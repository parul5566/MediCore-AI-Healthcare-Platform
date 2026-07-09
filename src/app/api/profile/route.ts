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

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { patient: true, doctor: true },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, phone, avatar, patientData, doctorData } = body

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar }),
      },
    })

    if (patientData && user.role === 'PATIENT') {
      await prisma.patient.updateMany({
        where: { userId: session.userId },
        data: patientData,
      })
    }

    if (doctorData && user.role === 'DOCTOR') {
      await prisma.doctor.updateMany({
        where: { userId: session.userId },
        data: doctorData,
      })
    }

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'UPDATE',
        entity: 'User',
        entityId: session.userId,
        details: 'Profile updated',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
