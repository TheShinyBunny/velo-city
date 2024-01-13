import { inferAsyncReturnType } from '@trpc/server'
import type { H3Event } from 'h3'
import {getServerSession} from '#auth'

export async function createContext (_event: H3Event) {
  return {prisma: _event.context.prisma, session: await getServerSession(_event), req: _event}
}

export type Context = inferAsyncReturnType<typeof createContext>
