import {type Block} from '~/utils/blocks'
import type {FunctionOption} from '~/utils/fields'


export const stringFunctions: FunctionOption[] = [
    {
        value: 'toLowerCase',
        label: 'Convert to lower case',
        type: 'string'
    },
    {
        value: 'toUpperCase',
        label: 'Convert to Upper Case',
        type: 'string'
    },
    {
        value: 'startsWith',
        label: 'Starts With',
        type: 'boolean',
        params: [
            {
                label: 'String to Match',
                type: 'string'
            },
            {
                label: 'Start Index',
                type: 'number',
                optional: true
            }
        ]
    },
    {
        value: 'endsWith',
        label: 'Ends With',
        type: 'boolean',
        params: [
            {
                label: 'String to Match',
                type: 'string'
            },
            {
                label: 'End Index',
                type: 'number',
                optional: true
            }
        ]
    },
    {
        value: 'includes',
        label: 'Contains',
        type: 'boolean',
        params: [
            {
                label: 'String to Match',
                type: 'string'
            },
            {
                label: 'Start Index',
                type: 'number',
                optional: true
            }
        ]
    }
]

export function strings(): Block[] {
    return [
        {
            type: 'multiCallable',
            data: {
                target: createProp('String', 'string'),
                functions: stringFunctions,
                selected: stringFunctions[0]
            }
        }
    ]
}
