/**
 * Debug: Test if calling createUnprovenCallTx TWICE crashes on the second call.
 * Theory: WASM state gets corrupted after first circuit execution.
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
import { FaucetAMM } from '@midnight-ntwrk/counter-contract';

setNetworkId('preprod');

const SEED = '1439daa970edb8d9941692ef66f3d83eb3ead8cc79005ee0b24c2a5bb35e4b498d6968c3741f191b51e7e8249b764e50cc38eec299976648e749519b025c41f8';

async function main() {
  console.log('=== Double Call Test ===\n');

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

  const recipient = {
    is_left: true,
    left: { bytes: ledger.encodeCoinPublicKey(cpk) },
    right: { bytes: new Uint8Array(32) },
  };

  const providers: any = {
    walletProvider,
    zkConfigProvider: new NodeZkConfigProvider(zkConfigPath),
    publicDataProvider,
  };

  const options: any = {
    compiledContract,
    contractAddress: CONTRACT_ADDRESS,
    circuitId: 'mintTestTokensX',
    args: [100n, recipient],
  };

  // Call 1
  console.log('Call 1: createUnprovenCallTx');
  try {
    const r = await createUnprovenCallTx(providers, options);
    console.log(`  ✓ Call 1 SUCCEEDED\n`);
  } catch (e: any) {
    console.error(`  ✗ Call 1 FAILED: ${e.message}\n`);
  }

  // Call 2 (same options, same providers)
  console.log('Call 2: createUnprovenCallTx (second call, same process)');
  try {
    const r = await createUnprovenCallTx(providers, options);
    console.log(`  ✓ Call 2 SUCCEEDED\n`);
  } catch (e: any) {
    console.error(`  ✗ Call 2 FAILED: ${e.message}`);
    if (e.cause) console.error(`    Cause: ${(e.cause as Error).message}`);
    console.error('');
  }

  // Call 3 (third time, in case it's a state accumulation issue)
  console.log('Call 3: createUnprovenCallTx (third call)');
  try {
    const r = await createUnprovenCallTx(providers, options);
    console.log(`  ✓ Call 3 SUCCEEDED\n`);
  } catch (e: any) {
    console.error(`  ✗ Call 3 FAILED: ${e.message}\n`);
  }

  console.log('=== Done ===');
  process.exit(0);
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
