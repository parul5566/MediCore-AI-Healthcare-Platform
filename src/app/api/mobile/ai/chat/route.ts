import { NextResponse } from 'next/server'
import { getUserFromToken, unauthorizedResponse } from '@/lib/mobile-auth'

export const dynamic = 'force-dynamic'

// POST /api/mobile/ai/chat — AI health assistant
export async function POST(request: Request) {
  const user = await getUserFromToken(request.headers.get('authorization'))
  if (!user) return unauthorizedResponse()

  const body = await request.json()
  const { message, history } = body

  if (!message) {
    return NextResponse.json({ success: false, message: 'message required' }, { status: 400 })
  }

  try {
    const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY
    const baseUrl = process.env.AI_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'

    const systemPrompt = `You are MediCore AI, a professional healthcare assistant. You provide general health information, medication reminders, lifestyle advice, and help interpret common medical terms. Always remind users to consult a healthcare professional for specific medical advice. Be empathetic, clear, and professional. Keep responses concise and actionable.

User context: ${user.firstName} ${user.lastName} (${user.role})`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map((h: any) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ]

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`)
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || 'I apologize, but I could not process your request.'

    return NextResponse.json({ success: true, reply })
  } catch (error) {
    console.error('AI chat error:', error)
    // Fallback response
    return NextResponse.json({
      success: true,
      reply: "I'm here to help! I can assist with general health questions, medication information, and lifestyle advice. Could you please rephrase your question? For specific medical concerns, please consult with a healthcare professional.",
    })
  }
}
