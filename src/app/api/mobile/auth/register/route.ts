import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateToken } from '@/lib/mobile-auth'

export const dynamic = 'force-dynamic'

// POST /api/mobile/auth/register
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password, phone, role, dateOfBirth, gender, bloodGroup, height, weight, specialization, licenseNumber, qualification, experience, consultationFee, bio } = body

    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        firstName, lastName, email,
        password: hashedPassword,
        phone, role,
        patient: role === 'PATIENT' ? { create: { dateOfBirth, gender, bloodGroup, height, weight } } : undefined,
        doctor: role === 'DOCTOR' ? { create: { specialization, licenseNumber, qualification, experience, consultationFee, bio, rating: 0, verified: false } } : undefined,
      },
      include: { patient: true, doctor: true },
    })

    const token = generateToken({
      userId: user.id,
      role: user.role,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    })

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        patientId: user.patient?.id,
        doctorId: user.doctor?.id,
        patient: user.patient ? { dateOfBirth: user.patient.dateOfBirth, gender: user.patient.gender, bloodGroup: user.patient.bloodGroup, height: user.patient.height, weight: user.patient.weight } : null,
        doctor: user.doctor ? { specialization: user.doctor.specialization, licenseNumber: user.doctor.licenseNumber, experience: user.doctor.experience, consultationFee: user.doctor.consultationFee, rating: user.doctor.rating, verified: user.doctor.verified, bio: user.doctor.bio, qualification: user.doctor.qualification } : null,
      },
    })
  } catch (error) {
    console.error('Mobile register error:', error)
    return NextResponse.json({ success: false, message: 'Registration failed' }, { status: 500 })
  }
}
