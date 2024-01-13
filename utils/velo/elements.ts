import { type Block } from '~/utils/blocks'

export function elements(): Block[] {
  return [
    ...createToggleableAndGetterElementState('Expand', 'Collapse', 'Collapsed', 'Expanded'),
    ...createToggleableAndGetterElementState('Show', 'Hide', 'Hidden', 'Shown'),
    ...createReadWriteMultiElementFields([
      {
        label: 'Background Color',
        value: 'style.backgroundColor',
        type: 'color'
      },
      {
        label: 'Text Color',
        value: 'style.color',
        type: 'color'
      },
      {
        label: 'Border Width',
        value: 'style.borderWidth',
        type: { type: 'number', suffix: 'px' }
      },
      {
        label: 'Border Radius',
        value: 'style.borderRadius',
        type: { type: 'number', suffix: 'px' }
      },
      {
        label: 'Foreground Color',
        value: 'style.foregroundColor',
        type: 'color'
      }
    ]),
    ...createReadWriteElementField('label', 'Label', 'string')
  ]
}
