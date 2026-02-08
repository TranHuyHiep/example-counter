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

import { type WalletContext } from './api';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface, type Interface } from 'node:readline/promises';
import { type Logger } from 'pino';
import { type StartedDockerComposeEnvironment, type DockerComposeEnvironment } from 'testcontainers';
import { type FaucetAMMProviders, type DeployedFaucetAMMContract } from './common-types';
import { type Config, StandaloneConfig } from './config';
import * as api from './api';

let logger: Logger;

/**
 * This seed gives access to tokens minted in the genesis block of a local development node.
 * Only used in standalone networks to build a wallet with initial funds.
 */
const GENESIS_MINT_WALLET_SEED = '0000000000000000000000000000000000000000000000000000000000000001';

// ─── Display Helpers ────────────────────────────────────────────────────────

const BANNER = `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              Midnight Token Mint Example                     ║
║              ───────────────────────────                     ║
║              A privacy-preserving token minting demo         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`;

const DIVIDER = '──────────────────────────────────────────────────────────────';

// ─── Menu Helpers ──────────────────────────────────────────────────────────

const WALLET_MENU = `
${DIVIDER}
  Wallet Setup
${DIVIDER}
  [1] Create a new wallet (random seed)
  [2] Create a new wallet with 24-word mnemonic
  [3] Restore wallet from 24-word mnemonic
  [4] Restore wallet from seed (hex)
  [5] Exit
${'─'.repeat(62)}
> `;

/** Build the contract actions menu, showing current DUST balance in the header. */
const contractMenu = (dustBalance: string) => `
${DIVIDER}
  Contract Actions${dustBalance ? `                    DUST: ${dustBalance}` : ''}
${DIVIDER}
  [1] Deploy a new mint contract
  [2] Join an existing mint contract
  [3] Monitor DUST balance
  [4] Exit
${'─'.repeat(62)}
> `;

/** Build the mint actions menu, showing current DUST balance in the header. */
const mintMenu = (dustBalance: string) => `
${DIVIDER}
  Token & AMM Actions${dustBalance ? `                 DUST: ${dustBalance}` : ''}
${DIVIDER}
  [1] Mint X tokens
  [2] Mint Y tokens
  [3] Initialize liquidity pool
  [4] Add liquidity
  [5] Remove liquidity
  [6] Swap X for Y
  [7] Swap Y for X
  [8] View pool status
  [9] Exit
${'─'.repeat(62)}
> `;

// ─── Wallet Setup ───────────────────────────────────────────────────────────

/** Prompt the user for a seed phrase and restore a wallet from it. */
const buildWalletFromSeed = async (config: Config, rli: Interface): Promise<WalletContext> => {
  const seed = await rli.question('Enter your wallet seed (hex): ');
  return await api.buildWalletAndWaitForFunds(config, seed);
};

/** Prompt the user for a 24-word mnemonic and restore a wallet from it. */
const buildWalletFromMnemonic = async (config: Config, rli: Interface): Promise<WalletContext> => {
  console.log('\nEnter your 24-word mnemonic phrase (space-separated):');
  // const mnemonic = await rli.question('> ');
  const mnemonic = "wheat enable enter flower giraffe load stem fly grass visual alpha change sudden kid wealth noodle genre dad stumble boy recycle spray gather frog";
  return await api.buildWalletFromMnemonic(config, mnemonic.trim());
};

/**
 * Wallet creation flow.
 * - Standalone configs skip the menu and use the genesis seed automatically.
 * - All other configs present a menu to create or restore a wallet.
 */
