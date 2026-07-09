import { NextResponse } from 'next/server'
import { getUserFromToken, unauthorizedResponse } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/mobile/admin/users
export async function GET(request: Request) {
  const user = await getUserFromToken(request.headers.get('authorization'))
  if (!user) return unauthorizedResponse()

  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role')
  const search = searchParams.get('search')

  const where: any = {}
  if (role) where.role = role
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  const users = await prisma.user.findMany({
    where,
    select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true, status: true, createdAt: true,
      patient: { select: { id: true, gender: true, bloodGroup: true } },
      doctor: { select: { id: true, specialization: true, verified: true, rating: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ success: true, users })
}

// PATCH /api/mobile/admin/users — update user status
export async function PATCH(request: Request) {
  const user = await getUserFromToken(request.headers.get('authorization'))
  if (!user) return unauthorizedResponse()

  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 })
  }

  const body = await request.json()
  const { userId, status } = body

  if (!userId || !status) {
    return NextResponse.json({ success: false, message: 'userId, status required' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status },
  })

  await prisma.auditLog.create({
    data: { userId: user.id, action: 'STATUS_UPDATE', entity: 'User', entityId: userId, details: `Status changed to ${status}` },
  })

  return NextResponse.json({ success: true, user: updated })
}
