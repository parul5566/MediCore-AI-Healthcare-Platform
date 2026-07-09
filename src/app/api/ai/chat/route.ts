import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { streamAiChat, healthAssistantChat } from '@/lib/ai'

export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `You are MediCore AI, a helpful healthcare assistant for patients. You provide general health information, symptom guidance, wellness tips, and help users understand when to seek professional medical care. 

Important guidelines:
- Always clarify you are not a replacement for professional medical advice
- Be empathetic, clear, and concise
- If symptoms suggest a serious/emergency condition, advise seeking immediate medical attention
- Provide actionable, evidence-based general health information
- Use bullet points and clear formatting when helpful
- Keep responses focused and practical`

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
          await streamAiChat(allMessages, (chunk) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
          })
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          // Fallback to non-streaming
          const response = await healthAssistantChat(messages[messages.length - 1].content, messages.slice(0, -1).map((m: any) => ({ role: m.role, content: m.content })))
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
    console.error('AI chat error:', error)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 500 })
  }
}
