import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ isLoggedIn: false })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { patient: true, doctor: true },
    })

    if (!user) {
      return NextResponse.json({ isLoggedIn: false })
    }

    return NextResponse.json({
      isLoggedIn: true,
      id: user.id,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar,
      patientId: user.patient?.id,
      doctorId: user.doctor?.id,
      doctorVerified: user.doctor?.verified,
    })
  } catch {
    return NextResponse.json({ isLoggedIn: false })
  }
}
