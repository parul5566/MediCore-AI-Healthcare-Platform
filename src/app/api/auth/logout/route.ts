import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const session = await getSession()

    if (session.userId) {
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'LOGOUT',
          entity: 'User',
          entityId: session.userId,
          details: 'User logged out',
        },
      })
    }

    session.destroy()
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
