import { Compiler } from "./compiler";
import type {Block, BlockAction, BlockPiece, BlockType, Property} from '~/utils/blocks'

export abstract class EventBlockType<T> implements BlockType<T> {
    color: string = 'bg-orange-400'
    abstract render(data: T): BlockPiece<T>[]
    abstract compile(ctx: Compiler, data: T): void
}

export class OnReady extends EventBlockType<any> {
    render(data: any): BlockPiece<any>[] {
        return ['When the page is loaded']
    }
    compile(ctx: Compiler, data: any): void {
        ctx.writeAll(ctx.eventContent)
        ctx.flushToOnReady()
    }

}

export interface EventData {
    key: string
    label: string
    element: Property
    oppositeKey?: string
    oppositeLabel?: string
}

export class ElementEvent extends EventBlockType<EventData> {
    render(data: EventData): BlockPiece<EventData>[] {
        return ['When', data.element, 'was', data.label]
    }
    compile(ctx: Compiler, data: EventData) {
        ctx.writeProperty(data.element)
        ctx.writeLine('.' + data.key + '(' + (ctx.isAsync ? 'async ' : '') + '() => ' + '{')
        ctx.indent(() => {
            ctx.writeAll(ctx.eventContent)
        })
        ctx.writeLine()
        ctx.write('}')
        ctx.flushToOnReady()
    }

    getActions(data: EventData): BlockAction<EventData>[] {
        return [
            ...addIf<BlockAction<EventData>>(!!data.oppositeKey, {
                label: 'Change to ' + data.oppositeLabel,
                run: (ctx, block) => {
                    return withData(block, {
                        key: data.oppositeLabel!.toLowerCase(),
                        label: data.oppositeLabel,
                        oppositeLabel: block.data!.label,
                        oppositeKey: block.data!.key
                    })
                }
            })
        ]
    }
}

export function events(): Block[] {
    return [
        {type: 'onReady'},
        {type: 'elementEvent', data: {key: 'onClick', label: 'Clicked', element: createElementProp()}},
        {type: 'elementEvent', data: {key: 'onFocus', label: 'Focused', element: createElementProp(), oppositeKey: 'onBlur', oppositeLabel: 'Unfocused'}},
    ]
}
