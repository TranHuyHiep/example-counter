import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type DivResultU64 = { quotient: bigint; remainder: bigint };

export type Witnesses<PS> = {
  divU64Locally(context: __compactRuntime.WitnessContext<Ledger, PS>,
                a_0: bigint,
                b_0: bigint): [PS, DivResultU64];
  sqrtU64Locally(context: __compactRuntime.WitnessContext<Ledger, PS>,
                 radicand_0: bigint): [PS, bigint];
}

export type ImpureCircuits<PS> = {
  div(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  rem(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  divRem(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, DivResultU64>;
  sqrt(context: __compactRuntime.CircuitContext<PS>, radical_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  isMultiple(context: __compactRuntime.CircuitContext<PS>,
             value_0: bigint,
             b_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
}

export type PureCircuits = {
  add(a_0: bigint, b_0: bigint): bigint;
  sub(a_0: bigint, b_0: bigint): bigint;
  mul(a_0: bigint, b_0: bigint): bigint;
  min(a_0: bigint, b_0: bigint): bigint;
  max(a_0: bigint, b_0: bigint): bigint;
  MAX_UINT8(): bigint;
  MAX_UINT16(): bigint;
  MAX_UINT32(): bigint;
  MAX_UINT64(): bigint;
}

export type Circuits<PS> = {
  add(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  sub(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  mul(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  div(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  rem(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  divRem(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, DivResultU64>;
  sqrt(context: __compactRuntime.CircuitContext<PS>, radical_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  isMultiple(context: __compactRuntime.CircuitContext<PS>,
             value_0: bigint,
             b_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  min(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  max(context: __compactRuntime.CircuitContext<PS>, a_0: bigint, b_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  MAX_UINT8(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  MAX_UINT16(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  MAX_UINT32(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  MAX_UINT64(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
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
