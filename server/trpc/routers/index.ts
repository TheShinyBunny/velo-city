import {router} from '../trpc'
import {projectRouter} from '~/server/trpc/routers/projects'
import {usersRouter} from '~/server/trpc/routers/users'

export const appRouter = router({
    projects: projectRouter,
    users: usersRouter
})

// export type definition of API
export type AppRouter = typeof appRouter
