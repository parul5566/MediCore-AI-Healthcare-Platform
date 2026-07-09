import { NextResponse } from 'next/server'
import { getUserFromToken, unauthorizedResponse } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/mobile/health-metrics
export async function GET(request: Request) {
  const user = await getUserFromToken(request.headers.get('authorization'))
  if (!user) return unauthorizedResponse()

  const { searchParams } = new URL(request.url)
  const metricType = searchParams.get('type')

  const where: any = { userId: user.id }
  if (metricType) where.type = metricType

  const metrics = await prisma.healthMetric.findMany({
    where,
    orderBy: { date: 'desc' },
    take: 100,
  })

  return NextResponse.json({ success: true, metrics })
}

// POST /api/mobile/health-metrics
export async function POST(request: Request) {
  const user = await getUserFromToken(request.headers.get('authorization'))
  if (!user) return unauthorizedResponse()

  const body = await request.json()
  const { type, value, secondaryValue, unit, notes } = body

  if (!type || value === undefined) {
    return NextResponse.json({ success: false, message: 'type, value required' }, { status: 400 })
  }

  const metric = await prisma.healthMetric.create({
    data: {
      userId: user.id, type, value: parseFloat(value), secondaryValue: secondaryValue ? parseFloat(secondaryValue) : null,
      unit: unit || '',
    },
  })

  return NextResponse.json({ success: true, metric })
}
