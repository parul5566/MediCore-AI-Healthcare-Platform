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

    const where: any = {}
    if (session.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId: session.userId } })
      if (!patient) return NextResponse.json([])
      where.patientId = patient.id
    } else if (session.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: session.userId } })
      if (!doctor) return NextResponse.json([])
      const patientAppts = await prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        select: { patientId: true },
        distinct: ['patientId'],
      })
      where.patientId = { in: patientAppts.map(p => p.patientId) }
    }

    const reports = await prisma.labReport.findMany({
      where,
      include: {
        doctor: { include: { user: true } },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(reports)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch lab reports' }, { status: 500 })
  }
}
