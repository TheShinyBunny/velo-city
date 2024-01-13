import type { Compiler } from '../compiler'
import { type Block, type BlockPiece, ExpressionBlock, type Property } from '~/utils/blocks'
import type { ExpressionType } from '~/utils/types'
import { isPartialMatch } from '~/utils/helpers'
import { FieldSetterBlock, type FieldSetterData, type MultiCallableData } from '~/utils/fields'
import { stringFunctions } from '~/utils/strings'
import type { ComparisonData, UnaryData } from '~/utils/logic'

type FilterType = Block & {
    restrict?: (data: any) => any
    revert?: (data: any) => any
}

export const filterTypes: Record<string, FilterType> = {
  eq: {
    type: 'comparison',
    data: { operand: { value: '==' } },
    restrict: restrictComparison,
    revert: revertComparison
  },
  gt: {
    type: 'comparison',
    data: { operand: { value: '>' } },
    restrict: restrictComparison,
    revert: revertComparison
  },
  ge: {
    type: 'comparison',
    data: { operand: { value: '>=' } },
    restrict: restrictComparison,
    revert: revertComparison
  },
  lt: {
    type: 'comparison',
    data: { operand: { value: '<' } },
    restrict: restrictComparison,
    revert: revertComparison
  },
  le: {
    type: 'comparison',
    data: { operand: { value: '<=' } },
    restrict: restrictComparison,
    revert: revertComparison
  },
  ne: {
    type: 'comparison',
    data: { operand: { value: '!=' } },
    restrict: restrictComparison,
    revert: revertComparison
  },
  not: {
    type: 'unary',
    data: { operand: '!' },
    restrict: restrictUnary,
    revert: revertUnary
  },
  startsWith: {
    type: 'multiCallable',
    data: {
      target: { type: 'string' },
      selected: {
        value: 'startsWith'
      }
    },
    restrict: restrictStringFunction,
    revert: revertStringFunction
  },
  endsWith: {
    type: 'multiCallable',
    data: {
      target: { type: 'string' },
      selected: {
        value: 'endsWith'
      }
    },
    restrict: restrictStringFunction,
    revert: revertStringFunction
  },
  contains: {
    type: 'multiCallable',
    data: {
      target: { type: 'string' },
      selected: {
        value: 'includes'
      }
    },
    restrict: restrictStringFunction,
    revert: revertStringFunction
  }
}

function restrictComparison(data: ComparisonData): ComparisonData {
  data.left.label = 'Property Name'
  data.right.label = 'Value'
  return data
}

function revertComparison(data: ComparisonData): ComparisonData {
  data.left.label = 'Value'
  data.right.label = 'Value'
  return data
}

function restrictUnary(data: UnaryData): UnaryData {
  data.value.label = 'Property Name'
  return data
}

function revertUnary(data: UnaryData): UnaryData {
  data.value.label = 'Value'
  return data
}

function restrictStringFunction(data: MultiCallableData): MultiCallableData {
  const newData = useCloneDeep(data)
  newData.functions = newData.functions.filter(func => ['startsWith', 'endsWith', 'includes'].includes(func.value))
  newData.functions.forEach((func) => {
    func.params = func.params!.slice(0, -1)
  })
  newData.target.label = 'Property Name'
  return newData
}

function revertStringFunction(data: MultiCallableData): MultiCallableData {
  const newData = useCloneDeep(data)
  newData.functions = stringFunctions
  return newData
}

export interface FilterData {
    filters: Property[]
}

export class CreateFilter extends ExpressionBlock<FilterData> {
  color: string = 'bg-teal-500'
  render(data: FilterData): BlockPiece<FilterData>[] {
    return ['Create a Filter where:', ...data.filters.map((filter, index): Property => {
      return {
        ...filter,
        onAttachedBlockChange: (prop, self, removed) => {
          removed.data = this.revertBlock(removed)
          const filters = [...self.data.filters]
          filters.splice(index, 1)
          return withData(self, {
            filters
          })
        }
      }
    }), <Property>{
      type: 'void',
      label: 'Add filter...',
      canAttachBlock: (property, block) => {
        if (this.getFilterType(block)) { return }
        return 'This block cannot be used as a Filter'
      },
      onAttachedBlockChange: (property, self) => {
        if (property.value) {
          return withData(self, {
            filters: [...self.data.filters, <Property>{
              label: 'Filter',
              value: this.restrictBlock(property.value),
              type: 'void'
            }]
          })
        } else {
          return self
        }
      }
    }]
  }

  compile(ctx: Compiler, data: FilterData): void {
  }

  getResultType(data: FilterData): ExpressionType {
    return 'any'
  }

  private isFilterTypeAccepts(filterType: FilterType, block: Block) {
    if (filterType.type !== block.type) { return false }
    return isPartialMatch(block.data, filterType.data)
  }

  private getFilterType(block: Block): FilterType | undefined {
    for (const filterType of Object.values(filterTypes)) {
      if (this.isFilterTypeAccepts(filterType, block)) {
        return filterType
      }
    }
  }

  private restrictBlock(value: Block) {
    const filter = this.getFilterType(value)!
    return filter.restrict ? withData(value, filter.restrict(value.data)) : value
  }

  private revertBlock(value: Block) {
    const filter = this.getFilterType(value)!
    return filter.revert ? filter.revert(value.data) : value.data
  }
}

export class SetFilter extends FieldSetterBlock {
  render(data: FieldSetterData): BlockPiece<FieldSetterData>[] {
    data.value.canAttachBlock = this.isFilterBlock
    return ['Set', data.label, 'of', data.target, 'to', data.value]
  }

  private isFilterBlock(property: Property, block: Block) {
    if (block.type === 'createFilter') {
      return
    }
    if (block.type === 'logicGate') {
      return
    }
    return 'This block cannot be used as a Filter'
  }
}

export function data(): Block[] {
  return [
    {
      type: 'createFilter',
      data: {
        filters: []
      }
    },
    {
      type: 'setFilter',
      data: {
        target: createProp('Dataset', 'element'),
        key: 'setFilter',
        label: 'Filter',
        value: createProp('Filter', 'any')
      }
    }
  ]
}
