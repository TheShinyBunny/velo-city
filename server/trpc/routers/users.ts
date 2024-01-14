import * as crypto from 'crypto'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { createTransport } from 'nodemailer'
import { TRPCError } from '@trpc/server'
import { $Enums, User } from '@prisma/client'
import { publicProcedure, router } from '~/server/trpc/trpc'
import { Context } from '~/server/trpc/context'
import { hashToken } from '~/server/utils/auth'

const ONE_DAY_IN_SECONDS = 86400

export const usersRouter = router({
  register: publicProcedure.input(z.object({
    name: z.string().min(4).max(24),
    email: z.string().email(),
    password: z.string()
  })).mutation(async ({ input, ctx }) => {
    const existing = await ctx.prisma.user.findUnique({
      where: {
        email: input.email
      }
    })

    if (existing) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'User with that Email already exists!' })
    }

    const hashedPassword = await bcrypt.hash(input.password, 10)

    const user = await ctx.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        emailVerified: null
      }
    })

    await ctx.prisma.account.create({
      data: {
        providerAccountId: user.id,
        type: 'credentials',
        provider: 'credentials',
        userId: user.id
      }
    })

    const token = crypto.randomBytes(32).toString('hex')
    const hashedTokenNext = hashToken(token)

    await ctx.prisma.verificationToken.upsert({
      where: {
        identifier: input.email,
        type: 'REGISTER'
      },
      create: {
        token: hashedTokenNext,
        identifier: input.email,
        type: 'REGISTER',
        expires: new Date(Date.now() + (ONE_DAY_IN_SECONDS * 1000))
      },
      update: {
        expires: new Date(Date.now() + (ONE_DAY_IN_SECONDS * 1000)),
        token: hashedTokenNext
      }
    })

    await sendVerificationEmail(input.email, 'Confirm Registration to VeloCity', 'Confirm Registration',
      `${process.env.AUTH_ORIGIN}/confirm?${new URLSearchParams({
      token
    })}`)
  }),

  checkToken: publicProcedure.input(z.object({ token: z.string(), type: z.nativeEnum($Enums.TokenType) })).mutation(async ({ input, ctx }) => {
    const token = hashToken(input.token)
    return checkToken(token, ctx)
  }),

  confirmToken: publicProcedure.input(z.object({ token: z.string(), type: z.nativeEnum($Enums.TokenType), newPassword: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const token = hashToken(input.token)
      const user = await checkToken(token, ctx)

      switch (input.type) {
        case $Enums.TokenType.REGISTER: {
          await ctx.prisma.user.update({
            where: { id: user.id },
            data: {
              emailVerified: new Date()
            }
          })
          break
        }
        case $Enums.TokenType.PASSWORD_RESET: {
          const hashedPassword = await bcrypt.hash(input.newPassword!, 10)

          await ctx.prisma.user.update({
            where: { id: user.id },
            data: {
              password: hashedPassword
            }
          })
          break
        }
      }

      await ctx.prisma.verificationToken.delete({
        where: {
          token
        }
      })
    }),

  requestResetPassword: publicProcedure.input(z.object({ email: z.string().email() })).mutation(async ({ input, ctx }) => {
    const user = await ctx.prisma.user.findUnique({ where: { email: input.email } })

    if (user && user.emailVerified) {
      const token = crypto.randomBytes(32).toString('hex')
      const hashedTokenNext = hashToken(token)

      await ctx.prisma.verificationToken.upsert({
        where: {
          identifier: input.email,
          type: 'PASSWORD_RESET'
        },
        create: {
          token: hashedTokenNext,
          identifier: input.email,
          type: 'PASSWORD_RESET',
          expires: new Date(Date.now() + (ONE_DAY_IN_SECONDS * 1000))
        },
        update: {
          expires: new Date(Date.now() + (ONE_DAY_IN_SECONDS * 1000)),
          token: hashedTokenNext
        }
      })

      await sendVerificationEmail(input.email, 'Reset your VeloCity Password', 'To Reset your Password, click the link below',
        `${process.env.AUTH_ORIGIN}/reset-password?${new URLSearchParams({
          token
        })}`)
    }
  })
})

async function checkToken(token: string, ctx: Context): Promise<User> {
  const existingToken = await ctx.prisma.verificationToken.findUnique({
    where: {
      token
    }
  })

  if (!existingToken) { throw new TRPCError({ message: 'Token does not exist!', code: 'BAD_REQUEST' }) }

  if (existingToken.expires < new Date()) {
    await ctx.prisma.verificationToken.delete({ where: { token } })
    throw new TRPCError({ message: 'This token has expired!', code: 'BAD_REQUEST' })
  }

  const existingUser = (await ctx.prisma.user.findUnique({ where: { email: existingToken.identifier }, select: { id: true, email: true, emailVerified: true, name: true } })) as User

  if (!existingUser) {
    await ctx.prisma.verificationToken.delete({ where: { token } })
    throw new TRPCError({ message: 'The user associated with this token no longer exists', code: 'BAD_REQUEST' })
  }

  return existingUser
}

async function sendVerificationEmail(email: string, title: string, subtitle: string, link: string) {
  const transport = createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD
    }
  })
  await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: title,
    html: `
        <h1>${subtitle}</h1>
        <a href="${link}" target="_blank">Click Here</a>
        `
  })
}
