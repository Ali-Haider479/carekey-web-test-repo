// types/next-auth.d.ts
import { DefaultSession, User as NextAuthUser } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface User extends NextAuthUser {
    id?: string // Use number since your backend returns id as a number
    userName?: string
    emailAddress?: string
    tenant?: any // Replace with specific type if known (e.g., Tenant interface)
    caregiver?: any // Replace with specific type if known
    userRoles?: any // Replace with specific type if known (e.g., Role interface)
    profileImageUrl?: string | null
    accessToken?: string // Add accessToken
    refreshToken?: string // Add refreshToken
    expiresIn?: number // Add expiresIn
    subscribedPlan?: string
  }

  interface Session {
    user: {
      id?: string
      userName?: string
      emailAddress?: string
      tenant?: any
      caregiver?: any
      userRoles?: any
      profileImageUrl?: string | null
      accessToken?: string
      refreshToken?: string // Add refreshToken
      expiresIn?: number
      subscribedPlan?: string
    } & DefaultSession['user']
    error?: string // For handling refresh token errors
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    userName?: string
    emailAddress?: string
    tenant?: any
    caregiver?: any
    userRoles?: any
    profileImageUrl?: string | null
    accessToken?: string
    refreshToken?: string
    expiresIn?: number
    error?: string // For handling refresh token errors
    subscribedPlan?: string
  }
}
