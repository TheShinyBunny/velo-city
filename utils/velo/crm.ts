import {
    type Block,
    type BlockAction,
    type BlockEditor,
    type BlockPiece,
    ComputationBlock,
    type Property
} from '~/utils/blocks'
import type { Compiler } from '../compiler'
import type {ExpressionType} from '~/utils/types'

export function crm(): Block[] {
    return [
        {
            type: 'sendTriggeredEmail', data: {
                isMember: false,
                email: createProp('Email', {type: 'string'}),
                target: createProp('Contact ID', {type: 'string'}),
                variables: []
            }
        }
    ]
}

interface Variable {
    key: Property
    value: Property
}

interface TriggeredEmailData {
    isMember: boolean
    email: Property
    target: Property
    variables: Variable[]
}

export class SendTriggeredEmail extends ComputationBlock<TriggeredEmailData> {
    color: string = 'bg-yellow-500'
    render(data: TriggeredEmailData): BlockPiece<TriggeredEmailData>[] {
        return ['Send Email', data.email, 'to ' + (data.isMember ? 'member' : 'contact'), data.target,
            ...addIf(!!data.variables.length, '\n', 'With variables:', ...data.variables.flatMap((variable) => [
                '\n',
                variable.key,
                ':',
                variable.value
            ]))
        ]
    }
    compile(ctx: Compiler, data: TriggeredEmailData): void {
    }
    getResultType(data: TriggeredEmailData): ExpressionType {
        return {type: 'promise', of: 'void'}
    }

    getActions(data: TriggeredEmailData): BlockAction<TriggeredEmailData>[] {
        return [
            {
                label: 'Send to a ' + (data.isMember ? 'Contact' : 'Member'),
                run(ctx: BlockEditor, block: Block<TriggeredEmailData>): Block<TriggeredEmailData> {
                    return withData(block, {
                        isMember: !data.isMember,
                        target: {...data.target, label: (data.isMember ? 'Contact ID' : 'Member ID')}
                    })
                }
            },
            {
                label: 'Add Variable',
                run(ctx: BlockEditor, block: Block<TriggeredEmailData>): Block<TriggeredEmailData> {
                    return withData(block, {
                        variables: data.variables.concat({
                            key: createProp('Key', {type: 'string'}),
                            value: createProp('Value', {type: 'string'}),
                        })
                    })
                }
            },
            ...addIf<BlockAction<TriggeredEmailData>>(!!data.variables.length, {
                label: 'Remove Last Variable',
                run(ctx: BlockEditor, block: Block<TriggeredEmailData>): Block<TriggeredEmailData> {
                    return withData(block, {
                        variables: data.variables.slice(0, data.variables.length - 1)
                    })
                }
            })
        ]
    }
}
