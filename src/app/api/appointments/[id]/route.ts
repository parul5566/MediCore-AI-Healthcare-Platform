import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status, notes, diagnosis } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get appointment with relations
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Permission check
    if (session.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: session.userId } })
      if (!doctor || doctor.id !== appointment.doctorId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } else if (session.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId: session.userId } })
      if (!patient || patient.id !== appointment.patientId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      // Patients can only cancel
      if (status !== 'CANCELLED') {
        return NextResponse.json({ error: 'Patients can only cancel appointments' }, { status: 403 })
      }
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        ...(notes !== undefined && { notes }),
        ...(diagnosis !== undefined && { diagnosis }),
      },
    })

    // Notifications
    const statusMessages: Record<string, { patient: string; doctor: string }> = {
      CONFIRMED: {
        patient: 'Your appointment has been confirmed.',
        doctor: 'Appointment confirmed.',
      },
      COMPLETED: {
        patient: 'Your appointment has been marked as completed.',
        doctor: 'Appointment completed.',
      },
      CANCELLED: {
        patient: 'Your appointment has been cancelled.',
        doctor: 'An appointment has been cancelled.',
      },
    }

    const msgs = statusMessages[status]
    if (msgs) {
      await prisma.notification.create({
        data: {
          userId: appointment.patient.userId,
          title: 'Appointment Update',
          message: msgs.patient,
          type: 'APPOINTMENT',
        },
      })
      await prisma.notification.create({
        data: {
          userId: appointment.doctor.userId,
          title: 'Appointment Update',
          message: msgs.doctor,
          type: 'APPOINTMENT',
        },
      })
    }

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'UPDATE',
        entity: 'Appointment',
        entityId: id,
        details: `Status changed to ${status}`,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Appointment PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
  }
}
