import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET messages - conversation list or messages with a specific user
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const withUserId = searchParams.get('with')

    if (withUserId) {
      // Get conversation with specific user
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.userId, receiverId: withUserId },
            { senderId: withUserId, receiverId: session.userId },
          ],
        },
        orderBy: { createdAt: 'asc' },
      })

      // Mark received messages as read
      await prisma.message.updateMany({
        where: { senderId: withUserId, receiverId: session.userId, read: false },
        data: { read: true },
      })

      return NextResponse.json(messages)
    }

    // Get conversation list - unique users we've messaged
    const sentMessages = await prisma.message.findMany({
      where: { senderId: session.userId },
      select: { receiverId: true, createdAt: true, content: true },
      orderBy: { createdAt: 'desc' },
    })

    const receivedMessages = await prisma.message.findMany({
      where: { receiverId: session.userId },
      select: { senderId: true, createdAt: true, content: true, read: true },
      orderBy: { createdAt: 'desc' },
    })

    // Build conversation list
    const conversations = new Map<string, { userId: string; lastMessage: string; lastDate: Date; unread: number }>()

    for (const m of receivedMessages) {
      const existing = conversations.get(m.senderId)
      if (!existing || new Date(m.createdAt) > existing.lastDate) {
        conversations.set(m.senderId, {
          userId: m.senderId,
          lastMessage: m.content,
          lastDate: new Date(m.createdAt),
          unread: 0,
        })
      }
    }

    for (const m of sentMessages) {
      const existing = conversations.get(m.receiverId)
      if (!existing || new Date(m.createdAt) > existing.lastDate) {
        conversations.set(m.receiverId, {
          userId: m.receiverId,
          lastMessage: m.content,
          lastDate: new Date(m.createdAt),
          unread: existing?.unread || 0,
        })
      }
    }

    // Count unread
    for (const m of receivedMessages) {
      if (!m.read) {
        const conv = conversations.get(m.senderId)
        if (conv) conv.unread++
      }
    }

    // Get user info for each conversation partner
    const userIds = Array.from(conversations.keys())
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, role: true },
    })

    const result = Array.from(conversations.values())
      .map(c => {
        const user = users.find(u => u.id === c.userId)
        return { ...c, user }
      })
      .sort((a, b) => b.lastDate.getTime() - a.lastDate.getTime())

    return NextResponse.json(result)
  } catch (error) {
    console.error('Messages GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST - send message
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { receiverId, content } = body

    if (!receiverId || !content) {
      return NextResponse.json({ error: 'Receiver and content required' }, { status: 400 })
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.userId,
        receiverId,
        content,
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Message POST error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
