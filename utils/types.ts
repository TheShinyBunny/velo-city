import type { SelectOption } from '~/utils/blocks'

export type SimpleTypes = 'any'
    | 'boolean'
    | 'void'
    | 'element'
    | 'color'
    | 'image'
    | 'link'

export type OptionalComplexTypes = 'string'
    | 'date'
    | 'number'

export type RequiredComplexTypes = 'enum'
    | 'array'
    | 'object'
    | 'promise'

export type ComplexTypes = OptionalComplexTypes | RequiredComplexTypes

export type TypeKey = SimpleTypes | ComplexTypes

export type SingleType = SimpleTypes | OptionalComplexTypes | AllComplexTypes

export type ExpressionType = SingleType | readonly ExpressionType[]

export type AllComplexTypes =
    StringType
    | NumberType
    | DateType
    | EnumType
    | ArrayType
    | ObjectType
    | PromiseType

export interface ComplexType {
    type: ComplexTypes
}

export interface StringType extends ComplexType {
    type: 'string'
}

export interface NumberType extends ComplexType {
    type: 'number'
    suffix?: string
    integer?: boolean
}

export interface DateType extends ComplexType {
    type: 'date'
}

export interface EnumType extends ComplexType {
    type: 'enum'
    name: string
    options: SelectOption[]
}

export interface ArrayType extends ComplexType {
    type: 'array'
    elements: ExpressionType
}

export interface ObjectType extends ComplexType {
    type: 'object'
    name: string
    entries: Record<string, ExpressionType>
}

export interface PromiseType extends ComplexType {
    type: 'promise'
    of: ExpressionType
}

export const stringTypes: TypeKey[] = ['any', 'color', 'element', 'image', 'string', 'enum', 'number', 'link']

export function canAssignTypes(value: ExpressionType, to: ExpressionType): boolean {
  if (Array.isArray(value)) {
    return value.some(option => canAssignTypes(option, to))
  }
  if (Array.isArray(to)) {
    return to.some(option => canAssignTypes(value, option))
  }
  const valueType = getTypeKey(value as SingleType)
  const toType = getTypeKey(to as SingleType)
  return areSimilar(valueType, toType)
}

function areSimilar(first: TypeKey, second: TypeKey): boolean {
  if (first === second) { return true }
  return stringTypes.includes(first) && stringTypes.includes(second)
}

export function getTypeKey(type: SingleType): TypeKey {
  if (typeof type === 'string') { return type }
  return type.type
}

export function asSingleType(type: ExpressionType): SingleType {
  if (Array.isArray(type)) { return asSingleType(type[0]) }
  return type as SingleType
}

type ComplexKeyToType = {
    string: 'string ' | StringType
    number: 'number' | NumberType
    date: 'date' | DateType
    enum: EnumType
    array: ArrayType
    object: ObjectType
    promise: PromiseType
}

type TypeNameMap = {
    [T in TypeKey]: T extends keyof ComplexKeyToType ? ((complex: ComplexKeyToType[T]) => string) : string
}

const typeNames: TypeNameMap = {
  any: 'Any Value',
  boolean: 'Boolean',
  color: 'Color',
  element: 'Wix Element',
  link: 'Link',
  image: 'Image',
  void: 'Nothing',
  string: (str: string | StringType) => 'Text',
  number: (num: string | NumberType) => typeof num !== 'string' && num.integer ? 'Whole Number' : 'Number',
  date: (date: string | DateType) => 'Date',
  enum: (en: EnumType) => en.name,
  array: (arr: ArrayType) => 'Array of ' + getTypeName(arr.elements),
  object: (obj: ObjectType) => obj.name,
  promise: (promise: PromiseType) => 'Async Operation resulting in ' + getTypeName(promise.of)
}

export function getTypeName(type: ExpressionType): string {
  if (Array.isArray(type)) {
    return type.map(subType => getTypeName(subType)).join(' or ')
  }
  const key = getTypeKey(type as SingleType)
  const name = typeNames[key]
  if (typeof name === 'function') {
    return name(type as any)
  }
  return name
}
