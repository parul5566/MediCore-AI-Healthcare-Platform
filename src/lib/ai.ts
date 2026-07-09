const AI_API_KEY = process.env.AI_API_KEY
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://llm.drytis.ai'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function aiChat(messages: ChatMessage[], temperature = 0.7): Promise<string> {
  if (!AI_API_KEY) {
    return fallbackResponse(messages)
  }

  try {
    const response = await fetch(`${AI_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response at this time.'
  } catch (error) {
    console.error('AI API error:', error)
    return fallbackResponse(messages)
  }
}

export async function streamAiChat(messages: ChatMessage[], onChunk: (text: string) => void): Promise<void> {
  if (!AI_API_KEY) {
    const fallback = fallbackResponse(messages)
    onChunk(fallback)
    return
  }

  try {
    const response = await fetch(`${AI_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      }),
    })

    if (!response.ok || !response.body) {
      throw new Error(`AI API error: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') return
          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) onChunk(content)
          } catch {
            // partial JSON, skip
          }
        }
      }
    }
  } catch (error) {
    console.error('AI stream error:', error)
    onChunk(fallbackResponse(messages))
  }
}

const HEALTH_ASSISTANT_SYSTEM = `You are MediCore AI, a helpful healthcare assistant. You provide general health information, symptom guidance, and wellness tips. Always clarify that you are not a replacement for professional medical advice. Be empathetic, clear, and concise. If symptoms suggest a serious condition, advise seeking immediate medical attention.`

const CLINICAL_COPILOT_SYSTEM = `You are MediCore Clinical Copilot, an AI assistant for healthcare professionals. You help generate clinical notes, visit summaries, and medical documentation. Generate professional, concise clinical documentation using standard medical terminology. Structure notes clearly with SOAP format when appropriate (Subjective, Objective, Assessment, Plan).`

export function healthAssistantChat(userMessage: string, history?: ChatMessage[]) {
  const messages: ChatMessage[] = [
    { role: 'system', content: HEALTH_ASSISTANT_SYSTEM },
    ...(history || []),
    { role: 'user', content: userMessage },
  ]
  return aiChat(messages)
}

export function clinicalCopilotChat(userMessage: string, context?: string) {
  const messages: ChatMessage[] = [
    { role: 'system', content: CLINICAL_COPILOT_SYSTEM },
    ...(context ? [{ role: 'user' as const, content: `Context: ${context}` }, { role: 'assistant' as const, content: 'Understood. Please provide the patient visit details.' }] : []),
    { role: 'user', content: userMessage },
  ]
  return aiChat(messages, 0.4)
}

function fallbackResponse(messages: ChatMessage[]): string {
  const lastUserMsg = messages.filter(m => m.role === 'user').pop()
  const userText = lastUserMsg?.content || ''

  if (userText.toLowerCase().includes('symptom') || userText.toLowerCase().includes('pain') || userText.toLowerCase().includes('feel')) {
    return `Thank you for sharing that with me. Based on what you've described, here are some general considerations:

**General Guidance:**
- Monitor your symptoms and note any changes
- Stay hydrated and get adequate rest
- If symptoms persist or worsen, consider booking an appointment with a healthcare provider

**When to Seek Immediate Care:**
- Severe or worsening pain
- Difficulty breathing
- High fever (above 103°F / 39.4°C)
- Any symptoms that significantly impact daily activities

Would you like me to help you find a suitable specialist or provide more specific guidance? You can also book an appointment through the platform.

*Note: This is general information and not a substitute for professional medical advice.*`
  }

  return `I understand you're looking for health guidance. I'm here to help with:
- General health questions and wellness tips
- Understanding symptoms and when to seek care
- Medication and lifestyle guidance
- Preventive care recommendations

Could you tell me more about what you'd like to know? You can describe your symptoms or ask any health-related question.

*Note: This is general information and not a substitute for professional medical advice.*`
}
