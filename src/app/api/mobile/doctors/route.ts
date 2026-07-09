import { NextResponse } from 'next/server'
import { getUserFromToken, unauthorizedResponse } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/mobile/doctors — list doctors
export async function GET(request: Request) {
  const user = await getUserFromToken(request.headers.get('authorization'))
  if (!user) return unauthorizedResponse()

  const { searchParams } = new URL(request.url)
  const specialization = searchParams.get('specialization')
  const search = searchParams.get('search')

  const where: any = {}
  if (specialization) where.specialization = { contains: specialization, mode: 'insensitive' }
  if (search) {
    where.OR = [
      { specialization: { contains: search, mode: 'insensitive' } },
      { user: { firstName: { contains: search, mode: 'insensitive' } } },
      { user: { lastName: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const doctors = await prisma.doctor.findMany({
    where,
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } },
    orderBy: { rating: 'desc' },
  })

  return NextResponse.json({
    success: true,
    doctors: doctors.map((d: any) => ({
      id: d.id,
      name: `Dr. ${d.user.firstName} ${d.user.lastName}`,
      email: d.user.email,
      phone: d.user.phone,
      specialization: d.specialization,
      qualification: d.qualification,
      experience: d.experience,
      consultationFee: d.consultationFee,
      rating: d.rating,
      reviewCount: d.reviewCount,
      verified: d.verified,
      bio: d.bio,
    })),
  })
}
