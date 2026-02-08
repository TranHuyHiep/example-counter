import { CircuitContext, emptyZswapLocalState, QueryContext, sampleContractAddress, type ContractState } from "@midnight-ntwrk/compact-runtime"
import { CostModel } from "@midnight-ntwrk/onchain-runtime-v2"
import { Contract, ledger } from "../../dist/managed/FaucetAMM/contract/index.js"
import { type Address } from "./addresses"

const dummyTxSender = "0".repeat(64)
const dummyRecipient = {
    is_left: false, // Use ContractAddress (right side)
    left: { bytes: new Uint8Array(32) },
    right: { bytes: new Uint8Array(32) }
}
const dummyNonce = new Uint8Array(32)

// Private state for FaucetAMM (empty since no private variables)
class PrivateState {}

export class Simulator {
    private contract: Contract<PrivateState, {}>;
    readonly address: string;
    private circuitContext: CircuitContext<PrivateState>
    private contractState: ContractState

    constructor(_treasury: Address) {
        const fee = 10n

        this.contract = new Contract({})
        
        // Call initialState with proper ConstructorContext
        const privateState = new PrivateState()
        const constructorContext = {
            initialPrivateState: privateState,
            transactionSender: dummyTxSender,
            initialZswapLocalState: emptyZswapLocalState(dummyTxSender)
        }
        
        const result = this.contract.initialState(constructorContext as any, fee)
        this.contractState = result.currentContractState
        
        this.address = sampleContractAddress()

        this.circuitContext = {
            currentPrivateState: privateState,
            originalState: this.contractState,
            currentZswapLocalState: emptyZswapLocalState(dummyTxSender),
            transactionContext: new QueryContext(
                this.contractState.data,
                this.address
            ),
            currentQueryContext: new QueryContext(
                this.contractState.data,
                this.address
            ),
            costModel: CostModel.initialCostModel()
        } as CircuitContext<PrivateState>
    }

    getFeeBps(): bigint {
        const ctx = this.circuitContext as any
        const state = ctx.transactionContext?.state || (this.contractState as any).data || this.contractState
        return ledger(state).feeBps
    }

    getLPCirculatingSupply(): bigint {
        const ctx = this.circuitContext as any
        const state = ctx.transactionContext?.state || (this.contractState as any).data || this.contractState
        return ledger(state).lpCirculatingSupply
    }

    getXLiquidity(): bigint {
        const ctx = this.circuitContext as any
        const state = ctx.transactionContext?.state || (this.contractState as any).data || this.contractState
        return ledger(state).xLiquidity
    }

    getXRewards(): bigint {
        const ctx = this.circuitContext as any
        const state = ctx.transactionContext?.state || (this.contractState as any).data || this.contractState
        return ledger(state).xRewards
    }

    getYLiquidity(): bigint {
        const ctx = this.circuitContext as any
        const state = ctx.transactionContext?.state || (this.contractState as any).data || this.contractState
        return ledger(state).yLiquidity
    }

    initLiquidity({xIn, yIn, lpOut}: {xIn: bigint, yIn: bigint, lpOut?: bigint}) {
        const userDefinedLPOut = !!lpOut

        lpOut = lpOut ?? BigInt(Math.round(Math.sqrt(Number(xIn)*Number(yIn))))

        if (!userDefinedLPOut) {
            while(lpOut*lpOut > xIn*yIn) {
                lpOut -= 1n
            }
        }

        const circuitResults = this.contract.circuits.initLiquidity(
            this.circuitContext,
            xIn, 
            yIn, 
            lpOut,
            dummyRecipient,
            dummyNonce
        )
        
        this.syncCircuitContext(circuitResults.context)
    }

    addLiquidity({xIn, yIn, lpOut}: {xIn: bigint, yIn: bigint, lpOut?: bigint}) {
        lpOut = lpOut ?? BigInt(Math.round(Math.sqrt(Number(xIn)*Number(yIn))))

        const circuitResults = this.contract.circuits.addLiquidity(
            this.circuitContext,
            xIn,
            yIn, 
            lpOut,
            dummyRecipient,
            dummyNonce
        )

        this.syncCircuitContext(circuitResults.context)
    }

