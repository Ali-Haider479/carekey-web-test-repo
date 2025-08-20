import { withAuth } from 'next-auth/middleware'
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/en/auth/sign-in', '/en/auth/forgot-password', '/en/auth/reset-password']

const protectedPaths = [
  'apps/dashboard',
  'apps/rcm',
  'apps/billing',
  'apps/caregiver/list',
  'apps/client/list',
  'apps/accounts/tenant-list',
  'apps/schedules/calendar-view',
  'apps/evv-tracking',
  'apps/timesheets',
  'apps/chat',
  'apps/reports',
  'apps/advance'
]

export default withAuth(
  async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname.replace(/\/$/, '')

    // Allow public routes
    if (publicPaths.some(path => pathname.startsWith(path))) {
      console.log('Public path matched:', pathname)
      return NextResponse.next()
    }

    // Get token from the request
    const token = await getToken({ req })

    // Deny and redirect if no token
    if (!token) {
      return NextResponse.redirect(new URL('/en/auth/sign-in', req.nextUrl.origin))
    }

    // Check permissions
    const matchedRoute = token.userRoles?.rolePermissions?.find((item: any) => {
      const permissionName = item.permission.name?.toLowerCase()
      if (permissionName && permissionName.endsWith('s')) {
        return pathname.includes(permissionName.slice(0, -1))
      }
      return pathname.includes(permissionName)
    })

    let userPath = token.userRoles?.rolePermissions[0]?.permission?.name?.toLowerCase()
    if (userPath && userPath.endsWith('s')) {
      userPath = userPath.slice(0, -1)
    }

    const userRedirectPath = protectedPaths.find(item => item.includes(userPath))

    if (!matchedRoute) {
      console.log('Access denied: No matching permission for', pathname)
      const redirectPath =
        token.userRoles.title === 'Caregiver' ? `apps/caregiver/${token.caregiver.id}/detail` : userRedirectPath || '/'
      return NextResponse.redirect(new URL(redirectPath, req.nextUrl.origin))
    }

    return NextResponse.next()
  },
  {
    pages: {
      signIn: '/en/auth/sign-in'
    }
  }
)

export const config = {
  matcher: ['/en/:path*']
}
