// This file is part of midnightntwrk/example-counter.
// Copyright (C) 2025 Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { randomBytes } from 'crypto';
import { type ContractAddress } from '@midnight-ntwrk/compact-runtime';
import { FaucetAMM, type FaucetAMMPrivateState, witnesses } from '@midnight-ntwrk/counter-contract';
import * as ledger from '@midnight-ntwrk/ledger-v7';
import { unshieldedToken } from '@midnight-ntwrk/ledger-v7';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { type FinalizedTxData, type MidnightProvider, type WalletProvider } from '@midnight-ntwrk/midnight-js-types';
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { HDWallet, Roles, generateRandomSeed } from '@midnight-ntwrk/wallet-sdk-hd';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import {
  createKeystore,
  InMemoryTransactionHistoryStorage,
  PublicKey,
  UnshieldedWallet,
  type UnshieldedKeystore,
} from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { type Logger } from 'pino';
import * as Rx from 'rxjs';
import { WebSocket } from 'ws';
import {
  type FaucetAMMCircuits,
  type FaucetAMMContract,
  type FaucetAMMPrivateStateId,
  type FaucetAMMProviders,
  type DeployedFaucetAMMContract,
} from './common-types';
import { type Config, contractConfig } from './config';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { assertIsContractAddress, toHex } from '@midnight-ntwrk/midnight-js-utils';
import { getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { Buffer } from 'buffer';
import * as bip39 from 'bip39';
import {
  MidnightBech32m,
  ShieldedAddress,
  ShieldedCoinPublicKey,
  ShieldedEncryptionPublicKey,
} from '@midnight-ntwrk/wallet-sdk-address-format';

let logger: Logger;

// Required for GraphQL subscriptions (wallet sync) to work in Node.js
// @ts-expect-error: It's needed to enable WebSocket usage through apollo
globalThis.WebSocket = WebSocket;

// Pre-compile the FaucetAMM contract with ZK circuit assets
const faucetAMMCompiledContract = CompiledContract.make('FaucetAMM', FaucetAMM.Contract<FaucetAMMPrivateState>).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(contractConfig.zkConfigPath),
);

export interface WalletContext {
  wallet: WalletFacade;
  shieldedSecretKeys: ledger.ZswapSecretKeys;
  dustSecretKey: ledger.DustSecretKey;
  unshieldedKeystore: UnshieldedKeystore;
}

export const faucetAMMContractInstance: FaucetAMMContract = new FaucetAMM.Contract(witnesses);

export const joinContract = async (
  providers: FaucetAMMProviders,
  contractAddress: string,
): Promise<DeployedFaucetAMMContract> => {
  const faucetAMMContract = await findDeployedContract(providers, {
    contractAddress,
    compiledContract: faucetAMMCompiledContract,
    privateStateId: 'faucetAMMPrivateState',
    initialPrivateState: {},
  });
  logger.info(`Joined contract at address: ${faucetAMMContract.deployTxData.public.contractAddress}`);
  
  // Initialize pool tracker with default fee (can't read ledger yet)
  initPoolTracker(faucetAMMContract.deployTxData.public.contractAddress, 10n);
  logger.warn('Joined existing contract - pool state tracker initialized to zeros');
  logger.warn('Perform operations to update local tracking');
  
  return faucetAMMContract;
};

export const deploy = async (
  providers: FaucetAMMProviders,
  privateState: FaucetAMMPrivateState,
  feeBps: bigint,
): Promise<DeployedFaucetAMMContract> => {
  logger.info(`Deploying FaucetAMM contract with fee ${feeBps} bps...`);
  const faucetAMMContract = await deployContract(providers, {
    compiledContract: faucetAMMCompiledContract,
    privateStateId: 'faucetAMMPrivateState',
    initialPrivateState: privateState,
    args: [feeBps],
  });
  logger.info(`Deployed contract at address: ${faucetAMMContract.deployTxData.public.contractAddress}`);
  
  // Initialize pool tracker
  initPoolTracker(faucetAMMContract.deployTxData.public.contractAddress, feeBps);
  
  return faucetAMMContract;
};

/**
 * Get the unshielded wallet address as raw bytes (32 bytes)
 */
