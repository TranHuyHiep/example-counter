/**
 * PINPOINT TEST: Test the exact operations in mergeUnsubmittedCallTxData.
 * 
 * The crash is in this code (TransactionContextImpl[MergeUnsubmittedCallTxData]):
 *   const [zswapChainState] = callData.private.unprovenTx.guaranteedOffer
 *     ? this.currentStates.zswapChainState.tryApply(
 *         ZswapOffer.deserialize('pre-proof', 
 *           callData.private.unprovenTx.guaranteedOffer.serialize()))
 *     : [this.currentStates.zswapChainState];
 */
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import * as ledger from '@midnight-ntwrk/ledger-v7';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { Buffer } from 'buffer';
import path from 'node:path';
import { createUnprovenCallTx, getPublicStates } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { FaucetAMM } from '@midnight-ntwrk/counter-contract';

setNetworkId('preprod');

const SEED = '1439daa970edb8d9941692ef66f3d83eb3ead8cc79005ee0b24c2a5bb35e4b498d6968c3741f191b51e7e8249b764e50cc38eec299976648e749519b025c41f8';

async function main() {
  console.log('=== Pinpoint mergeUnsubmittedCallTxData Operations ===\n');

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

  // Step 1: Get callData from createUnprovenCallTx
  console.log('Step 1: Get callData from createUnprovenCallTx');
  const callData = await createUnprovenCallTx(providers, {
    compiledContract,
    contractAddress: CONTRACT_ADDRESS,
    circuitId: 'mintTestTokensX',
    args: [100n, recipient],
  } as any);
  console.log('  ✓ callData obtained\n');

  // Step 2: Get current states from indexer (this is what currentStates would be)
  console.log('Step 2: Get current states from indexer');
  const states = await getPublicStates(publicDataProvider, CONTRACT_ADDRESS);
  console.log(`  ✓ States obtained`);
  console.log(`  zswapChainState type: ${states.zswapChainState?.constructor?.name}`);
  console.log(`  contractState type: ${states.contractState?.constructor?.name}\n`);

  // Step 3: Check if guaranteedOffer exists
  const tx = callData.private.unprovenTx;
  console.log('Step 3: Check unprovenTx structure');
  console.log(`  unprovenTx type: ${tx?.constructor?.name}`);
  console.log(`  has guaranteedOffer: ${tx?.guaranteedOffer != null}`);
  
  if (tx?.guaranteedOffer) {
    console.log(`  guaranteedOffer type: ${tx.guaranteedOffer?.constructor?.name}\n`);

    // Step 4: Serialize the guaranteedOffer
    console.log('Step 4: Serialize guaranteedOffer');
    let serialized: Uint8Array;
    try {
      serialized = tx.guaranteedOffer.serialize();
      console.log(`  ✓ serialize() OK, length=${serialized.length}\n`);
    } catch (e: any) {
      console.error(`  ✗ serialize() FAILED: ${e.message}\n`);
      process.exit(1);
    }

    // Step 5: Deserialize with 'pre-proof'
    console.log('Step 5: ZswapOffer.deserialize(\'pre-proof\', serialized)');
    let deserializedOffer: any;
    try {
      deserializedOffer = ledger.ZswapOffer.deserialize('pre-proof' as any, serialized);
      console.log(`  ✓ deserialize OK\n`);
    } catch (e: any) {
      console.error(`  ✗ deserialize FAILED: ${e.message}`);
      console.error(`    Stack: ${e.stack?.split('\n').slice(0, 5).join('\n')}\n`);
      process.exit(1);
    }

    // Step 6: Try to apply to zswapChainState
    console.log('Step 6: zswapChainState.tryApply(deserializedOffer)');
    try {
      const [newState] = states.zswapChainState.tryApply(deserializedOffer);
      console.log(`  ✓ tryApply OK\n`);
    } catch (e: any) {
      console.error(`  ✗ tryApply FAILED: ${e.message}`);
      console.error(`    Stack: ${e.stack?.split('\n').slice(0, 10).join('\n')}\n`);
      
      if (e.message === 'unreachable' || e instanceof WebAssembly.RuntimeError) {
        console.error('  *** THIS IS THE CRASH POINT! ***');
        console.error('  zswapChainState.tryApply() crashes with RuntimeError: unreachable');
      }
    }
  } else {
    console.log('  No guaranteedOffer — checking other offers...');
    console.log(`  intents: ${tx?.intents?.size}`);
    // Check the transaction more thoroughly
    try {
      const serialized = tx.serialize();
      console.log(`  tx.serialize() OK, length=${serialized.length}`);
    } catch (e: any) {
      console.error(`  tx.serialize() FAILED: ${e.message}`);
    }
  }

  console.log('=== Done ===');
  process.exit(0);
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
