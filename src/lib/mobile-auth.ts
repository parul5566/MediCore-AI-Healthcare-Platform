import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'medicore-ai-healthcare-secret-key-2026-secure-random-string-at-least-32-chars'
const TOKEN_EXPIRY = '7d'

export interface JwtPayload {
  userId: string
  role: string
  email: string
  name: string
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export async function getUserFromToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  const payload = verifyToken(token)
  if (!payload) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { patient: true, doctor: true },
  })
  return user
}

export function unauthorizedResponse() {
  return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 })
}
