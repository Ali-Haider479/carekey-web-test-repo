import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import axios from 'axios'

const MAX_AGE = 1 * 24 * 60 * 60 // 1 day

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      id: 'credentials',
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string
          password: string
        }

        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            { email, password },
            {
              headers: { 'Content-Type': 'application/json' }
            }
          )

          const data = response.data
          if (data) {
            const user = data.user
            const backendTokens = data.backendTokens
            return {
              ...user,
              accessToken: backendTokens.accessToken,
              refreshToken: backendTokens.refreshToken,
              expiresIn: backendTokens.expiresIn
            }
          }
          return null
        } catch (err: any) {
          throw new Error(err.response?.data?.message || 'Authentication failed')
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: MAX_AGE
  },
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        // Initial sign-in
        token.id = user.id
        token.userName = user.userName
        token.emailAddress = user.emailAddress
        token.tenant = user.tenant
        token.caregiver = user.caregiver // Optional caregiver data
        token.userRoles = user.userRoles
        token.profileImageUrl = user.profileImageUrl
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.expiresIn = user.expiresIn
        token.subscribedPlan = user.subscribedPlan
      }

      if (trigger == 'update') {
        if (session?.user.subscribedPlan) {
          console.log("Here's the session subscribed plan:", session.user.subscribedPlan)
          token.subscribedPlan = session.user.subscribedPlan // Trust but verify via backend fetch (done client-side)
        } else {
          token.accessToken = session.user.accessToken
          token.refreshToken = session.user.refreshToken
          token.expiresIn = session.expiresIn
          token.subscribedPlan = null
        }
      }

      // Check if access token is expired
      if (token.expiresIn && Date.now() > token.expiresIn) {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refreshToken: token.refreshToken },
            {
              headers: { 'Content-Type': 'application/json' }
            }
          )

          const { accessToken, refreshToken, expiresIn } = response.data
          token.accessToken = accessToken
          token.refreshToken = refreshToken // Update refresh token (rotation)
          token.expiresIn = expiresIn
        } catch (err) {
          console.error('Token refresh failed:', err)
          return { ...token, error: 'RefreshTokenError' }
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token.error === 'RefreshTokenError') {
        session.error = 'RefreshTokenError'
        return session
      }

      session.user.id = token.id
      session.user.userName = token.userName
      session.user.emailAddress = token.emailAddress
      session.user.tenant = token.tenant
      session.user.caregiver = token.caregiver // Optional caregiver data
      session.user.userRoles = token.userRoles
      session.user.profileImageUrl = token.profileImageUrl
      session.user.accessToken = token.accessToken
      session.user.expiresIn = token.expiresIn
      session.user.refreshToken = token.refreshToken
      session.user.subscribedPlan = token.subscribedPlan
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true
}
