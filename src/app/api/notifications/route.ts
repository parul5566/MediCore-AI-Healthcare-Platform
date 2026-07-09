import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json(notifications)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}
