import { withAuth } from 'next-auth/middleware'

export default withAuth({
  // Matches the pages config in `[...nextauth]`
  pages: {
    signIn: '/en/auth/sign-in'
  },
  callbacks: {
    authorized: ({ req, token }) => {
      // Allow public routes to be accessed without authentication
      const pathname = req.nextUrl.pathname
      const publicPaths = ['/en/auth/sign-in', '/en/auth/forgot-password', '/en/auth/reset-password']

      // If it's a public auth page, allow access
      if (publicPaths.some(path => pathname.startsWith(path))) {
        return true
      }

      // For all other routes, require authentication
      return !!token
    }
  }
})

export const config = {
  matcher: ['/en/', '/en/:path*']
}