export const getUnshieldedAddressBytes = async (wallet: WalletFacade): Promise<Uint8Array> => {
  const state = await Rx.firstValueFrom(wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  // The unshielded address is essentially the public key
  // Convert it to a format we can use - get the underlying bytes
  const addressString = state.unshielded.address.hexString;
  return hexToBytes(addressString);
};

// Helper to convert hex string to Uint8Array for Bytes<32>
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32 && i * 2 < hex.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export const mintTokensX = async (
  faucetAMMContract: DeployedFaucetAMMContract,
  amount: bigint,
  wallet: WalletFacade,
): Promise<FinalizedTxData> => {
  logger.info(`Minting ${amount} X tokens (unshielded)...`);
  
  const state = await Rx.firstValueFrom(wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  
  // Get unshielded address bytes (32 bytes)
  const userAddressHex = state.unshielded.address.hexString;
  const userAddressBytes = new Uint8Array(32);
  const hexBytes = Buffer.from(userAddressHex, 'hex');
  userAddressBytes.set(hexBytes.slice(0, 32));
  
  logger.info(`Recipient unshielded address: ${userAddressHex}`);
  
  // For unshielded tokens: Either<ContractAddress, UserAddress>
  // Use is_left=false to send to UserAddress (unshielded wallet)
  const recipient = {
    is_left: false,  // Use right side for UserAddress
    left: { bytes: new Uint8Array(32) },  // Empty ContractAddress
    right: { bytes: userAddressBytes },  // UserAddress
  };
  
  const finalizedTxData = await faucetAMMContract.callTx.mintTestTokensX(amount, recipient);
  logger.info(`Transaction ${finalizedTxData.public.txId} added in block ${finalizedTxData.public.blockHeight}`);
  return finalizedTxData.public;
};

export const mintTokensY = async (
  faucetAMMContract: DeployedFaucetAMMContract,
  amount: bigint,
  wallet: WalletFacade,
): Promise<FinalizedTxData> => {
  logger.info(`Minting ${amount} Y tokens (unshielded)...`);
  
  const state = await Rx.firstValueFrom(wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  
  // Get unshielded address bytes (32 bytes)
  const userAddressHex = state.unshielded.address.hexString;
  const userAddressBytes = new Uint8Array(32);
  const hexBytes = Buffer.from(userAddressHex, 'hex');
  userAddressBytes.set(hexBytes.slice(0, 32));
  
  // For unshielded tokens: Either<ContractAddress, UserAddress>
  const recipient = {
    is_left: false,
    left: { bytes: new Uint8Array(32) },
    right: { bytes: userAddressBytes },
  };
  
  const finalizedTxData = await faucetAMMContract.callTx.mintTestTokensY(amount, recipient);
  logger.info(`Transaction ${finalizedTxData.public.txId} added in block ${finalizedTxData.public.blockHeight}`);
  return finalizedTxData.public;
};

// ============================================
// AMM LIQUIDITY FUNCTIONS
// ============================================

export const initLiquidity = async (
  faucetAMMContract: DeployedFaucetAMMContract,
  xIn: bigint,
  yIn: bigint,
  lpOut: bigint,
  wallet: WalletFacade,
): Promise<FinalizedTxData> => {
  logger.info(`Initializing liquidity pool: ${xIn} X + ${yIn} Y -> ${lpOut} LP...`);
  
  const state = await Rx.firstValueFrom(wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  const userAddressHex = state.unshielded.address.hexString;
  const userAddressBytes = new Uint8Array(32);
  const hexBytes = Buffer.from(userAddressHex, 'hex');
  userAddressBytes.set(hexBytes.slice(0, 32));
  
  const recipient = {
    is_left: false,
    left: { bytes: new Uint8Array(32) },
    right: { bytes: userAddressBytes },
  };
  
  const finalizedTxData = await faucetAMMContract.callTx.initLiquidity(xIn, yIn, lpOut, recipient);
  logger.info(`Transaction ${finalizedTxData.public.txId} added in block ${finalizedTxData.public.blockHeight}`);
  
  // Update local pool tracker
  const contractAddress = faucetAMMContract.deployTxData.public.contractAddress;
  updatePoolTracker(contractAddress, {
    xLiquidity: xIn,
    yLiquidity: yIn,
    lpCirculatingSupply: lpOut,
  });
  logger.info(`Pool tracker updated: xLiq=${xIn}, yLiq=${yIn}, lpSupply=${lpOut}`);
  
  return finalizedTxData.public;
};

export const addLiquidity = async (
  faucetAMMContract: DeployedFaucetAMMContract,
  xIn: bigint,
  yIn: bigint,
  lpOut: bigint,
  wallet: WalletFacade,
): Promise<FinalizedTxData> => {
  logger.info(`Adding liquidity: ${xIn} X + ${yIn} Y -> ${lpOut} LP...`);
  
  const state = await Rx.firstValueFrom(wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  const userAddressHex = state.unshielded.address.hexString;
  const userAddressBytes = new Uint8Array(32);
  const hexBytes = Buffer.from(userAddressHex, 'hex');
  userAddressBytes.set(hexBytes.slice(0, 32));
  
  const recipient = {
    is_left: false,
    left: { bytes: new Uint8Array(32) },
    right: { bytes: userAddressBytes },
  };
  
  const finalizedTxData = await faucetAMMContract.callTx.addLiquidity(xIn, yIn, lpOut, recipient);
  logger.info(`Transaction ${finalizedTxData.public.txId} added in block ${finalizedTxData.public.blockHeight}`);
  
  // Update local pool tracker
  const contractAddress = faucetAMMContract.deployTxData.public.contractAddress;
  const tracker = poolTrackers.get(contractAddress);
  if (tracker) {
    tracker.xLiquidity += xIn;
    tracker.yLiquidity += yIn;
    tracker.lpCirculatingSupply += lpOut;
    logger.info(`Pool tracker updated: xLiq=${tracker.xLiquidity}, yLiq=${tracker.yLiquidity}, lpSupply=${tracker.lpCirculatingSupply}`);
  }
  
  return finalizedTxData.public;
};

export const removeLiquidity = async (
  faucetAMMContract: DeployedFaucetAMMContract,
  lpIn: bigint,
  xOut: bigint,
  yOut: bigint,
  wallet: WalletFacade,
): Promise<FinalizedTxData> => {
  logger.info(`Removing liquidity: ${lpIn} LP -> ${xOut} X + ${yOut} Y...`);
  
  const state = await Rx.firstValueFrom(wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  const userAddressHex = state.unshielded.address.hexString;
  const userAddressBytes = new Uint8Array(32);
  const hexBytes = Buffer.from(userAddressHex, 'hex');
  userAddressBytes.set(hexBytes.slice(0, 32));
  
  const recipient = {
    is_left: false,
    left: { bytes: new Uint8Array(32) },
    right: { bytes: userAddressBytes },
  };
  
  const finalizedTxData = await faucetAMMContract.callTx.removeLiquidity(lpIn, xOut, yOut, recipient);
  logger.info(`Transaction ${finalizedTxData.public.txId} added in block ${finalizedTxData.public.blockHeight}`);
  
  // Update local pool tracker
  const contractAddress = faucetAMMContract.deployTxData.public.contractAddress;
  const tracker = poolTrackers.get(contractAddress);
  if (tracker) {
    tracker.xLiquidity -= xOut;
    tracker.yLiquidity -= yOut;
    tracker.lpCirculatingSupply -= lpIn;
    logger.info(`Pool tracker updated: xLiq=${tracker.xLiquidity}, yLiq=${tracker.yLiquidity}, lpSupply=${tracker.lpCirculatingSupply}`);
  }
  
  return finalizedTxData.public;
};

export const swapXToY = async (
  faucetAMMContract: DeployedFaucetAMMContract,
  xIn: bigint,
  xFee: bigint,
  yOut: bigint,
  wallet: WalletFacade,
): Promise<FinalizedTxData> => {
  logger.info(`Swapping ${xIn} X (fee: ${xFee}) -> ${yOut} Y...`);
  
  const state = await Rx.firstValueFrom(wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  const userAddressHex = state.unshielded.address.hexString;
  const userAddressBytes = new Uint8Array(32);
  const hexBytes = Buffer.from(userAddressHex, 'hex');
  userAddressBytes.set(hexBytes.slice(0, 32));
  
  const recipient = {
    is_left: false,
    left: { bytes: new Uint8Array(32) },
    right: { bytes: userAddressBytes },
  };
  
  const finalizedTxData = await faucetAMMContract.callTx.swapXToY(xIn, xFee, yOut, recipient);
  logger.info(`Transaction ${finalizedTxData.public.txId} added in block ${finalizedTxData.public.blockHeight}`);
  
  // Update local pool tracker
  const contractAddress = faucetAMMContract.deployTxData.public.contractAddress;
  const tracker = poolTrackers.get(contractAddress);
  if (tracker) {
    tracker.xLiquidity += xIn;
    tracker.yLiquidity -= yOut;
    tracker.xRewards += xFee;
    logger.info(`Pool tracker updated: xLiq=${tracker.xLiquidity}, yLiq=${tracker.yLiquidity}, xRewards=${tracker.xRewards}`);
  }
  
  return finalizedTxData.public;
};

export const swapYToX = async (
  faucetAMMContract: DeployedFaucetAMMContract,
  yIn: bigint,
  xFee: bigint,
  xOut: bigint,
  wallet: WalletFacade,
): Promise<FinalizedTxData> => {
  logger.info(`Swapping ${yIn} Y -> ${xOut} X (fee: ${xFee})...`);
  
  const state = await Rx.firstValueFrom(wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  const userAddressHex = state.unshielded.address.hexString;
  const userAddressBytes = new Uint8Array(32);
  const hexBytes = Buffer.from(userAddressHex, 'hex');
  userAddressBytes.set(hexBytes.slice(0, 32));
  
  const recipient = {
    is_left: false,
    left: { bytes: new Uint8Array(32) },
    right: { bytes: userAddressBytes },
  };
  
  const finalizedTxData = await faucetAMMContract.callTx.swapYToX(yIn, xFee, xOut, recipient);
  logger.info(`Transaction ${finalizedTxData.public.txId} added in block ${finalizedTxData.public.blockHeight}`);
  
  // Update local pool tracker
  const contractAddress = faucetAMMContract.deployTxData.public.contractAddress;
  const tracker = poolTrackers.get(contractAddress);
  if (tracker) {
    tracker.xLiquidity -= xOut;
    tracker.yLiquidity += yIn;
    tracker.xRewards += xFee;
    logger.info(`Pool tracker updated: xLiq=${tracker.xLiquidity}, yLiq=${tracker.yLiquidity}, xRewards=${tracker.xRewards}`);
  }
  
  return finalizedTxData.public;
};

// ============================================
// POOL STATUS
// ============================================

// ============================================
// POOL STATUS TRACKER (Client-side)
// ============================================

// Local tracking of pool state (since ledger reading requires indexer)
interface PoolStateTracker {
  feeBps: bigint;
  xRewards: bigint;
  xLiquidity: bigint;
  yLiquidity: bigint;
  lpCirculatingSupply: bigint;
}

const poolTrackers = new Map<string, PoolStateTracker>();

export const initPoolTracker = (contractAddress: string, feeBps: bigint) => {
  poolTrackers.set(contractAddress, {
    feeBps,
    xRewards: 0n,
    xLiquidity: 0n,
    yLiquidity: 0n,
    lpCirculatingSupply: 0n,
  });
};

export const updatePoolTracker = (
  contractAddress: string,
  updates: Partial<PoolStateTracker>
) => {
  const tracker = poolTrackers.get(contractAddress);
  if (tracker) {
    Object.assign(tracker, updates);
  }
};

export const getPoolStatus = async (
  faucetAMMContract: DeployedFaucetAMMContract,
  wallet: WalletFacade,
): Promise<{
  feeBps: bigint;
  xRewards: bigint;
  xLiquidity: bigint;
  yLiquidity: bigint;
  lpCirculatingSupply: bigint;
}> => {
  logger.info('Reading pool status from contract ledger...');
  
  const contractAddress = faucetAMMContract.deployTxData.public.contractAddress;
  const tracker = poolTrackers.get(contractAddress);
  
  if (!tracker) {
    logger.warn('No local pool tracker found. Returning default values.');
    logger.warn('Note: Ledger state reading requires indexer API (not yet available)');
    return {
      feeBps: 10n,
      xRewards: 0n,
      xLiquidity: 0n,
      yLiquidity: 0n,
      lpCirculatingSupply: 0n,
    };
  }
  
  logger.info(`Pool state (client-side tracking): x=${tracker.xLiquidity}, y=${tracker.yLiquidity}, lp=${tracker.lpCirculatingSupply}`);
  return { ...tracker };
};

/**
 * Sign all unshielded offers in a transaction's intents, using the correct
 * proof marker for Intent.deserialize. This works around a bug in the wallet
 * SDK where signRecipe hardcodes 'pre-proof', which fails for proven
 * (UnboundTransaction) intents that contain 'proof' data.
 */
const signTransactionIntents = (
  tx: { intents?: Map<number, any> },
  signFn: (payload: Uint8Array) => ledger.Signature,
  proofMarker: 'proof' | 'pre-proof',
): void => {
  if (!tx.intents || tx.intents.size === 0) return;

  for (const segment of tx.intents.keys()) {
    const intent = tx.intents.get(segment);
    if (!intent) continue;

    // Clone the intent with the correct proof marker.
    // The wallet SDK bug hardcodes 'pre-proof' here, which fails for
    // proven (UnboundTransaction) intents that use 'proof'.
    const cloned = ledger.Intent.deserialize<ledger.SignatureEnabled, ledger.Proofish, ledger.PreBinding>(
      'signature',
      proofMarker,
      'pre-binding',
      intent.serialize(),
    );

    const sigData = cloned.signatureData(segment);
    const signature = signFn(sigData);

    if (cloned.fallibleUnshieldedOffer) {
      const sigs = cloned.fallibleUnshieldedOffer.inputs.map(
        (_: ledger.UtxoSpend, i: number) => cloned.fallibleUnshieldedOffer!.signatures.at(i) ?? signature,
      );
      cloned.fallibleUnshieldedOffer = cloned.fallibleUnshieldedOffer.addSignatures(sigs);
    }

    if (cloned.guaranteedUnshieldedOffer) {
      const sigs = cloned.guaranteedUnshieldedOffer.inputs.map(
        (_: ledger.UtxoSpend, i: number) => cloned.guaranteedUnshieldedOffer!.signatures.at(i) ?? signature,
      );
      cloned.guaranteedUnshieldedOffer = cloned.guaranteedUnshieldedOffer.addSignatures(sigs);
    }

    tx.intents.set(segment, cloned);
  }
};

/**
 * Create the unified WalletProvider & MidnightProvider for midnight-js.
 * This bridges the wallet-sdk-facade to the midnight-js contract API by
 * implementing balance, sign, finalize, and submit operations.
 */
export const createWalletAndMidnightProvider = async (
  ctx: WalletContext,
): Promise<WalletProvider & MidnightProvider> => {
  const state = await Rx.firstValueFrom(ctx.wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  return {
    getCoinPublicKey() {
      return state.shielded.coinPublicKey.toHexString();
    },
    getEncryptionPublicKey() {
      return state.shielded.encryptionPublicKey.toHexString();
    },
    async balanceTx(tx, ttl?) {
      const recipe = await ctx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: ctx.shieldedSecretKeys, dustSecretKey: ctx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );

      // Work around wallet SDK bug: signRecipe uses hardcoded 'pre-proof'
      // marker when cloning intents, but proven (UnboundTransaction) intents
      // have 'proof' data, causing "Failed to clone intent". We sign manually
      // with the correct proof markers.
      const signFn = (payload: Uint8Array) => ctx.unshieldedKeystore.signData(payload);
      signTransactionIntents(recipe.baseTransaction, signFn, 'proof');
      if (recipe.balancingTransaction) {
        signTransactionIntents(recipe.balancingTransaction, signFn, 'pre-proof');
      }

      return ctx.wallet.finalizeRecipe(recipe);
    },
    submitTx(tx) {
      return ctx.wallet.submitTransaction(tx) as any;
    },
  };
};

/** Wait until the wallet has fully synced with the network. Returns the synced state. */
export const waitForSync = (wallet: WalletFacade) =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(5_000),
      Rx.filter((state) => state.isSynced),
    ),
  );

/** Wait until the wallet has a non-zero unshielded balance. Returns the balance. */
export const waitForFunds = (wallet: WalletFacade): Promise<bigint> =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(10_000),
      Rx.filter((state) => state.isSynced),
      Rx.map((s) => s.unshielded.balances[unshieldedToken().raw] ?? 0n),
      Rx.filter((balance) => balance > 0n),
    ),
  );

const buildShieldedConfig = ({ indexer, indexerWS, node, proofServer }: Config) => ({
  networkId: getNetworkId(),
  indexerClientConnection: {
    indexerHttpUrl: indexer,
    indexerWsUrl: indexerWS,
  },
  provingServerUrl: new URL(proofServer),
  relayURL: new URL(node.replace(/^http/, 'ws')),
});

const buildUnshieldedConfig = ({ indexer, indexerWS }: Config) => ({
  networkId: getNetworkId(),
  indexerClientConnection: {
    indexerHttpUrl: indexer,
    indexerWsUrl: indexerWS,
  },
  txHistoryStorage: new InMemoryTransactionHistoryStorage(),
});

const buildDustConfig = ({ indexer, indexerWS, node, proofServer }: Config) => ({
  networkId: getNetworkId(),
  costParameters: {
    additionalFeeOverhead: 300_000_000_000_000n,
    feeBlocksMargin: 5,
  },
  indexerClientConnection: {
    indexerHttpUrl: indexer,
    indexerWsUrl: indexerWS,
  },
  provingServerUrl: new URL(proofServer),
  relayURL: new URL(node.replace(/^http/, 'ws')),
});

/**
 * Derive HD wallet keys for all three roles (Zswap, NightExternal, Dust)
 * from a hex-encoded seed using BIP-44 style derivation at account 0, index 0.
 */
const deriveKeysFromSeed = (seed: string) => {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hdWallet.type !== 'seedOk') {
    throw new Error('Failed to initialize HDWallet from seed');
  }

  const derivationResult = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);

  if (derivationResult.type !== 'keysDerived') {
    throw new Error('Failed to derive keys');
  }

  hdWallet.hdWallet.clear();
  return derivationResult.keys;
};

/**
 * Formats a token balance for display (e.g. 1000000000 -> "1,000,000,000").
 */
const formatBalance = (balance: bigint): string => balance.toLocaleString();

/**
 * Runs an async operation with an animated spinner on the console.
 * Shows ⠋⠙⠹... while running, then ✓ on success or ✗ on failure.
 */
export const withStatus = async <T>(message: string, fn: () => Promise<T>): Promise<T> => {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  const interval = setInterval(() => {
    process.stdout.write(`\r  ${frames[i++ % frames.length]} ${message}`);
  }, 80);
  try {
    const result = await fn();
    clearInterval(interval);
    process.stdout.write(`\r  ✓ ${message}\n`);
    return result;
  } catch (e) {
    clearInterval(interval);
    process.stdout.write(`\r  ✗ ${message}\n`);
    throw e;
  }
};

/**
 * Register unshielded NIGHT UTXOs for dust generation.
 *
 * On Preprod/Preview, NIGHT tokens generate DUST over time, but only after
 * the UTXOs have been explicitly designated for dust generation via an on-chain
 * transaction. DUST is the non-transferable fee token used by the Midnight network.
 */
const registerForDustGeneration = async (
  wallet: WalletFacade,
  unshieldedKeystore: UnshieldedKeystore,
): Promise<void> => {
  const state = await Rx.firstValueFrom(wallet.state().pipe(Rx.filter((s) => s.isSynced)));

  // Check if dust is already available (e.g. from a previous designation)
  if (state.dust.availableCoins.length > 0) {
    const dustBal = state.dust.walletBalance(new Date());
    console.log(`  ✓ Dust tokens already available (${formatBalance(dustBal)} DUST)`);
    return;
  }

  // Only register coins that haven't been designated yet
  const nightUtxos = state.unshielded.availableCoins.filter(
    (coin: any) => coin.meta?.registeredForDustGeneration !== true,
  );
  if (nightUtxos.length === 0) {
    // All coins already registered — just wait for dust to generate
    await withStatus('Waiting for dust tokens to generate', () =>
      Rx.firstValueFrom(
        wallet.state().pipe(
          Rx.throttleTime(5_000),
          Rx.filter((s) => s.isSynced),
          Rx.filter((s) => s.dust.walletBalance(new Date()) > 0n),
        ),
      ),
    );
    return;
  }

  await withStatus(`Registering ${nightUtxos.length} NIGHT UTXO(s) for dust generation`, async () => {
    const recipe = await wallet.registerNightUtxosForDustGeneration(
      nightUtxos,
      unshieldedKeystore.getPublicKey(),
      (payload) => unshieldedKeystore.signData(payload),
    );
    const finalized = await wallet.finalizeRecipe(recipe);
    await wallet.submitTransaction(finalized);
  });

  // Wait for dust to actually generate (balance > 0), not just for coins to appear
  await withStatus('Waiting for dust tokens to generate', () =>
    Rx.firstValueFrom(
      wallet.state().pipe(
        Rx.throttleTime(5_000),
        Rx.filter((s) => s.isSynced),
        Rx.filter((s) => s.dust.walletBalance(new Date()) > 0n),
      ),
    ),
  );
};

/**
 * Prints a formatted wallet summary to the console, showing all three
 * wallet types (Shielded, Unshielded, Dust) with their addresses and balances.
 */
const printWalletSummary = (seed: string, state: any, unshieldedKeystore: UnshieldedKeystore) => {
  const networkId = getNetworkId();
  const unshieldedBalance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;

  // Build the bech32m shielded address from coin + encryption public keys
  const coinPubKey = ShieldedCoinPublicKey.fromHexString(state.shielded.coinPublicKey.toHexString());
  const encPubKey = ShieldedEncryptionPublicKey.fromHexString(state.shielded.encryptionPublicKey.toHexString());
  const shieldedAddress = MidnightBech32m.encode(networkId, new ShieldedAddress(coinPubKey, encPubKey)).toString();

  const DIV = '──────────────────────────────────────────────────────────────';

  console.log(`
${DIV}
  Wallet Overview                            Network: ${networkId}
${DIV}
  Seed: ${seed}
${DIV}

  Shielded (ZSwap)
  └─ Address: ${shieldedAddress}

  Unshielded
  ├─ Address: ${unshieldedKeystore.getBech32Address()}
  └─ Balance: ${formatBalance(unshieldedBalance)} tNight

  Dust
  └─ Address: ${state.dust.dustAddress}

${DIV}`);
};

/**
 * Build (or restore) a wallet from a hex seed, then wait for the wallet
 * to sync and receive funds before returning.
 *
 * Steps:
 *   1. Derive HD keys (Zswap, NightExternal, Dust) from the seed
 *   2. Create the three sub-wallets (Shielded, Unshielded, Dust)
 *   3. Start the WalletFacade and wait for sync
 *   4. Display a wallet summary with all addresses
 *   5. If balance is zero, wait for incoming funds (e.g. from faucet)
 */
export const buildWalletAndWaitForFunds = async (config: Config, seed: string): Promise<WalletContext> => {
  console.log('');

  // Derive HD keys and initialize the three sub-wallets
  const { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore } = await withStatus(
    'Building wallet',
    async () => {
      const keys = deriveKeysFromSeed(seed);
      const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
      const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
      const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], getNetworkId());
      const shieldedWallet = ShieldedWallet(buildShieldedConfig(config)).startWithSecretKeys(shieldedSecretKeys);
      const unshieldedWallet = UnshieldedWallet(buildUnshieldedConfig(config)).startWithPublicKey(
        PublicKey.fromKeyStore(unshieldedKeystore),
      );
      const dustWallet = DustWallet(buildDustConfig(config)).startWithSecretKey(
        dustSecretKey,
        ledger.LedgerParameters.initialParameters().dust,
      );

      const wallet = new WalletFacade(shieldedWallet, unshieldedWallet, dustWallet);
      await wallet.start(shieldedSecretKeys, dustSecretKey);

      return { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };
    },
  );

  // Show seed and unshielded address immediately so user can fund via faucet while syncing
  const networkId = getNetworkId();
  const DIV = '──────────────────────────────────────────────────────────────';
  console.log(`
${DIV}
  Wallet Overview                            Network: ${networkId}
${DIV}
  Seed: ${seed}

  Unshielded Address (send tNight here):
  ${unshieldedKeystore.getBech32Address()}

  Fund your wallet with tNight from the Preprod faucet:
  https://faucet.preprod.midnight.network/
${DIV}
`);

  // Wait for the wallet to sync with the network
  const syncedState = await withStatus('Syncing with network', () => waitForSync(wallet));

  // Display the full wallet summary with all addresses and balances
  printWalletSummary(seed, syncedState, unshieldedKeystore);

  // Check if wallet has funds; if not, wait for incoming tokens
  const balance = syncedState.unshielded.balances[unshieldedToken().raw] ?? 0n;
  if (balance === 0n) {
    const fundedBalance = await withStatus('Waiting for incoming tokens', () => waitForFunds(wallet));
    console.log(`    Balance: ${formatBalance(fundedBalance)} tNight\n`);
  }

  // Register NIGHT UTXOs for dust generation (required for tx fees on Preprod/Preview)
  await registerForDustGeneration(wallet, unshieldedKeystore);

  return { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };
};

