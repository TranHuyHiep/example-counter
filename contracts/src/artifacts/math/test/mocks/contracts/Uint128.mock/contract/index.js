import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.14.0');

const _descriptor_0 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

class _U128_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_1.alignment());
  }
  fromValue(value_0) {
    return {
      low: _descriptor_1.fromValue(value_0),
      high: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.low).concat(_descriptor_1.toValue(value_0.high));
  }
}

const _descriptor_2 = new _U128_0();

const _descriptor_3 = __compactRuntime.CompactTypeBoolean;

class _DivResultU128_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_2.alignment());
  }
  fromValue(value_0) {
    return {
      quotient: _descriptor_2.fromValue(value_0),
      remainder: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.quotient).concat(_descriptor_2.toValue(value_0.remainder));
  }
}

const _descriptor_4 = new _DivResultU128_0();

class _U256_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_2.alignment());
  }
  fromValue(value_0) {
    return {
      low: _descriptor_2.fromValue(value_0),
      high: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.low).concat(_descriptor_2.toValue(value_0.high));
  }
}

const _descriptor_5 = new _U256_0();

const _descriptor_6 = new __compactRuntime.CompactTypeUnsignedInteger(4294967295n, 4);

const _descriptor_7 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

const _descriptor_8 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

const _descriptor_9 = new __compactRuntime.CompactTypeUnsignedInteger(36893488147419103231n, 9);

const _descriptor_10 = new __compactRuntime.CompactTypeBytes(32);

