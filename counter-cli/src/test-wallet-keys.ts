/**
 * Debug: Get the wallet's encryptionPublicKey and test ZswapOutput.new() with it.
 * Tests whether the real wallet keys cause the WASM crash.
 */
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import * as ledger from '@midnight-ntwrk/ledger-v7';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { Buffer } from 'buffer';

setNetworkId('preprod');

const SEED = '1439daa970edb8d9941692ef66f3d83eb3ead8cc79005ee0b24c2a5bb35e4b498d6968c3741f191b51e7e8249b764e50cc38eec299976648e749519b025c41f8';

async function main() {
  console.log('=== Get Wallet Keys & Test ZswapOutput ===\n');

  // Derive keys the same way as api.ts buildWalletAndWaitForFunds
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
  
  console.log(`coinPublicKey:       ${coinPublicKey}`);
  console.log(`  length: ${coinPublicKey.length} chars = ${coinPublicKey.length / 2} bytes`);
  console.log(`encryptionPublicKey: ${encryptionPublicKey}`);
  console.log(`  length: ${encryptionPublicKey.length} chars = ${encryptionPublicKey.length / 2} bytes`);

  const sampleCpk = ledger.sampleCoinPublicKey();
  const sampleEpk = ledger.sampleEncryptionPublicKey();
  console.log(`\nsampleCoinPublicKey:       ${sampleCpk} (${sampleCpk.length} chars)`);
  console.log(`sampleEncryptionPublicKey: ${sampleEpk} (${sampleEpk.length} chars)`);

  console.log(`\nKey length match: cpk=${coinPublicKey.length === sampleCpk.length}, epk=${encryptionPublicKey.length === sampleEpk.length}`);

  // Test ZswapOutput.new with all combinations
  console.log('\n--- Testing ZswapOutput.new ---');
  const testCoin = { nonce: '00'.repeat(32), color: '00'.repeat(32), value: 100n };

  const combos = [
    ['REAL cpk + REAL epk', coinPublicKey, encryptionPublicKey],
    ['SAMPLE cpk + SAMPLE epk', sampleCpk, sampleEpk],
    ['REAL cpk + SAMPLE epk', coinPublicKey, sampleEpk],
    ['SAMPLE cpk + REAL epk', sampleCpk, encryptionPublicKey],
  ] as const;

  for (const [label, cpk, epk] of combos) {
    try {
      const output = ledger.ZswapOutput.new(testCoin as any, 0, cpk, epk);
      console.log(`  ✓ ${label}: OK`);
    } catch (e: any) {
      console.error(`  ✗ ${label}: FAILED - ${e.message}`);
    }
  }

  // Test full createUnprovenCallTx with REAL wallet keys
  console.log('\n--- Testing createUnprovenCallTx with REAL wallet keys ---');
  const { createUnprovenCallTx } = await import('@midnight-ntwrk/midnight-js-contracts');
  const { CompiledContract } = await import('@midnight-ntwrk/compact-js');
  const { NodeZkConfigProvider } = await import('@midnight-ntwrk/midnight-js-node-zk-config-provider');
  const { indexerPublicDataProvider } = await import('@midnight-ntwrk/midnight-js-indexer-public-data-provider');
  const { FaucetAMM } = await import('@midnight-ntwrk/counter-contract');
  const path = await import('node:path');

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

  const coinPubKeyBytes = ledger.encodeCoinPublicKey(coinPublicKey);
  const recipient = {
    is_left: true,
    left: { bytes: coinPubKeyBytes },
    right: { bytes: new Uint8Array(32) },
  };

  const walletProvider = {
    getCoinPublicKey: () => coinPublicKey,
    getEncryptionPublicKey: () => encryptionPublicKey,
    balanceTx: async () => { throw new Error('Not implemented'); },
    signTx: async () => { throw new Error('Not implemented'); },
  };

  const providers = {
    walletProvider,
    zkConfigProvider: new NodeZkConfigProvider(zkConfigPath),
    publicDataProvider,
  };

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
    console.log(`  ✓ createUnprovenCallTx SUCCEEDED!`);
    console.log(`    newCoins: ${result.private.newCoins?.length}`);
  } catch (e: any) {
    console.error(`  ✗ createUnprovenCallTx FAILED: ${e.message}`);
    if (e.cause) console.error(`    Cause: ${(e.cause as Error).message}`);
    console.error(`    Stack: ${e.stack?.split('\n').slice(0, 10).join('\n')}`);
  }

  console.log('\n=== Done ===');
  process.exit(0);
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
