import { NextResponse } from 'next/server'
import { getUserFromToken, unauthorizedResponse } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/mobile/medical-records
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

  const records = await prisma.medicalRecord.findMany({
    where: { patientId },
    include: {
      doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json({
    success: true,
    records: records.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      type: r.type,
      severity: r.severity,
      date: r.date,
      doctorName: r.doctor ? `Dr. ${r.doctor.user.firstName} ${r.doctor.user.lastName}` : 'Unknown',
    })),
  })
}

// POST /api/mobile/medical-records — doctor creates a record
export async function POST(request: Request) {
  const user = await getUserFromToken(request.headers.get('authorization'))
  if (!user) return unauthorizedResponse()

  if (user.role !== 'DOCTOR' || !user.doctor) {
    return NextResponse.json({ success: false, message: 'Doctor access required' }, { status: 403 })
  }

  const body = await request.json()
  const { patientId, type, title, description, severity } = body

  if (!patientId || !type || !title) {
    return NextResponse.json({ success: false, message: 'patientId, type, title required' }, { status: 400 })
  }

  const record = await prisma.medicalRecord.create({
    data: {
      patientId,
      doctorId: user.doctor.id,
      type,
      title,
      description: description || '',
      severity: severity || null,
    },
  })

  return NextResponse.json({ success: true, record })
}