class _Either_0 {
  alignment() {
    return _descriptor_3.alignment().concat(_descriptor_10.alignment().concat(_descriptor_10.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_3.fromValue(value_0),
      left: _descriptor_10.fromValue(value_0),
      right: _descriptor_10.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_3.toValue(value_0.is_left).concat(_descriptor_10.toValue(value_0.left).concat(_descriptor_10.toValue(value_0.right)));
  }
}

const _descriptor_11 = new _Either_0();

class _ContractAddress_0 {
  alignment() {
    return _descriptor_10.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_10.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_10.toValue(value_0.bytes);
  }
}

const _descriptor_12 = new _ContractAddress_0();

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    if (typeof(witnesses_0.divU128Locally) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named divU128Locally');
    }
    if (typeof(witnesses_0.divUint128Locally) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named divUint128Locally');
    }
    if (typeof(witnesses_0.sqrtU128Locally) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named sqrtU128Locally');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      MODULUS(context, ...args_1) {
        return { result: pureCircuits.MODULUS(...args_1), context };
      },
      ZERO_U128(context, ...args_1) {
        return { result: pureCircuits.ZERO_U128(...args_1), context };
      },
      toU128: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`toU128: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const value_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('toU128',
                                     'argument 1 (as invoked from Typescript)',
                                     'Uint128.mock.compact line 27 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(value_0) === 'bigint' && value_0 >= 0n && value_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('toU128',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'Uint128.mock.compact line 27 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     value_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(value_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._toU128_1(context, partialProofData, value_0);
        partialProofData.output = { value: _descriptor_2.toValue(result_0), alignment: _descriptor_2.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      fromU128(context, ...args_1) {
        return { result: pureCircuits.fromU128(...args_1), context };
      },
      isZero(context, ...args_1) {
        return { result: pureCircuits.isZero(...args_1), context };
      },
      isZeroU128(context, ...args_1) {
        return { result: pureCircuits.isZeroU128(...args_1), context };
      },
      eq(context, ...args_1) {
        return { result: pureCircuits.eq(...args_1), context };
      },
      eqU128(context, ...args_1) {
        return { result: pureCircuits.eqU128(...args_1), context };
      },
      lt(context, ...args_1) {
        return { result: pureCircuits.lt(...args_1), context };
      },
      lte(context, ...args_1) {
        return { result: pureCircuits.lte(...args_1), context };
      },
      ltU128(context, ...args_1) {
        return { result: pureCircuits.ltU128(...args_1), context };
      },
      lteU128(context, ...args_1) {
        return { result: pureCircuits.lteU128(...args_1), context };
      },
      gt(context, ...args_1) {
        return { result: pureCircuits.gt(...args_1), context };
      },
      gte(context, ...args_1) {
        return { result: pureCircuits.gte(...args_1), context };
      },
      gtU128(context, ...args_1) {
        return { result: pureCircuits.gtU128(...args_1), context };
      },
      gteU128(context, ...args_1) {
        return { result: pureCircuits.gteU128(...args_1), context };
      },
      add: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`add: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const a_0 = args_1[1];
        const b_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('add',
                                     'argument 1 (as invoked from Typescript)',
                                     'Uint128.mock.compact line 83 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(a_0) === 'bigint' && a_0 >= 0n && a_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('add',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'Uint128.mock.compact line 83 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     a_0)
        }
        if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('add',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'Uint128.mock.compact line 83 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     b_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(a_0).concat(_descriptor_0.toValue(b_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._add_1(context, partialProofData, a_0, b_0);
        partialProofData.output = { value: _descriptor_5.toValue(result_0), alignment: _descriptor_5.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      addU128: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`addU128: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const a_0 = args_1[1];
        const b_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('addU128',
                                     'argument 1 (as invoked from Typescript)',
                                     'Uint128.mock.compact line 87 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(a_0) === 'object' && typeof(a_0.low) === 'bigint' && a_0.low >= 0n && a_0.low <= 18446744073709551615n && typeof(a_0.high) === 'bigint' && a_0.high >= 0n && a_0.high <= 18446744073709551615n)) {
          __compactRuntime.typeError('addU128',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'Uint128.mock.compact line 87 char 1',
                                     'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                     a_0)
        }
        if (!(typeof(b_0) === 'object' && typeof(b_0.low) === 'bigint' && b_0.low >= 0n && b_0.low <= 18446744073709551615n && typeof(b_0.high) === 'bigint' && b_0.high >= 0n && b_0.high <= 18446744073709551615n)) {
          __compactRuntime.typeError('addU128',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'Uint128.mock.compact line 87 char 1',
                                     'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                     b_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_2.toValue(a_0).concat(_descriptor_2.toValue(b_0)),
            alignment: _descriptor_2.alignment().concat(_descriptor_2.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._addU128_1(context, partialProofData, a_0, b_0);
        partialProofData.output = { value: _descriptor_5.toValue(result_0), alignment: _descriptor_5.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      addChecked(context, ...args_1) {
        return { result: pureCircuits.addChecked(...args_1), context };
      },
      addCheckedU128(context, ...args_1) {
        return { result: pureCircuits.addCheckedU128(...args_1), context };
      },
      sub(context, ...args_1) {
        return { result: pureCircuits.sub(...args_1), context };
      },
      subU128(context, ...args_1) {
        return { result: pureCircuits.subU128(...args_1), context };
      },
      mul: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`mul: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const a_0 = args_1[1];
        const b_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('mul',
                                     'argument 1 (as invoked from Typescript)',
                                     'Uint128.mock.compact line 107 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(a_0) === 'bigint' && a_0 >= 0n && a_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('mul',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'Uint128.mock.compact line 107 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     a_0)
        }
        if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('mul',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'Uint128.mock.compact line 107 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     b_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(a_0).concat(_descriptor_0.toValue(b_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._mul_1(context, partialProofData, a_0, b_0);
        partialProofData.output = { value: _descriptor_5.toValue(result_0), alignment: _descriptor_5.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      mulU128: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`mulU128: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const a_0 = args_1[1];
        const b_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('mulU128',
                                     'argument 1 (as invoked from Typescript)',
                                     'Uint128.mock.compact line 111 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(a_0) === 'object' && typeof(a_0.low) === 'bigint' && a_0.low >= 0n && a_0.low <= 18446744073709551615n && typeof(a_0.high) === 'bigint' && a_0.high >= 0n && a_0.high <= 18446744073709551615n)) {
          __compactRuntime.typeError('mulU128',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'Uint128.mock.compact line 111 char 1',
                                     'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                     a_0)
        }
        if (!(typeof(b_0) === 'object' && typeof(b_0.low) === 'bigint' && b_0.low >= 0n && b_0.low <= 18446744073709551615n && typeof(b_0.high) === 'bigint' && b_0.high >= 0n && b_0.high <= 18446744073709551615n)) {
          __compactRuntime.typeError('mulU128',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'Uint128.mock.compact line 111 char 1',
                                     'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                     b_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_2.toValue(a_0).concat(_descriptor_2.toValue(b_0)),
            alignment: _descriptor_2.alignment().concat(_descriptor_2.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._mulU128_1(context, partialProofData, a_0, b_0);
        partialProofData.output = { value: _descriptor_5.toValue(result_0), alignment: _descriptor_5.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      mulChecked: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`mulChecked: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const a_0 = args_1[1];
        const b_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('mulChecked',
                                     'argument 1 (as invoked from Typescript)',
                                     'Uint128.mock.compact line 115 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(a_0) === 'bigint' && a_0 >= 0n && a_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('mulChecked',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'Uint128.mock.compact line 115 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     a_0)
        }
        if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('mulChecked',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'Uint128.mock.compact line 115 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     b_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(a_0).concat(_descriptor_0.toValue(b_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._mulChecked_1(context, partialProofData, a_0, b_0);
        partialProofData.output = { value: _descriptor_0.toValue(result_0), alignment: _descriptor_0.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      mulCheckedU128: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`mulCheckedU128: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const a_0 = args_1[1];
        const b_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('mulCheckedU128',
                                     'argument 1 (as invoked from Typescript)',
                                     'Uint128.mock.compact line 119 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(a_0) === 'object' && typeof(a_0.low) === 'bigint' && a_0.low >= 0n && a_0.low <= 18446744073709551615n && typeof(a_0.high) === 'bigint' && a_0.high >= 0n && a_0.high <= 18446744073709551615n)) {
          __compactRuntime.typeError('mulCheckedU128',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'Uint128.mock.compact line 119 char 1',
                                     'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                     a_0)
        }
        if (!(typeof(b_0) === 'object' && typeof(b_0.low) === 'bigint' && b_0.low >= 0n && b_0.low <= 18446744073709551615n && typeof(b_0.high) === 'bigint' && b_0.high >= 0n && b_0.high <= 18446744073709551615n)) {
          __compactRuntime.typeError('mulCheckedU128',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'Uint128.mock.compact line 119 char 1',
                                     'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                     b_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_2.toValue(a_0).concat(_descriptor_2.toValue(b_0)),
            alignment: _descriptor_2.alignment().concat(_descriptor_2.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._mulCheckedU128_1(context,
                                                partialProofData,
                                                a_0,
                                                b_0);
        partialProofData.output = { value: _descriptor_0.toValue(result_0), alignment: _descriptor_0.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      div: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`div: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const a_0 = args_1[1];
        const b_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('div',
                                     'argument 1 (as invoked from Typescript)',
                                     'Uint128.mock.compact line 123 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(a_0) === 'bigint' && a_0 >= 0n && a_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('div',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'Uint128.mock.compact line 123 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     a_0)
        }
        if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('div',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'Uint128.mock.compact line 123 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     b_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(a_0).concat(_descriptor_0.toValue(b_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._div_1(context, partialProofData, a_0, b_0);
        partialProofData.output = { value: _descriptor_0.toValue(result_0), alignment: _descriptor_0.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      divU128: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`divU128: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const a_0 = args_1[1];
        const b_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('divU128',
                                     'argument 1 (as invoked from Typescript)',
                                     'Uint128.mock.compact line 127 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(a_0) === 'object' && typeof(a_0.low) === 'bigint' && a_0.low >= 0n && a_0.low <= 18446744073709551615n && typeof(a_0.high) === 'bigint' && a_0.high >= 0n && a_0.high <= 18446744073709551615n)) {
          __compactRuntime.typeError('divU128',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'Uint128.mock.compact line 127 char 1',
                                     'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                     a_0)
        }
        if (!(typeof(b_0) === 'object' && typeof(b_0.low) === 'bigint' && b_0.low >= 0n && b_0.low <= 18446744073709551615n && typeof(b_0.high) === 'bigint' && b_0.high >= 0n && b_0.high <= 18446744073709551615n)) {
          __compactRuntime.typeError('divU128',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'Uint128.mock.compact line 127 char 1',
                                     'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                     b_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_2.toValue(a_0).concat(_descriptor_2.toValue(b_0)),
            alignment: _descriptor_2.alignment().concat(_descriptor_2.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._divU128_1(context, partialProofData, a_0, b_0);
        partialProofData.output = { value: _descriptor_2.toValue(result_0), alignment: _descriptor_2.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      rem: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`rem: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const a_0 = args_1[1];
        const b_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('rem',
                                     'argument 1 (as invoked from Typescript)',
                                     'Uint128.mock.compact line 131 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(a_0) === 'bigint' && a_0 >= 0n && a_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('rem',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'Uint128.mock.compact line 131 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     a_0)
        }
        if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('rem',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'Uint128.mock.compact line 131 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     b_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(a_0).concat(_descriptor_0.toValue(b_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._rem_1(context, partialProofData, a_0, b_0);
        partialProofData.output = { value: _descriptor_0.toValue(result_0), alignment: _descriptor_0.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      remU128: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`remU128: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const a_0 = args_1[1];
        const b_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('remU128',
                                     'argument 1 (as invoked from Typescript)',
                                     'Uint128.mock.compact line 135 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(a_0) === 'object' && typeof(a_0.low) === 'bigint' && a_0.low >= 0n && a_0.low <= 18446744073709551615n && typeof(a_0.high) === 'bigint' && a_0.high >= 0n && a_0.high <= 18446744073709551615n)) {
          __compactRuntime.typeError('remU128',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'Uint128.mock.compact line 135 char 1',
                                     'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                     a_0)
        }
        if (!(typeof(b_0) === 'object' && typeof(b_0.low) === 'bigint' && b_0.low >= 0n && b_0.low <= 18446744073709551615n && typeof(b_0.high) === 'bigint' && b_0.high >= 0n && b_0.high <= 18446744073709551615n)) {
          __compactRuntime.typeError('remU128',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'Uint128.mock.compact line 135 char 1',
                                     'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                     b_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_2.toValue(a_0).concat(_descriptor_2.toValue(b_0)),
            alignment: _descriptor_2.alignment().concat(_descriptor_2.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._remU128_1(context, partialProofData, a_0, b_0);
        partialProofData.output = { value: _descriptor_2.toValue(result_0), alignment: _descriptor_2.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      divRem: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`divRem: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const a_0 = args_1[1];
        const b_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('divRem',
                                     'argument 1 (as invoked from Typescript)',
                                     'Uint128.mock.compact line 139 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(a_0) === 'bigint' && a_0 >= 0n && a_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('divRem',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'Uint128.mock.compact line 139 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     a_0)
        }
        if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('divRem',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'Uint128.mock.compact line 139 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     b_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(a_0).concat(_descriptor_0.toValue(b_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._divRem_1(context, partialProofData, a_0, b_0);
        partialProofData.output = { value: _descriptor_4.toValue(result_0), alignment: _descriptor_4.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      divRemU128: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`divRemU128: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const a_0 = args_1[1];
        const b_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('divRemU128',
                                     'argument 1 (as invoked from Typescript)',
                                     'Uint128.mock.compact line 143 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(a_0) === 'object' && typeof(a_0.low) === 'bigint' && a_0.low >= 0n && a_0.low <= 18446744073709551615n && typeof(a_0.high) === 'bigint' && a_0.high >= 0n && a_0.high <= 18446744073709551615n)) {
          __compactRuntime.typeError('divRemU128',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'Uint128.mock.compact line 143 char 1',
                                     'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                     a_0)
        }
        if (!(typeof(b_0) === 'object' && typeof(b_0.low) === 'bigint' && b_0.low >= 0n && b_0.low <= 18446744073709551615n && typeof(b_0.high) === 'bigint' && b_0.high >= 0n && b_0.high <= 18446744073709551615n)) {
          __compactRuntime.typeError('divRemU128',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'Uint128.mock.compact line 143 char 1',
                                     'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                     b_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_2.toValue(a_0).concat(_descriptor_2.toValue(b_0)),
            alignment: _descriptor_2.alignment().concat(_descriptor_2.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._divRemU128_1(context, partialProofData, a_0, b_0);
        partialProofData.output = { value: _descriptor_4.toValue(result_0), alignment: _descriptor_4.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      sqrt: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`sqrt: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const radicand_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('sqrt',
                                     'argument 1 (as invoked from Typescript)',
                                     'Uint128.mock.compact line 147 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(radicand_0) === 'bigint' && radicand_0 >= 0n && radicand_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('sqrt',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'Uint128.mock.compact line 147 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     radicand_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(radicand_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._sqrt_1(context, partialProofData, radicand_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      sqrtU128: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`sqrtU128: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const radicand_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('sqrtU128',
                                     'argument 1 (as invoked from Typescript)',
                                     'Uint128.mock.compact line 151 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(radicand_0) === 'object' && typeof(radicand_0.low) === 'bigint' && radicand_0.low >= 0n && radicand_0.low <= 18446744073709551615n && typeof(radicand_0.high) === 'bigint' && radicand_0.high >= 0n && radicand_0.high <= 18446744073709551615n)) {
          __compactRuntime.typeError('sqrtU128',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'Uint128.mock.compact line 151 char 1',
                                     'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                     radicand_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_2.toValue(radicand_0),
            alignment: _descriptor_2.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._sqrtU128_1(context, partialProofData, radicand_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      min(context, ...args_1) {
        return { result: pureCircuits.min(...args_1), context };
      },
      minU128(context, ...args_1) {
        return { result: pureCircuits.minU128(...args_1), context };
      },
      max(context, ...args_1) {
        return { result: pureCircuits.max(...args_1), context };
      },
      maxU128(context, ...args_1) {
        return { result: pureCircuits.maxU128(...args_1), context };
      },
      isMultiple: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`isMultiple: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const value_0 = args_1[1];
        const b_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('isMultiple',
                                     'argument 1 (as invoked from Typescript)',
                                     'Uint128.mock.compact line 171 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(value_0) === 'bigint' && value_0 >= 0n && value_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('isMultiple',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'Uint128.mock.compact line 171 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     value_0)
        }
        if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('isMultiple',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'Uint128.mock.compact line 171 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     b_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(value_0).concat(_descriptor_0.toValue(b_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._isMultiple_1(context,
                                            partialProofData,
                                            value_0,
                                            b_0);
        partialProofData.output = { value: _descriptor_3.toValue(result_0), alignment: _descriptor_3.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      isMultipleU128: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`isMultipleU128: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const value_0 = args_1[1];
        const b_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('isMultipleU128',
                                     'argument 1 (as invoked from Typescript)',
                                     'Uint128.mock.compact line 175 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(value_0) === 'object' && typeof(value_0.low) === 'bigint' && value_0.low >= 0n && value_0.low <= 18446744073709551615n && typeof(value_0.high) === 'bigint' && value_0.high >= 0n && value_0.high <= 18446744073709551615n)) {
          __compactRuntime.typeError('isMultipleU128',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'Uint128.mock.compact line 175 char 1',
                                     'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                     value_0)
        }
        if (!(typeof(b_0) === 'object' && typeof(b_0.low) === 'bigint' && b_0.low >= 0n && b_0.low <= 18446744073709551615n && typeof(b_0.high) === 'bigint' && b_0.high >= 0n && b_0.high <= 18446744073709551615n)) {
          __compactRuntime.typeError('isMultipleU128',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'Uint128.mock.compact line 175 char 1',
                                     'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                     b_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_2.toValue(value_0).concat(_descriptor_2.toValue(b_0)),
            alignment: _descriptor_2.alignment().concat(_descriptor_2.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._isMultipleU128_1(context,
                                                partialProofData,
                                                value_0,
                                                b_0);
        partialProofData.output = { value: _descriptor_3.toValue(result_0), alignment: _descriptor_3.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      MAX_UINT128(context, ...args_1) {
        return { result: pureCircuits.MAX_UINT128(...args_1), context };
      },
      MAX_U128(context, ...args_1) {
        return { result: pureCircuits.MAX_U128(...args_1), context };
      }
    };
    this.impureCircuits = {
      toU128: this.circuits.toU128,
      add: this.circuits.add,
      addU128: this.circuits.addU128,
      mul: this.circuits.mul,
      mulU128: this.circuits.mulU128,
      mulChecked: this.circuits.mulChecked,
      mulCheckedU128: this.circuits.mulCheckedU128,
      div: this.circuits.div,
      divU128: this.circuits.divU128,
      rem: this.circuits.rem,
      remU128: this.circuits.remU128,
      divRem: this.circuits.divRem,
      divRemU128: this.circuits.divRemU128,
      sqrt: this.circuits.sqrt,
      sqrtU128: this.circuits.sqrtU128,
      isMultiple: this.circuits.isMultiple,
      isMultipleU128: this.circuits.isMultipleU128
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('toU128', new __compactRuntime.ContractOperation());
    state_0.setOperation('add', new __compactRuntime.ContractOperation());
    state_0.setOperation('addU128', new __compactRuntime.ContractOperation());
    state_0.setOperation('mul', new __compactRuntime.ContractOperation());
    state_0.setOperation('mulU128', new __compactRuntime.ContractOperation());
    state_0.setOperation('mulChecked', new __compactRuntime.ContractOperation());
    state_0.setOperation('mulCheckedU128', new __compactRuntime.ContractOperation());
    state_0.setOperation('div', new __compactRuntime.ContractOperation());
    state_0.setOperation('divU128', new __compactRuntime.ContractOperation());
    state_0.setOperation('rem', new __compactRuntime.ContractOperation());
    state_0.setOperation('remU128', new __compactRuntime.ContractOperation());
    state_0.setOperation('divRem', new __compactRuntime.ContractOperation());
    state_0.setOperation('divRemU128', new __compactRuntime.ContractOperation());
    state_0.setOperation('sqrt', new __compactRuntime.ContractOperation());
    state_0.setOperation('sqrtU128', new __compactRuntime.ContractOperation());
    state_0.setOperation('isMultiple', new __compactRuntime.ContractOperation());
    state_0.setOperation('isMultipleU128', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _divU128Locally_0(context, partialProofData, a_0, b_0) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.divU128Locally(witnessContext_0,
                                                                         a_0,
                                                                         b_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'object' && typeof(result_0.quotient) === 'object' && typeof(result_0.quotient.low) === 'bigint' && result_0.quotient.low >= 0n && result_0.quotient.low <= 18446744073709551615n && typeof(result_0.quotient.high) === 'bigint' && result_0.quotient.high >= 0n && result_0.quotient.high <= 18446744073709551615n && typeof(result_0.remainder) === 'object' && typeof(result_0.remainder.low) === 'bigint' && result_0.remainder.low >= 0n && result_0.remainder.low <= 18446744073709551615n && typeof(result_0.remainder.high) === 'bigint' && result_0.remainder.high >= 0n && result_0.remainder.high <= 18446744073709551615n)) {
      __compactRuntime.typeError('divU128Locally',
                                 'return value',
                                 'Uint128.compact line 70 char 3',
                                 'struct DivResultU128<quotient: struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>, remainder: struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_4.toValue(result_0),
      alignment: _descriptor_4.alignment()
    });
    return result_0;
  }
  _divUint128Locally_0(context, partialProofData, a_0, b_0) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.divUint128Locally(witnessContext_0,
                                                                            a_0,
                                                                            b_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'object' && typeof(result_0.quotient) === 'object' && typeof(result_0.quotient.low) === 'bigint' && result_0.quotient.low >= 0n && result_0.quotient.low <= 18446744073709551615n && typeof(result_0.quotient.high) === 'bigint' && result_0.quotient.high >= 0n && result_0.quotient.high <= 18446744073709551615n && typeof(result_0.remainder) === 'object' && typeof(result_0.remainder.low) === 'bigint' && result_0.remainder.low >= 0n && result_0.remainder.low <= 18446744073709551615n && typeof(result_0.remainder.high) === 'bigint' && result_0.remainder.high >= 0n && result_0.remainder.high <= 18446744073709551615n)) {
      __compactRuntime.typeError('divUint128Locally',
                                 'return value',
                                 'Uint128.compact line 79 char 3',
                                 'struct DivResultU128<quotient: struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>, remainder: struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_4.toValue(result_0),
      alignment: _descriptor_4.alignment()
    });
    return result_0;
  }
  _sqrtU128Locally_0(context, partialProofData, radicand_0) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.sqrtU128Locally(witnessContext_0,
                                                                          radicand_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('sqrtU128Locally',
                                 'return value',
                                 'Uint128.compact line 87 char 3',
                                 'Uint<0..18446744073709551616>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_1.toValue(result_0),
      alignment: _descriptor_1.alignment()
    });
    return result_0;
  }
  _MODULUS_0() { return 18446744073709551616n; }
  _ZERO_U128_0() { return { low: 0n, high: 0n }; }
  _MAX_U128_0() {
    return { low: this._MAX_UINT64_0(), high: this._MAX_UINT64_0() };
  }
  _MAX_UINT128_0() { return 340282366920938463463374607431768211455n; }
  _toU128_0(context, partialProofData, value_0) {
    const result_0 = this._divUint128Locally_0(context,
                                               partialProofData,
                                               value_0,
                                               this._MODULUS_0());
    const high_0 = result_0.quotient.low;
    const low_0 = result_0.remainder.low;
    const highShifted_0 = high_0 * this._MODULUS_0();
    const reconstructed_0 = highShifted_0 + low_0;
    __compactRuntime.assert(this._equal_0(reconstructed_0, value_0),
                            'MathU128: conversion invalid');
    return { low: low_0, high: high_0 };
  }
  _fromU128_0(value_0) {
    const highShifted_0 = value_0.high * this._MODULUS_0();
    const result_0 = highShifted_0 + value_0.low;
    return ((t1) => {
             if (t1 > 340282366920938463463374607431768211455n) {
               throw new __compactRuntime.CompactError('Uint128.compact line 219 char 12: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 340282366920938463463374607431768211455');
             }
             return t1;
           })(result_0);
  }
  _isZero_0(a_0) { return this._equal_1(a_0, 0n); }
  _isZeroU128_0(a_0) {
    return this._equal_2(a_0.low, 0n) && this._equal_3(a_0.high, 0n);
  }
  _eq_0(a_0, b_0) { return this._equal_4(a_0, b_0); }
  _eqU128_0(a_0, b_0) {
    return this._equal_5(a_0.low, b_0.low) && this._equal_6(a_0.high, b_0.high);
  }
  _lt_0(a_0, b_0) { return a_0 < b_0; }
  _lte_0(a_0, b_0) { return a_0 <= b_0; }
  _ltU128_0(a_0, b_0) {
    return a_0.high < b_0.high
           ||
           this._equal_7(a_0.high, b_0.high) && a_0.low < b_0.low;
  }
  _lteU128_0(a_0, b_0) {
    return this._ltU128_0(a_0, b_0) || this._eqU128_0(a_0, b_0);
  }
  _gt_0(a_0, b_0) { return a_0 > b_0; }
  _gte_0(a_0, b_0) { return a_0 >= b_0; }
  _gtU128_0(a_0, b_0) {
    return a_0.high > b_0.high
           ||
           this._equal_8(a_0.high, b_0.high) && a_0.low > b_0.low;
  }
  _gteU128_0(a_0, b_0) {
    return this._gtU128_0(a_0, b_0) || this._eqU128_0(a_0, b_0);
  }
  __add_0(context, partialProofData, a_0, b_0) {
    if (this._isZeroU128_0(a_0)) {
      return { low: b_0, high: this._ZERO_U128_0() };
    } else {
      if (this._isZeroU128_0(b_0)) {
        return { low: a_0, high: this._ZERO_U128_0() };
      } else {
        const lowSumFull_0 = a_0.low + b_0.low;
        const lowSumFullU128_0 = this._toU128_0(context,
                                                partialProofData,
                                                lowSumFull_0);
        const carry_0 = lowSumFullU128_0.high;
        const highSumIntermediate_0 = a_0.high + b_0.high;
        const highSumFull_0 = highSumIntermediate_0 + carry_0;
        const highSumFullU128_0 = this._toU128_0(context,
                                                 partialProofData,
                                                 highSumFull_0);
        const carryHigh_0 = highSumFullU128_0.high;
        return { low: { low: lowSumFullU128_0.low, high: highSumFullU128_0.low },
                 high: { low: carryHigh_0, high: 0n } };
      }
    }
  }
  _add_0(context, partialProofData, a_0, b_0) {
    const aU128_0 = this._toU128_0(context, partialProofData, a_0);
    const bU128_0 = this._toU128_0(context, partialProofData, b_0);
    return this.__add_0(context, partialProofData, aU128_0, bU128_0);
  }
  _addU128_0(context, partialProofData, a_0, b_0) {
    return this.__add_0(context, partialProofData, a_0, b_0);
  }
  _addChecked_0(a_0, b_0) {
    return ((t1) => {
             if (t1 > 340282366920938463463374607431768211455n) {
               throw new __compactRuntime.CompactError('Uint128.compact line 517 char 12: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 340282366920938463463374607431768211455');
             }
             return t1;
           })(a_0 + b_0);
  }
  _addCheckedU128_0(a_0, b_0) {
    return ((t1) => {
             if (t1 > 340282366920938463463374607431768211455n) {
               throw new __compactRuntime.CompactError('Uint128.compact line 539 char 12: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 340282366920938463463374607431768211455');
             }
             return t1;
           })(this._fromU128_0(a_0) + this._fromU128_0(b_0));
  }
  _sub_0(a_0, b_0) {
    __compactRuntime.assert(a_0 >= b_0, 'MathU128: subtraction underflow');
    __compactRuntime.assert(a_0 >= b_0,
                            'result of subtraction would be negative');
    return a_0 - b_0;
  }
  _subU128_0(a_0, b_0) {
    if (this._isZeroU128_0(b_0)) {
      return a_0;
    } else {
      if (this._eqU128_0(a_0, b_0)) {
        return this._ZERO_U128_0();
      } else {
        __compactRuntime.assert(this._gtU128_0(a_0, b_0)
                                ||
                                this._eqU128_0(a_0, b_0),
                                'MathU128: subtraction underflow');
        const borrow_0 = a_0.low < b_0.low ? 1n : 0n;
        const highWithBorrow_0 = b_0.high + borrow_0;
        let t_0;
        const highDiff_0 = (t_0 = a_0.high,
                            (__compactRuntime.assert(t_0 >= highWithBorrow_0,
                                                     'result of subtraction would be negative'),
                             t_0 - highWithBorrow_0));
        if (this._equal_9(borrow_0, 0n)) {
          let t_1, t_2;
          const lowDiff_0 = (t_1 = a_0.low,
                             (t_2 = b_0.low,
                              (__compactRuntime.assert(t_1 >= t_2,
                                                       'result of subtraction would be negative'),
                               t_1 - t_2)));
          return { low: lowDiff_0, high: highDiff_0 };
        } else {
          let t_3, t_4;
          const lowDiff_1 = (t_3 = a_0.low + this._MODULUS_0(),
                             (t_4 = b_0.low,
                              (__compactRuntime.assert(t_3 >= t_4,
                                                       'result of subtraction would be negative'),
                               t_3 - t_4)));
          return { low:
                     ((t1) => {
                       if (t1 > 18446744073709551615n) {
                         throw new __compactRuntime.CompactError('Uint128.compact line 625 char 33: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                       }
                       return t1;
                     })(lowDiff_1),
                   high: highDiff_0 };
        }
      }
    }
  }
  __mul_0(context, partialProofData, a_0, b_0) {
    if (this._isZeroU128_0(a_0) || this._isZeroU128_0(b_0)) {
      return { low: { low: 0n, high: 0n }, high: { low: 0n, high: 0n } };
    } else {
      if (this._eqU128_0(a_0, { low: 1n, high: 0n })) {
        return { low: b_0, high: { low: 0n, high: 0n } };
      } else {
        if (this._eqU128_0(b_0, { low: 1n, high: 0n })) {
          return { low: a_0, high: { low: 0n, high: 0n } };
        } else {
          const ll_0 = a_0.low * b_0.low;
          const hl_0 = a_0.high * b_0.low;
          const lh_0 = a_0.low * b_0.high;
          const hh_0 = a_0.high * b_0.high;
          const llU128_0 = this._toU128_0(context, partialProofData, ll_0);
          const hlU128_0 = this._toU128_0(context, partialProofData, hl_0);
          const lhU128_0 = this._toU128_0(context, partialProofData, lh_0);
          const hhU128_0 = this._toU128_0(context, partialProofData, hh_0);
          const crossSum_0 = this.__add_0(context,
                                          partialProofData,
                                          hlU128_0,
                                          lhU128_0);
          const crossShifted_0 = { low: 0n, high: crossSum_0.low.low };
          const lowAndCross_0 = this.__add_0(context,
                                             partialProofData,
                                             llU128_0,
                                             crossShifted_0);
          const crossCarry_0 = { low: crossSum_0.low.high,
                                 high: crossSum_0.high.low };
          const highPartU256_0 = this.__add_0(context,
                                              partialProofData,
                                              hhU128_0,
                                              crossCarry_0);
          const finalLow_0 = lowAndCross_0.low;
          const finalHigh_0 = this.__add_0(context,
                                           partialProofData,
                                           lowAndCross_0.high,
                                           highPartU256_0.low);
          return { low: finalLow_0, high: finalHigh_0.low };
        }
      }
    }
  }
  __mulChecked_0(context, partialProofData, a_0, b_0) {
    const result_0 = this.__mul_0(context, partialProofData, a_0, b_0);
    __compactRuntime.assert(this._eqU128_0(result_0.high, this._ZERO_U128_0()),
                            'MathU128: multiplication overflow');
    return result_0.low;
  }
  _mul_0(context, partialProofData, a_0, b_0) {
    const aU128_0 = this._toU128_0(context, partialProofData, a_0);
    const bU128_0 = this._toU128_0(context, partialProofData, b_0);
    return this.__mul_0(context, partialProofData, aU128_0, bU128_0);
  }
  _mulU128_0(context, partialProofData, a_0, b_0) {
    return this.__mul_0(context, partialProofData, a_0, b_0);
  }
  _mulChecked_0(context, partialProofData, a_0, b_0) {
    const aU128_0 = this._toU128_0(context, partialProofData, a_0);
    const bU128_0 = this._toU128_0(context, partialProofData, b_0);
    return this._fromU128_0(this.__mulChecked_0(context,
                                                partialProofData,
                                                aU128_0,
                                                bU128_0));
  }
  _mulCheckedU128_0(context, partialProofData, a_0, b_0) {
    return this._fromU128_0(this.__mulChecked_0(context,
                                                partialProofData,
                                                a_0,
                                                b_0));
  }
  __div_0(context, partialProofData, a_0, b_0) {
    __compactRuntime.assert(!this._isZeroU128_0(b_0),
                            'MathU128: division by zero');
    if (this._isZeroU128_0(a_0)) {
      return { quotient: this._ZERO_U128_0(), remainder: this._ZERO_U128_0() };
    } else {
      if (this._eqU128_0(b_0, { low: 1n, high: 0n })) {
        return { quotient: a_0, remainder: this._ZERO_U128_0() };
      } else {
        if (this._eqU128_0(a_0, b_0)) {
          return { quotient: { low: 1n, high: 0n },
                   remainder: this._ZERO_U128_0() };
        } else {
          if (this._lteU128_0(a_0, b_0)) {
            return { quotient: this._ZERO_U128_0(), remainder: a_0 };
          } else {
            __compactRuntime.assert(!this._isZeroU128_0(b_0),
                                    'MathU128: division by zero');
            const result_0 = this._divU128Locally_0(context,
                                                    partialProofData,
                                                    a_0,
                                                    b_0);
            __compactRuntime.assert(this._ltU128_0(result_0.remainder, b_0),
                                    'MathU128: remainder error');
            const productU256_0 = this.__mul_0(context,
                                               partialProofData,
                                               result_0.quotient,
                                               b_0);
            const remainderU256_0 = { low: result_0.remainder,
                                      high: this._ZERO_U128_0() };
            const lowSumU256_0 = this.__add_0(context,
                                              partialProofData,
                                              productU256_0.low,
                                              result_0.remainder);
            const highSumU256_0 = this.__add_0(context,
                                               partialProofData,
                                               productU256_0.high,
                                               lowSumU256_0.high);
            __compactRuntime.assert(this._eqU128_0(highSumU256_0.low,
                                                   this._ZERO_U128_0())
                                    &&
                                    this._eqU128_0(highSumU256_0.high,
                                                   this._ZERO_U128_0())
                                    &&
                                    this._eqU128_0(lowSumU256_0.low, a_0),
                                    'MathU128: division invalid');
            return result_0;
          }
        }
      }
    }
  }
  _div_0(context, partialProofData, a_0, b_0) {
    const aU128_0 = this._toU128_0(context, partialProofData, a_0);
    const bU128_0 = this._toU128_0(context, partialProofData, b_0);
    return this._fromU128_0(this.__div_0(context,
                                         partialProofData,
                                         aU128_0,
                                         bU128_0).quotient);
  }
  _divU128_0(context, partialProofData, a_0, b_0) {
    return this.__div_0(context, partialProofData, a_0, b_0).quotient;
  }
  _rem_0(context, partialProofData, a_0, b_0) {
    const aU128_0 = this._toU128_0(context, partialProofData, a_0);
    const bU128_0 = this._toU128_0(context, partialProofData, b_0);
    return this._fromU128_0(this.__div_0(context,
                                         partialProofData,
                                         aU128_0,
                                         bU128_0).remainder);
  }
  _remU128_0(context, partialProofData, a_0, b_0) {
    return this.__div_0(context, partialProofData, a_0, b_0).remainder;
  }
  _divRem_0(context, partialProofData, a_0, b_0) {
    const aU128_0 = this._toU128_0(context, partialProofData, a_0);
    const bU128_0 = this._toU128_0(context, partialProofData, b_0);
    return this.__div_0(context, partialProofData, aU128_0, bU128_0);
  }
  _divRemU128_0(context, partialProofData, a_0, b_0) {
    return this.__div_0(context, partialProofData, a_0, b_0);
  }
  __sqrt_0(context, partialProofData, radicand_0) {
    if (this._isZeroU128_0(radicand_0)) {
      return 0n;
    } else {
      if (this._eqU128_0(radicand_0, { low: 1n, high: 0n })) {
        return 1n;
      } else {
        if (this._eqU128_0(radicand_0, { low: 2n, high: 0n })) {
          return 1n;
        } else {
          if (this._eqU128_0(radicand_0, { low: 3n, high: 0n })) {
            return 1n;
          } else {
            if (this._eqU128_0(radicand_0, { low: 4n, high: 0n })) {
              return 2n;
            } else {
              if (this._eqU128_0(radicand_0, { low: 9n, high: 0n })) {
                return 3n;
              } else {
                if (this._eqU128_0(radicand_0,
                                   { low: this._MAX_UINT8_0(), high: 0n }))
                {
                  return 15n;
                } else {
                  if (this._eqU128_0(radicand_0,
                                     { low: this._MAX_UINT16_0(), high: 0n }))
                  {
                    return 255n;
                  } else {
                    if (this._eqU128_0(radicand_0,
                                       { low: this._MAX_UINT32_0(), high: 0n }))
                    {
                      return 65535n;
                    } else {
                      if (this._eqU128_0(radicand_0,
                                         { low: this._MAX_UINT64_0(), high: 0n }))
                      {
                        return 4294967295n;
                      } else {
                        if (this._eqU128_0(radicand_0, this._MAX_U128_0())) {
                          return this._MAX_UINT64_0();
                        } else {
                          const root_0 = this._sqrtU128Locally_0(context,
                                                                 partialProofData,
                                                                 radicand_0);
                          const rootU128_0 = { low: root_0, high: 0n };
                          const rootSquareU256_0 = this.__mul_0(context,
                                                                partialProofData,
                                                                rootU128_0,
                                                                rootU128_0);
                          __compactRuntime.assert(this._eqU128_0(rootSquareU256_0.high,
                                                                 this._ZERO_U128_0()),
                                                  'MathU128: sqrt root^2 overflow');
                          const rootSquareU128_0 = rootSquareU256_0.low;
                          __compactRuntime.assert(!this._gtU128_0(rootSquareU128_0,
                                                                  radicand_0),
                                                  'MathU128: sqrt overestimate');
                          const next_0 = ((t1) => {
                                           if (t1 > 18446744073709551615n) {
                                             throw new __compactRuntime.CompactError('Uint128.compact line 1182 char 51: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                                           }
                                           return t1;
                                         })(root_0 + 1n);
                          const nextU128_0 = { low: next_0, high: 0n };
                          const nextSquareU256_0 = this.__mul_0(context,
                                                                partialProofData,
                                                                nextU128_0,
                                                                nextU128_0);
                          __compactRuntime.assert(this._eqU128_0(nextSquareU256_0.high,
                                                                 this._ZERO_U128_0()),
                                                  'MathU128: next sqrt overflow');
                          const nextSquareU128_0 = nextSquareU256_0.low;
                          __compactRuntime.assert(this._gtU128_0(nextSquareU128_0,
                                                                 radicand_0),
                                                  'MathU128: sqrt underestimate');
                          return root_0;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  _sqrt_0(context, partialProofData, radicand_0) {
    const radicandU128_0 = this._toU128_0(context, partialProofData, radicand_0);
    return this.__sqrt_0(context, partialProofData, radicandU128_0);
  }
  _sqrtU128_0(context, partialProofData, radicand_0) {
    return this.__sqrt_0(context, partialProofData, radicand_0);
  }
  _min_0(a_0, b_0) {
    if (this._lte_0(a_0, b_0)) { return a_0; } else { return b_0; }
  }
  _minU128_0(a_0, b_0) {
    if (this._lteU128_0(a_0, b_0)) { return a_0; } else { return b_0; }
  }
  _max_0(a_0, b_0) {
    if (this._gte_0(a_0, b_0)) { return a_0; } else { return b_0; }
  }
  _maxU128_0(a_0, b_0) {
    if (this._gteU128_0(a_0, b_0)) { return a_0; } else { return b_0; }
  }
  __isMultiple_0(context, partialProofData, a_0, b_0) {
    __compactRuntime.assert(b_0.high > 0n || b_0.low > 0n,
                            'MathU128: division by zero');
    const result_0 = this.__div_0(context, partialProofData, a_0, b_0);
    return this._eqU128_0(result_0.remainder, this._ZERO_U128_0());
  }
  _isMultiple_0(context, partialProofData, a_0, b_0) {
    const aU128_0 = this._toU128_0(context, partialProofData, a_0);
    const bU128_0 = this._toU128_0(context, partialProofData, b_0);
    return this.__isMultiple_0(context, partialProofData, aU128_0, bU128_0);
  }
  _isMultipleU128_0(context, partialProofData, a_0, b_0) {
    return this.__isMultiple_0(context, partialProofData, a_0, b_0);
  }
  _MAX_UINT8_0() { return 255n; }
  _MAX_UINT16_0() { return 65535n; }
  _MAX_UINT32_0() { return 4294967295n; }
  _MAX_UINT64_0() { return 18446744073709551615n; }
  _MODULUS_1() { return this._MODULUS_0(); }
  _ZERO_U128_1() { return this._ZERO_U128_0(); }
  _toU128_1(context, partialProofData, value_0) {
    return this._toU128_0(context, partialProofData, value_0);
  }
  _fromU128_1(value_0) { return this._fromU128_0(value_0); }
  _isZero_1(value_0) { return this._isZero_0(value_0); }
  _isZeroU128_1(value_0) { return this._isZeroU128_0(value_0); }
  _eq_1(a_0, b_0) { return this._eq_0(a_0, b_0); }
  _eqU128_1(a_0, b_0) { return this._eqU128_0(a_0, b_0); }
  _lt_1(a_0, b_0) { return this._lt_0(a_0, b_0); }
  _lte_1(a_0, b_0) { return this._lte_0(a_0, b_0); }
  _ltU128_1(a_0, b_0) { return this._ltU128_0(a_0, b_0); }
  _lteU128_1(a_0, b_0) { return this._lteU128_0(a_0, b_0); }
  _gt_1(a_0, b_0) { return this._gt_0(a_0, b_0); }
  _gte_1(a_0, b_0) { return this._gte_0(a_0, b_0); }
  _gtU128_1(a_0, b_0) { return this._gtU128_0(a_0, b_0); }
  _gteU128_1(a_0, b_0) { return this._gteU128_0(a_0, b_0); }
  _add_1(context, partialProofData, a_0, b_0) {
    return this._add_0(context, partialProofData, a_0, b_0);
  }
  _addU128_1(context, partialProofData, a_0, b_0) {
    return this._addU128_0(context, partialProofData, a_0, b_0);
  }
  _addChecked_1(a_0, b_0) { return this._addChecked_0(a_0, b_0); }
  _addCheckedU128_1(a_0, b_0) { return this._addCheckedU128_0(a_0, b_0); }
  _sub_1(a_0, b_0) { return this._sub_0(a_0, b_0); }
  _subU128_1(a_0, b_0) { return this._subU128_0(a_0, b_0); }
  _mul_1(context, partialProofData, a_0, b_0) {
    return this._mul_0(context, partialProofData, a_0, b_0);
  }
  _mulU128_1(context, partialProofData, a_0, b_0) {
    return this._mulU128_0(context, partialProofData, a_0, b_0);
  }
  _mulChecked_1(context, partialProofData, a_0, b_0) {
    return this._mulChecked_0(context, partialProofData, a_0, b_0);
  }
  _mulCheckedU128_1(context, partialProofData, a_0, b_0) {
    return this._mulCheckedU128_0(context, partialProofData, a_0, b_0);
  }
  _div_1(context, partialProofData, a_0, b_0) {
    return this._div_0(context, partialProofData, a_0, b_0);
  }
  _divU128_1(context, partialProofData, a_0, b_0) {
    return this._divU128_0(context, partialProofData, a_0, b_0);
  }
  _rem_1(context, partialProofData, a_0, b_0) {
    return this._rem_0(context, partialProofData, a_0, b_0);
  }
  _remU128_1(context, partialProofData, a_0, b_0) {
    return this._remU128_0(context, partialProofData, a_0, b_0);
  }
  _divRem_1(context, partialProofData, a_0, b_0) {
    return this._divRem_0(context, partialProofData, a_0, b_0);
  }
  _divRemU128_1(context, partialProofData, a_0, b_0) {
    return this._divRemU128_0(context, partialProofData, a_0, b_0);
  }
  _sqrt_1(context, partialProofData, radicand_0) {
    return this._sqrt_0(context, partialProofData, radicand_0);
  }
  _sqrtU128_1(context, partialProofData, radicand_0) {
    return this._sqrtU128_0(context, partialProofData, radicand_0);
  }
  _min_1(a_0, b_0) { return this._min_0(a_0, b_0); }
  _minU128_1(a_0, b_0) { return this._minU128_0(a_0, b_0); }
  _max_1(a_0, b_0) { return this._max_0(a_0, b_0); }
  _maxU128_1(a_0, b_0) { return this._maxU128_0(a_0, b_0); }
  _isMultiple_1(context, partialProofData, value_0, b_0) {
    return this._isMultiple_0(context, partialProofData, value_0, b_0);
  }
  _isMultipleU128_1(context, partialProofData, value_0, b_0) {
    return this._isMultipleU128_0(context, partialProofData, value_0, b_0);
  }
  _MAX_UINT128_1() { return this._MAX_UINT128_0(); }
  _MAX_U128_1() { return this._MAX_U128_0(); }
  _equal_0(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_1(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_2(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_3(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_4(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_5(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_6(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_7(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_8(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_9(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()),
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({
  divU128Locally: (...args) => undefined,
  divUint128Locally: (...args) => undefined,
  sqrtU128Locally: (...args) => undefined
});
export const pureCircuits = {
  MODULUS: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`MODULUS: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._MODULUS_1();
  },
  ZERO_U128: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`ZERO_U128: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._ZERO_U128_1();
  },
  fromU128: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`fromU128: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const value_0 = args_0[0];
    if (!(typeof(value_0) === 'object' && typeof(value_0.low) === 'bigint' && value_0.low >= 0n && value_0.low <= 18446744073709551615n && typeof(value_0.high) === 'bigint' && value_0.high >= 0n && value_0.high <= 18446744073709551615n)) {
      __compactRuntime.typeError('fromU128',
                                 'argument 1',
                                 'Uint128.mock.compact line 31 char 1',
                                 'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                 value_0)
    }
    return _dummyContract._fromU128_1(value_0);
  },
  isZero: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`isZero: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const value_0 = args_0[0];
    if (!(typeof(value_0) === 'bigint' && value_0 >= 0n && value_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('isZero',
                                 'argument 1',
                                 'Uint128.mock.compact line 35 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 value_0)
    }
    return _dummyContract._isZero_1(value_0);
  },
  isZeroU128: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`isZeroU128: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const value_0 = args_0[0];
    if (!(typeof(value_0) === 'object' && typeof(value_0.low) === 'bigint' && value_0.low >= 0n && value_0.low <= 18446744073709551615n && typeof(value_0.high) === 'bigint' && value_0.high >= 0n && value_0.high <= 18446744073709551615n)) {
      __compactRuntime.typeError('isZeroU128',
                                 'argument 1',
                                 'Uint128.mock.compact line 39 char 1',
                                 'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                 value_0)
    }
    return _dummyContract._isZeroU128_1(value_0);
  },
  eq: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`eq: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    if (!(typeof(a_0) === 'bigint' && a_0 >= 0n && a_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('eq',
                                 'argument 1',
                                 'Uint128.mock.compact line 43 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 a_0)
    }
    if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('eq',
                                 'argument 2',
                                 'Uint128.mock.compact line 43 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 b_0)
    }
    return _dummyContract._eq_1(a_0, b_0);
  },
  eqU128: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`eqU128: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    if (!(typeof(a_0) === 'object' && typeof(a_0.low) === 'bigint' && a_0.low >= 0n && a_0.low <= 18446744073709551615n && typeof(a_0.high) === 'bigint' && a_0.high >= 0n && a_0.high <= 18446744073709551615n)) {
      __compactRuntime.typeError('eqU128',
                                 'argument 1',
                                 'Uint128.mock.compact line 47 char 1',
                                 'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                 a_0)
    }
    if (!(typeof(b_0) === 'object' && typeof(b_0.low) === 'bigint' && b_0.low >= 0n && b_0.low <= 18446744073709551615n && typeof(b_0.high) === 'bigint' && b_0.high >= 0n && b_0.high <= 18446744073709551615n)) {
      __compactRuntime.typeError('eqU128',
                                 'argument 2',
                                 'Uint128.mock.compact line 47 char 1',
                                 'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                 b_0)
    }
    return _dummyContract._eqU128_1(a_0, b_0);
  },
  lt: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`lt: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    if (!(typeof(a_0) === 'bigint' && a_0 >= 0n && a_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('lt',
                                 'argument 1',
                                 'Uint128.mock.compact line 51 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 a_0)
    }
    if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('lt',
                                 'argument 2',
                                 'Uint128.mock.compact line 51 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 b_0)
    }
    return _dummyContract._lt_1(a_0, b_0);
  },
  lte: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`lte: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    if (!(typeof(a_0) === 'bigint' && a_0 >= 0n && a_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('lte',
                                 'argument 1',
                                 'Uint128.mock.compact line 55 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 a_0)
    }
    if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('lte',
                                 'argument 2',
                                 'Uint128.mock.compact line 55 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 b_0)
    }
    return _dummyContract._lte_1(a_0, b_0);
  },
  ltU128: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`ltU128: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    if (!(typeof(a_0) === 'object' && typeof(a_0.low) === 'bigint' && a_0.low >= 0n && a_0.low <= 18446744073709551615n && typeof(a_0.high) === 'bigint' && a_0.high >= 0n && a_0.high <= 18446744073709551615n)) {
      __compactRuntime.typeError('ltU128',
                                 'argument 1',
                                 'Uint128.mock.compact line 59 char 1',
                                 'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                 a_0)
    }
    if (!(typeof(b_0) === 'object' && typeof(b_0.low) === 'bigint' && b_0.low >= 0n && b_0.low <= 18446744073709551615n && typeof(b_0.high) === 'bigint' && b_0.high >= 0n && b_0.high <= 18446744073709551615n)) {
      __compactRuntime.typeError('ltU128',
                                 'argument 2',
                                 'Uint128.mock.compact line 59 char 1',
                                 'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                 b_0)
    }
    return _dummyContract._ltU128_1(a_0, b_0);
  },
  lteU128: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`lteU128: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    if (!(typeof(a_0) === 'object' && typeof(a_0.low) === 'bigint' && a_0.low >= 0n && a_0.low <= 18446744073709551615n && typeof(a_0.high) === 'bigint' && a_0.high >= 0n && a_0.high <= 18446744073709551615n)) {
      __compactRuntime.typeError('lteU128',
                                 'argument 1',
                                 'Uint128.mock.compact line 63 char 1',
                                 'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                 a_0)
    }
    if (!(typeof(b_0) === 'object' && typeof(b_0.low) === 'bigint' && b_0.low >= 0n && b_0.low <= 18446744073709551615n && typeof(b_0.high) === 'bigint' && b_0.high >= 0n && b_0.high <= 18446744073709551615n)) {
      __compactRuntime.typeError('lteU128',
                                 'argument 2',
                                 'Uint128.mock.compact line 63 char 1',
                                 'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                 b_0)
    }
    return _dummyContract._lteU128_1(a_0, b_0);
  },
  gt: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`gt: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    if (!(typeof(a_0) === 'bigint' && a_0 >= 0n && a_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('gt',
                                 'argument 1',
                                 'Uint128.mock.compact line 67 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 a_0)
    }
    if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('gt',
                                 'argument 2',
                                 'Uint128.mock.compact line 67 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 b_0)
    }
    return _dummyContract._gt_1(a_0, b_0);
  },
  gte: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`gte: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    if (!(typeof(a_0) === 'bigint' && a_0 >= 0n && a_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('gte',
                                 'argument 1',
                                 'Uint128.mock.compact line 71 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 a_0)
    }
    if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('gte',
                                 'argument 2',
                                 'Uint128.mock.compact line 71 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 b_0)
    }
    return _dummyContract._gte_1(a_0, b_0);
  },
  gtU128: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`gtU128: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    if (!(typeof(a_0) === 'object' && typeof(a_0.low) === 'bigint' && a_0.low >= 0n && a_0.low <= 18446744073709551615n && typeof(a_0.high) === 'bigint' && a_0.high >= 0n && a_0.high <= 18446744073709551615n)) {
      __compactRuntime.typeError('gtU128',
                                 'argument 1',
                                 'Uint128.mock.compact line 75 char 1',
                                 'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                 a_0)
    }
    if (!(typeof(b_0) === 'object' && typeof(b_0.low) === 'bigint' && b_0.low >= 0n && b_0.low <= 18446744073709551615n && typeof(b_0.high) === 'bigint' && b_0.high >= 0n && b_0.high <= 18446744073709551615n)) {
      __compactRuntime.typeError('gtU128',
                                 'argument 2',
                                 'Uint128.mock.compact line 75 char 1',
                                 'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                 b_0)
    }
    return _dummyContract._gtU128_1(a_0, b_0);
  },
  gteU128: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`gteU128: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    if (!(typeof(a_0) === 'object' && typeof(a_0.low) === 'bigint' && a_0.low >= 0n && a_0.low <= 18446744073709551615n && typeof(a_0.high) === 'bigint' && a_0.high >= 0n && a_0.high <= 18446744073709551615n)) {
      __compactRuntime.typeError('gteU128',
                                 'argument 1',
                                 'Uint128.mock.compact line 79 char 1',
                                 'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                 a_0)
    }
    if (!(typeof(b_0) === 'object' && typeof(b_0.low) === 'bigint' && b_0.low >= 0n && b_0.low <= 18446744073709551615n && typeof(b_0.high) === 'bigint' && b_0.high >= 0n && b_0.high <= 18446744073709551615n)) {
      __compactRuntime.typeError('gteU128',
                                 'argument 2',
                                 'Uint128.mock.compact line 79 char 1',
                                 'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                 b_0)
    }
    return _dummyContract._gteU128_1(a_0, b_0);
  },
  addChecked: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`addChecked: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    if (!(typeof(a_0) === 'bigint' && a_0 >= 0n && a_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('addChecked',
                                 'argument 1',
                                 'Uint128.mock.compact line 91 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 a_0)
    }
    if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('addChecked',
                                 'argument 2',
                                 'Uint128.mock.compact line 91 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 b_0)
    }
    return _dummyContract._addChecked_1(a_0, b_0);
  },
  addCheckedU128: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`addCheckedU128: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    if (!(typeof(a_0) === 'object' && typeof(a_0.low) === 'bigint' && a_0.low >= 0n && a_0.low <= 18446744073709551615n && typeof(a_0.high) === 'bigint' && a_0.high >= 0n && a_0.high <= 18446744073709551615n)) {
      __compactRuntime.typeError('addCheckedU128',
                                 'argument 1',
                                 'Uint128.mock.compact line 95 char 1',
                                 'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                 a_0)
    }
    if (!(typeof(b_0) === 'object' && typeof(b_0.low) === 'bigint' && b_0.low >= 0n && b_0.low <= 18446744073709551615n && typeof(b_0.high) === 'bigint' && b_0.high >= 0n && b_0.high <= 18446744073709551615n)) {
      __compactRuntime.typeError('addCheckedU128',
                                 'argument 2',
                                 'Uint128.mock.compact line 95 char 1',
                                 'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                 b_0)
    }
    return _dummyContract._addCheckedU128_1(a_0, b_0);
  },
  sub: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`sub: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    if (!(typeof(a_0) === 'bigint' && a_0 >= 0n && a_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('sub',
                                 'argument 1',
                                 'Uint128.mock.compact line 99 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 a_0)
    }
    if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('sub',
                                 'argument 2',
                                 'Uint128.mock.compact line 99 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 b_0)
    }
    return _dummyContract._sub_1(a_0, b_0);
  },
  subU128: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`subU128: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    if (!(typeof(a_0) === 'object' && typeof(a_0.low) === 'bigint' && a_0.low >= 0n && a_0.low <= 18446744073709551615n && typeof(a_0.high) === 'bigint' && a_0.high >= 0n && a_0.high <= 18446744073709551615n)) {
      __compactRuntime.typeError('subU128',
                                 'argument 1',
                                 'Uint128.mock.compact line 103 char 1',
                                 'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                 a_0)
    }
    if (!(typeof(b_0) === 'object' && typeof(b_0.low) === 'bigint' && b_0.low >= 0n && b_0.low <= 18446744073709551615n && typeof(b_0.high) === 'bigint' && b_0.high >= 0n && b_0.high <= 18446744073709551615n)) {
      __compactRuntime.typeError('subU128',
                                 'argument 2',
                                 'Uint128.mock.compact line 103 char 1',
                                 'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                 b_0)
    }
    return _dummyContract._subU128_1(a_0, b_0);
  },
  min: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`min: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    if (!(typeof(a_0) === 'bigint' && a_0 >= 0n && a_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('min',
                                 'argument 1',
                                 'Uint128.mock.compact line 155 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 a_0)
    }
    if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('min',
                                 'argument 2',
                                 'Uint128.mock.compact line 155 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 b_0)
    }
    return _dummyContract._min_1(a_0, b_0);
  },
  minU128: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`minU128: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    if (!(typeof(a_0) === 'object' && typeof(a_0.low) === 'bigint' && a_0.low >= 0n && a_0.low <= 18446744073709551615n && typeof(a_0.high) === 'bigint' && a_0.high >= 0n && a_0.high <= 18446744073709551615n)) {
      __compactRuntime.typeError('minU128',
                                 'argument 1',
                                 'Uint128.mock.compact line 159 char 1',
                                 'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                 a_0)
    }
    if (!(typeof(b_0) === 'object' && typeof(b_0.low) === 'bigint' && b_0.low >= 0n && b_0.low <= 18446744073709551615n && typeof(b_0.high) === 'bigint' && b_0.high >= 0n && b_0.high <= 18446744073709551615n)) {
      __compactRuntime.typeError('minU128',
                                 'argument 2',
                                 'Uint128.mock.compact line 159 char 1',
                                 'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                 b_0)
    }
    return _dummyContract._minU128_1(a_0, b_0);
  },
  max: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`max: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    if (!(typeof(a_0) === 'bigint' && a_0 >= 0n && a_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('max',
                                 'argument 1',
                                 'Uint128.mock.compact line 163 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 a_0)
    }
    if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('max',
                                 'argument 2',
                                 'Uint128.mock.compact line 163 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 b_0)
    }
    return _dummyContract._max_1(a_0, b_0);
  },
  maxU128: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`maxU128: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    if (!(typeof(a_0) === 'object' && typeof(a_0.low) === 'bigint' && a_0.low >= 0n && a_0.low <= 18446744073709551615n && typeof(a_0.high) === 'bigint' && a_0.high >= 0n && a_0.high <= 18446744073709551615n)) {
      __compactRuntime.typeError('maxU128',
                                 'argument 1',
                                 'Uint128.mock.compact line 167 char 1',
                                 'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                 a_0)
    }
    if (!(typeof(b_0) === 'object' && typeof(b_0.low) === 'bigint' && b_0.low >= 0n && b_0.low <= 18446744073709551615n && typeof(b_0.high) === 'bigint' && b_0.high >= 0n && b_0.high <= 18446744073709551615n)) {
      __compactRuntime.typeError('maxU128',
                                 'argument 2',
                                 'Uint128.mock.compact line 167 char 1',
                                 'struct U128<low: Uint<0..18446744073709551616>, high: Uint<0..18446744073709551616>>',
                                 b_0)
    }
    return _dummyContract._maxU128_1(a_0, b_0);
  },
  MAX_UINT128: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`MAX_UINT128: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._MAX_UINT128_1();
  },
  MAX_U128: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`MAX_U128: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._MAX_U128_1();
  }
};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
//# sourceMappingURL=index.js.map
