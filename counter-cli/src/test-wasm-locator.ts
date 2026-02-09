/**
 * WASM CRASH LOCATOR: Instrument WASM calls to find which one crashes.
 * 
 * Approach: Wrap the onchain-runtime-v2 module's WASM functions with try/catch
 * to identify exactly which WASM call triggers the crash during submitCallTx.
 */
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import * as ledger from '@midnight-ntwrk/ledger-v7';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { Buffer } from 'buffer';
import path from 'node:path';

// Instrument compact-runtime BEFORE importing contracts
import * as ocrt from '@midnight-ntwrk/onchain-runtime-v2';

// Wrap key WASM functions
const originalRuntimeCoinCommitment = (ocrt as any).runtimeCoinCommitment;
if (originalRuntimeCoinCommitment) {
  (ocrt as any).runtimeCoinCommitment = function(...args: any[]) {
    console.log('  [WASM] runtimeCoinCommitment called');
    try {
      const result = originalRuntimeCoinCommitment.apply(this, args);
      console.log('  [WASM] runtimeCoinCommitment OK');
      return result;
    } catch (e) {
      console.error('  [WASM] runtimeCoinCommitment CRASHED!', e);
      throw e;
    }
  };
}

setNetworkId('preprod');

const SEED = '1439daa970edb8d9941692ef66f3d83eb3ead8cc79005ee0b24c2a5bb35e4b498d6968c3741f191b51e7e8249b764e50cc38eec299976648e749519b025c41f8';

