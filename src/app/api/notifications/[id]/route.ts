import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const notification = await prisma.notification.updateMany({
      where: { id, userId: session.userId },
      data: { read: true },
    })

    return NextResponse.json({ success: true, updated: notification.count })
  } catch {
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
