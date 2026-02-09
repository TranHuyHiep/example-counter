/**
 * CRITICAL DEBUG: Manually replicate the EXACT scoped() + callTxFn flow.
 * 
 * We know:
 * - createUnprovenCallTx(providers, options) → SUCCEEDS
 * - submitCallTx(providers, options) → CRASHES in scoped()
 * 
 * submitCallTx does:
 * 1. Creates TransactionContextImpl
 * 2. Calls createUnprovenCallTx(providers, options, txCtx)  
 * 3. Calls mergeUnsubmittedCallTxData(txCtx, circuitId, callData, privateStateId)
 * 
 * We need to test step 2 and 3 separately to find the crash.
 * Since TransactionContextImpl is not exported, we'll monkey-patch scoped().
 */
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import * as ledger from '@midnight-ntwrk/ledger-v7';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { Buffer } from 'buffer';
import path from 'node:path';
import { createUnprovenCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { FaucetAMM } from '@midnight-ntwrk/counter-contract';

setNetworkId('preprod');

const SEED = '1439daa970edb8d9941692ef66f3d83eb3ead8cc79005ee0b24c2a5bb35e4b498d6968c3741f191b51e7e8249b764e50cc38eec299976648e749519b025c41f8';

async function main() {
  console.log('=== Critical Debug: Manual scoped() Replication ===\n');

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
    privateStateStoreName: 'faucet-amm-critical-debug',
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
    proofProvider: { proveTx: async () => { throw new Error('NO_PROOF'); } },
    midnightProvider: { submitTx: async () => { throw new Error('NO_SUBMIT'); } },
  };

  const options: any = {
    compiledContract,
    contractAddress: CONTRACT_ADDRESS,
    circuitId: 'mintTestTokensX',
    args: [100n, recipient],
  };

  // Step 1: Use the internal module to access TransactionContextImpl
  // We need to read it from the source since it's not exported
  const contractsModule = await import('@midnight-ntwrk/midnight-js-contracts');
  
  // Step 2: We'll manually invoke submitCallTx but add logging
  // Since we can't access internals, let's use a Proxy on providers to intercept calls
  
  // First: does the levelPrivateStateProvider.get work?
  console.log('Test A: Check private state provider');
  try {
    const ps = await psp.get('faucetAMMPrivateState');
    console.log(`  ✓ Private state: ${JSON.stringify(ps)}`);
  } catch (e: any) {
    console.error(`  ✗ Private state error: ${e.message}`);
  }

  // Test B: createUnprovenCallTx WITH privateStateId but WITHOUT txCtx
  console.log('\nTest B: createUnprovenCallTx with privateStateId, no txCtx');
  try {
    const r = await createUnprovenCallTx(providers, { ...options, privateStateId: 'faucetAMMPrivateState' });
    console.log(`  ✓ SUCCEEDED`);
  } catch (e: any) {
    console.error(`  ✗ FAILED: ${e.message}`);
    if (e.cause) console.error(`    Cause: ${(e.cause as Error).message}`);
  }

  // Test C: submitCallTx — this should crash
  console.log('\nTest C: submitCallTx with privateStateId (expected crash)');
  try {
    const { submitCallTx } = contractsModule;
    const r = await submitCallTx(providers, { ...options, privateStateId: 'faucetAMMPrivateState' });
    console.log(`  ✓ SUCCEEDED (unexpected!)`);
  } catch (e: any) {
    const msg = e.message;
    if (msg.includes('RuntimeError')) {
      console.error(`  ✗ CRASHED: ${msg.substring(0, 80)}`);
    } else {
      console.log(`  Result: ${msg.substring(0, 80)}`);
    }
  }

  // Test D: submitCallTx WITHOUT privateStateId — does it also crash?
  console.log('\nTest D: submitCallTx without privateStateId');
  try {
    const { submitCallTx } = contractsModule;
    const r = await submitCallTx(providers, options);
    console.log(`  ✓ SUCCEEDED (unexpected!)`);
  } catch (e: any) {
    const msg = e.message;
    if (msg.includes('RuntimeError')) {
      console.error(`  ✗ CRASHED: ${msg.substring(0, 80)}`);
    } else {
      console.log(`  Result: ${msg.substring(0, 80)}`);
    }
  }

  // Test E: The previous test-full-unproven-tx.ts used sampleEncryptionPublicKey() 
  // and it worked. Does submitCallTx work with sampleEncryptionPublicKey?
  console.log('\nTest E: submitCallTx with sampleEncryptionPublicKey');
  const sampleEpk = ledger.sampleEncryptionPublicKey();
  const providers2: any = {
    ...providers,
    walletProvider: {
      getCoinPublicKey: () => cpk,
      getEncryptionPublicKey: () => sampleEpk,
    },
  };
  try {
    const { submitCallTx } = contractsModule;
    const r = await submitCallTx(providers2, options);
    console.log(`  ✓ SUCCEEDED (unexpected!)`);
  } catch (e: any) {
    const msg = e.message;
    if (msg.includes('RuntimeError')) {
      console.error(`  ✗ CRASHED: ${msg.substring(0, 80)}`);
    } else {
      console.log(`  Result: ${msg.substring(0, 80)}`);
    }
  }

  try { await psp.clear(); } catch {}
  console.log('\n=== Done ===');
  process.exit(0);
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
