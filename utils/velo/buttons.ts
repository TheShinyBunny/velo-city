import type {Block} from '~/utils/blocks'

export function buttons(): Block[] {
    return [
        ...createReadWriteElementField('icon', 'Icon of Button', 'image'),
        ...createReadWriteElementField('link', 'Button Link', 'link'),
        ...createToggleableAndGetterElementState('Expand Icon', 'Collapse Icon', 'Icon Collapsed', 'Icon Expanded'),
    ]
}
