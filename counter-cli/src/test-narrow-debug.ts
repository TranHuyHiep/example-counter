/**
 * Debug: Narrowing down the crash. Test createUnprovenCallTx WITH privateStateId.
 * 
 * Previous test: createUnprovenCallTx WITHOUT privateStateId → SUCCEEDS
 * submitCallTx WITH privateStateId → FAILS with RuntimeError: unreachable
 * 
 * This test: createUnprovenCallTx WITH privateStateId + privateStateProvider
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
  console.log('=== createUnprovenCallTx WITH privateState Debug ===\n');

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

  const walletProvider = {
    getCoinPublicKey: () => coinPublicKey,
    getEncryptionPublicKey: () => encryptionPublicKey,
    balanceTx: async () => { throw new Error('Not implemented'); },
    signTx: async () => { throw new Error('Not implemented'); },
  };

  const privateStateProv = levelPrivateStateProvider({
    privateStateStoreName: 'faucet-amm-narrow-debug',
    walletProvider: walletProvider as any,
  });

  // Initialize private state
  await privateStateProv.set('faucetAMMPrivateState', {});
  console.log('Private state initialized\n');

  const coinPubKeyBytes = ledger.encodeCoinPublicKey(coinPublicKey);
  const recipient = {
    is_left: true,
    left: { bytes: coinPubKeyBytes },
    right: { bytes: new Uint8Array(32) },
  };

  const providers = {
    walletProvider,
    zkConfigProvider: new NodeZkConfigProvider(zkConfigPath),
    publicDataProvider,
    privateStateProvider: privateStateProv,
  };

  // Test 1: WITHOUT privateStateId (the working path)
  console.log('--- Test 1: createUnprovenCallTx WITHOUT privateStateId ---');
  try {
    const result = await createUnprovenCallTx(
      providers as any,
      {
        compiledContract,
        contractAddress: CONTRACT_ADDRESS,
        circuitId: 'mintTestTokensX',
        args: [100n, recipient],
      } as any,
    );
    console.log(`  ✓ SUCCEEDED (no privateStateId)\n`);
  } catch (e: any) {
    console.error(`  ✗ FAILED: ${e.message}\n`);
  }

  // Test 2: WITH privateStateId (the failing path)
  console.log('--- Test 2: createUnprovenCallTx WITH privateStateId ---');
  try {
    const result = await createUnprovenCallTx(
      providers as any,
      {
        compiledContract,
        contractAddress: CONTRACT_ADDRESS,
        circuitId: 'mintTestTokensX',
        privateStateId: 'faucetAMMPrivateState',
        args: [100n, recipient],
      } as any,
    );
    console.log(`  ✓ SUCCEEDED (with privateStateId)\n`);
  } catch (e: any) {
    console.error(`  ✗ FAILED: ${e.message}`);
    if (e.cause) console.error(`    Cause: ${(e.cause as Error).message}`);
    console.error(`    Stack: ${e.stack?.split('\n').slice(0, 5).join('\n')}\n`);
  }

  // Clean up
  try { await privateStateProv.clear(); } catch {}

  console.log('=== Done ===');
  process.exit(0);
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
