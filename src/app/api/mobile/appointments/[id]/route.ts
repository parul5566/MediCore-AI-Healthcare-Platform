import { NextResponse } from 'next/server'
import { getUserFromToken, unauthorizedResponse } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// PATCH /api/mobile/appointments/[id] — update status
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken(request.headers.get('authorization'))
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const body = await request.json()
  const { status } = body

  if (!status) {
    return NextResponse.json({ success: false, message: 'status required' }, { status: 400 })
  }

  // Verify access
  const appt = await prisma.appointment.findUnique({ where: { id } })
  if (!appt) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })

  if (user.role === 'DOCTOR' && user.doctor?.id !== appt.doctorId) {
    return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 })
  }
  if (user.role === 'PATIENT' && user.patient?.id !== appt.patientId) {
    return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 })
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json({ success: true, appointment: updated })
}