const buildWallet = async (config: Config, rli: Interface): Promise<WalletContext | null> => {
  // Standalone mode: use the pre-funded genesis wallet
  if (config instanceof StandaloneConfig) {
    return await api.buildWalletAndWaitForFunds(config, GENESIS_MINT_WALLET_SEED);
  }

  while (true) {
    // const choice = await rli.question(WALLET_MENU);
    const choice = '3';
    switch (choice.trim()) {
      case '1':
        return await api.buildFreshWallet(config);
      case '2':
        return await api.buildFreshWalletWithMnemonic(config);
      case '3':
        return await buildWalletFromMnemonic(config, rli);
      case '4':
        return await buildWalletFromSeed(config, rli);
      case '5':
        return null;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

// ─── Contract Interaction ───────────────────────────────────────────────────

/** Format dust balance for menu headers. */
const getDustLabel = async (wallet: api.WalletContext['wallet']): Promise<string> => {
  try {
    const dust = await api.getDustBalance(wallet);
    return dust.available.toLocaleString();
  } catch {
    return '';
  }
};

/** Prompt for a contract address and join an existing deployed contract. */
const joinContract = async (providers: FaucetAMMProviders, rli: Interface): Promise<DeployedFaucetAMMContract> => {
  const contractAddress = await rli.question('Enter the contract address (hex): ');
  return await api.joinContract(providers, contractAddress);
};

/**
 * Start the DUST monitor. Shows a live-updating balance display
 * that runs until the user presses Enter.
 */
const startDustMonitor = async (wallet: api.WalletContext['wallet'], rli: Interface): Promise<void> => {
  console.log('');
  // Use readline question to wait for Enter — the monitor will render above this line
  const stopPromise = rli.question('  Press Enter to return to menu...\n').then(() => {});
  await api.monitorDustBalance(wallet, stopPromise);
  console.log('');
};

/**
 * Deploy or join flow. Returns the contract handle, or null if the user exits.
 * Errors during deploy/join are caught and displayed — the user stays in the menu.
 */
const deployOrJoin = async (
  providers: FaucetAMMProviders,
  walletCtx: api.WalletContext,
  rli: Interface,
): Promise<DeployedFaucetAMMContract | null> => {
  while (true) {
    const dustLabel = await getDustLabel(walletCtx.wallet);
    const choice = await rli.question(contractMenu(dustLabel));
    switch (choice.trim()) {
      case '1':
        try {
          const feeBps = BigInt(10); // 10 basis points = 0.1% fee
          const contract = await api.withStatus('Deploying FaucetAMM contract', () =>
            api.deploy(providers, {}, feeBps),
          );
          console.log(`  Contract deployed at: ${contract.deployTxData.public.contractAddress}\n`);
          return contract;
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`\n  ✗ Deploy failed: ${msg}`);
          // Log the full cause chain to help debug WASM/ledger errors
          if (e instanceof Error && e.cause) {
            let cause: unknown = e.cause;
            let depth = 0;
            while (cause && depth < 5) {
              const causeMsg =
                cause instanceof Error
                  ? `${cause.message}\n      ${cause.stack?.split('\n').slice(1, 3).join('\n      ') ?? ''}`
                  : String(cause);
              console.log(`    cause: ${causeMsg}`);
              cause = cause instanceof Error ? cause.cause : undefined;
              depth++;
            }
          }
          if (msg.toLowerCase().includes('dust') || msg.toLowerCase().includes('no dust')) {
            console.log('    Insufficient DUST for transaction fees. Use option [3] to monitor your balance.');
          }
          console.log('');
        }
        break;
      case '2':
        try {
          return await joinContract(providers, rli);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`  ✗ Failed to join contract: ${msg}\n`);
        }
        break;
      case '3':
        await startDustMonitor(walletCtx.wallet, rli);
        break;
      case '4':
        return null;
      default:
        console.log(`  Invalid choice: ${choice}`);
    }
  }
};

/**
 * Main interaction loop. Once a contract is deployed/joined, the user
 * can mint tokens X or Y.
 */
const mainLoop = async (providers: FaucetAMMProviders, walletCtx: api.WalletContext, rli: Interface): Promise<void> => {
  const mintContract = await deployOrJoin(providers, walletCtx, rli);
  if (mintContract === null) {
    return;
  }

  // For FaucetAMM with shielded tokens - pass the wallet directly
  logger.info(`Wallet ready for minting shielded tokens`);

  while (true) {
    const dustLabel = await getDustLabel(walletCtx.wallet);
    const choice = await rli.question(mintMenu(dustLabel));
    switch (choice.trim()) {
      case '1':
        try {
          const amount = await rli.question('Enter amount of X tokens to mint: ');
          await api.withStatus('Minting X tokens (shielded)', () => 
            api.mintTokensX(mintContract, BigInt(amount), walletCtx.wallet)
          );
          console.log(`  ✓ Minted ${amount} X tokens (shielded)\n`);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`  ✗ Mint X tokens failed: ${msg}\n`);
        }
        break;
      case '2':
        try {
          const amount = await rli.question('Enter amount of Y tokens to mint: ');
          await api.withStatus('Minting Y tokens (shielded)', () => 
            api.mintTokensY(mintContract, BigInt(amount), walletCtx.wallet)
          );
          console.log(`  ✓ Minted ${amount} Y tokens (shielded)\n`);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`  ✗ Mint Y tokens failed: ${msg}\n`);
        }
        break;
      case '3':
        try {
          const xIn = await rli.question('Enter X tokens to add: ');
          const yIn = await rli.question('Enter Y tokens to add: ');
          const lpOut = await rli.question('Enter LP tokens to receive: ');
          await api.withStatus('Initializing liquidity', () =>
            api.initLiquidity(mintContract, BigInt(xIn), BigInt(yIn), BigInt(lpOut), walletCtx.wallet)
          );
          console.log(`  ✓ Liquidity initialized: ${xIn} X + ${yIn} Y -> ${lpOut} LP\n`);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`  ✗ Init liquidity failed: ${msg}\n`);
        }
        break;
      case '4':
        try {
          const xIn = await rli.question('Enter X tokens to add: ');
          const yIn = await rli.question('Enter Y tokens to add: ');
          const lpOut = await rli.question('Enter LP tokens to receive: ');
          await api.withStatus('Adding liquidity', () =>
            api.addLiquidity(mintContract, BigInt(xIn), BigInt(yIn), BigInt(lpOut), walletCtx.wallet)
          );
          console.log(`  ✓ Added liquidity: ${xIn} X + ${yIn} Y -> ${lpOut} LP\n`);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`  ✗ Add liquidity failed: ${msg}\n`);
        }
        break;
      case '5':
        try {
          const lpIn = await rli.question('Enter LP tokens to burn: ');
          const xOut = await rli.question('Enter X tokens to receive: ');
          const yOut = await rli.question('Enter Y tokens to receive: ');
          await api.withStatus('Removing liquidity', () =>
            api.removeLiquidity(mintContract, BigInt(lpIn), BigInt(xOut), BigInt(yOut), walletCtx.wallet)
          );
          console.log(`  ✓ Removed liquidity: ${lpIn} LP -> ${xOut} X + ${yOut} Y\n`);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`  ✗ Remove liquidity failed: ${msg}\n`);
        }
        break;
      case '6':
        try {
          const xIn = await rli.question('Enter X tokens to swap: ');
          const xFee = await rli.question('Enter fee amount (X tokens): ');
          const yOut = await rli.question('Enter Y tokens to receive: ');
          await api.withStatus('Swapping X to Y', () =>
            api.swapXToY(mintContract, BigInt(xIn), BigInt(xFee), BigInt(yOut), walletCtx.wallet)
          );
          console.log(`  ✓ Swapped ${xIn} X -> ${yOut} Y (fee: ${xFee})\n`);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`  ✗ Swap X to Y failed: ${msg}\n`);
        }
        break;
      case '7':
        try {
          const yIn = await rli.question('Enter Y tokens to swap: ');
          const xFee = await rli.question('Enter fee amount (X tokens): ');
          const xOut = await rli.question('Enter X tokens to receive: ');
          await api.withStatus('Swapping Y to X', () =>
            api.swapYToX(mintContract, BigInt(yIn), BigInt(xFee), BigInt(xOut), walletCtx.wallet)
          );
          console.log(`  ✓ Swapped ${yIn} Y -> ${xOut} X (fee: ${xFee})\n`);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`  ✗ Swap Y to X failed: ${msg}\n`);
        }
        break;
      case '8':
        try {
          // View pool status from ledger
          const poolStatus = await api.getPoolStatus(mintContract, walletCtx.wallet);
          console.log('\n=== Pool Status ===');
          console.log(`Fee: ${poolStatus.feeBps} basis points (${Number(poolStatus.feeBps) / 100}%)`);
          console.log(`X Token Rewards: ${poolStatus.xRewards}`);
          console.log(`X Token Liquidity: ${poolStatus.xLiquidity}`);
          console.log(`Y Token Liquidity: ${poolStatus.yLiquidity}`);
          console.log(`LP Token Supply: ${poolStatus.lpCirculatingSupply}`);
          
          // Calculate constant product k
          const k = poolStatus.xLiquidity * poolStatus.yLiquidity;
          console.log(`Constant Product (k): ${k}`);
          
          // Calculate current price if pool has liquidity
          if (poolStatus.xLiquidity > 0n && poolStatus.yLiquidity > 0n) {
            const priceXtoY = Number(poolStatus.yLiquidity) / Number(poolStatus.xLiquidity);
            const priceYtoX = Number(poolStatus.xLiquidity) / Number(poolStatus.yLiquidity);
            console.log(`Price X→Y: ${priceXtoY.toFixed(6)}`);
            console.log(`Price Y→X: ${priceYtoX.toFixed(6)}`);
          }
          console.log('===================');
          console.log('\n💡 Note: This is a FAUCET AMM for testing.');
          console.log('   Tokens are NOT actually transferred from your wallet.');
          console.log('   Liquidity operations only UPDATE ledger state.');
          console.log('   Direct ledger reading requires indexer API (not yet implemented).');
          console.log('   Track your operations via transaction logs above.\n');
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`  ✗ View pool failed: ${msg}\n`);
        }
        break;
      case '9':
        return;
      default:
        console.log(`  Invalid choice: ${choice}`);
    }
  }
};

