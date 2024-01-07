import type { Block } from "./blocks"
import {elements} from '~/utils/velo/elements'
import {inputs} from '~/utils/velo/inputs'
import {buttons} from '~/utils/velo/buttons'
import {crm} from '~/utils/velo/crm'

export interface BlockCategory {
    name: string
    blocks: Block[]
}

export function getCategories(): BlockCategory[] {
    return [
        {
            name: 'Control',
            blocks: control()
        },
        {
            name: 'Events',
            blocks: events()
        },
        {
            name: 'Logic',
            blocks: logic
        },
        {
            name: 'Elements',
            blocks: elements()
        },
        {
            name: 'Buttons',
            blocks: buttons()
        },
        {
            name: 'Inputs',
            blocks: inputs()
        },
        {
            name: 'CRM',
            blocks: crm()
        }
    ]
}
