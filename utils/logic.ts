import {
    type Block,
    type BlockAction,
    type BlockPiece,
    ExpressionBlock,
    type Property,
    type SelectOption
} from './blocks'
import {Compiler} from './compiler'
import type {ExpressionType} from '~/utils/types'

interface Operand extends SelectOption {
    value: string
    label: string
    opposite: string
}

const operands: Operand[] = [
    {
        value: '>',
        label: '>',
        opposite: '<'
    },
    {
        value: '>=',
        label: '≥',
        opposite: '<='
    },
    {
        value: '<',
        label: '<',
        opposite: '>'
    },
    {
        value: '<=',
        label: '≤',
        opposite: '>='
    },
    {
        value: '==',
        label: '=',
        opposite: '!='
    },
    {
        value: '!=',
        label: '≠',
        opposite: '=='
    }
]

interface ComparisonData {
  left: Property
  right: Property
  operand: Operand
}

export class Comparison extends ExpressionBlock<ComparisonData> {
    color: string = 'bg-green-400'

    render(data: ComparisonData): BlockPiece<ComparisonData>[] {
        return [data.left, {options: operands, value: data.operand.value, largeLabels: true, onChange: (value, block) => {
            return withData(block, {
                operand: operands.find(op => op.value === value)
            })
        }}, data.right]
    }
    getResultType(data: ComparisonData): ExpressionType {
        return 'boolean'
    }
    compile(ctx: Compiler, data: ComparisonData) {
        if (data.left.value?.type === 'comparison') {
            ctx.write('(')
            ctx.writeProperty(data.left)
            ctx.write(')')
        } else {
            ctx.writeProperty(data.left)
        }
        ctx.write(' ' + data.operand.value + ' ')
        if (data.right.value?.type === 'comparison') {
            ctx.write('(')
            ctx.writeProperty(data.right)
            ctx.write(')')
        } else {
            ctx.writeProperty(data.right)
        }
    }
    getActions(data: ComparisonData): BlockAction<ComparisonData>[] {
        return [
            {
                label: 'Swap Left & Right',
                run(ctx, block) {
                    return withData(block, {
                        left: {...block.data!.left, value: block.data!.right.value},
                        right: {...block.data!.right, value: block.data!.left.value}
                    })
                }
            },
            {
                label: 'Negate',
                run(ctx, block) {
                    let opposite = operands.find(op => op.value === data.operand.opposite)
                    return withData(block, {
                        operand: opposite
                    })
                }
            }
        ]
    }
}

export interface UnaryData {
    value: Property
    label: string
    operand: string
    resultType: ExpressionType
}

export class UnaryOperation extends ExpressionBlock<UnaryData> {
    color: string = 'bg-red-300'
    render(data: UnaryData): BlockPiece<UnaryData>[] {
        return [data.label, data.value]
    }
    compile(ctx: Compiler, data: UnaryData): void {
        ctx.write(data.operand)
        if (data.value.value?.type === 'comparison') {
            ctx.write('(')
            ctx.writeProperty(data.value)
            ctx.write(')')
        } else {
            ctx.writeProperty(data.value)
        }
    }
    getResultType(data: UnaryData): ExpressionType {
        return data.resultType
    }

}

export const logic: Block[] = [
    {type: 'comparison', data: {operand: operands[0], left: createProp('Left', 'any'), right: createProp('Right', 'any')}},
    {type: 'unary', data: {value: {label: 'Value', type: 'any'}, label: 'Not', operand: '!', resultType: 'boolean'}},
]