// ─── Docker Port Mapping ────────────────────────────────────────────────────

/** Map a container's first exposed port into the config URL. */
const mapContainerPort = (env: StartedDockerComposeEnvironment, url: string, containerName: string) => {
  const mappedUrl = new URL(url);
  const container = env.getContainer(containerName);
  mappedUrl.port = String(container.getFirstMappedPort());
  return mappedUrl.toString().replace(/\/+$/, '');
};

// ─── Entry Point ────────────────────────────────────────────────────────────

/**
 * Main entry point for the CLI.
 *
 * Flow:
 *   1. (Optional) Start Docker containers for proof server / node / indexer
 *   2. Build or restore a wallet and wait for it to be funded
 *   3. Configure midnight-js providers (proof server, indexer, wallet, private state)
 *   4. Enter the contract deploy/join and counter interaction loop
 *   5. Clean up: close wallet, readline, and docker environment
 */
export const run = async (config: Config, _logger: Logger, dockerEnv?: DockerComposeEnvironment): Promise<void> => {
  logger = _logger;
  api.setLogger(_logger);

  // Print the title banner
  console.log(BANNER);

  const rli = createInterface({ input, output, terminal: true });
  let env: StartedDockerComposeEnvironment | undefined;

  try {
    // Step 1: Start Docker environment if provided (e.g. local proof server)
    if (dockerEnv !== undefined) {
      env = await dockerEnv.up();

      // In standalone mode, remap ports to the dynamically assigned container ports
      if (config instanceof StandaloneConfig) {
        config.indexer = mapContainerPort(env, config.indexer, 'counter-indexer');
        config.indexerWS = mapContainerPort(env, config.indexerWS, 'counter-indexer');
        config.node = mapContainerPort(env, config.node, 'counter-node');
        config.proofServer = mapContainerPort(env, config.proofServer, 'counter-proof-server');
      }
    }

    // Step 2: Build wallet (create new or restore from seed)
    const walletCtx = await buildWallet(config, rli);
    if (walletCtx === null) {
      return;
    }

    try {
      // Step 3: Configure midnight-js providers
      const providers = await api.withStatus('Configuring providers', () => api.configureProviders(walletCtx, config));
      console.log('');

      // Step 4: Enter the contract interaction loop
      await mainLoop(providers, walletCtx, rli);
    } catch (e) {
      if (e instanceof Error) {
        logger.error(`Error: ${e.message}`);
        logger.debug(`${e.stack}`);
      } else {
        throw e;
      }
    } finally {
      // Step 5a: Stop the wallet
      try {
        await walletCtx.wallet.stop();
      } catch (e) {
        logger.error(`Error stopping wallet: ${e}`);
      }
    }
  } finally {
    // Step 5b: Close readline and Docker environment
    rli.close();
    rli.removeAllListeners();

    if (env !== undefined) {
      try {
        await env.down();
      } catch (e) {
        logger.error(`Error shutting down docker environment: ${e}`);
      }
    }

    logger.info('Goodbye.');
  }
};
