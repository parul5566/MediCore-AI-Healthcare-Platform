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

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.userId },
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const [appointments, patients, prescriptions] = await Promise.all([
      prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        include: { patient: { include: { user: true } } },
        orderBy: { date: 'desc' },
        take: 20,
      }),
      prisma.patient.findMany({
        where: { appointments: { some: { doctorId: doctor.id } } },
        include: { user: true },
        take: 20,
      }),
      prisma.prescription.findMany({
        where: { doctorId: doctor.id },
        include: { patient: { include: { user: true } } },
        orderBy: { date: 'desc' },
        take: 5,
      }),
    ])

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayAppointments = appointments.filter(a => {
      const aptDate = new Date(a.date)
      aptDate.setHours(0, 0, 0, 0)
      return aptDate.getTime() === today.getTime() && a.status !== 'CANCELLED'
    })

    const upcomingAppointments = appointments.filter(a =>
      new Date(a.date) > new Date() && a.status !== 'CANCELLED' && a.status !== 'COMPLETED'
    )

    const completedAppointments = appointments.filter(a => a.status === 'COMPLETED')

    return NextResponse.json({
      doctor,
      todayAppointments,
      upcomingAppointments,
      completedAppointments,
      patients,
      prescriptions,
      stats: {
        today: todayAppointments.length,
        upcoming: upcomingAppointments.length,
        totalPatients: patients.length,
        completed: completedAppointments.length,
      },
    })
  } catch (error) {
    console.error('Doctor dashboard error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
  }
}
