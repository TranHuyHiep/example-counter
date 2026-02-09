/**
 * Debug: The DEFINITIVE narrowing test.
 * 
 * Working: createUnprovenCallTx(providers, options) — no transactionContext
 * Crashing: submitCallTx which calls createUnprovenCallTx(providers, options, txCtx)
 * 
 * This test: call createUnprovenCallTx WITH a TransactionContextImpl to see if
 * the txCtx parameter causes the crash.
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
  console.log('=== Definitive Narrowing Test ===\n');

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
    balanceTx: async () => { throw new Error('Not implemented'); },
    signTx: async () => { throw new Error('Not implemented'); },
  };

  const psp = levelPrivateStateProvider({
    privateStateStoreName: 'faucet-amm-definitive-debug',
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

  // Test 1: createUnprovenCallTx WITHOUT txCtx
  console.log('Test 1: createUnprovenCallTx(providers, options) — NO txCtx');
  try {
    const r = await createUnprovenCallTx(providers, options);
    console.log(`  ✓ SUCCEEDED\n`);
  } catch (e: any) {
    console.error(`  ✗ FAILED: ${e.message}\n`);
  }

  // Test 2: createUnprovenCallTx WITH txCtx (a mock TransactionContextImpl)
  // We can't instantiate TransactionContextImpl directly since it's internal.
  // But submitCallTx creates one via scoped(). Let's extract the logic.
  // Actually, let's just import the internal module...
  
  // The TransactionContextImpl is in the same file. Let's access it via the module internals.
  // Actually we can't. But we can see if the transactionContext parameter matters by passing
  // a simple object that implements getCurrentStates().
  
  console.log('Test 2: createUnprovenCallTx with mock transactionContext');
  const mockTxCtx: any = {
    getCurrentStates: () => undefined, // No cached states
  };
  // We need to add the CacheStates symbol. Let's check if it crashes with just getCurrentStates.
  try {
    const r = await createUnprovenCallTx(providers, options, mockTxCtx);
    console.log(`  ✓ SUCCEEDED\n`);
  } catch (e: any) {
    console.error(`  ✗ FAILED: ${e.message}`);
    if (e.cause) console.error(`    Cause: ${(e.cause as Error).message}`);
    console.error('');
  }

  // Test 3: Let's check the exact error in submitCallTx and trace where it happens
  console.log('Test 3: submitCallTx (reproducing crash for detailed trace)');
  const { submitCallTx } = await import('@midnight-ntwrk/midnight-js-contracts');
  try {
    const r = await submitCallTx(providers, options);
    console.log(`  ✓ SUCCEEDED (unexpected)\n`);
  } catch (e: any) {
    const msg = e.message || String(e);
    console.error(`  ✗ FAILED: ${msg.substring(0, 100)}`);
    if (e.cause) {
      const cause = e.cause as Error;
      console.error(`    Cause: ${cause.message}`);
      console.error(`    Cause stack:`);
      console.error(cause.stack?.split('\n').slice(0, 15).join('\n'));
    }
    console.error('');
  }

  try { await psp.clear(); } catch {}
  console.log('=== Done ===');
  process.exit(0);
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
