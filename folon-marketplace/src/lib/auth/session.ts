import { getIronSession, IronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { appConfig } from '@/lib/config'

export interface SessionData {
  adminId?: string
  adminEmail?: string
}

const sessionOptions = {
  password: appConfig.session.secret,
  cookieName: 'fm_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24, // 24h
  },
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

export async function requireAdmin(): Promise<{ adminId: string; adminEmail: string }> {
  const session = await getSession()
  if (!session.adminId || !session.adminEmail) {
    throw new Error('Unauthorized')
  }
  return { adminId: session.adminId, adminEmail: session.adminEmail }
}
