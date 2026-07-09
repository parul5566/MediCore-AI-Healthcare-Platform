import { NextResponse } from 'next/server'
import { getUserFromToken, unauthorizedResponse } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/mobile/lab-reports
export async function GET(request: Request) {
  const user = await getUserFromToken(request.headers.get('authorization'))
  if (!user) return unauthorizedResponse()

  let patientId = user.patient?.id
  const { searchParams } = new URL(request.url)
  const queryPatientId = searchParams.get('patientId')

  if (user.role === 'DOCTOR' && queryPatientId) {
    patientId = queryPatientId
  }

  if (!patientId) {
    return NextResponse.json({ success: false, message: 'Patient profile required' }, { status: 400 })
  }

  const reports = await prisma.labReport.findMany({
    where: { patientId },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json({
    success: true,
    reports: reports.map((r: any) => ({
      id: r.id,
      testName: r.testName,
      category: r.category,
      results: r.results,
      summary: r.summary,
      status: r.status,
      date: r.date,
    })),
  })
}
