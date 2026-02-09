import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  enqueue(context: __compactRuntime.CircuitContext<PS>, item_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  dequeue(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, { is_some: boolean,
                                                                                               value: bigint
                                                                                             }>;
  isEmpty(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, boolean>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  enqueue(context: __compactRuntime.CircuitContext<PS>, item_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  dequeue(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, { is_some: boolean,
                                                                                               value: bigint
                                                                                             }>;
  isEmpty(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, boolean>;
}

export type Ledger = {
  Queue_state: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): bigint;
    [Symbol.iterator](): Iterator<[bigint, bigint]>
  };
  readonly Queue_head: bigint;
  readonly Queue_tail: bigint;
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
