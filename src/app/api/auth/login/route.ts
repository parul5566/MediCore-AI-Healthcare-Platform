import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        patient: true,
        doctor: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json({ error: 'Account suspended. Contact administrator.' }, { status: 403 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
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
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
        details: 'User logged in',
      },
    })

    return NextResponse.json({
      id: user.id,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