    removeLiquidity({lpIn, xOut, yOut}: {lpIn: bigint, xOut: bigint, yOut: bigint}) {
        const circuitResults = this.contract.circuits.removeLiquidity(
            this.circuitContext,
            lpIn,
            xOut,
            yOut,
            dummyRecipient,
            dummyNonce
        )

        this.syncCircuitContext(circuitResults.context)
    }

    swapXToY({xIn, xFee, yOut}: {xIn: bigint, xFee?: bigint, yOut?: bigint}) {
        xFee = xFee ?? this.calcSwapXToYFee(xIn)
        yOut = yOut ?? this.calcSwapXToYOut(xIn, xFee)
        
        const circuitResults = this.contract.circuits.swapXToY(
            this.circuitContext,
            xIn,
            xFee,
            yOut,
            dummyRecipient,
            dummyNonce
        )

        this.syncCircuitContext(circuitResults.context)
    }

    swapYToX({yIn, xFee, xOut}: {yIn: bigint, xFee?: bigint, xOut?: bigint}) {
        xOut = xOut ?? this.calcSwapYToXOut(yIn)
        xFee = xFee ?? this.calcSwapYToXFee(xOut)

        const circuitResults = this.contract.circuits.swapYToX(
            this.circuitContext,
            yIn,
            xFee,
            xOut,
            dummyRecipient,
            dummyNonce
        )

        this.syncCircuitContext(circuitResults.context)
    }

    private calcSwapXToYFee(xIn: bigint): bigint {
        const feeBps = this.getFeeBps()
        let xFee = BigInt(Math.round(Number(xIn)*Number(feeBps)/10000))

        while (xFee*10000n < feeBps*xIn) {
            xFee += 1n
        }

        return xFee
    }

    private calcSwapXToYOut(xIn: bigint, xFee: bigint): bigint {
        const xLiquidity = this.getXLiquidity()
        const yLiquidity = this.getYLiquidity()
        const initialK = xLiquidity * yLiquidity

        let yOut = yLiquidity - BigInt(Math.round(Number(initialK)/Number(xLiquidity + xIn - xFee)));

        while (initialK > (yLiquidity - yOut)*(xLiquidity + xIn - xFee)) {
            yOut -= 1n
        }

        return yOut
    }

    private calcSwapYToXFee(xOut: bigint): bigint {
        const feeBps = this.getFeeBps()
        let xFee = BigInt(Math.round(Number(xOut)*Number(feeBps)/(10000 - Number(feeBps))))

        while (xFee*(10000n - feeBps) < feeBps*xOut) {
            xFee += 1n
        }

        return xFee
    }

    private calcSwapYToXOut(yIn: bigint): bigint {
        const xLiquidity = this.getXLiquidity()
        const yLiquidity = this.getYLiquidity()
        const initialK = xLiquidity * yLiquidity

        let xOutWithoutFee = xLiquidity - BigInt(Math.round(Number(initialK)/Number(yLiquidity + yIn)));

        while (initialK > (xLiquidity - xOutWithoutFee)*(yLiquidity + yIn)) {
            xOutWithoutFee -= 1n
        }

        const xFee = this.calcSwapXToYFee(xOutWithoutFee)

        return xOutWithoutFee - xFee
    }

    private syncCircuitContext(context: CircuitContext<PrivateState>) {
        this.circuitContext = context
        const ctx = context as any
        
        if (ctx.transactionContext && ctx.transactionContext.state) {
            this.contractState = ctx.transactionContext.state
        } else if (ctx.currentQueryContext && ctx.currentQueryContext.state) {
            this.contractState = ctx.currentQueryContext.state
        } else if (ctx.originalState) {
            this.contractState = ctx.originalState
        }
    }
}

