import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET appointments for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let appointments

    if (session.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId: session.userId } })
      if (!patient) return NextResponse.json([])

      appointments = await prisma.appointment.findMany({
        where: {
          patientId: patient.id,
          ...(status && status !== 'all' ? { status } : {}),
        },
        include: { doctor: { include: { user: true } } },
        orderBy: { date: 'desc' },
      })
    } else if (session.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: session.userId } })
      if (!doctor) return NextResponse.json([])

      appointments = await prisma.appointment.findMany({
        where: {
          doctorId: doctor.id,
          ...(status && status !== 'all' ? { status } : {}),
        },
        include: { patient: { include: { user: true } } },
        orderBy: { date: 'desc' },
      })
    } else if (session.role === 'ADMIN') {
      appointments = await prisma.appointment.findMany({
        where: status && status !== 'all' ? { status } : {},
        include: {
          patient: { include: { user: true } },
          doctor: { include: { user: true } },
        },
        orderBy: { date: 'desc' },
      })
    }

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Appointments GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

// POST - create new appointment (patient books)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { doctorId, date, time, type, reason, symptoms } = body

    if (!doctorId || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const patient = await prisma.patient.findUnique({ where: { userId: session.userId } })
    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId,
        date: new Date(date),
        time,
        type: type || 'IN_PERSON',
        reason: reason || null,
        symptoms: symptoms || null,
        status: 'PENDING',
      },
    })

    // Create notification for doctor
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: true },
    })
    if (doctor) {
      await prisma.notification.create({
        data: {
          userId: doctor.userId,
          title: 'New Appointment Request',
          message: `${session.name} has requested a consultation.`,
          type: 'APPOINTMENT',
        },
      })
    }

    // Create notification for patient
    await prisma.notification.create({
      data: {
        userId: session.userId,
        title: 'Appointment Booked',
        message: `Your appointment request has been submitted. You'll be notified once confirmed.`,
        type: 'APPOINTMENT',
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'CREATE',
        entity: 'Appointment',
        entityId: appointment.id,
        details: 'Patient booked appointment',
      },
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Appointment POST error:', error)
    return NextResponse.json({ error: 'Failed to book appointment' }, { status: 500 })
  }
}
