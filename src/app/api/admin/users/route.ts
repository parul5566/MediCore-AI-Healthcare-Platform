import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    const where: any = {}
    if (role && role !== 'all') where.role = role
    if (status && status !== 'all') where.status = status
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      include: { patient: true, doctor: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json(users)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, action } = body

    if (!userId || !action) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

    let newStatus = 'ACTIVE'
    if (action === 'suspend') newStatus = 'SUSPENDED'
    if (action === 'activate') newStatus = 'ACTIVE'

    await prisma.user.update({ where: { id: userId }, data: { status: newStatus } })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: action.toUpperCase(),
        entity: 'User',
        entityId: userId,
        details: `Admin ${action}ed user`,
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
