import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateToken } from '@/lib/mobile-auth'

export const dynamic = 'force-dynamic'

// POST /api/mobile/auth/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { patient: true, doctor: true },
    })

    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json({ success: false, message: 'Account suspended' }, { status: 403 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    })

    await prisma.auditLog.create({
      data: { userId: user.id, action: 'LOGIN', entity: 'User', entityId: user.id, details: 'Mobile login' },
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
        doctorVerified: user.doctor?.verified,
        patient: user.patient ? {
          dateOfBirth: user.patient.dateOfBirth,
          gender: user.patient.gender,
          bloodGroup: user.patient.bloodGroup,
          height: user.patient.height,
          weight: user.patient.weight,
        } : null,
        doctor: user.doctor ? {
          specialization: user.doctor.specialization,
          licenseNumber: user.doctor.licenseNumber,
          experience: user.doctor.experience,
          consultationFee: user.doctor.consultationFee,
          rating: user.doctor.rating,
          verified: user.doctor.verified,
          bio: user.doctor.bio,
          qualification: user.doctor.qualification,
        } : null,
      },
    })
  } catch (error) {
    console.error('Mobile login error:', error)
    return NextResponse.json({ success: false, message: 'Login failed' }, { status: 500 })
  }
}
