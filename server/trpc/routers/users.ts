import {publicProcedure, router} from '~/server/trpc/trpc'
import {z} from 'zod'
import bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import nodemailer from 'nodemailer'
import {TRPCError} from '@trpc/server'
import {createHash} from 'crypto'

const ONE_DAY_IN_SECONDS = 86400

export const usersRouter = router({
    register: publicProcedure.input(z.object({
        name: z.string().min(4).max(24),
        email: z.string().email(),
        password: z.string()
    })).mutation(async ({input, ctx}) => {
        const existing = await ctx.prisma.user.findUnique({
            where: {
                email: input.email
            }
        })

        if (existing) {
            throw new TRPCError({code: 'BAD_REQUEST', message: 'User with that Email already exists!'})
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
                identifier: input.email
            },
            create: {
                token: hashedTokenNext,
                identifier: input.email,
                expires: new Date(Date.now() + (ONE_DAY_IN_SECONDS * 1000))
            },
            update: {
                expires: new Date(Date.now() + (ONE_DAY_IN_SECONDS * 1000)),
                token: hashedTokenNext
            }
        })

        await sendVerificationEmail(input.email, `${process.env.AUTH_ORIGIN}/api/auth/callback/verify?${new URLSearchParams({
            email: input.email,
            token
        })}`)
    })
})

function hashToken(token: string) {
    return createHash("sha256")
            .update(`${token}${process.env.APP_SECRET}`)
            .digest("hex")
}

async function sendVerificationEmail(email: string, link: string) {
    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_FROM,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    await transport.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Confirm Registration to VeloCity',
        html: `
        <h1>Confirm Registration</h1>
        <a href="${link}" target="_blank">Click Here</a>
        `
    })
}
