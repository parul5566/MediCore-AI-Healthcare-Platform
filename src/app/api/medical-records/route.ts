import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope') || 'self'

    const where: { patientId?: string } = {}
    if (session.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId: session.userId } })
      if (!patient) return NextResponse.json([])
      where.patientId = patient.id
    } else if (session.role === 'DOCTOR') {
      const { patientId } = Object.fromEntries(searchParams)
      if (patientId) {
        // Verify doctor has an appointment relationship with this patient
        const doctor = await prisma.doctor.findUnique({ where: { userId: session.userId } })
        if (doctor) {
          const hasRelationship = await prisma.appointment.findFirst({
            where: { doctorId: doctor.id, patientId },
          })
          if (hasRelationship) {
            where.patientId = patientId
          } else {
            return NextResponse.json({ error: 'No patient relationship found' }, { status: 403 })
          }
        }
      } else {
        return NextResponse.json({ error: 'patientId required' }, { status: 400 })
      }
    } else if (session.role === 'ADMIN') {
      const { patientId } = Object.fromEntries(searchParams)
      if (patientId) where.patientId = patientId
    }

    const records = await prisma.medicalRecord.findMany({
      where,
      include: { doctor: { include: { user: true } } },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(records)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 })
  }
}
