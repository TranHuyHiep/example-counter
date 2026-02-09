/**
 * ISOLATED TEST: Only call submitCallTx — nothing else before it.
 * This eliminates the possibility that prior calls corrupt state.
 */
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import * as ledger from '@midnight-ntwrk/ledger-v7';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { Buffer } from 'buffer';
import path from 'node:path';
import { submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { FaucetAMM } from '@midnight-ntwrk/counter-contract';

setNetworkId('preprod');

const SEED = '1439daa970edb8d9941692ef66f3d83eb3ead8cc79005ee0b24c2a5bb35e4b498d6968c3741f191b51e7e8249b764e50cc38eec299976648e749519b025c41f8';

async function main() {
  console.log('=== ISOLATED submitCallTx Test ===\n');

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
    privateStateStoreName: 'faucet-amm-isolated-test',
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
    proofProvider: { proveTx: async (tx: any) => {
      console.log('  [proveTx] called!');
      return tx; // pass through
    }},
    midnightProvider: { submitTx: async (tx: any) => {
      console.log('  [submitTx] called!');
      return 'test-tx-id';
    }},
  };

  console.log('Calling submitCallTx...\n');
  try {
    const r = await submitCallTx(providers as any, {
      compiledContract,
      contractAddress: CONTRACT_ADDRESS,
      circuitId: 'mintTestTokensX',
      args: [100n, recipient],
    } as any);
    console.log(`\n  ✓ SUCCEEDED!`);
  } catch (e: any) {
    console.error(`\n  ✗ FAILED: ${e.message}`);
    if (e.cause) {
      const cause = e.cause as Error;
      console.error(`  Cause: ${cause.message}`);
      // Print full stack for WASM analysis
      console.error(`  Full cause stack:\n${cause.stack}`);
    }
  }

  try { await psp.clear(); } catch {}
  console.log('\n=== Done ===');
  process.exit(0);
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
