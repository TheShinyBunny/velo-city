import type { Block } from './blocks'
import { elements } from '~/utils/velo/elements'
import { inputs } from '~/utils/velo/inputs'
import { buttons } from '~/utils/velo/buttons'
import { crm } from '~/utils/velo/crm'
import { data } from '~/utils/velo/data'

export interface BlockCategory {
    label: string
    blocks: Block[]
}

export function getCategories(): BlockCategory[] {
  return [
    {
      label: 'Control',
      blocks: control()
    },
    {
      label: 'Events',
      blocks: events()
    },
    {
      label: 'Logic',
      blocks: logic
    },
    {
      label: 'String',
      blocks: strings()
    },
    {
      label: 'Elements',
      blocks: elements()
    },
    {
      label: 'Buttons',
      blocks: buttons()
    },
    {
      label: 'Inputs',
      blocks: inputs()
    },
    {
      label: 'CRM',
      blocks: crm()
    },
    {
      label: 'Data',
      blocks: data()
    }
  ]
}
