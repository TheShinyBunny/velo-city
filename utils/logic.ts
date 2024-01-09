import {type Block, type BlockAction, type BlockPiece, ExpressionBlock, type Property} from './blocks'
import {Compiler} from './compiler'
import type {ExpressionType} from '~/utils/types'

interface ComparisonData {
  left: Property
  right: Property
  operand: string
  label: string
  opposite: string
}

export class Comparison extends ExpressionBlock<ComparisonData> {
    color: string = 'bg-green-400'

    render(data: ComparisonData): BlockPiece<ComparisonData>[] {
        return [data.left, data.label, data.right]
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
        ctx.write(' ' + data.operand + ' ')
        if (data.right.value?.type === 'comparison') {
            ctx.write('(')
            ctx.writeProperty(data.right)
            ctx.write(')')
        } else {
            ctx.writeProperty(data.right)
        }
    }
    getActions(): BlockAction<ComparisonData>[] {
        return [
            {
                label: 'Swap Left & Right',
                run(ctx, block) {
                    return withData(block, {left: block.data!.right, right: block.data!.left})
                }
            },
            {
                label: 'Negate',
                run(ctx, block) {
                    let oppositeData = (comparisons as Record<string, ComparisonData>)[block.data!.opposite]
                    return withData(block, {
                        label: oppositeData.label,
                        operand: oppositeData.operand,
                        opposite: oppositeData.opposite
                    })
                }
            }
        ]
    }
}

function createComparison(operand: string, label: string, opposite: string): ComparisonData {
  return {operand, label, left: {label: 'Value', type: 'any'}, right: {label: 'Value', type: 'any'}, opposite}
}

export const comparisons = {
  equals: createComparison('==', 'is', 'notEqual'),
  notEqual: createComparison('!=', 'is not', 'equals'),
  lessThan: createComparison('<', 'is less than', 'greaterOrEqual'),
  greaterThan: createComparison('>', 'is greater than', 'lessOrEqual'),
  lessOrEqual: createComparison('<=', 'is less or equal to', 'greaterThan'),
  greaterOrEqual: createComparison('>=', 'is greater or equal to', 'lessThan'),
} satisfies Record<string, ComparisonData>

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
    {type: 'comparison', data: comparisons.equals},
    {type: 'comparison', data: comparisons.notEqual},
    {type: 'comparison', data: comparisons.lessThan},
    {type: 'comparison', data: comparisons.greaterThan},
    {type: 'comparison', data: comparisons.lessOrEqual},
    {type: 'comparison', data: comparisons.greaterOrEqual},
    {type: 'unary', data: {value: {label: 'Value', type: 'any'}, label: 'Not', operand: '!', resultType: 'boolean'}},
]
