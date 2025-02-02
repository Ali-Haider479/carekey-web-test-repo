import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import { JWT } from 'next-auth/jwt'
import axios from 'axios'

const MAX_AGE = 1 * 24 * 60 * 60

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      id: 'credentials',
      credentials: {},
      async authorize(credentials, req) {
        console.log('Cred', credentials)
        // if (credentials == null) return null;
        const { email, password } = credentials as {
          email: string
          password: string
        }

        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            JSON.stringify({ email, password }),
            {
              headers: { 'Content-Type': 'application/json' }
            }
          )
          console.log(response.data)
          const data = response.data
          console.log('DATA', data)

          if (data) {
            let user = response?.data?.user
            const backendToken = response?.data?.backendTokens
            console.log('backendToken', backendToken)
            user = { ...user, ...backendToken }
            console.log('User', user)
            return user
          } else {
            console.log('User not found')
            return null
            // throw new Error("User not found");
          }
        } catch (err: any) {
          throw new Error(err)
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: MAX_AGE
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id
        token.userName = user.userName
        token.emailAddress = user.emailAddress
        token.tenant = user.tenant
        token.caregiver = user.caregiver
        token.userRoles = user.userRoles
        token.backendAccessToken = user.accessToken
        token.backendAccessExpiresIn = user.expiresIn
      }
      return token
    },
    async session({ session, token }: { session: any; token: JWT }) {
      session.user.id = token.id
      session.user.userName = token.userName
      session.user.emailAddress = token.emailAddress
      session.user.tenant = token.tenant
      session.user.caregiver = token.caregiver
      session.user.userRoles = token.userRoles
      session.user.backendAccessToken = token.backendAccessToken
      session.user.backendAccessExpiresIn = token.backendAccessExpiresIn
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET
}
