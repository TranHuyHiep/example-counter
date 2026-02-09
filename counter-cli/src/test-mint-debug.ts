/**
 * Debug script: Reproduce the exact mintTestTokensX flow locally
 * to isolate the "RuntimeError: unreachable" WASM crash.
 *
 * Uses createConstructorContext + createCircuitContext from compact-runtime
 * to replicate the middleware execution path.
 */
import { FaucetAMM } from '@midnight-ntwrk/counter-contract';
import { witnesses } from '@midnight-ntwrk/counter-contract';
import { createCircuitContext, createConstructorContext } from '@midnight-ntwrk/compact-runtime';
import { Buffer } from 'buffer';
import * as ocrt from '@midnight-ntwrk/onchain-runtime-v2';
import { randomBytes } from 'crypto';
import {
  MidnightBech32m,
  ShieldedAddress,
} from '@midnight-ntwrk/wallet-sdk-address-format';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

// ─── Configuration ──────────────────────────────────────────────────────
// The real wallet coinPublicKey from preprod logs
const REAL_COIN_PUBLIC_KEY = 'af009dd97d710f28bd98b7a164cfbe9e5e171cfbda9f3279f99678e337e652ee';

// The real shielded address from preprod logs
const REAL_SHIELDED_ADDRESS = 'mn_shield-addr_preprod14uqfmktawy8j30vck7skfna7ne0pw88mm20ny70ejeuwxdlx2thgdurq8206p03vf7xftf4s4c0ccacvteggvvaq3hef3aklcc4065qjel7nu';

// Use a dummy contract address for testing
const DUMMY_CONTRACT_ADDRESS = '0000000000000000000000000000000000000000000000000000000000000001';

setNetworkId('preprod');

async function main() {
  console.log('=== Shielded Mint Debug ===\n');

  // Step 1: Create contract
  console.log('[Step 1] Creating contract instance...');
  const contract = new FaucetAMM.Contract(witnesses);

  // Step 2: Create constructor context and initialize
  console.log('[Step 2] Constructor...');
  const feeBps = 10n;
  const initialNonce = randomBytes(32);
  const constructorCtx = createConstructorContext({}, REAL_COIN_PUBLIC_KEY);
  const ctxResult = contract.initialState(constructorCtx, feeBps, initialNonce);
  console.log('  ✓ Constructor succeeded');

  // Get the contract state from constructor result
  const contractState = ctxResult.currentContractState;
  console.log('  contractState type:', typeof contractState);

  // Step 3: Build recipients in different ways
  console.log('\n[Step 3] Building recipients...');

  // Method A: Our current approach (encodeCoinPublicKey from hex)
  const coinPubKeyBytes_A = ocrt.encodeCoinPublicKey(REAL_COIN_PUBLIC_KEY);
  const recipientA = {
    is_left: true,
    left: { bytes: coinPubKeyBytes_A },
    right: { bytes: new Uint8Array(32) },
  };
  console.log(`  [A] encodeCoinPublicKey: ${Buffer.from(coinPubKeyBytes_A).toString('hex')}`);
  console.log(`      type=${coinPubKeyBytes_A.constructor.name} len=${coinPubKeyBytes_A.length}`);

  // Method B: Buffer.from(hex, 'hex') directly
  const coinPubKeyBytes_B = Buffer.from(REAL_COIN_PUBLIC_KEY, 'hex');
  const recipientB = {
    is_left: true,
    left: { bytes: coinPubKeyBytes_B },
    right: { bytes: new Uint8Array(32) },
  };
  console.log(`  [B] Buffer.from: ${coinPubKeyBytes_B.toString('hex')}`);
  console.log(`      type=${coinPubKeyBytes_B.constructor.name} len=${coinPubKeyBytes_B.length}`);

  // Method C: ShieldedAddress.codec.decode (reference test pattern)
  let recipientC: any;
  try {
    const bech32m = MidnightBech32m.parse(REAL_SHIELDED_ADDRESS);
    const shieldedAddr = ShieldedAddress.codec.decode(getNetworkId(), bech32m);
    const coinPubKeyBytes_C = shieldedAddr.coinPublicKey.data;
    recipientC = {
      is_left: true,
      left: { bytes: coinPubKeyBytes_C },
      right: { bytes: new Uint8Array(32) },
    };
    console.log(`  [C] ShieldedAddress.decode: ${coinPubKeyBytes_C.toString('hex')}`);
    console.log(`      type=${coinPubKeyBytes_C.constructor.name} len=${coinPubKeyBytes_C.length}`);
  } catch (e: any) {
    console.error(`  [C] ShieldedAddress.decode FAILED: ${e.message}`);
    recipientC = recipientA; // fallback
  }

  // Step 4: Test mintTestTokensX with each recipient type
  const testCases = [
    { name: 'encodeCoinPublicKey (Uint8Array)', recipient: recipientA },
    { name: 'Buffer.from hex', recipient: recipientB },
    { name: 'ShieldedAddress.decode', recipient: recipientC },
  ];

  for (const tc of testCases) {
    console.log(`\n[Step 4] mintTestTokensX with ${tc.name}...`);
    try {
      const circuitCtx = createCircuitContext(
        DUMMY_CONTRACT_ADDRESS,
        REAL_COIN_PUBLIC_KEY,
        contractState,
        {},
      );
      const result = contract.circuits.mintTestTokensX(circuitCtx, 100n, tc.recipient);
      console.log(`  ✓ SUCCEEDED! result: ${JSON.stringify(result.result)}`);
    } catch (e: any) {
      console.error(`  ✗ FAILED: ${e.message}`);
      if (e.cause) console.error(`    Cause: ${(e.cause as Error).message || e.cause}`);
      console.error(`    Stack: ${e.stack?.split('\n').slice(0, 8).join('\n')}`);
    }
  }

  console.log('\n=== Done ===');
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
