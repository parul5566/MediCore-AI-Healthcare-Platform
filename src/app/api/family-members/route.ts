import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Patient only' }, { status: 403 })
    }

    const patient = await prisma.patient.findUnique({ where: { userId: session.userId } })
    if (!patient) return NextResponse.json([])

    const family = await prisma.familyMember.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(family)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch family members' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, relationship, dateOfBirth, gender, bloodGroup, phone, medicalInfo } = body

    if (!name || !relationship) {
      return NextResponse.json({ error: 'Name and relationship required' }, { status: 400 })
    }

    const patient = await prisma.patient.findUnique({ where: { userId: session.userId } })
    if (!patient) return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })

    const member = await prisma.familyMember.create({
      data: {
        patientId: patient.id,
        name,
        relationship,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
        bloodGroup: bloodGroup || null,
        phone: phone || null,
        medicalInfo: medicalInfo || null,
      },
    })

    return NextResponse.json(member)
  } catch {
    return NextResponse.json({ error: 'Failed to add family member' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    await prisma.familyMember.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete family member' }, { status: 500 })
  }
}
