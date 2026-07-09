import { NextResponse } from 'next/server'
import { getUserFromToken, unauthorizedResponse } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/mobile/dashboard — role-based dashboard data
export async function GET(request: Request) {
  const user = await getUserFromToken(request.headers.get('authorization'))
  if (!user) return unauthorizedResponse()

  const role = user.role

  if (role === 'PATIENT' && user.patient) {
    const [upcomingAppointments, totalDoctors, totalRecords, activePrescriptions] = await Promise.all([
      prisma.appointment.count({ where: { patientId: user.patient.id, status: { in: ['PENDING', 'CONFIRMED'] } } }),
      prisma.doctor.count(),
      prisma.medicalRecord.count({ where: { patientId: user.patient.id } }),
      prisma.prescription.count({ where: { patientId: user.patient.id, status: 'ACTIVE' } }),
    ])

    const recentMetrics = await prisma.healthMetric.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 10,
    })

    const upcomingAppts = await prisma.appointment.findMany({
      where: { patientId: user.patient.id, status: { in: ['PENDING', 'CONFIRMED'] } },
      include: { doctor: { include: { user: { select: { firstName: true, lastName: true } } } } },
      orderBy: { date: 'asc' },
      take: 5,
    })

    return NextResponse.json({
      success: true,
      stats: { upcomingAppointments, totalDoctors, totalRecords, activePrescriptions },
      recentMetrics: recentMetrics.map((m: any) => ({
        id: m.id, type: m.type, value: m.value, secondaryValue: m.secondaryValue, unit: m.unit, date: m.date,
      })),
      upcomingAppointments: upcomingAppts.map((a: any) => ({
        id: a.id, date: a.date, time: a.time, type: a.type, status: a.status,
        doctorName: `Dr. ${a.doctor.user.firstName} ${a.doctor.user.lastName}`,
      })),
    })
  }

  if (role === 'DOCTOR' && user.doctor) {
    const [pendingRequests, confirmedAppts, uniquePatients] = await Promise.all([
      prisma.appointment.count({ where: { doctorId: user.doctor.id, status: 'PENDING' } }),
      prisma.appointment.count({ where: { doctorId: user.doctor.id, status: 'CONFIRMED' } }),
      prisma.appointment.findMany({ where: { doctorId: user.doctor.id }, select: { patientId: true }, distinct: ['patientId'] }),
    ])

    const upcomingAppts = await prisma.appointment.findMany({
      where: { doctorId: user.doctor.id, status: { in: ['PENDING', 'CONFIRMED'] } },
      include: { patient: { include: { user: { select: { firstName: true, lastName: true } } } } },
      orderBy: { date: 'asc' },
      take: 5,
    })

    return NextResponse.json({
      success: true,
      stats: { todayAppointments: confirmedAppts, totalPatients: uniquePatients.length, pendingRequests },
      upcomingAppointments: upcomingAppts.map((a: any) => ({
        id: a.id, date: a.date, time: a.time, type: a.type, status: a.status, reason: a.reason,
        patientName: `${a.patient.user.firstName} ${a.patient.user.lastName}`,
      })),
    })
  }

  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    const [totalUsers, totalDoctors, totalPatients, totalAppointments] = await Promise.all([
      prisma.user.count(),
      prisma.doctor.count(),
      prisma.patient.count(),
      prisma.appointment.count(),
    ])

    const recentUsers = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true, email: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return NextResponse.json({
      success: true,
      stats: { totalUsers, totalDoctors, totalPatients, totalAppointments },
      recentUsers,
    })
  }

  return NextResponse.json({ success: false, message: 'No dashboard data' }, { status: 400 })
}
