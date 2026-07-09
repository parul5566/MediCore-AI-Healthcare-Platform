import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access only' }, { status: 403 })
    }

    const [
      totalUsers, totalPatients, totalDoctors, totalAppointments,
      pendingAppointments, completedAppointments, totalPrescriptions,
      totalLabReports, verifiedDoctors
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'PATIENT' } }),
      prisma.user.count({ where: { role: 'DOCTOR' } }),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'PENDING' } }),
      prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      prisma.prescription.count(),
      prisma.labReport.count(),
      prisma.doctor.count({ where: { verified: true } }),
    ])

    // Revenue = sum of consultation fees for completed appointments
    const completedAppts = await prisma.appointment.findMany({
      where: { status: 'COMPLETED' },
      include: { doctor: true },
    })
    const revenue = completedAppts.reduce((sum, a) => sum + (a.doctor.consultationFee || 0), 0)

    // Recent users
    const recentUsers = await prisma.user.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { patient: true, doctor: true },
    })

    // Unverified doctors
    const unverifiedDoctors = await prisma.doctor.findMany({
      where: { verified: false },
      include: { user: true },
    })

    // Appointments over last 7 days for chart
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000)
    const recentAppts = await prisma.appointment.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { status: true, createdAt: true },
    })

    const daysData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000)
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
      const count = recentAppts.filter(a => {
        const aDate = new Date(a.createdAt)
        return aDate.getDate() === date.getDate() && aDate.getMonth() === date.getMonth()
      }).length
      daysData.push({ day: dayName, appointments: count })
    }

    // Role distribution
    const roleDistribution = [
      { name: 'Patients', value: totalPatients, color: '#ec4899' },
      { name: 'Doctors', value: totalDoctors, color: '#3b82f6' },
      { name: 'Admins', value: totalUsers - totalPatients - totalDoctors, color: '#8b5cf6' },
    ]

    return NextResponse.json({
      stats: {
        totalUsers, totalPatients, totalDoctors, totalAppointments,
        pendingAppointments, completedAppointments, totalPrescriptions,
        totalLabReports, verifiedDoctors, unverifiedDoctors: unverifiedDoctors.length,
        revenue,
      },
      recentUsers,
      unverifiedDoctors,
      daysData,
      roleDistribution,
    })
  } catch (error) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
  }
}
