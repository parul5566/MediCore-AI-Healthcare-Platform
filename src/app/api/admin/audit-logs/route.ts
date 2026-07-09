import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json(logs)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
