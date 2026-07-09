import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { aiChat } from '@/lib/ai'

export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `You are MediCore Clinical Copilot, an AI assistant for healthcare professionals. You help generate professional clinical documentation.

Capabilities:
- Generate SOAP notes (Subjective, Objective, Assessment, Plan)
- Create visit summaries
- Suggest medical codes
- Draft referral letters
- Summarize patient presentations

Always:
- Use proper medical terminology
- Be concise but thorough
- Format with clear sections and headings
- Include appropriate disclaimers when needed
- Structure notes professionally`

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 })
    }

    const allMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
    ]

    // Stream response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const { streamAiChat } = await import('@/lib/ai')
          await streamAiChat(allMessages, (chunk) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
          })
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          const response = await aiChat(allMessages, 0.4)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: response })}\n\n`))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Clinical copilot error:', error)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 500 })
  }
}
