import { withAuth } from 'next-auth/middleware'

export default withAuth({
  // Matches the pages config in `[...nextauth]`
  pages: {
    signIn: '/en/auth/sign-in'
  }
})

export const config = {
  matcher: ['/en/', '/en/:path*']
}
