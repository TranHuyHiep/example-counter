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

import type { Witnesses } from './managed/FaucetAMM/contract/index.js';

// Helper types from Uint128 module
type U128 = {
  low: bigint;
  high: bigint;
};

type DivResultU128 = {
  quotient: U128;
  remainder: U128;
};

// This is how we type an empty object.
export type FaucetAMMPrivateState = {
  // Empty for now - FaucetAMM functions don't use private state
};

const UINT64_MASK = BigInt('0xFFFFFFFFFFFFFFFF');

const toU128 = (value: bigint): U128 => ({
  low: value & UINT64_MASK,
  high: value >> 64n,
});

const fromU128 = (value: U128): bigint =>
  (BigInt(value.high) << 64n) + BigInt(value.low);

/**
 * Witness implementations for FaucetAMM contract.
 * Provides off-chain computation for division operations used in swap calculations.
 */
export const witnesses: Witnesses<FaucetAMMPrivateState> = {
  /**
   * Computes division of two U128 values off-chain.
   * Used by Uint128.div() for on-chain verification.
   */
  divU128Locally(context, a, b): [FaucetAMMPrivateState, DivResultU128] {
    const aValue = fromU128(a);
    const bValue = fromU128(b);
    const quotient = aValue / bValue;
    const remainder = aValue - quotient * bValue;
    return [
      context.privateState,
      {
        quotient: toU128(quotient),
        remainder: toU128(remainder),
      },
    ];
  },

  /**
   * Computes division of two Uint<128> values off-chain.
   * Used by Uint128.div() for on-chain verification.
   */
  divUint128Locally(context, a, b): [FaucetAMMPrivateState, DivResultU128] {
    const quotient = a / b;
    const remainder = a - quotient * b;
    return [
      context.privateState,
      {
        quotient: toU128(quotient),
        remainder: toU128(remainder),
      },
    ];
  },
};