export const buildFreshWallet = async (config: Config): Promise<WalletContext> =>
  await buildWalletAndWaitForFunds(config, toHex(Buffer.from(generateRandomSeed())));

/**
 * Build a wallet from a 24-word BIP39 mnemonic phrase.
 * 
 * This function allows you to restore an existing wallet using your mnemonic backup.
 * The mnemonic is converted to a seed using BIP39 standard, then the wallet is
 * initialized with the same process as a new wallet.
 * 
 * @param config - Network configuration (preprod/preview)
 * @param mnemonic - 24-word mnemonic phrase (space-separated)
 * @returns WalletContext with the restored wallet
 * 
 * @example
 * ```typescript
 * const mnemonic = "word1 word2 word3 ... word24";
 * const wallet = await buildWalletFromMnemonic(config, mnemonic);
 * ```
 */
export const buildWalletFromMnemonic = async (config: Config, mnemonic: string): Promise<WalletContext> => {
  // Validate mnemonic
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase. Please check your 24-word phrase.');
  }

  // Convert mnemonic to seed (64 bytes / 128 hex chars)
  const seedBuffer = bip39.mnemonicToSeedSync(mnemonic, ''); // Empty passphrase
  const seed = seedBuffer.toString('hex');

  console.log('\n✓ Mnemonic validated successfully');
  console.log(`✓ Restoring wallet from seed: ${seed.slice(0, 16)}...${seed.slice(-16)}\n`);

  // Use the same wallet building process as other methods
  return await buildWalletAndWaitForFunds(config, seed);
};

