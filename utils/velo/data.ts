import {type Block, type BlockPiece, ExpressionBlock, type Property} from '~/utils/blocks'
import type { Compiler } from '../compiler'
import type {ExpressionType} from '~/utils/types'


export const filterTypes: Record<string, Block> = {
    eq: {
        type: 'comparison',
        data: {operand: {value: '=='}}
    },
    gt: {
        type: 'comparison',
        data: {operand: {value: '>'}}
    },
    ge: {
        type: 'comparison',
        data: {operand: {value: '>='}}
    },
    lt: {
        type: 'comparison',
        data: {operand: {value: '<'}}
    },
    le: {
        type: 'comparison',
        data: {operand: {value: '<='}}
    },
    ne: {
        type: 'comparison',
        data: {operand: {value: '!='}}
    },
    not: {
        type: 'unary',
        data: {operand: '!'}
    },
    startsWith: {
        type: 'multiCallable',
        data: {
            target: {type: 'string'},
            selected: {
                value: 'startsWith'
            }
        }
    },
    endsWith: {
        type: 'multiCallable',
        data: {
            target: {type: 'string'},
            selected: {
                value: 'endsWith'
            }
        }
    },
    contains: {
        type: 'multiCallable',
        data: {
            target: {type: 'string'},
            selected: {
                value: 'includes'
            }
        }
    }
}

export interface FilterData {
    filters: Property[]
}

export class CreateFilter extends ExpressionBlock<FilterData> {
    color: string = 'bg-teal-500'
    render(data: FilterData): BlockPiece<FilterData>[] {
        return ['Create a Filter with conditions:', ...data.filters, <Property>{type: 'any', label: 'Add filter...',
            onAttachedBlockChange: (property, self) => {
                if (property.value) {
                    return withData(self, {
                        filters: [...self.data.filters, <Property>{
                            label: 'Filter',
                            value: property.value,
                            type: 'any',
                            onAttachedBlockChange: (prop, me) => {
                                const filters = [...me.data.filters]
                                filters.splice(filters.indexOf(prop), 1)
                                return withData(me, {
                                    filters
                                })
                            }
                        }],
                        newFilter: {
                            ...property,
                            value: undefined
                        }
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

}


export function data(): Block[] {
    return [
        {
            type: 'createFilter',
            data: {
                filters: []
            }
        }
    ]
}


