/**
 * Debug script: Test the FULL createUnprovenCallTxFromInitialStates path.
 * 
 * Our previous test only ran the circuit (contractRuntime.runPromiseExit).
 * But the real path ALSO calls createUnprovenLedgerCallTx afterward,
 * which uses ZswapOutput.new() from ledger-v7 WASM — this might be where
 * the "RuntimeError: unreachable" crash happens.
 * 
 * This test calls createUnprovenCallTxFromInitialStates directly to test
 * the full path including TX assembly.
 */
import { FaucetAMM } from '@midnight-ntwrk/counter-contract';
import { witnesses } from '@midnight-ntwrk/counter-contract';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { Buffer } from 'buffer';
import path from 'node:path';

// We need to import the internal function
// createUnprovenCallTxFromInitialStates is not exported, so we need to test
// via createUnprovenCallTx which IS exported
import {
  createUnprovenCallTx,
} from '@midnight-ntwrk/midnight-js-contracts';

// ─── Configuration ──────────────────────────────────────────────────────
const REAL_COIN_PUBLIC_KEY = 'af009dd97d710f28bd98b7a164cfbe9e5e171cfbda9f3279f99678e337e652ee';
const REAL_ENCRYPTION_PUBLIC_KEY_PLACEHOLDER = ''; // We'll get this from the wallet
const CONTRACT_ADDRESS = 'c0d3950d5373f0bafae1dba3c1a48c9adb93a3150ca58c1758d65e93dc3ca792';

const INDEXER_URL = 'https://indexer.preprod.midnight.network/api/v3/graphql';
const INDEXER_WS = 'wss://indexer.preprod.midnight.network/api/v3/graphql/ws';

const currentDir = path.resolve(new URL(import.meta.url).pathname, '..');
const zkConfigPath = path.resolve(currentDir, '..', '..', 'contract', 'src', 'managed', 'FaucetAMM');

setNetworkId('preprod');

type FaucetAMMCircuits = 'mintTestTokensX' | 'mintTestTokensY' | 'initLiquidity' | 'addLiquidity' | 'removeLiquidity' | 'swapXToY' | 'swapYToX';

async function main() {
  console.log('=== Full Unproven TX Debug (including ZswapOutput.new) ===\n');

  // Step 1: Get the encryption public key
  // In the real CLI, this comes from wallet.state().shielded.encryptionPublicKey
  // For this test, we need to get it from the wallet or use sampleEncryptionPublicKey
  console.log('[Step 1] Setting up...');
  
  // First, let's try to get a valid encryption public key.
  // We can either use the wallet SDK or try sampleEncryptionPublicKey from ledger-v7
  let encryptionPublicKey: string;
  try {
    const { sampleEncryptionPublicKey, sampleCoinPublicKey } = await import('@midnight-ntwrk/ledger-v7');
    encryptionPublicKey = sampleEncryptionPublicKey();
    console.log(`  Using sampleEncryptionPublicKey: ${encryptionPublicKey.substring(0, 20)}...`);
    console.log(`  sampleCoinPublicKey: ${sampleCoinPublicKey().substring(0, 20)}...`);
    console.log(`  Real coinPublicKey:  ${REAL_COIN_PUBLIC_KEY.substring(0, 20)}...`);
  } catch (e: any) {
    console.log(`  Could not get sample keys: ${e.message}`);
    // Use a dummy 32-byte hex string
    encryptionPublicKey = 'aa'.repeat(32);
    console.log(`  Using dummy encryptionPublicKey: ${encryptionPublicKey.substring(0, 20)}...`);
  }

  // Step 2: Create compiled contract
  console.log('\n[Step 2] Creating CompiledContract...');
  const compiledContract = CompiledContract.make('FaucetAMM', FaucetAMM.Contract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );
  console.log('  ✓ CompiledContract created');

  // Step 3: Build the recipient
  console.log('\n[Step 3] Building recipient...');
  const coinPubKeyBytes = Buffer.from(REAL_COIN_PUBLIC_KEY, 'hex');
  const recipient = {
    is_left: true,
    left: { bytes: coinPubKeyBytes },
    right: { bytes: new Uint8Array(32) },
  };

  // Step 4: Set up providers (minimal)
  console.log('\n[Step 4] Setting up providers...');
  const zkConfigProvider = new NodeZkConfigProvider<FaucetAMMCircuits>(zkConfigPath);
  const publicDataProvider = indexerPublicDataProvider(INDEXER_URL, INDEXER_WS);
  
  // Create a minimal WalletProvider
  const walletProvider = {
    getCoinPublicKey: () => REAL_COIN_PUBLIC_KEY,
    getEncryptionPublicKey: () => encryptionPublicKey,
    balanceTx: async (tx: any) => { throw new Error('Not implemented'); },
    signTx: async (tx: any) => { throw new Error('Not implemented'); },
  };

  const providers = {
    walletProvider,
    zkConfigProvider,
    publicDataProvider,
  };

  // Step 5: Call createUnprovenCallTx - this is the FULL path
  console.log('\n[Step 5] Calling createUnprovenCallTx (FULL path)...');
  console.log('  This calls:');
  console.log('    1. getContractPublicStates (fetches from indexer)');
  console.log('    2. createUnprovenCallTxFromInitialStates which:');
  console.log('       a. Runs the circuit via Effect runtime');
  console.log('       b. Calls createUnprovenLedgerCallTx');
  console.log('       c. Which calls ZswapOutput.new() from ledger-v7 WASM');
  console.log('');

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

    console.log('  ✓ createUnprovenCallTx SUCCEEDED!');
    console.log('  result.public keys:', Object.keys(result.public));
    console.log('  result.private keys:', Object.keys(result.private));
    console.log('  unprovenTx type:', result.private.unprovenTx?.constructor?.name);
    console.log('  newCoins length:', result.private.newCoins?.length);
  } catch (e: any) {
    console.error(`  ✗ createUnprovenCallTx FAILED: ${e.message}`);
    if (e.cause) {
      const cause = e.cause as Error;
      console.error(`    Cause: ${cause.message}`);
      console.error(`    Cause stack: ${cause.stack?.split('\n').slice(0, 15).join('\n')}`);
    }
    console.error(`    Stack: ${e.stack?.split('\n').slice(0, 15).join('\n')}`);
  }

  console.log('\n=== Done ===');
  process.exit(0);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
