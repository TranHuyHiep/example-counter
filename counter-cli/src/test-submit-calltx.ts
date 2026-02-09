/**
 * Debug: Test the complete submitCallTx path (scoped + mergeUnsubmittedCallTxData).
 * 
 * createUnprovenCallTx succeeds. The crash must be in:
 * - mergeUnsubmittedCallTxData (inside scoped's fn callback)
 * - innerTxCtx[Submit]() (proof generation / balancing / submission)
 * 
 * This test calls submitCallTx directly to reproduce the exact error.
 * We expect it to fail at the Submit phase (proof/balance/submit) since
 * we don't have a real proof server or balancing setup, but the error
 * should be DIFFERENT from "RuntimeError: unreachable".
 */
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import * as ledger from '@midnight-ntwrk/ledger-v7';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { Buffer } from 'buffer';
import path from 'node:path';

setNetworkId('preprod');

const SEED = '1439daa970edb8d9941692ef66f3d83eb3ead8cc79005ee0b24c2a5bb35e4b498d6968c3741f191b51e7e8249b764e50cc38eec299976648e749519b025c41f8';

async function main() {
  console.log('=== submitCallTx Debug ===\n');

  // Derive keys
  const hdWallet = HDWallet.fromSeed(Buffer.from(SEED, 'hex'));
  if (hdWallet.type !== 'seedOk') throw new Error('Bad seed');
  const derivationResult = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (derivationResult.type !== 'keysDerived') throw new Error('Bad derivation');
  hdWallet.hdWallet.clear();

  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(derivationResult.keys[Roles.Zswap]);
  const coinPublicKey = shieldedSecretKeys.coinPublicKey;
  const encryptionPublicKey = shieldedSecretKeys.encryptionPublicKey;
  console.log(`coinPublicKey: ${coinPublicKey}`);
  console.log(`encryptionPublicKey: ${encryptionPublicKey}`);

  // Set up the same way as the CLI
  const { submitCallTx } = await import('@midnight-ntwrk/midnight-js-contracts');
  const { CompiledContract } = await import('@midnight-ntwrk/compact-js');
  const { NodeZkConfigProvider } = await import('@midnight-ntwrk/midnight-js-node-zk-config-provider');
  const { indexerPublicDataProvider } = await import('@midnight-ntwrk/midnight-js-indexer-public-data-provider');
  const { FaucetAMM } = await import('@midnight-ntwrk/counter-contract');
  const { levelPrivateStateProvider } = await import('@midnight-ntwrk/midnight-js-level-private-state-provider');

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

  // Create the private state provider (LevelDB) — same as CLI
  const privateStateProvider = levelPrivateStateProvider({
    privateStateStoreName: 'faucet-amm-debug-private-state',
    walletProvider: {
      getCoinPublicKey: () => coinPublicKey,
      getEncryptionPublicKey: () => encryptionPublicKey,
      balanceTx: async () => { throw new Error('Not implemented'); },
      signTx: async () => { throw new Error('Not implemented'); },
    } as any,
  });

  // Initialize private state (same as joinContract does)
  console.log('\nSetting initial private state...');
  await privateStateProvider.set('faucetAMMPrivateState', {});
  console.log('  ✓ Private state initialized');

  const coinPubKeyBytes = ledger.encodeCoinPublicKey(coinPublicKey);
  const recipient = {
    is_left: true,
    left: { bytes: coinPubKeyBytes },
    right: { bytes: new Uint8Array(32) },
  };

  // Create a mock proof provider that simulates what the real one does
  const proofProvider = {
    proveTx: async (tx: any) => {
      console.log('  [proofProvider] proveTx called - would send to proof server');
      throw new Error('PROOF_NOT_IMPLEMENTED - test only goes up to this point');
    },
  };

  const walletProvider = {
    getCoinPublicKey: () => coinPublicKey,
    getEncryptionPublicKey: () => encryptionPublicKey,
    balanceTx: async (tx: any) => {
      console.log('  [walletProvider] balanceTx called');
      throw new Error('BALANCE_NOT_IMPLEMENTED');
    },
    signTx: async (tx: any) => {
      console.log('  [walletProvider] signTx called');
      throw new Error('SIGN_NOT_IMPLEMENTED');
    },
  };

  const midnightProvider = {
    submitTx: async (tx: any) => {
      console.log('  [midnightProvider] submitTx called');
      throw new Error('SUBMIT_NOT_IMPLEMENTED');
    },
  };

  const providers = {
    walletProvider,
    zkConfigProvider: new NodeZkConfigProvider(zkConfigPath),
    publicDataProvider,
    privateStateProvider,
    proofProvider,
    midnightProvider,
  };

  // Call submitCallTx — this is the EXACT path the CLI uses
  console.log('\n--- Calling submitCallTx ---');
  console.log('  This calls:');
  console.log('    1. scoped(providers, callTxFn)');
  console.log('       a. callTxFn: createUnprovenCallTx + mergeUnsubmittedCallTxData');
  console.log('    2. innerTxCtx[Submit]()');
  console.log('       a. proofProvider.proveTx');
  console.log('       b. walletProvider.balanceTx');
  console.log('       c. midnightProvider.submitTx');
  console.log('');

  // Test 1: submitCallTx WITH privateStateId (known to crash)
  console.log('\n--- Test 1: submitCallTx WITH privateStateId ---');
  try {
    const result = await submitCallTx(
      providers as any,
      {
        compiledContract,
        contractAddress: CONTRACT_ADDRESS,
        circuitId: 'mintTestTokensX',
        privateStateId: 'faucetAMMPrivateState',
        args: [100n, recipient],
      } as any,
    );
    console.log(`  ✓ SUCCEEDED (unexpected)`);
  } catch (e: any) {
    const msg = e.message || String(e);
    if (msg.includes('RuntimeError: unreachable')) {
      console.error(`  ✗ RuntimeError: unreachable (the bug!)`);
    } else if (msg.includes('PROOF_NOT_IMPLEMENTED') || msg.includes('submitting')) {
      console.log(`  ✓ Expected error (no proof server): ${msg.substring(0, 80)}`);
    } else {
      console.error(`  ✗ Unexpected: ${msg}`);
    }
  }

  // Test 2: submitCallTx WITHOUT privateStateId
  console.log('\n--- Test 2: submitCallTx WITHOUT privateStateId ---');
  try {
    const result = await submitCallTx(
      providers as any,
      {
        compiledContract,
        contractAddress: CONTRACT_ADDRESS,
        circuitId: 'mintTestTokensX',
        args: [100n, recipient],
      } as any,
    );
    console.log(`  ✓ SUCCEEDED (unexpected)`);
  } catch (e: any) {
    const msg = e.message || String(e);
    if (msg.includes('RuntimeError: unreachable')) {
      console.error(`  ✗ RuntimeError: unreachable (the bug!)`);
    } else if (msg.includes('PROOF_NOT_IMPLEMENTED') || msg.includes('submitting')) {
      console.log(`  ✓ Expected error (no proof server): ${msg.substring(0, 80)}`);
    } else {
      console.error(`  ✗ Unexpected: ${msg}`);
    }
  }

  // Clean up LevelDB
  try {
    await privateStateProvider.clear();
  } catch {}

  console.log('\n=== Done ===');
  process.exit(0);
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
