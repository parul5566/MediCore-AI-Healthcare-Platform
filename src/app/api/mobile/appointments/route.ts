import { NextResponse } from 'next/server'
import { getUserFromToken, unauthorizedResponse } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/mobile/appointments — list appointments for current user
export async function GET(request: Request) {
  const user = await getUserFromToken(request.headers.get('authorization'))
  if (!user) return unauthorizedResponse()

  let appointments
  if (user.role === 'PATIENT' && user.patient) {
    appointments = await prisma.appointment.findMany({
      where: { patientId: user.patient.id },
      include: {
        doctor: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } } },
      },
      orderBy: { date: 'desc' },
    })
  } else if (user.role === 'DOCTOR' && user.doctor) {
    appointments = await prisma.appointment.findMany({
      where: { doctorId: user.doctor.id },
      include: {
        patient: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } } },
      },
      orderBy: { date: 'desc' },
    })
  } else {
    appointments = await prisma.appointment.findMany({
      include: {
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        patient: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { date: 'desc' },
    })
  }

  return NextResponse.json({
    success: true,
    appointments: appointments.map((a: any) => ({
      id: a.id,
      patientId: a.patientId,
      doctorId: a.doctorId,
      date: a.date,
      time: a.time,
      duration: a.duration,
      status: a.status,
      type: a.type,
      reason: a.reason,
      symptoms: a.symptoms,
      notes: a.notes,
      diagnosis: a.diagnosis,
      doctorName: a.doctor ? `Dr. ${a.doctor.user.firstName} ${a.doctor.user.lastName}` : null,
      doctorEmail: a.doctor?.user?.email || null,
      patientName: a.patient ? `${a.patient.user.firstName} ${a.patient.user.lastName}` : null,
    })),
  })
}

// POST /api/mobile/appointments — create appointment
export async function POST(request: Request) {
  const user = await getUserFromToken(request.headers.get('authorization'))
  if (!user) return unauthorizedResponse()

  const body = await request.json()
  const { doctorId, date, time, type, reason, symptoms } = body

  if (!doctorId || !date || !time) {
    return NextResponse.json({ success: false, message: 'doctorId, date, time required' }, { status: 400 })
  }

  if (user.role !== 'PATIENT' || !user.patient) {
    return NextResponse.json({ success: false, message: 'Only patients can book appointments' }, { status: 403 })
  }

  const appt = await prisma.appointment.create({
    data: {
      patientId: user.patient.id,
      doctorId,
      date: new Date(date),
      time,
      type: type || 'IN_PERSON',
      reason: reason || '',
      symptoms: symptoms || '',
      status: 'PENDING',
    },
  })

  return NextResponse.json({ success: true, appointment: appt })
}
