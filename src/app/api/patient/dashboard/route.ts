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

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    const [appointments, prescriptions, labReports, records, metrics] = await Promise.all([
      prisma.appointment.findMany({
        where: { patientId: patient.id },
        include: {
          doctor: { include: { user: true } },
        },
        orderBy: { date: 'desc' },
        take: 10,
      }),
      prisma.prescription.findMany({
        where: { patientId: patient.id },
        include: { doctor: { include: { user: true } } },
        orderBy: { date: 'desc' },
        take: 5,
      }),
      prisma.labReport.findMany({
        where: { patientId: patient.id },
        orderBy: { date: 'desc' },
        take: 5,
      }),
      prisma.medicalRecord.findMany({
        where: { patientId: patient.id },
        orderBy: { date: 'desc' },
        take: 10,
      }),
      prisma.healthMetric.findMany({
        where: { userId: session.userId },
        orderBy: { date: 'desc' },
        take: 7,
      }),
    ])

    const upcomingAppointments = appointments.filter(a =>
      new Date(a.date) >= new Date() && a.status !== 'CANCELLED' && a.status !== 'COMPLETED'
    )
    const pastAppointments = appointments.filter(a =>
      new Date(a.date) < new Date() || a.status === 'COMPLETED'
    )

    return NextResponse.json({
      patient,
      upcomingAppointments,
      pastAppointments,
      prescriptions,
      labReports,
      records,
      metrics,
      stats: {
        totalAppointments: appointments.length,
        upcoming: upcomingAppointments.length,
        activePrescriptions: prescriptions.filter(p => p.status === 'ACTIVE').length,
        totalLabReports: labReports.length,
      },
    })
  } catch (error) {
    console.error('Patient dashboard error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 })
  }
}
