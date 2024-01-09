import {StatementBlock, type Block, type BlockAction, type BlockGroup, type BlockPiece, type Property} from './blocks'
import { Compiler } from "./compiler";

export function control(): Block[] {
    return [
        {type: 'ifBlock', data: <IfBlockData>{cond: createProp('Condition', 'boolean'), then: {blocks: []}}}
    ]
}

interface IfBlockData {
    cond: Property
    then: BlockGroup
    else?: BlockGroup
}

export class IfBlock extends StatementBlock<IfBlockData> {
    color: string = 'bg-blue-400';
    render(data: IfBlockData): BlockPiece<IfBlockData>[] {
        return ['If', data.cond, data.then].concat(data.else ? ['Or Else', data.else] : [])
    }
    compile(ctx: Compiler, data: IfBlockData): void {
        ctx.write('if (')
        ctx.writeProperty(data.cond)
        ctx.write(') ')
        ctx.writeGroup(data.then)
        if (data.else) {
            ctx.write(' else ')
            ctx.writeGroup(data.else)
        }
    }

    getActions?(data: IfBlockData): BlockAction<IfBlockData>[] {
        return [
            {
                label: data.else ? 'Remove Else' : 'Add Else',
                run(ctx, block) {
                    return withData(block, {else: data.else ? undefined : {blocks: []}})
                },
            }
        ]
    }

}
