import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.username
          }
        })

        if (!user) {
          return null
        }

        if (user.password !== credentials.password) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin'
  },
  callbacks: {
    async jwt(token, user, account, profile, isNewUser) {
      return token
    }
  }
})