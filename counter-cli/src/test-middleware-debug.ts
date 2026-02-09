/**
 * Debug script: Reproduce the EXACT middleware path that fails on preprod.
 * 
 * This replicates what createUnprovenCallTxFromInitialStates does:
 * 1. Fetch contract state from indexer (like getContractPublicStates)
 * 2. Create ContractExecutable + ContractExecutableRuntime
 * 3. Call circuit via Effect runtime (like contractRuntime.runPromiseExit)
 * 
 * This should reproduce the "RuntimeError: unreachable" locally.
 */
import { FaucetAMM } from '@midnight-ntwrk/counter-contract';
import { witnesses } from '@midnight-ntwrk/counter-contract';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { ContractExecutable, CompiledContract } from '@midnight-ntwrk/compact-js';
import { makeContractExecutableRuntime, exitResultOrError } from '@midnight-ntwrk/midnight-js-types';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { Buffer } from 'buffer';
import * as ocrt from '@midnight-ntwrk/onchain-runtime-v2';
import path from 'node:path';

// ─── Configuration ──────────────────────────────────────────────────────
const REAL_COIN_PUBLIC_KEY = 'af009dd97d710f28bd98b7a164cfbe9e5e171cfbda9f3279f99678e337e652ee';
const CONTRACT_ADDRESS = 'c0d3950d5373f0bafae1dba3c1a48c9adb93a3150ca58c1758d65e93dc3ca792';

const INDEXER_URL = 'https://indexer.preprod.midnight.network/api/v3/graphql';
const INDEXER_WS = 'wss://indexer.preprod.midnight.network/api/v3/graphql/ws';

const currentDir = path.resolve(new URL(import.meta.url).pathname, '..');
const zkConfigPath = path.resolve(currentDir, '..', '..', 'contract', 'src', 'managed', 'FaucetAMM');

setNetworkId('preprod');

type FaucetAMMCircuits = 'mintTestTokensX' | 'mintTestTokensY' | 'initLiquidity' | 'addLiquidity' | 'removeLiquidity' | 'swapXToY' | 'swapYToX';

async function main() {
  console.log('=== Middleware Path Debug ===\n');

  // Step 1: Create compiled contract (same as api.ts)
  console.log('[Step 1] Creating CompiledContract...');
  const compiledContract = CompiledContract.make('FaucetAMM', FaucetAMM.Contract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );
  console.log('  ✓ CompiledContract created');

  // Step 2: Fetch contract state from indexer (replicating getContractPublicStates)
  console.log('\n[Step 2] Fetching contract state from indexer...');
  const publicDataProvider = indexerPublicDataProvider(INDEXER_URL, INDEXER_WS);
  
  let contractState: any;
  let zswapChainState: any;
  try {
    const data = await publicDataProvider.queryZSwapAndContractState(CONTRACT_ADDRESS);
    if (!data) {
      console.error('  ✗ No state found for contract!');
      process.exit(1);
    }
    [zswapChainState, contractState] = data;
    console.log('  ✓ Contract state fetched');
    console.log(`    contractState type: ${contractState?.constructor?.name || typeof contractState}`);
    console.log(`    zswapChainState type: ${zswapChainState?.constructor?.name || typeof zswapChainState}`);
    
    // Try to read ledger state for debugging
    try {
      const ledgerData = FaucetAMM.ledger(contractState);
      console.log(`    ledger.feeBps: ${ledgerData.feeBps}`);
      console.log(`    ledger.mintCounter: ${ledgerData.mintCounter}`);
      console.log(`    ledger.mintNonce: ${Buffer.from(ledgerData.mintNonce).toString('hex')}`);
      console.log(`    ledger.xLiquidity: ${ledgerData.xLiquidity}`);
    } catch (le: any) {
      console.log(`    (Could not read ledger: ${le.message})`);
    }
  } catch (e: any) {
    console.error(`  ✗ Fetch FAILED: ${e.message}`);
    process.exit(1);
  }

  // Step 3: Build the recipient
  console.log('\n[Step 3] Building recipient...');
  const coinPubKeyBytes = Buffer.from(REAL_COIN_PUBLIC_KEY, 'hex');
  const recipient = {
    is_left: true,
    left: { bytes: coinPubKeyBytes },
    right: { bytes: new Uint8Array(32) },
  };
  console.log(`  recipient ready: is_left=${recipient.is_left}, left.bytes.length=${recipient.left.bytes.length}`);

  // Step 4: Create ContractExecutable + Runtime (replicating createUnprovenCallTxFromInitialStates)
  console.log('\n[Step 4] Creating ContractExecutable + Runtime...');
  const zkConfigProvider = new NodeZkConfigProvider<FaucetAMMCircuits>(zkConfigPath);
  const contractExec = ContractExecutable.make(compiledContract);
  const contractRuntime = makeContractExecutableRuntime(zkConfigProvider, {
    coinPublicKey: REAL_COIN_PUBLIC_KEY,
  });
  console.log('  ✓ Runtime created');

  // Step 5: Execute the circuit via Effect runtime (the exact middleware path)
  console.log('\n[Step 5] Executing mintTestTokensX via Effect runtime...');
  console.log('  (This is the path that crashes with RuntimeError: unreachable)');
  try {
    const exitResult = await contractRuntime.runPromiseExit(
      contractExec.circuit('mintTestTokensX' as any, {
        address: CONTRACT_ADDRESS as any,
        contractState: contractState,
        privateState: {},
      } as any, ...[100n, recipient] as any)
    );

    console.log('  exitResult received, parsing...');
    try {
      const result = exitResultOrError(exitResult);
      console.log('  ✓ Circuit execution SUCCEEDED!');
      console.log('  result keys:', Object.keys(result));
    } catch (exitErr: any) {
      console.error(`  ✗ exitResult contains error: ${exitErr.message}`);
      if (exitErr.cause) console.error(`    Cause: ${(exitErr.cause as Error).message || exitErr.cause}`);
      console.error(`    Stack: ${exitErr.stack?.split('\n').slice(0, 10).join('\n')}`);
    }
  } catch (e: any) {
    console.error(`  ✗ Circuit execution FAILED: ${e.message}`);
    if (e.cause) {
      const cause = e.cause as Error;
      console.error(`    Cause: ${cause.message}`);
      console.error(`    Cause stack: ${cause.stack?.split('\n').slice(0, 10).join('\n')}`);
    }
    console.error(`    Stack: ${e.stack?.split('\n').slice(0, 10).join('\n')}`);
  }

  console.log('\n=== Done ===');
  process.exit(0);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
