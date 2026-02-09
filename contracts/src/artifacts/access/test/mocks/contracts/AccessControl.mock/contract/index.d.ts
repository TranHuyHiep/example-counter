import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type ZswapCoinPublicKey = { bytes: Uint8Array };

export type MerkleTreePath<T> = { leaf: T;
                                  path: { sibling: MerkleTreeDigest,
                                          goes_left: boolean
                                        }[]
                                };

export type MerkleTreeDigest = { field: bigint };

export type Maybe<T> = { is_some: boolean; value: T };

export enum AccessControl_Role { Admin = 0, Lp = 1, Trader = 2, None = 3 }

export type Witnesses<PS> = {
  wit_updateRole(context: __compactRuntime.WitnessContext<Ledger, PS>,
                 userRoleCommit_0: Uint8Array,
                 role_0: AccessControl_Role,
                 index_0: bigint): [PS, []];
  wit_getRoleMerklePath(context: __compactRuntime.WitnessContext<Ledger, PS>,
                        userRoleCommit_0: Uint8Array): [PS, Maybe<MerkleTreePath<Uint8Array>>];
  wit_getSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  testGrantRole(context: __compactRuntime.CircuitContext<PS>,
                user_0: ZswapCoinPublicKey,
                role_0: AccessControl_Role): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  AccessControl_hashUserRole(user_0: ZswapCoinPublicKey,
                             role_0: AccessControl_Role): Uint8Array;
}

export type Circuits<PS> = {
  AccessControl_hashUserRole(context: __compactRuntime.CircuitContext<PS>,
                             user_0: ZswapCoinPublicKey,
                             role_0: AccessControl_Role): __compactRuntime.CircuitResults<PS, Uint8Array>;
  testGrantRole(context: __compactRuntime.CircuitContext<PS>,
                user_0: ZswapCoinPublicKey,
                role_0: AccessControl_Role): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly AccessControl_isInitialized: boolean;
  AccessControl_roleCommits: {
    isFull(): boolean;
    checkRoot(rt_0: MerkleTreeDigest): boolean;
    root(): __compactRuntime.MerkleTreeDigest;
    firstFree(): bigint;
    pathForLeaf(index_0: bigint, leaf_0: Uint8Array): __compactRuntime.MerkleTreePath<Uint8Array>;
    findPathForLeaf(leaf_0: Uint8Array): __compactRuntime.MerkleTreePath<Uint8Array> | undefined
  };
  readonly AccessControl_index: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               initialAdmin_0: ZswapCoinPublicKey): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
