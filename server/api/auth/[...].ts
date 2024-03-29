import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { User } from '@prisma/client'
import bcrypt from 'bcrypt'
import { NuxtAuthHandler } from '#auth'

export default NuxtAuthHandler({
  secret: process.env.APP_SECRET,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    session({ session, token }) {
      session.user.id = token.userId as string
      return session
    },
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id
      }
      return token
    }
  },
  providers: [
    // @ts-expect-error
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || ''
    }),
    // @ts-expect-error
    CredentialsProvider.default({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      authorize: async (credentials: any) => {
        if (!credentials.email || !credentials.password) {
          throw new Error('Please enter an email and password')
        }

        const user: User = await prisma.user.findUnique({
          where: {
            email: credentials?.email
          }
        })

        if (!user || !user.password) {
          throw new Error('Invalid Email or Password')
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password)
        if (!passwordMatch) {
          throw new Error('Invalid Email or Password')
        }

        if (!user.emailVerified) {
          throw new Error('This account is not verified yet!')
        }

        return user
      }
    })
  ],
  pages: {
    signIn: '/',
    signOut: '/error'
  },
  debug: process.env.NODE_ENV === 'development'
})
