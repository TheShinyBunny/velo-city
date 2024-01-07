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

export function withData<T>(block: Block<T>, newData: Partial<T>): Block<T> {
    return {type: block.type, data: Object.assign(block.data as object, newData)} as Block<T>
}

export function createProp(label: string, type: ExpressionType): Property {
    return {label, type}
}

export function createElementProp(): Property {
    return {label: 'Element', type: 'element'}
}

export function createSingleGroup(block: Block): BlockGroup {
    const copy = structuredClone(block)
    return {blocks: [copy]}
}

export function createReadWriteElementField(key: string, label: string, type: ExpressionType, oppositeLabel?: string): Block[] {
    return [
        {type: 'fieldAccess', data: {target: createElementProp(), key, label, type, oppositeLabel}},
        {type: 'fieldSetter', data: {target: createElementProp(), value: {label, type}, key, label, toggleable: type === 'boolean' ? label : undefined}},
    ]
}

export function createReadWriteMultiElementFields(fields: TypedSelectOption[]): Block[] {
    return [
        {type: 'multiFieldAccess', data: {target: createElementProp(), fields, selected: fields[0]}},
        {type: 'multiFieldSetter', data: {target: createElementProp(), fields, selected: fields[0], value: {label: fields[0].label, type: fields[0].type}}},
    ]
}

export function createToggleableElementState(trueLabel: string, falseLabel: string): Block {
    return {type: 'callable', data: {target: createElementProp(), key: trueLabel.toLowerCase(), label: trueLabel, params: [], returnType: 'void', oppositeLabel: falseLabel}}
}

export function createToggleableAndGetterElementState(trueLabel: string, falseLabel: string, getterLabel: string, oppositeLabel: string): Block[] {
    return [
        {type: 'callable', data: {target: createElementProp(), key: falseLabel.toLowerCase(), label: falseLabel, params: [], returnType: 'void', oppositeLabel: trueLabel, toggleable: getterLabel}},
        {type: 'fieldAccess', data: {target: createElementProp(), key: getterLabel.toLowerCase(), label: getterLabel, type: 'boolean', oppositeLabel}},
    ]
}

export function createBoolElementProp(key: string, label: string, oppositeLabel: string): Block {
    return {type: 'fieldAccess', data: {target: createElementProp(), key, label, type: 'boolean', oppositeLabel}}
}

export function isGroup(piece: BlockPiece<any>): piece is BlockGroup {
    return Array.isArray((piece as BlockGroup)?.blocks)
}

export function isSelectionPiece(piece: BlockPiece<any>): piece is SelectionPiece<any> {
    return typeof piece === 'object' && 'options' in piece
}

export function canConnectBottom<T>(type: BlockType<T>): boolean {
    return type instanceof StatementBlock || type instanceof ComputationBlock || type instanceof EventBlockType
}

export function canConnectTop<T>(type: BlockType<T>): boolean {
    return type instanceof StatementBlock || type instanceof ComputationBlock
}

export function isExpression<T>(type: BlockType<T>): boolean {
    return type instanceof ExpressionBlock
}

export async function canBlockConnectBottom<T>(block: Block<T>): Promise<boolean> {
    const type = await getBlockType(block)
    return type instanceof StatementBlock || type instanceof ComputationBlock || type instanceof EventBlockType
}

export async function canBlockConnectTop<T>(block: Block<T>): Promise<boolean> {
    const type = await getBlockType(block)
    return type instanceof StatementBlock || type instanceof ComputationBlock
}

export async function isBlockExpression<T>(block: Block<T>): Promise<boolean> {
    const type = await getBlockType(block)
    return type instanceof ExpressionBlock
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

export function addIf<T>(condition: boolean, ...values: T[]): T[] {
    if (condition) {
        return values
    }
    return []
}
