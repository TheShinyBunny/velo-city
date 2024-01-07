// @ts-expect-error
import {NuxtAuthHandler} from '#auth'
import GoogleProvider from 'next-auth/providers/google'
import {PrismaAdapter} from '@next-auth/prisma-adapter'

export default NuxtAuthHandler({
  secret: process.env.APP_SECRET,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async session({ session, user }: any) {
      session.user.id = user.id
      return session
    },
  },
  providers: [
    // @ts-expect-error
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || ''
    })
  ],
  pages: {
    signIn: '/',
    signOut: '/error'
  }
})