import {
    type Block,
    type BlockAction,
    type BlockPiece,
    ComputationBlock,
    ExpressionBlock,
    type Property, type SelectOption, StatementBlock, type TypedSelectOption
} from '~/utils/blocks'
import {Compiler} from '~/utils/compiler'
import type {ExpressionType} from '~/utils/types'

interface LiteralData {
    type: ExpressionType
    value: any
}

export class LiteralValue extends ExpressionBlock<LiteralData> {
    color: string = 'bg-red-500'

    compile(ctx: Compiler, data: LiteralData): void {
    }

    getResultType(data: LiteralData): ExpressionType {
        return data.type
    }

    render(data: LiteralData): BlockPiece<LiteralData>[] {
        return [data.value]
    }
}

export interface FieldAccessData {
    target: Property
    key: string
    label: string
    type: ExpressionType
    oppositeLabel?: string
    negated?: boolean
}

export class FieldAccessBlock extends ExpressionBlock<FieldAccessData> {
    color: string = 'bg-indigo-400'

    getResultType(data: FieldAccessData): ExpressionType {
        return data.type
    }

    compile(ctx: Compiler, data: FieldAccessData): void {
    }

    render(data: FieldAccessData): BlockPiece<FieldAccessData>[] {
        return data.type === 'boolean' ? ['Is', data.target, data.negated ? data.oppositeLabel! : data.label] : [data.label, 'of', data.target]
    }

    getActions(data: FieldAccessData): BlockAction<FieldAccessData>[] {
        return [
            ...addIf<BlockAction<FieldAccessData>>(data.type === 'boolean' && !!data.oppositeLabel, {
                label: 'Change to ' + (data.negated ? data.label : data.oppositeLabel),
                run: (ctx, block) => {
                    return withData(block, {
                        negated: !block.data!.negated
                    })
                }
            })
        ]
    }
}

export interface MultiFieldAccessData {
    target: Property
    fields: TypedSelectOption[]
    selected: TypedSelectOption
}

export class MultiFieldAccessBlock extends ExpressionBlock<MultiFieldAccessData> {
    color: string = 'bg-indigo-400'

    getResultType(data: MultiFieldAccessData): ExpressionType {
        return data.selected.type
    }

    compile(ctx: Compiler, data: MultiFieldAccessData): void {
    }

    render(data: MultiFieldAccessData): BlockPiece<MultiFieldAccessData>[] {
        return [{value: data.selected.value, options: data.fields, onChange: (value, block) => {
            return withData(block, {
                selected: data.fields.find(field => field.value === value)
            })
        }}, 'of', data.target]
    }
}

export interface CallableData {
    target: Property
    key: string
    label: string
    params: Property[]
    returnType: ExpressionType
    oppositeLabel?: string
    toggleable?: string
    toggling?: boolean
}

export class CallableBlock extends ComputationBlock<CallableData> {
    color: string = 'bg-purple-400'

    getResultType(data: CallableData): ExpressionType {
        return data.returnType
    }

    compile(ctx: Compiler, data: CallableData): void {
    }

    render(data: CallableData): BlockPiece<CallableData>[] {
        if (data.toggleable && data.toggling) {
            return ['Toggle', data.toggleable, 'state of', data.target]
        }
        return [data.label, data.target, ...data.params]
    }

    getActions(data: CallableData): BlockAction<CallableData>[] {
        return [
            ...addIf<BlockAction<CallableData>>(!!data.oppositeLabel, {
                label: 'Change to ' + data.oppositeLabel,
                run: (ctx, block) => {
                    return withData(block, {
                        key: data.oppositeLabel!.toLowerCase(),
                        label: data.oppositeLabel,
                        oppositeLabel: block.data!.label,
                        toggling: false
                    })
                }
            }),
            ...addIf<BlockAction<CallableData>>(!!data.toggleable && !!data.toggling, {
                label: 'Change to ' + data.label,
                run: (ctx, block) => {
                    return withData(block, {
                        toggling: false
                    })
                }
            }),
            ...addIf<BlockAction<CallableData>>(!!data.toggleable && !data.toggling, {
                label: 'Toggle ' + data.toggleable + ' state',
                run: (ctx, block) => {
                    return withData(block, {
                        toggling: true
                    })
                }
            }),
        ]
    }
}

export interface FieldSetterData {
    target: Property
    key: string
    label: string
    value: Property
    toggleable?: string
    toggling?: boolean
}

export class FieldSetterBlock extends StatementBlock<FieldSetterData> {
    color: string = 'bg-indigo-500'

    compile(ctx: Compiler, data: FieldSetterData): void {
    }

    render(data: FieldSetterData): BlockPiece<FieldSetterData>[] {
        if (data.toggleable && data.toggling) {
            return ['Toggle', data.label, 'state of', data.target]
        }
        return ['Set', data.label, 'of', data.target, 'to', data.value]
    }

    getActions(data: FieldSetterData): BlockAction<FieldSetterData>[] {
        return [
            ...addIf<BlockAction<FieldSetterData>>(!!data.toggleable && !data.toggling, {
                label: 'Toggle ' + data.toggleable + ' state',
                run: (ctx, block) => {
                    return withData(block, {
                        toggling: true
                    })
                }
            }),
            ...addIf<BlockAction<FieldSetterData>>(!!data.toggleable && !!data.toggling, {
                label: 'Set manual value',
                run: (ctx, block) => {
                    return withData(block, {
                        toggling: false
                    })
                }
            })
        ]
    }
}

export interface MultiFieldSetterData {
    target: Property
    fields: TypedSelectOption[]
    selected: TypedSelectOption
    value: Property
}

export class MultiFieldSetterBlock extends StatementBlock<MultiFieldSetterData> {
    color: string = 'bg-indigo-500'

    compile(ctx: Compiler, data: MultiFieldSetterData): void {
    }

    render(data: MultiFieldSetterData): BlockPiece<MultiFieldSetterData>[] {
        return ['Set', {value: data.selected.value, options: data.fields, onChange: (value, block) => {
                const field = data.fields.find(field => field.value === value)!
                return withData(block, {
                    selected: field,
                    value: {label: field.label, type: field.type, value: data.value.value}
                })
            }}, 'of', data.target, 'to', data.value]
    }
}


export class ErrorBlock extends ComputationBlock<string> {
    color: string = 'bg-red-500'
    render(data: string): BlockPiece<any>[] {
        return [data]
    }
    compile(ctx: Compiler, data: string): void {
    }
    getResultType(data: any): ExpressionType {
        return 'any'
    }

}
