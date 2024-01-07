import {type Block} from '~/utils/blocks'


export function inputs(): Block[] {
    return [
        ...createReadWriteElementField('value', 'Value', {type: 'string'}),
        ...createReadWriteElementField('placeholder', 'Placeholder', {type: 'string'}),
        ...createReadWriteElementField('required', 'Required', 'boolean'),
        ...createToggleableAndGetterElementState('Enable', 'Disable', 'Enabled', 'Disabled'),
        createBoolElementProp('valid', 'Valid', 'Invalid'),
        ...createReadWriteElementField('inputType', 'Input Type', {type: 'enum', options: [
            {label: 'Text', value: 'text'},
            {label: 'Password', value: 'password'},
            {label: 'Number', value: 'number'},
            {label: 'Email', value: 'email'},
            {label: 'URL', value: 'url'},
            {label: 'Phone Number', value: 'tel'},
        ]}),
        createToggleableElementState('Focus', 'Unfocus'),
    ]
}
