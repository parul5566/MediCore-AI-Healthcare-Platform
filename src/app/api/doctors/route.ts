import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - list all doctors for booking
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const specialization = searchParams.get('specialization')

    const where: { verified?: boolean; specialization?: string } = { verified: true }
    if (specialization && specialization !== 'all') {
      where.specialization = specialization
    }

    const doctors = await prisma.doctor.findMany({
      where,
      include: { user: true },
      orderBy: { rating: 'desc' },
    })

    return NextResponse.json(doctors)
  } catch (error) {
    console.error('Doctors list error:', error)
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 })
  }
}
