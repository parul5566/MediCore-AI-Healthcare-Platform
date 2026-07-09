import { NextResponse } from 'next/server'
import { getUserFromToken, unauthorizedResponse } from '@/lib/mobile-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/mobile/messages — conversation list + messages
export async function GET(request: Request) {
  const user = await getUserFromToken(request.headers.get('authorization'))
  if (!user) return unauthorizedResponse()

  const { searchParams } = new URL(request.url)
  const otherUserId = searchParams.get('userId')

  if (otherUserId) {
    // Get conversation between current user and other user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: user.id },
        ],
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ success: true, messages })
  }

  // Get all conversations (latest message per user)
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: user.id }, { receiverId: user.id }] },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true } },
      receiver: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Group by other user
  const conversations = new Map()
  for (const msg of messages) {
    const otherId = msg.senderId === user.id ? msg.receiverId : msg.senderId
    if (!conversations.has(otherId)) {
      conversations.set(otherId, {
        userId: otherId,
        name: msg.senderId === user.id ? `${msg.receiver.firstName} ${msg.receiver.lastName}` : `${msg.sender.firstName} ${msg.sender.lastName}`,
        lastMessage: msg.content,
        lastMessageAt: msg.createdAt,
      })
    }
  }

  return NextResponse.json({ success: true, conversations: Array.from(conversations.values()) })
}

// POST /api/mobile/messages
export async function POST(request: Request) {
  const user = await getUserFromToken(request.headers.get('authorization'))
  if (!user) return unauthorizedResponse()

  const body = await request.json()
  const { receiverId, content } = body

  if (!receiverId || !content) {
    return NextResponse.json({ success: false, message: 'receiverId, content required' }, { status: 400 })
  }

  const message = await prisma.message.create({
    data: { senderId: user.id, receiverId, content },
  })

  return NextResponse.json({ success: true, message })
}
