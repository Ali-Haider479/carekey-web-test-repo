import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  eslint: {
    ignoreDuringBuilds: true
  },
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/en/apps/dashboard',
        permanent: true,
        locale: false
      },
      {
        source: '/:lang(en|fr|ar)',
        destination: '/:lang/apps/dashboard',
        permanent: true,
        locale: false
      },
      {
        source: '/((?!(?:en|fr|ar|front-pages|favicon.ico)\\b)):path',
        destination: '/en/:path',
        permanent: true,
        locale: false
      }
    ]
  }
}

export default nextConfig
