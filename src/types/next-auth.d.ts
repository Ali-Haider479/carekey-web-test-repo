import 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    id?: string
    userName?: string
    emailAddress?: string
    tenant?: string
    caregiver?: any
    userRoles?: any[]
    profileImageUrl: any
    backendAccessToken?: any
    backendAccessExpiresIn?: number
  }
  interface Session {
    user: {
      id?: string
      userName?: string
      emailAddress?: string
      tenant?: string
      caregiver?: any
      userRoles?: any[]
      profileImageUrl: any
      backendAccessToken?: any
      backendAccessExpiresIn?: number
    } & DefaultSession['user']
  }
}
