import { type Compiler } from '../compiler'
import {
  type Block,
  type BlockAction,
  type BlockEditor,
  type BlockPiece,
  ComputationBlock,
  type Property
} from '~/utils/blocks'
import type { ExpressionType } from '~/utils/types'

export function crm(): Block[] {
  return [
    {
      type: 'sendTriggeredEmail',
      data: {
        isMember: false,
        email: createProp('Email', 'string'),
        target: createProp('Contact ID', 'string'),
        variables: []
      }
    },
    {
      type: 'createContact',
      data: {
        firstName: createProp('First Name', 'string'),
        lastName: createProp('Last Name', 'string'),
        email: createProp('Email', 'string'),
        phone: createProp('Phone', 'string')
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
      ...addIf(!!data.variables.length, '\n', 'With variables:', ...data.variables.flatMap(variable => [
        '\n',
        variable.key,
        ':',
        variable.value
      ]))
    ]
  }

  compile(ctx: Compiler, data: TriggeredEmailData): void {
    ctx.addSpecificImport('triggeredEmails', 'wix-crm-frontend')
    ctx.write('triggeredEmails.' + (data.isMember ? 'emailMember' : 'emailContact') + '(')
    ctx.writeProperty(data.email)
    ctx.write(', ')
    ctx.writeProperty(data.target)
    if (data.variables.length) {
      ctx.writeLine(', {variables: {')
      ctx.indent(() => {
        let first = true
        for (const variable of data.variables) {
          if (!first) {
            ctx.writeLine(',')
          }
          if (variable.key.value?.type === 'literal') {
            ctx.writeProperty(variable.key)
          } else {
            ctx.write('[')
            ctx.writeProperty(variable.key)
            ctx.write(']')
          }
          ctx.write(': ')
          ctx.writeProperty(variable.value)
          first = false
        }
      })
      ctx.writeLine()
      ctx.write('}')
    }
    ctx.write(')')
  }

  getResultType(data: TriggeredEmailData): ExpressionType {
    return { type: 'promise', of: 'void' }
  }

  getActions(data: TriggeredEmailData): BlockAction<TriggeredEmailData>[] {
    return [
      {
        label: 'Send to a ' + (data.isMember ? 'Contact' : 'Member'),
        run(ctx: BlockEditor, block: Block<TriggeredEmailData>): Block<TriggeredEmailData> {
          return withData(block, {
            isMember: !data.isMember,
            target: { ...data.target, label: (data.isMember ? 'Contact ID' : 'Member ID') }
          })
        }
      },
      {
        label: 'Add Variable',
        run(ctx: BlockEditor, block: Block<TriggeredEmailData>): Block<TriggeredEmailData> {
          return withData(block, {
            variables: data.variables.concat({
              key: createProp('Key', 'string'),
              value: createProp('Value', 'string')
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

interface CreateContactData {
    firstName: Property
    lastName: Property
    email: Property
    phone: Property
}

export class CreateContact extends ComputationBlock<CreateContactData> {
  color: string = 'bg-yellow-600'

  compile(ctx: Compiler, data: CreateContactData): void {
    ctx.addSpecificImport('contacts', 'wix-crm-frontend')
    ctx.isAsync = true
    ctx.write('(await contacts.appendOrCreateContact(')
    ctx.writeJsonObject({
      name: {
        first: data.firstName,
        last: data.lastName
      },
      emails: [{ email: data.email }],
      phones: [{ phone: data.phone }]
    })
    ctx.write(')).contactId')
  }

  getResultType(data: CreateContactData): ExpressionType {
    return 'string'
  }

  render(data: CreateContactData): BlockPiece<CreateContactData>[] {
    return ['Create or Update Contact', '\n',
      'First Name:', data.firstName, '\n',
      'Last Name:', data.lastName, '\n',
      'Email:', data.email, '\n',
      'Phone:', data.phone
    ]
  }
}
