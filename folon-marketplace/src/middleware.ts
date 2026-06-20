import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import type { SessionData } from '@/lib/auth/session'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const res = NextResponse.next()
    const session = await getIronSession<SessionData>(req, res, {
      password: process.env.SESSION_SECRET ?? 'fallback-dev-secret-at-least-32-chars!!',
      cookieName: 'fm_session',
    })

    if (!session.adminId) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
