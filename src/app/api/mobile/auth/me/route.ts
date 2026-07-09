import { NextResponse } from 'next/server'
import { getUserFromToken, unauthorizedResponse } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/mobile/auth/me — current user profile
export async function GET(request: Request) {
  const user = await getUserFromToken(request.headers.get('authorization'))
  if (!user) return unauthorizedResponse()

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      patientId: user.patient?.id,
      doctorId: user.doctor?.id,
      doctorVerified: user.doctor?.verified,
      patient: user.patient ? {
        dateOfBirth: user.patient.dateOfBirth, gender: user.patient.gender, bloodGroup: user.patient.bloodGroup,
        height: user.patient.height, weight: user.patient.weight,
      } : null,
      doctor: user.doctor ? {
        specialization: user.doctor.specialization, licenseNumber: user.doctor.licenseNumber,
        experience: user.doctor.experience, consultationFee: user.doctor.consultationFee, rating: user.doctor.rating,
        verified: user.doctor.verified, bio: user.doctor.bio, qualification: user.doctor.qualification,
      } : null,
    },
  })
}