async function main() {
  console.log('=== WASM Crash Locator ===\n');

  const hdWallet = HDWallet.fromSeed(Buffer.from(SEED, 'hex'));
  if (hdWallet.type !== 'seedOk') throw new Error('Bad seed');
  const dr = hdWallet.hdWallet.selectAccount(0).selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust]).deriveKeysAt(0);
  if (dr.type !== 'keysDerived') throw new Error('Bad derivation');
  hdWallet.hdWallet.clear();

  const sk = ledger.ZswapSecretKeys.fromSeed(dr.keys[Roles.Zswap]);
  const cpk = sk.coinPublicKey;
  const epk = sk.encryptionPublicKey;

  const currentDir = path.resolve(new URL(import.meta.url).pathname, '..');
  const zkConfigPath = path.resolve(currentDir, '..', '..', 'contract', 'src', 'managed', 'FaucetAMM');
  const CONTRACT_ADDRESS = 'c0d3950d5373f0bafae1dba3c1a48c9adb93a3150ca58c1758d65e93dc3ca792';

  const { submitCallTx, createUnprovenCallTx } = await import('@midnight-ntwrk/midnight-js-contracts');
  const { CompiledContract } = await import('@midnight-ntwrk/compact-js');
  const { NodeZkConfigProvider } = await import('@midnight-ntwrk/midnight-js-node-zk-config-provider');
  const { indexerPublicDataProvider } = await import('@midnight-ntwrk/midnight-js-indexer-public-data-provider');
  const { levelPrivateStateProvider } = await import('@midnight-ntwrk/midnight-js-level-private-state-provider');
  const { FaucetAMM } = await import('@midnight-ntwrk/counter-contract');

  const compiledContract = CompiledContract.make('FaucetAMM', FaucetAMM.Contract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );

  const publicDataProvider = indexerPublicDataProvider(
    'https://indexer.preprod.midnight.network/api/v3/graphql',
    'wss://indexer.preprod.midnight.network/api/v3/graphql/ws',
  );

  const walletProvider: any = {
    getCoinPublicKey: () => cpk,
    getEncryptionPublicKey: () => epk,
  };

  const psp = levelPrivateStateProvider({
    privateStateStoreName: 'faucet-amm-wasm-locator',
    walletProvider,
  });
  await psp.set('faucetAMMPrivateState', {});

  const recipient = {
    is_left: true,
    left: { bytes: ledger.encodeCoinPublicKey(cpk) },
    right: { bytes: new Uint8Array(32) },
  };

  const providers: any = {
    walletProvider,
    zkConfigProvider: new NodeZkConfigProvider(zkConfigPath),
    publicDataProvider,
    privateStateProvider: psp,
    proofProvider: { proveTx: async (tx: any) => tx },
    midnightProvider: { submitTx: async (tx: any) => 'test-tx-id' },
  };

  const options: any = {
    compiledContract,
    contractAddress: CONTRACT_ADDRESS,
    circuitId: 'mintTestTokensX',
    args: [100n, recipient],
  };

  // Step 1: Test createUnprovenCallTx (should succeed)
  console.log('Step 1: createUnprovenCallTx (no txCtx)');
  try {
    const r = await createUnprovenCallTx(providers, options);
    console.log('  ✓ SUCCEEDED\n');
    
    // Examine the result to understand what mergeUnsubmittedCallTxData receives
    console.log('  Result structure:');
    console.log(`    public keys: ${Object.keys(r.public)}`);
    console.log(`    private keys: ${Object.keys(r.private)}`);
    console.log(`    unprovenTx type: ${r.private.unprovenTx?.constructor?.name}`);
    console.log(`    unprovenTx has guaranteedOffer: ${r.private.unprovenTx?.guaranteedOffer != null}`);
    if (r.private.unprovenTx?.guaranteedOffer) {
      console.log(`    guaranteedOffer type: ${r.private.unprovenTx.guaranteedOffer?.constructor?.name}`);
      try {
        const serialized = r.private.unprovenTx.guaranteedOffer.serialize();
        console.log(`    guaranteedOffer.serialize() length: ${serialized.length}`);
      } catch (e: any) {
        console.error(`    guaranteedOffer.serialize() FAILED: ${e.message}`);
      }
    }
    
    // Try to manually call mergeSubmitTxOptions to see if that crashes
    console.log('\n  Manually testing what mergeUnsubmittedCallTxData does:');
    
    // mergeSubmitTxOptions creates:
    // { unprovenTx: callData.private.unprovenTx, circuitId }
    const submitTxOptions = { unprovenTx: r.private.unprovenTx, circuitId: 'mintTestTokensX' };
    console.log(`    submitTxOptions created OK`);
    
    // The crash might be in ChargedState or operation()
    console.log('\n  Testing ChargedState...');
    try {
      // mergeUnsubmittedCallTxData line 656:
      // contractState.data = new ChargedState(callData.public.nextContractState);
      const { ChargedState } = await import('@midnight-ntwrk/compact-js');
      const charged = new (ChargedState as any)(r.public.nextContractState);
      console.log(`    ✓ ChargedState created OK`);
    } catch (e: any) {
      console.error(`    ✗ ChargedState FAILED: ${e.message}`);
    }
    
    // The crash might be in ZswapOffer.deserialize('pre-proof', ...)
    if (r.private.unprovenTx?.guaranteedOffer) {
      console.log('\n  Testing ZswapOffer.deserialize...');
      try {
        const serialized = r.private.unprovenTx.guaranteedOffer.serialize();
        const deserialized = ledger.ZswapOffer.deserialize('pre-proof' as any, serialized);
        console.log(`    ✓ ZswapOffer.deserialize OK`);
      } catch (e: any) {
        console.error(`    ✗ ZswapOffer.deserialize FAILED: ${e.message}`);
        console.error(`      Stack: ${e.stack?.split('\n').slice(0, 5).join('\n')}`);
      }
      
      // Test tryApply
      console.log('\n  Testing zswapChainState.tryApply...');
      try {
        const { getPublicStates } = await import('@midnight-ntwrk/midnight-js-contracts');
        const states = await getPublicStates(publicDataProvider, CONTRACT_ADDRESS);
        console.log(`    Got zswapChainState: ${states.zswapChainState?.constructor?.name}`);
        
        const serialized = r.private.unprovenTx.guaranteedOffer.serialize();
        const deserializedOffer = ledger.ZswapOffer.deserialize('pre-proof' as any, serialized);
        console.log(`    Deserialized offer OK`);
        
        const [newState] = states.zswapChainState.tryApply(deserializedOffer);
        console.log(`    ✓ tryApply OK`);
      } catch (e: any) {
        console.error(`    ✗ tryApply FAILED: ${e.message}`);
        console.error(`      Stack: ${e.stack?.split('\n').slice(0, 5).join('\n')}`);
      }
    }
    
  } catch (e: any) {
    console.error(`  ✗ FAILED: ${e.message}\n`);
  }

  // Step 2: submitCallTx (should crash)
  console.log('\nStep 2: submitCallTx (expected to crash)');
  try {
    const r = await submitCallTx(providers, options);
    console.log('  ✓ SUCCEEDED (unexpected!)');
  } catch (e: any) {
    const msg = e.message;
    if (msg.includes('RuntimeError')) {
      console.error(`  ✗ CRASHED: ${msg.substring(0, 100)}`);
    } else {
      console.log(`  Result: ${msg.substring(0, 100)}`);
    }
  }

  try { await psp.clear(); } catch {}
  console.log('\n=== Done ===');
  process.exit(0);
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
