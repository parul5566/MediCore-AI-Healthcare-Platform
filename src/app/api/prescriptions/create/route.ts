import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || session.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Doctor access only' }, { status: 403 })
    }

    const body = await request.json()
    const { patientId, medications, notes } = body

    if (!patientId || !medications || !Array.isArray(medications) || medications.length === 0) {
      return NextResponse.json({ error: 'Patient and at least one medication required' }, { status: 400 })
    }

    const doctor = await prisma.doctor.findUnique({ where: { userId: session.userId } })
    if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })

    const prescription = await prisma.prescription.create({
      data: {
        patientId,
        doctorId: doctor.id,
        medications: JSON.stringify(medications),
        notes: notes || null,
        status: 'ACTIVE',
      },
    })

    // Notify patient
    const patient = await prisma.patient.findUnique({ where: { id: patientId }, include: { user: true } })
    if (patient) {
      await prisma.notification.create({
        data: {
          userId: patient.userId,
          title: 'New Prescription',
          message: `Dr. ${session.name} has issued a new prescription for you.`,
          type: 'PRESCRIPTION',
        },
      })
    }

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'CREATE',
        entity: 'Prescription',
        entityId: prescription.id,
        details: 'Doctor created prescription',
      },
    })

    return NextResponse.json(prescription)
  } catch (error) {
    console.error('Prescription create error:', error)
    return NextResponse.json({ error: 'Failed to create prescription' }, { status: 500 })
  }
}