/**
 * Generate a new 24-word BIP39 mnemonic and display it to the user.
 * This is useful for creating a new wallet with a human-readable backup.
 * 
 * @param config - Network configuration
 * @returns WalletContext with the new wallet AND the mnemonic phrase
 */
export const buildFreshWalletWithMnemonic = async (
  config: Config,
): Promise<WalletContext & { mnemonic: string }> => {
  // Generate 256-bit entropy → 24 words
  const mnemonic = bip39.generateMnemonic(256);

  const DIV = '══════════════════════════════════════════════════════════════';
  console.log(`
${DIV}
  🔑 NEW WALLET MNEMONIC (24 WORDS)
${DIV}

  ⚠️  WRITE DOWN THESE 24 WORDS AND KEEP THEM SAFE!
  ⚠️  Anyone with these words can access your wallet!

  ${mnemonic}

${DIV}
`);

  // Convert to seed and build wallet
  const seedBuffer = bip39.mnemonicToSeedSync(mnemonic, '');
  const seed = seedBuffer.toString('hex');

  const walletContext = await buildWalletAndWaitForFunds(config, seed);

  return { ...walletContext, mnemonic };
};

/**
 * Configure all midnight-js providers needed for contract deployment and interaction.
 * This wires together the wallet, proof server, indexer, and private state storage.
 */
