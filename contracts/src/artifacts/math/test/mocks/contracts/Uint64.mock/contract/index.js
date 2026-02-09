import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.14.0');

const _descriptor_0 = new __compactRuntime.CompactTypeUnsignedInteger(4294967295n, 4);

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_2 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

const _descriptor_3 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

const _descriptor_4 = __compactRuntime.CompactTypeBoolean;

class _DivResultU64_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_1.alignment());
  }
  fromValue(value_0) {
    return {
      quotient: _descriptor_1.fromValue(value_0),
      remainder: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.quotient).concat(_descriptor_1.toValue(value_0.remainder));
  }
}

const _descriptor_5 = new _DivResultU64_0();

const _descriptor_6 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

const _descriptor_7 = new __compactRuntime.CompactTypeBytes(32);

class _Either_0 {
  alignment() {
    return _descriptor_4.alignment().concat(_descriptor_7.alignment().concat(_descriptor_7.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_4.fromValue(value_0),
      left: _descriptor_7.fromValue(value_0),
      right: _descriptor_7.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_4.toValue(value_0.is_left).concat(_descriptor_7.toValue(value_0.left).concat(_descriptor_7.toValue(value_0.right)));
  }
}

const _descriptor_8 = new _Either_0();

class _ContractAddress_0 {
  alignment() {
    return _descriptor_7.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_7.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_7.toValue(value_0.bytes);
  }
}

const _descriptor_9 = new _ContractAddress_0();

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
    if (typeof(witnesses_0.divU64Locally) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named divU64Locally');
    }
    if (typeof(witnesses_0.sqrtU64Locally) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named sqrtU64Locally');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      add(context, ...args_1) {
        return { result: pureCircuits.add(...args_1), context };
      },
      sub(context, ...args_1) {
        return { result: pureCircuits.sub(...args_1), context };
      },
      mul(context, ...args_1) {
        return { result: pureCircuits.mul(...args_1), context };
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
                                     'Uint64.mock.compact line 26 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(a_0) === 'bigint' && a_0 >= 0n && a_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('div',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'Uint64.mock.compact line 26 char 1',
                                     'Uint<0..18446744073709551616>',
                                     a_0)
        }
        if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('div',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'Uint64.mock.compact line 26 char 1',
                                     'Uint<0..18446744073709551616>',
                                     b_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(a_0).concat(_descriptor_1.toValue(b_0)),
            alignment: _descriptor_1.alignment().concat(_descriptor_1.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._div_1(context, partialProofData, a_0, b_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
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
                                     'Uint64.mock.compact line 30 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(a_0) === 'bigint' && a_0 >= 0n && a_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('rem',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'Uint64.mock.compact line 30 char 1',
                                     'Uint<0..18446744073709551616>',
                                     a_0)
        }
        if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('rem',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'Uint64.mock.compact line 30 char 1',
                                     'Uint<0..18446744073709551616>',
                                     b_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(a_0).concat(_descriptor_1.toValue(b_0)),
            alignment: _descriptor_1.alignment().concat(_descriptor_1.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._rem_1(context, partialProofData, a_0, b_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
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
                                     'Uint64.mock.compact line 34 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(a_0) === 'bigint' && a_0 >= 0n && a_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('divRem',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'Uint64.mock.compact line 34 char 1',
                                     'Uint<0..18446744073709551616>',
                                     a_0)
        }
        if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('divRem',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'Uint64.mock.compact line 34 char 1',
                                     'Uint<0..18446744073709551616>',
                                     b_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(a_0).concat(_descriptor_1.toValue(b_0)),
            alignment: _descriptor_1.alignment().concat(_descriptor_1.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._divRem_1(context, partialProofData, a_0, b_0);
        partialProofData.output = { value: _descriptor_5.toValue(result_0), alignment: _descriptor_5.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      sqrt: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`sqrt: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const radical_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('sqrt',
                                     'argument 1 (as invoked from Typescript)',
                                     'Uint64.mock.compact line 38 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(radical_0) === 'bigint' && radical_0 >= 0n && radical_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('sqrt',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'Uint64.mock.compact line 38 char 1',
                                     'Uint<0..18446744073709551616>',
                                     radical_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(radical_0),
            alignment: _descriptor_1.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._sqrt_1(context, partialProofData, radical_0);
        partialProofData.output = { value: _descriptor_0.toValue(result_0), alignment: _descriptor_0.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
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
                                     'Uint64.mock.compact line 42 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(value_0) === 'bigint' && value_0 >= 0n && value_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('isMultiple',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'Uint64.mock.compact line 42 char 1',
                                     'Uint<0..18446744073709551616>',
                                     value_0)
        }
        if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('isMultiple',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'Uint64.mock.compact line 42 char 1',
                                     'Uint<0..18446744073709551616>',
                                     b_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(value_0).concat(_descriptor_1.toValue(b_0)),
            alignment: _descriptor_1.alignment().concat(_descriptor_1.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._isMultiple_1(context,
                                            partialProofData,
                                            value_0,
                                            b_0);
        partialProofData.output = { value: _descriptor_4.toValue(result_0), alignment: _descriptor_4.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      min(context, ...args_1) {
        return { result: pureCircuits.min(...args_1), context };
      },
      max(context, ...args_1) {
        return { result: pureCircuits.max(...args_1), context };
      },
      MAX_UINT8(context, ...args_1) {
        return { result: pureCircuits.MAX_UINT8(...args_1), context };
      },
      MAX_UINT16(context, ...args_1) {
        return { result: pureCircuits.MAX_UINT16(...args_1), context };
      },
      MAX_UINT32(context, ...args_1) {
        return { result: pureCircuits.MAX_UINT32(...args_1), context };
      },
      MAX_UINT64(context, ...args_1) {
        return { result: pureCircuits.MAX_UINT64(...args_1), context };
      }
    };
    this.impureCircuits = {
      div: this.circuits.div,
      rem: this.circuits.rem,
      divRem: this.circuits.divRem,
      sqrt: this.circuits.sqrt,
      isMultiple: this.circuits.isMultiple
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
    state_0.setOperation('div', new __compactRuntime.ContractOperation());
    state_0.setOperation('rem', new __compactRuntime.ContractOperation());
    state_0.setOperation('divRem', new __compactRuntime.ContractOperation());
    state_0.setOperation('sqrt', new __compactRuntime.ContractOperation());
    state_0.setOperation('isMultiple', new __compactRuntime.ContractOperation());
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
  _divU64Locally_0(context, partialProofData, a_0, b_0) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.divU64Locally(witnessContext_0,
                                                                        a_0,
                                                                        b_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'object' && typeof(result_0.quotient) === 'bigint' && result_0.quotient >= 0n && result_0.quotient <= 18446744073709551615n && typeof(result_0.remainder) === 'bigint' && result_0.remainder >= 0n && result_0.remainder <= 18446744073709551615n)) {
      __compactRuntime.typeError('divU64Locally',
                                 'return value',
                                 'Uint64.compact line 50 char 3',
                                 'struct DivResultU64<quotient: Uint<0..18446744073709551616>, remainder: Uint<0..18446744073709551616>>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_5.toValue(result_0),
      alignment: _descriptor_5.alignment()
    });
    return result_0;
  }
  _sqrtU64Locally_0(context, partialProofData, radicand_0) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.sqrtU64Locally(witnessContext_0,
                                                                         radicand_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 4294967295n)) {
      __compactRuntime.typeError('sqrtU64Locally',
                                 'return value',
                                 'Uint64.compact line 58 char 3',
                                 'Uint<0..4294967296>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _MAX_UINT8_0() { return 255n; }
  _MAX_UINT16_0() { return 65535n; }
  _MAX_UINT32_0() { return 4294967295n; }
  _MAX_UINT64_0() { return 18446744073709551615n; }
  _add_0(a_0, b_0) { return a_0 + b_0; }
  _sub_0(a_0, b_0) {
    __compactRuntime.assert(a_0 >= b_0, 'Math: subtraction underflow');
    __compactRuntime.assert(a_0 >= b_0,
                            'result of subtraction would be negative');
    return a_0 - b_0;
  }
  _mul_0(a_0, b_0) { return a_0 * b_0; }
  __div_0(context, partialProofData, a_0, b_0) {
    __compactRuntime.assert(!this._equal_0(b_0, 0n), 'Math: division by zero');
    if (this._equal_1(a_0, 0n)) {
      return { quotient: 0n, remainder: 0n };
    } else {
      if (this._equal_2(b_0, 1n)) {
        return { quotient: a_0, remainder: 0n };
      } else {
        if (this._equal_3(a_0, b_0)) {
          return { quotient: 1n, remainder: 0n };
        } else {
          if (a_0 < b_0) {
            return { quotient: 0n, remainder: a_0 };
          } else {
            const result_0 = this._divU64Locally_0(context,
                                                   partialProofData,
                                                   a_0,
                                                   b_0);
            __compactRuntime.assert(result_0.remainder < b_0,
                                    'Math: remainder error');
            __compactRuntime.assert(this._equal_4(((t1) => {
                                                    if (t1 > 18446744073709551615n) {
                                                      throw new __compactRuntime.CompactError('Uint64.compact line 226 char 14: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                                                    }
                                                    return t1;
                                                  })(result_0.quotient * b_0
                                                     +
                                                     result_0.remainder),
                                                  a_0),
                                    'Math: division invalid');
            return result_0;
          }
        }
      }
    }
  }
  _div_0(context, partialProofData, a_0, b_0) {
    return this.__div_0(context, partialProofData, a_0, b_0).quotient;
  }
  _rem_0(context, partialProofData, a_0, b_0) {
    return this.__div_0(context, partialProofData, a_0, b_0).remainder;
  }
  _divRem_0(context, partialProofData, a_0, b_0) {
    return this.__div_0(context, partialProofData, a_0, b_0);
  }
  _sqrt_0(context, partialProofData, radicand_0) {
    const root_0 = this._sqrtU64Locally_0(context, partialProofData, radicand_0);
    const rootSquare_0 = this._mul_0(root_0, root_0);
    __compactRuntime.assert(rootSquare_0 <= radicand_0,
                            'Math: sqrt overestimate');
    const next_0 = root_0 + 1n;
    const nextSquare_0 = this._mul_0(next_0, next_0);
    __compactRuntime.assert(nextSquare_0 > radicand_0,
                            'Math: sqrt underestimate');
    return root_0;
  }
  _isMultiple_0(context, partialProofData, a_0, b_0) {
    return this._equal_5(this._rem_0(context, partialProofData, a_0, b_0), 0n);
  }
  _min_0(a_0, b_0) { if (a_0 < b_0) { return a_0; } else { return b_0; } }
  _max_0(a_0, b_0) { if (a_0 > b_0) { return a_0; } else { return b_0; } }
  _add_1(a_0, b_0) { return this._add_0(a_0, b_0); }
  _sub_1(a_0, b_0) { return this._sub_0(a_0, b_0); }
  _mul_1(a_0, b_0) { return this._mul_0(a_0, b_0); }
  _div_1(context, partialProofData, a_0, b_0) {
    return this._div_0(context, partialProofData, a_0, b_0);
  }
  _rem_1(context, partialProofData, a_0, b_0) {
    return this._rem_0(context, partialProofData, a_0, b_0);
  }
  _divRem_1(context, partialProofData, a_0, b_0) {
    return this._divRem_0(context, partialProofData, a_0, b_0);
  }
  _sqrt_1(context, partialProofData, radical_0) {
    return this._sqrt_0(context, partialProofData, radical_0);
  }
  _isMultiple_1(context, partialProofData, value_0, b_0) {
    return this._isMultiple_0(context, partialProofData, value_0, b_0);
  }
  _min_1(a_0, b_0) { return this._min_0(a_0, b_0); }
  _max_1(a_0, b_0) { return this._max_0(a_0, b_0); }
  _MAX_UINT8_1() { return this._MAX_UINT8_0(); }
  _MAX_UINT16_1() { return this._MAX_UINT16_0(); }
  _MAX_UINT32_1() { return this._MAX_UINT32_0(); }
  _MAX_UINT64_1() { return this._MAX_UINT64_0(); }
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
  divU64Locally: (...args) => undefined, sqrtU64Locally: (...args) => undefined
});
export const pureCircuits = {
  add: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`add: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    if (!(typeof(a_0) === 'bigint' && a_0 >= 0n && a_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('add',
                                 'argument 1',
                                 'Uint64.mock.compact line 14 char 1',
                                 'Uint<0..18446744073709551616>',
                                 a_0)
    }
    if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('add',
                                 'argument 2',
                                 'Uint64.mock.compact line 14 char 1',
                                 'Uint<0..18446744073709551616>',
                                 b_0)
    }
    return _dummyContract._add_1(a_0, b_0);
  },
  sub: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`sub: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    if (!(typeof(a_0) === 'bigint' && a_0 >= 0n && a_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('sub',
                                 'argument 1',
                                 'Uint64.mock.compact line 18 char 1',
                                 'Uint<0..18446744073709551616>',
                                 a_0)
    }
    if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('sub',
                                 'argument 2',
                                 'Uint64.mock.compact line 18 char 1',
                                 'Uint<0..18446744073709551616>',
                                 b_0)
    }
    return _dummyContract._sub_1(a_0, b_0);
  },
  mul: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`mul: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    if (!(typeof(a_0) === 'bigint' && a_0 >= 0n && a_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('mul',
                                 'argument 1',
                                 'Uint64.mock.compact line 22 char 1',
                                 'Uint<0..18446744073709551616>',
                                 a_0)
    }
    if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('mul',
                                 'argument 2',
                                 'Uint64.mock.compact line 22 char 1',
                                 'Uint<0..18446744073709551616>',
                                 b_0)
    }
    return _dummyContract._mul_1(a_0, b_0);
  },
  min: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`min: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    if (!(typeof(a_0) === 'bigint' && a_0 >= 0n && a_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('min',
                                 'argument 1',
                                 'Uint64.mock.compact line 46 char 1',
                                 'Uint<0..18446744073709551616>',
                                 a_0)
    }
    if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('min',
                                 'argument 2',
                                 'Uint64.mock.compact line 46 char 1',
                                 'Uint<0..18446744073709551616>',
                                 b_0)
    }
    return _dummyContract._min_1(a_0, b_0);
  },
  max: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`max: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    if (!(typeof(a_0) === 'bigint' && a_0 >= 0n && a_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('max',
                                 'argument 1',
                                 'Uint64.mock.compact line 50 char 1',
                                 'Uint<0..18446744073709551616>',
                                 a_0)
    }
    if (!(typeof(b_0) === 'bigint' && b_0 >= 0n && b_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('max',
                                 'argument 2',
                                 'Uint64.mock.compact line 50 char 1',
                                 'Uint<0..18446744073709551616>',
                                 b_0)
    }
    return _dummyContract._max_1(a_0, b_0);
  },
  MAX_UINT8: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`MAX_UINT8: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._MAX_UINT8_1();
  },
  MAX_UINT16: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`MAX_UINT16: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._MAX_UINT16_1();
  },
  MAX_UINT32: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`MAX_UINT32: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._MAX_UINT32_1();
  },
  MAX_UINT64: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`MAX_UINT64: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._MAX_UINT64_1();
  }
};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
//# sourceMappingURL=index.js.map
