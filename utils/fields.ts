import {
    type BlockAction,
    type BlockPiece,
    ComputationBlock,
    ExpressionBlock,
    type Property,
    StatementBlock,
    type TypedSelectOption
} from '~/utils/blocks'
import {Compiler} from '~/utils/compiler'
import type {ExpressionType} from '~/utils/types'

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
        if (data.negated) {
            ctx.write('!')
        }
        ctx.writeProperty(data.target)
        ctx.write('.' + data.key)
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
        ctx.writeProperty(data.target)
        ctx.write('.' + data.selected.value)
    }

    render(data: MultiFieldAccessData): BlockPiece<MultiFieldAccessData>[] {
        return [{
            value: data.selected.value, options: data.fields, onChange: (value, block) => {
                return withData(block, {
                    selected: data.fields.find(field => field.value === value)
                })
            }
        }, 'of', data.target]
    }
}

export interface CallableData {
    target: Property
    key: string
    label: string
    params?: Property[]
    returnType: ExpressionType
    oppositeKey?: string
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
        if (data.toggleable && data.toggling) {
            ctx.write('if (')
            ctx.writeProperty(data.target)
            ctx.writeLine('.' + data.toggleable.toLowerCase() + ') {')
            ctx.indent(() => {
                ctx.writeProperty(data.target)
                ctx.write('.' + data.key + '()')
            })
            ctx.writeLine()
            ctx.writeLine('} else {')
            ctx.indent(() => {
                ctx.writeProperty(data.target)
                ctx.write('.' + data.key + '()')
            })
            ctx.writeLine()
            ctx.write('}')
        } else {
            ctx.writeProperty(data.target)
            ctx.write('.' + data.key + '(')
            if (data.params) {
                let first = true
                for (let param of data.params) {
                    if (!param.optional || param.value) {
                        if (!first) {
                            ctx.write(', ')
                        }
                        ctx.writeProperty(param)
                        first = false
                    }
                }
            }
            ctx.write(')')
        }
    }

    render(data: CallableData): BlockPiece<CallableData>[] {
        if (data.toggleable && data.toggling) {
            return ['Toggle', data.toggleable, 'state of', data.target]
        }
        return [data.label, data.target, ...(data.params || [])]
    }

    getActions(data: CallableData): BlockAction<CallableData>[] {
        return [
            ...addIf<BlockAction<CallableData>>(!!data.oppositeLabel, {
                label: 'Change to ' + data.oppositeLabel,
                run: (ctx, block) => {
                    return withData(block, {
                        key: data.oppositeKey,
                        label: data.oppositeLabel,
                        oppositeKey: block.data!.key,
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

export interface FunctionOption extends TypedSelectOption {
    params?: Property[]
}

export interface MultiCallableData {
    target: Property
    functions: FunctionOption[]
    selected: FunctionOption
}

export class MultiCallableBlock extends ComputationBlock<MultiCallableData> {
    color: string = 'bg-purple-400'

    getResultType(data: MultiCallableData): ExpressionType {
        return data.selected.type
    }

    compile(ctx: Compiler, data: MultiCallableData): void {
        ctx.writeProperty(data.target)
        ctx.write('.' + data.selected.value + '(')
        if (data.selected.params) {
            let first = true
            for (let param of data.selected.params) {
                if (!param.optional || param.value) {
                    if (!first) {
                        ctx.write(', ')
                    }
                    ctx.writeProperty(param)
                    first = false
                }
            }
        }
        ctx.write(')')
    }

    render(data: MultiCallableData): BlockPiece<MultiCallableData>[] {
        return [{
            value: data.selected.value,
            options: data.functions, onChange: (value, block) => {
                const func = data.functions.find(func => func.value === value)!
                return withData(block, {
                    selected: func
                })
            }
        }, data.target, ...(data.selected.params || [])]
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
        ctx.writeProperty(data.target)
        ctx.write('.' + data.key + ' = ')
        if (data.toggleable && data.toggling) {
            ctx.write('!')
            ctx.writeProperty(data.target)
            ctx.write('.' + data.key)
        } else {
            ctx.writeProperty(data.value)
        }
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
        ctx.writeProperty(data.target)
        ctx.write('.' + data.selected.value + ' = ')
        ctx.writeProperty(data.value)
    }

    render(data: MultiFieldSetterData): BlockPiece<MultiFieldSetterData>[] {
        return ['Set', {
            value: data.selected.value,
            options: data.fields, onChange: (value, block) => {
                const field = data.fields.find(field => field.value === value)!
                return withData(block, {
                    selected: field,
                    value: {label: field.label, type: field.type, value: data.value.value}
                })
            }
        }, 'of', data.target, 'to', data.value]
    }
}