export const configureProviders = async (ctx: WalletContext, config: Config) => {
  const walletAndMidnightProvider = await createWalletAndMidnightProvider(ctx);
  const zkConfigProvider = new NodeZkConfigProvider<FaucetAMMCircuits>(contractConfig.zkConfigPath);
  return {
    privateStateProvider: levelPrivateStateProvider<typeof FaucetAMMPrivateStateId>({
      privateStateStoreName: contractConfig.privateStateStoreName,
      walletProvider: walletAndMidnightProvider,
    }),
    publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(config.proofServer, zkConfigProvider),
    walletProvider: walletAndMidnightProvider,
    midnightProvider: walletAndMidnightProvider,
  };
};

/**
 * Get the current DUST balance from the wallet state.
 */
export const getDustBalance = async (
  wallet: WalletFacade,
): Promise<{ available: bigint; pending: bigint; availableCoins: number; pendingCoins: number }> => {
  const state = await Rx.firstValueFrom(wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  const available = state.dust.walletBalance(new Date());
  const availableCoins = state.dust.availableCoins.length;
  const pendingCoins = state.dust.pendingCoins.length;
  // Sum pending coin initial values for a rough pending balance
  const pending = state.dust.pendingCoins.reduce((sum, c) => sum + c.initialValue, 0n);
  return { available, pending, availableCoins, pendingCoins };
};

/**
 * Monitor DUST balance with a live-updating display.
 * Prints a status line every 5 seconds showing balance, coins, and status.
 * Resolves when the user presses Enter (via the provided signal).
 */
export const monitorDustBalance = async (wallet: WalletFacade, stopSignal: Promise<void>): Promise<void> => {
  let stopped = false;
  void stopSignal.then(() => {
    stopped = true;
  });

  const sub = wallet
    .state()
    .pipe(
      Rx.throttleTime(5_000),
      Rx.filter((s) => s.isSynced),
    )
    .subscribe((state) => {
      if (stopped) return;

      const now = new Date();
      const available = state.dust.walletBalance(now);
      const availableCoins = state.dust.availableCoins.length;
      const pendingCoins = state.dust.pendingCoins.length;

      const registeredNight = state.unshielded.availableCoins.filter(
        (coin: any) => coin.meta?.registeredForDustGeneration === true,
      ).length;
      const totalNight = state.unshielded.availableCoins.length;

      let status = '';
      if (pendingCoins > 0 && availableCoins === 0) {
        status = '⚠ locked by pending tx';
      } else if (available > 0n) {
        status = '✓ ready to deploy';
      } else if (availableCoins > 0) {
        status = 'accruing...';
      } else if (registeredNight > 0) {
        status = 'waiting for generation...';
      } else {
        status = 'no NIGHT registered';
      }

      const time = now.toLocaleTimeString();
      console.log(
        `  [${time}] DUST: ${formatBalance(available)} (${availableCoins} coins, ${pendingCoins} pending) | NIGHT: ${totalNight} UTXOs, ${registeredNight} registered | ${status}`,
      );
    });

  await stopSignal;
  sub.unsubscribe();
};

export function setLogger(_logger: Logger) {
  logger = _logger;
}
