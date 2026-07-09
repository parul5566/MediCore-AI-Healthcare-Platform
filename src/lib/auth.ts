import { getIronSession, SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  userId?: string
  role?: string
  email?: string
  name?: string
  isLoggedIn: boolean
}

export const sessionOptions: SessionOptions = {
  password: process.env.NEXTAUTH_SECRET || 'medicore-ai-healthcare-secret-key-2026-secure-random-string-at-least-32-chars',
  cookieName: 'medicore_session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)
  return session
}

export async function requireAuth() {
  const session = await getSession()
  if (!session.isLoggedIn || !session.userId) {
    throw new Error('UNAUTHORIZED')
  }
  return session
}

export async function requireRole(roles: string | string[]) {
  const session = await requireAuth()
  const allowed = Array.isArray(roles) ? roles : [roles]
  if (!allowed.includes(session.role || '')) {
    throw new Error('FORBIDDEN')
  }
  return session
}
