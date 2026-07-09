import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check session via cookie existence (client-side checks handle auth)
  const sessionCookie = request.cookies.get('medicore_session')

  const publicPaths = ['/', '/login', '/register']
  const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/favicon')

  if (isPublicPath) {
    return NextResponse.next()
  }

  // For dashboard routes, check if logged in
  if (pathname.startsWith('/dashboard')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
