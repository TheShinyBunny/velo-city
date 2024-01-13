import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { authProcedure, publicProcedure, router } from '~/server/trpc/trpc'

export const projectRouter = router({
  getProject: publicProcedure.input(z.string()).query(({ input: projectId, ctx }) => {
    return ctx.prisma.project.findUnique({
      where: {
        id: projectId
      }
    })
  }),

  create: authProcedure.input(z.object({
    name: z.string()
  })).mutation(({ input, ctx }) => {
    const project: Prisma.ProjectUncheckedCreateInput = {
      name: input.name,
      creatorId: ctx.session!.user.id
    }

    return ctx.prisma.project.create({
      data: project
    })
  }),

  delete: authProcedure.input(z.string()).mutation(({ input: projectId, ctx }) => {
    return ctx.prisma.project.delete({ where: { id: projectId } })
  }),

  rename: authProcedure.input(z.object({
    projectId: z.string(),
    name: z.string()
  })).mutation(({ input, ctx }) => {
    return prisma.project.update({
      where: { id: input.projectId },
      data: { name: input.name }
    })
  }),

  update: authProcedure.input(z.object({
    projectId: z.string(),
    structure: z.array(z.any())
  })).mutation(({ input, ctx }) => {
    return prisma.project.update({
      where: { id: input.projectId },
      data: {
        structure: [...input.structure]
      }
    })
  }),

  userProjects: authProcedure.query(({ ctx }) => {
    return prisma.project.findMany({
      where: {
        creatorId: ctx.session!.user.id
      },
      select: {
        createdAt: true,
        name: true,
        id: true
      }
    })
  })
})
