import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type DivResultU128 = { quotient: U128; remainder: U128 };

export type U128 = { low: bigint; high: bigint };

export type U256 = { low: U128; high: U128 };

export type Witnesses<PS> = {
  divU128Locally(context: __compactRuntime.WitnessContext<Ledger, PS>,
                 a_0: U128,
                 b_0: U128): [PS, DivResultU128];
  divUint128Locally(context: __compactRuntime.WitnessContext<Ledger, PS>,
                    a_0: bigint,
                    b_0: bigint): [PS, DivResultU128];
  sqrtU128Locally(context: __compactRuntime.WitnessContext<Ledger, PS>,
                  radicand_0: U128): [PS, bigint];
}

export type ImpureCircuits<PS> = {
  toU128(context: __compactRuntime.CircuitContext<PS>, value_0: bigint): __compactRuntime.CircuitResults<PS, U128>;
  add(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, U256>;
  addU128(context: __compactRuntime.CircuitContext<PS>, a_0: U128, b_0: U128): __compactRuntime.CircuitResults<PS, U256>;
  mul(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, U256>;
  mulU128(context: __compactRuntime.CircuitContext<PS>, a_0: U128, b_0: U128): __compactRuntime.CircuitResults<PS, U256>;
  mulChecked(context: __compactRuntime.CircuitContext<PS>,
             a_0: bigint,
             b_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  mulCheckedU128(context: __compactRuntime.CircuitContext<PS>,
                 a_0: U128,
                 b_0: U128): __compactRuntime.CircuitResults<PS, bigint>;
  div(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  divU128(context: __compactRuntime.CircuitContext<PS>, a_0: U128, b_0: U128): __compactRuntime.CircuitResults<PS, U128>;
  rem(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  remU128(context: __compactRuntime.CircuitContext<PS>, a_0: U128, b_0: U128): __compactRuntime.CircuitResults<PS, U128>;
  divRem(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, DivResultU128>;
  divRemU128(context: __compactRuntime.CircuitContext<PS>, a_0: U128, b_0: U128): __compactRuntime.CircuitResults<PS, DivResultU128>;
  sqrt(context: __compactRuntime.CircuitContext<PS>, radicand_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  sqrtU128(context: __compactRuntime.CircuitContext<PS>, radicand_0: U128): __compactRuntime.CircuitResults<PS, bigint>;
  isMultiple(context: __compactRuntime.CircuitContext<PS>,
             value_0: bigint,
             b_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  isMultipleU128(context: __compactRuntime.CircuitContext<PS>,
                 value_0: U128,
                 b_0: U128): __compactRuntime.CircuitResults<PS, boolean>;
}

export type PureCircuits = {
  MODULUS(): bigint;
  ZERO_U128(): U128;
  fromU128(value_0: U128): bigint;
  isZero(value_0: bigint): boolean;
  isZeroU128(value_0: U128): boolean;
  eq(a_0: bigint, b_0: bigint): boolean;
  eqU128(a_0: U128, b_0: U128): boolean;
  lt(a_0: bigint, b_0: bigint): boolean;
  lte(a_0: bigint, b_0: bigint): boolean;
  ltU128(a_0: U128, b_0: U128): boolean;
  lteU128(a_0: U128, b_0: U128): boolean;
  gt(a_0: bigint, b_0: bigint): boolean;
  gte(a_0: bigint, b_0: bigint): boolean;
  gtU128(a_0: U128, b_0: U128): boolean;
  gteU128(a_0: U128, b_0: U128): boolean;
  addChecked(a_0: bigint, b_0: bigint): bigint;
  addCheckedU128(a_0: U128, b_0: U128): bigint;
  sub(a_0: bigint, b_0: bigint): bigint;
  subU128(a_0: U128, b_0: U128): U128;
  min(a_0: bigint, b_0: bigint): bigint;
  minU128(a_0: U128, b_0: U128): U128;
  max(a_0: bigint, b_0: bigint): bigint;
  maxU128(a_0: U128, b_0: U128): U128;
  MAX_UINT128(): bigint;
  MAX_U128(): U128;
}

export type Circuits<PS> = {
  MODULUS(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  ZERO_U128(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, U128>;
  toU128(context: __compactRuntime.CircuitContext<PS>, value_0: bigint): __compactRuntime.CircuitResults<PS, U128>;
  fromU128(context: __compactRuntime.CircuitContext<PS>, value_0: U128): __compactRuntime.CircuitResults<PS, bigint>;
  isZero(context: __compactRuntime.CircuitContext<PS>, value_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  isZeroU128(context: __compactRuntime.CircuitContext<PS>, value_0: U128): __compactRuntime.CircuitResults<PS, boolean>;
  eq(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  eqU128(context: __compactRuntime.CircuitContext<PS>, a_0: U128, b_0: U128): __compactRuntime.CircuitResults<PS, boolean>;
  lt(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  lte(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  ltU128(context: __compactRuntime.CircuitContext<PS>, a_0: U128, b_0: U128): __compactRuntime.CircuitResults<PS, boolean>;
  lteU128(context: __compactRuntime.CircuitContext<PS>, a_0: U128, b_0: U128): __compactRuntime.CircuitResults<PS, boolean>;
  gt(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  gte(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  gtU128(context: __compactRuntime.CircuitContext<PS>, a_0: U128, b_0: U128): __compactRuntime.CircuitResults<PS, boolean>;
  gteU128(context: __compactRuntime.CircuitContext<PS>, a_0: U128, b_0: U128): __compactRuntime.CircuitResults<PS, boolean>;
  add(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, U256>;
  addU128(context: __compactRuntime.CircuitContext<PS>, a_0: U128, b_0: U128): __compactRuntime.CircuitResults<PS, U256>;
  addChecked(context: __compactRuntime.CircuitContext<PS>,
             a_0: bigint,
             b_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  addCheckedU128(context: __compactRuntime.CircuitContext<PS>,
                 a_0: U128,
                 b_0: U128): __compactRuntime.CircuitResults<PS, bigint>;
  sub(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  subU128(context: __compactRuntime.CircuitContext<PS>, a_0: U128, b_0: U128): __compactRuntime.CircuitResults<PS, U128>;
  mul(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, U256>;
  mulU128(context: __compactRuntime.CircuitContext<PS>, a_0: U128, b_0: U128): __compactRuntime.CircuitResults<PS, U256>;
  mulChecked(context: __compactRuntime.CircuitContext<PS>,
             a_0: bigint,
             b_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  mulCheckedU128(context: __compactRuntime.CircuitContext<PS>,
                 a_0: U128,
                 b_0: U128): __compactRuntime.CircuitResults<PS, bigint>;
  div(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  divU128(context: __compactRuntime.CircuitContext<PS>, a_0: U128, b_0: U128): __compactRuntime.CircuitResults<PS, U128>;
  rem(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  remU128(context: __compactRuntime.CircuitContext<PS>, a_0: U128, b_0: U128): __compactRuntime.CircuitResults<PS, U128>;
  divRem(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, DivResultU128>;
  divRemU128(context: __compactRuntime.CircuitContext<PS>, a_0: U128, b_0: U128): __compactRuntime.CircuitResults<PS, DivResultU128>;
  sqrt(context: __compactRuntime.CircuitContext<PS>, radicand_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  sqrtU128(context: __compactRuntime.CircuitContext<PS>, radicand_0: U128): __compactRuntime.CircuitResults<PS, bigint>;
  min(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  minU128(context: __compactRuntime.CircuitContext<PS>, a_0: U128, b_0: U128): __compactRuntime.CircuitResults<PS, U128>;
  max(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  maxU128(context: __compactRuntime.CircuitContext<PS>, a_0: U128, b_0: U128): __compactRuntime.CircuitResults<PS, U128>;
  isMultiple(context: __compactRuntime.CircuitContext<PS>,
             value_0: bigint,
             b_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  isMultipleU128(context: __compactRuntime.CircuitContext<PS>,
                 value_0: U128,
                 b_0: U128): __compactRuntime.CircuitResults<PS, boolean>;
  MAX_UINT128(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  MAX_U128(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, U128>;
}

export type Ledger = {
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
