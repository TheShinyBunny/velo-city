import type { ExpressionType } from '~/utils/types'
import { EventBlockType } from '~/utils/events'
import {
  type Block,
  type BlockGroup,
  type BlockPiece,
  type BlockType,
  ComputationBlock,
  ExpressionBlock,
  getBlockType,
  type Property,
  type SelectionPiece,
  StatementBlock,
  type TypedSelectOption
} from '~/utils/blocks'

export function withData<T> (block: Block<T>, newData: Partial<T>): Block<T> {
  return { type: block.type, data: Object.assign(block.data as object, newData) } as Block<T>
}

export function createProp(label: string, type: ExpressionType): Property {
  return { label, type }
}

export function createElementProp(): Property {
  return { label: 'Element', type: 'element' }
}

export function createReadWriteElementField(key: string, label: string, type: ExpressionType, oppositeLabel?: string): Block[] {
  return [
    { type: 'fieldAccess', data: { target: createElementProp(), key, label, type, oppositeLabel } },
    { type: 'fieldSetter', data: { target: createElementProp(), value: { label, type }, key, label, toggleable: type === 'boolean' ? label : undefined } }
  ]
}

export function createReadWriteMultiElementFields(fields: TypedSelectOption[]): Block[] {
  return [
    { type: 'multiFieldAccess', data: { target: createElementProp(), fields, selected: fields[0] } },
    { type: 'multiFieldSetter', data: { target: createElementProp(), fields, selected: fields[0], value: { label: fields[0].label, type: fields[0].type } } }
  ]
}

export function createToggleableElementState(trueLabel: string, falseLabel: string): Block {
  return { type: 'callable', data: { target: createElementProp(), key: trueLabel.toLowerCase(), label: trueLabel, returnType: 'void', oppositeLabel: falseLabel, oppositeKey: falseLabel.toLowerCase() } }
}

export function createToggleableAndGetterElementState(trueLabel: string, falseLabel: string, getterLabel: string, oppositeLabel: string): Block[] {
  return [
    { type: 'callable', data: { target: createElementProp(), key: falseLabel.toLowerCase(), label: falseLabel, returnType: 'void', oppositeLabel: trueLabel, oppositeKey: trueLabel.toLowerCase(), toggleable: getterLabel } },
    { type: 'fieldAccess', data: { target: createElementProp(), key: getterLabel.toLowerCase(), label: getterLabel, type: 'boolean', oppositeLabel } }
  ]
}

export function createBoolElementProp(key: string, label: string, oppositeLabel: string): Block {
  return { type: 'fieldAccess', data: { target: createElementProp(), key, label, type: 'boolean', oppositeLabel } }
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

export function getResultType(block: Block): ExpressionType {
  const type = getBlockTypeNow(block)
  if (type instanceof ExpressionBlock) {
    return type.getResultType(block.data)
  }
  return 'void'
}

export function addIf<T>(condition: boolean, ...values: T[]): T[] {
  if (condition) {
    return values
  }
  return []
}

export function toTitleCase(str: string) {
  const result = str.replace(/([A-Z])/g, ' $1')
  return result.charAt(0).toUpperCase() + result.slice(1)
}

export function isProperty(value: any): value is Property {
  return value.label && value.type
}

export function isPropertyWithValue(value: any): value is Property {
  return value.label && value.type && value.value
}

export function isPartialMatch(obj: any, partial: any): boolean {
  return Object.keys(partial).every(k =>
    partial[k] && obj[k]
      ? partial[k] instanceof Object
        ? isPartialMatch(obj[k], partial[k])
        : partial[k] === obj[k]
      : false
  )
}
