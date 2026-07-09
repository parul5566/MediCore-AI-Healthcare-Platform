import { NextResponse } from 'next/server'
import { getUserFromToken, unauthorizedResponse } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/mobile/prescriptions
export async function GET(request: Request) {
  const user = await getUserFromToken(request.headers.get('authorization'))
  if (!user) return unauthorizedResponse()

  let patientId = user.patient?.id
  const { searchParams } = new URL(request.url)
  const queryPatientId = searchParams.get('patientId')

  if (user.role === 'DOCTOR' && queryPatientId) {
    patientId = queryPatientId
  }

  if (!patientId) {
    return NextResponse.json({ success: false, message: 'Patient profile required' }, { status: 400 })
  }

  const prescriptions = await prisma.prescription.findMany({
    where: { patientId },
    include: { doctor: { include: { user: { select: { firstName: true, lastName: true } } } } },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json({
    success: true,
    prescriptions: prescriptions.map((p: any) => ({
      id: p.id,
      medications: p.medications,
      notes: p.notes,
      status: p.status,
      date: p.date,
      doctorName: p.doctor ? `Dr. ${p.doctor.user.firstName} ${p.doctor.user.lastName}` : 'Unknown',
    })),
  })
}

// POST /api/mobile/prescriptions — doctor creates a prescription
export async function POST(request: Request) {
  const user = await getUserFromToken(request.headers.get('authorization'))
  if (!user) return unauthorizedResponse()

  if (user.role !== 'DOCTOR' || !user.doctor) {
    return NextResponse.json({ success: false, message: 'Doctor access required' }, { status: 403 })
  }

  const body = await request.json()
  const { patientId, medications, notes } = body

  if (!patientId || !medications) {
    return NextResponse.json({ success: false, message: 'patientId, medications required' }, { status: 400 })
  }

  const prescription = await prisma.prescription.create({
    data: {
      patientId,
      doctorId: user.doctor.id,
      medications,
      notes: notes || '',
      status: 'ACTIVE',
    },
  })

  return NextResponse.json({ success: true, prescription })
}
