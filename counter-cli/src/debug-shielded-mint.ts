/**
 * Debug script to test mintShieldedToken locally with proper encodeCoinPublicKey
 * Run: cd /root/example-counter/counter-cli && node --loader ts-node/esm src/debug-shielded-mint.ts
 */
import { FaucetAMM, type FaucetAMMPrivateState, witnesses } from '@midnight-ntwrk/counter-contract';
import { createConstructorContext, createCircuitContext } from '@midnight-ntwrk/compact-runtime';
import { encodeCoinPublicKey } from '@midnight-ntwrk/onchain-runtime-v2';
import { createUnprovenCallTxFromInitialStates } from '@midnight-ntwrk/midnight-js-contracts';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import path from 'node:path';
import { Buffer } from 'buffer';

// Use the SAME coin public key hex that the wallet would provide.
// This is a VALID hex string representing a coin public key.
// In production, this comes from state.shielded.coinPublicKey.toHexString()
const COIN_PUB_KEY_HEX = '4242424242424242424242424242424242424242424242424242424242424242';
const CONTRACT_ADDR = '0100000000000000000000000000000000000000000000000000000000000001';

async function main() {
  console.log('=== Debug Shielded Mint with encodeCoinPublicKey ===\n');

  // Step 0: Test encodeCoinPublicKey
  console.log('Step 0: Test encodeCoinPublicKey...');
  let encodedCoinPubKey: Uint8Array;
  try {
    encodedCoinPubKey = encodeCoinPublicKey(COIN_PUB_KEY_HEX);
    console.log(`  ✅ encodeCoinPublicKey OK`);
    console.log(`  Input hex: ${COIN_PUB_KEY_HEX} (${COIN_PUB_KEY_HEX.length} chars)`);
    console.log(`  Output bytes: ${Buffer.from(encodedCoinPubKey).toString('hex')} (${encodedCoinPubKey.length} bytes)`);
  } catch (e) {
    console.log(`  ❌ encodeCoinPublicKey FAILED: ${(e as Error).message}`);
    console.log(`  This means the hex key is not a valid curve point!`);
    console.log(`  Stack: ${(e as Error).stack}`);
    process.exit(1);
  }

  // Step 1: Create contract instance
  console.log('\nStep 1: Create contract instance...');
  const contract = new FaucetAMM.Contract<FaucetAMMPrivateState>(witnesses);
  console.log('  ✅ Contract instance created');

  // Step 2: Run constructor (uses COIN_PUB_KEY_HEX)
  console.log('\nStep 2: Run constructor...');
  const nonce = new Uint8Array(32).fill(0xAB);
  const feeBps = 10n;
  const constructorCtx = createConstructorContext<FaucetAMMPrivateState>({}, COIN_PUB_KEY_HEX);

  let constructorResult: any;
  try {
    constructorResult = contract.initialState(constructorCtx, feeBps, nonce);
    console.log('  ✅ Constructor succeeded!');
  } catch (e) {
    console.log('  ❌ Constructor FAILED:', (e as Error).message);
    process.exit(1);
  }

  // Step 3: Create circuit context
  console.log('\nStep 3: Create circuit context...');
  let circuitCtx: any;
  try {
    circuitCtx = createCircuitContext<FaucetAMMPrivateState>(
      CONTRACT_ADDR,
      COIN_PUB_KEY_HEX,
      constructorResult.currentContractState,
      constructorResult.currentPrivateState,
    );
    console.log('  ✅ Circuit context created');
  } catch (e) {
    console.log('  ❌ createCircuitContext FAILED:', (e as Error).message);
    process.exit(1);
  }

  // Step 4: Call mintTestTokensX with ENCODED recipient
  console.log('\nStep 4: Call mintTestTokensX with encodeCoinPublicKey...');
  const recipient = {
    is_left: true,
    left: { bytes: encodedCoinPubKey },     // ← ENCODED, not raw hex decode
    right: { bytes: new Uint8Array(32) },
  };

  console.log(`  recipient.left.bytes: ${Buffer.from(recipient.left.bytes).toString('hex')} (${recipient.left.bytes.length} bytes)`);

  try {
    const result = contract.circuits.mintTestTokensX(circuitCtx, 100n, recipient);
    console.log('  ✅ mintTestTokensX (circuit) SUCCEEDED!');
    
    const outputs = result.context?.currentZswapLocalState?.outputs;
    if (outputs && outputs.length > 0) {
      console.log(`  Zswap outputs: ${outputs.length}`);
      for (const out of outputs) {
        console.log(`    color: ${Buffer.from(out.coinInfo.color).toString('hex')}`);
        console.log(`    value: ${out.coinInfo.value}`);
        console.log(`    nonce: ${Buffer.from(out.coinInfo.nonce).toString('hex')}`);
      }
    }
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.log(`  ❌ mintTestTokensX FAILED: ${err.message}`);
    const stackLines = err.stack?.split('\n') ?? [];
    for (const line of stackLines) {
      if (line.includes('wasm') || line.includes('runtime') || line.includes('zswap')) {
        console.log(`  📍 ${line.trim()}`);
      }
    }
  }

  // Step 5: Try the middleware path (createUnprovenCallTxFromInitialStates)
  console.log('\nStep 5: Test middleware path (createUnprovenCallTxFromInitialStates)...');
  try {
    const zkConfigPath = path.resolve(new URL(import.meta.url).pathname, '..', '..', '..', 'contract', 'src', 'managed', 'FaucetAMM');
    const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
    const compiledContract = CompiledContract.make('FaucetAMM', FaucetAMM.Contract<FaucetAMMPrivateState>)
      .pipe(CompiledContract.withVacantWitnesses, CompiledContract.withCompiledFileAssets(zkConfigPath));

    const options = {
      compiledContract,
      contractAddress: CONTRACT_ADDR,
      circuitId: 'mintTestTokensX',
      coinPublicKey: COIN_PUB_KEY_HEX,
      initialContractState: constructorResult.currentContractState,
      initialZswapChainState: constructorResult.currentZswapLocalState,
      args: [100n, recipient],
    } as any;

    const unproven = await createUnprovenCallTxFromInitialStates(
      zkConfigProvider as any,
      options as any,
      COIN_PUB_KEY_HEX as any,
    );
    console.log('  ✅ Middleware path SUCCEEDED!');
    console.log(`  nextPrivateState keys: ${Object.keys(unproven.private.nextPrivateState || {})}`);
    console.log(`  unprovenTx exists: ${!!unproven.private.unprovenTx}`);
    if (unproven.private.newCoins) {
      console.log(`  newCoins: ${unproven.private.newCoins.length}`);
    }
  } catch (err) {
    console.error(`  ❌ Middleware path FAILED: ${err instanceof Error ? err.message : String(err)}`);
    if (err instanceof Error && err.stack) {
      const stackLines = err.stack.split('\n');
      for (const line of stackLines) {
        if (line.includes('wasm') || line.includes('ledger') || line.includes('Zswap') || line.includes('runtime') || line.includes('index.')) {
          console.error(`  📍 ${line.trim()}`);
        }
      }
    }
  }

  console.log('\n=== Debug Complete ===');
}

main().catch(e => {
  console.error('Unhandled error:', e);
  process.exit(1);
});
