import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password, phone, role, specialization, licenseNumber, experience, dateOfBirth, gender, bloodGroup } = body

    // Validate
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['PATIENT', 'DOCTOR'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user + profile in transaction
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone: phone || null,
        role,
      },
    })

    if (role === 'PATIENT') {
      await prisma.patient.create({
        data: {
          userId: user.id,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender: gender || null,
          bloodGroup: bloodGroup || null,
        },
      })
    } else if (role === 'DOCTOR') {
      await prisma.doctor.create({
        data: {
          userId: user.id,
          specialization: specialization || 'General',
          licenseNumber: licenseNumber || `TEMP-${user.id.slice(-6)}`,
          experience: parseInt(experience) || 0,
          verified: false,
        },
      })
    }

    // Set session
    const session = await getSession()
    session.userId = user.id
    session.role = user.role
    session.email = user.email
    session.name = `${user.firstName} ${user.lastName}`
    session.isLoggedIn = true
    await session.save()

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        entity: 'User',
        entityId: user.id,
        details: `New ${role} registration`,
      },
    })

    return NextResponse.json({
      id: user.id,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
