import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { Context } from '~/server/trpc/context'

const t = initTRPC.context<Context>().create({
  transformer: superjson
})

export const publicProcedure = t.procedure
export const authProcedure = publicProcedure.use((opts) => {
  if (!opts.ctx.session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return opts.next(opts)
})
export const router = t.router
export const middleware = t.middleware
