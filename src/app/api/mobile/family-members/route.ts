import { NextResponse } from 'next/server'
import { getUserFromToken, unauthorizedResponse } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/mobile/family-members
export async function GET(request: Request) {
  const user = await getUserFromToken(request.headers.get('authorization'))
  if (!user) return unauthorizedResponse()

  if (!user.patient) {
    return NextResponse.json({ success: false, message: 'Patient profile required' }, { status: 400 })
  }

  const members = await prisma.familyMember.findMany({
    where: { patientId: user.patient.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    success: true,
    members: members.map((m: any) => ({
      id: m.id,
      name: m.name,
      relationship: m.relationship,
      dateOfBirth: m.dateOfBirth,
      gender: m.gender,
      bloodGroup: m.bloodGroup,
      phone: m.phone,
    })),
  })
}

// POST /api/mobile/family-members
export async function POST(request: Request) {
  const user = await getUserFromToken(request.headers.get('authorization'))
  if (!user) return unauthorizedResponse()

  if (!user.patient) {
    return NextResponse.json({ success: false, message: 'Patient profile required' }, { status: 400 })
  }

  const body = await request.json()
  const { name, relationship, dateOfBirth, gender, bloodGroup, phone } = body

  if (!name || !relationship) {
    return NextResponse.json({ success: false, message: 'name, relationship required' }, { status: 400 })
  }

  const member = await prisma.familyMember.create({
    data: {
      patientId: user.patient.id,
      name, relationship, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender, bloodGroup, phone,
    },
  })

  return NextResponse.json({ success: true, member })
}
