import { type BlockPiece, ComputationBlock, ExpressionBlock } from '~/utils/blocks'
import { Compiler } from '~/utils/compiler'
import type { ExpressionType } from '~/utils/types'

interface LiteralData {
    type: ExpressionType
    value: string
}

export class LiteralValue extends ExpressionBlock<LiteralData> {
  color: string = 'bg-red-500'

  compile(ctx: Compiler, data: LiteralData): void {
    if (ctx.expectedType) {
      const key = getTypeKey(asSingleType(ctx.expectedType))
      if (key === 'number') {
        ctx.write(Number(data.value).toString())
      } else if (key === 'element') {
        ctx.write('"')
        if (!data.value.startsWith('#')) {
          ctx.write('#')
        }
        ctx.write(data.value + '"')
      } else {
        ctx.write('"' + data.value + '"')
      }
    } else {
      ctx.write('"' + data.value + '"')
    }
  }

  getResultType(data: LiteralData): ExpressionType {
    return data.type
  }

  render(data: LiteralData): BlockPiece<LiteralData>[] {
    return [data.value]
  }
}

export class ErrorBlock extends ComputationBlock<string> {
  color: string = 'bg-red-500'
  render(data: string): BlockPiece<any>[] {
    return [data]
  }

  compile(ctx: Compiler, data: string): void {
  }

  getResultType(data: any): ExpressionType {
    return 'any'
  }
}
