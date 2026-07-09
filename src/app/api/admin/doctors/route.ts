import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const doctors = await prisma.doctor.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(doctors)
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
    const { doctorId, action } = body

    if (!doctorId || !action) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

    const verified = action === 'verify' ? true : false
    await prisma.doctor.update({ where: { id: doctorId }, data: { verified } })

    // Notify doctor
    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } })
    if (doctor) {
      await prisma.notification.create({
        data: {
          userId: doctor.userId,
          title: verified ? 'Profile Verified!' : 'Verification Removed',
          message: verified ? 'Your doctor profile has been verified by the admin. You are now visible to patients.' : 'Your verification status has been updated.',
          type: 'SYSTEM',
        },
      })
    }

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: action.toUpperCase(),
        entity: 'Doctor',
        entityId: doctorId,
        details: `Admin ${action}d doctor`,
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
