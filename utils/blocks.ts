import { Compiler } from "./compiler"
import {EventBlockType} from '~/utils/events'
import type {ExpressionType} from '~/utils/types'

export interface Block<T = any> {
    type: BlockTypes
    data?: T
}

export interface BlockGroup {
    blocks: Block[]
    xPos?: number
    yPos?: number
}

export interface BlockType<T> {
    color: string
    render(data: T): BlockPiece<T>[]
    compile(ctx: Compiler, data: T): void
    getActions?(data: T): BlockAction<T>[]
}

export abstract class ExpressionBlock<T> implements BlockType<T> {
    abstract color: string
    abstract render(data: T): BlockPiece<T>[]
    abstract compile(ctx: Compiler, data: T): void
    abstract getResultType(data: T): ExpressionType
}

export abstract class ComputationBlock<T> extends ExpressionBlock<T> {

}

export abstract class StatementBlock<T> implements BlockType<T> {
    abstract color: string
    abstract render(data: T): BlockPiece<T>[]
    abstract compile(ctx: Compiler, data: T): void
}

export type BlockPiece<T> = string | Property | SelectionPiece<T> | BlockGroup

export interface Property {
    label: string
    type: ExpressionType
    value?: Block
    error?: string
}

export interface SelectionPiece<T> {
    placeholder?: string
    value?: string
    options: SelectOption[]
    onChange?(value: string, block: Block<T>): Block<T>
}

export interface SelectOption {
    label: string
    value: string
    disabled?: boolean
}

export interface TypedSelectOption extends SelectOption {
    type: ExpressionType
}

export interface BlockAction<T> {
    label: string
    run(ctx: BlockEditor, block: Block<T>): Block<T>
}

export interface BlockEditor {
    startDragging(group: BlockGroup): void
}

let registry: any

async function createRegistry() {
    const control = await import('./control')
    const events = await import('./events')
    const logic = await import('./logic')
    const values = await import('./values')
    return {
        ifBlock: new control.IfBlock(),
        onReady: new events.OnReady(),
        comparison: new logic.Comparison(),
        unary: new logic.UnaryOperation(),
        literal: new values.LiteralValue(),
        elementEvent: new events.ElementEvent(),
        callable: new values.CallableBlock(),
        fieldAccess: new values.FieldAccessBlock(),
        multiFieldAccess: new values.MultiFieldAccessBlock(),
        fieldSetter: new values.FieldSetterBlock(),
        multiFieldSetter: new values.MultiFieldSetterBlock(),
        error: new values.ErrorBlock()
    }
}

export async function getBlockType<T>(block: Block<T>): Promise<BlockType<T>> {
    return getType(block.type)
}

export async function getType(type: BlockTypes): Promise<BlockType<any>> {
    let reg = registry
    if (!reg) reg = await createRegistry()
    return reg[type]
}

export type BlockTypes = keyof Awaited<ReturnType<typeof createRegistry>>

export interface AttachTarget {
    type: 'adjacent' | 'slot'
}

export interface AdjacentAttachment extends AttachTarget {
    type: 'adjacent'
    group: BlockGroup
    index: number
    offset: 'top' | 'bottom'
}

export interface SlotAttachment extends AttachTarget {
    type: 'slot'
    property: Property
}
