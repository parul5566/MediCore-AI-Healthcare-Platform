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

    const where: { patientId?: string; doctorId?: string } = {}
    if (session.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId: session.userId } })
      if (!patient) return NextResponse.json([])
      where.patientId = patient.id
    } else if (session.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: session.userId } })
      if (!doctor) return NextResponse.json([])
      where.doctorId = doctor.id
    }

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(prescriptions)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 })
  }
}
