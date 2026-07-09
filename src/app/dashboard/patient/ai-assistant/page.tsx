'use client'

import { useState, useRef, useEffect } from 'react'
import { Brain, Send, Sparkles, AlertCircle, Loader2, RotateCcw } from 'lucide-react'
import { PageHeader } from '@/components/ui-components'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const suggestions = [
  'I have a headache and feel dizzy. What should I do?',
  'What are some tips for better sleep?',
  'How can I lower my blood pressure naturally?',
  'What should I know about vitamin D deficiency?',
]

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return

    const userMessage: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)

    // Add placeholder assistant message
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) throw new Error('Failed')

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullText = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                fullText += parsed.content
                setMessages(prev => {
                  const copy = [...prev]
                  copy[copy.length - 1] = { role: 'assistant', content: fullText }
                  return copy
                })
              }
            } catch { /* partial */ }
          }
        }
      }

      // If no content streamed, use fallback
      if (!fullText) {
        setMessages(prev => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'assistant', content: 'I apologize, but I could not generate a response at this time. Please try again.' }
          return copy
        })
      }
    } catch {
      setMessages(prev => {
        const copy = [...prev]
        copy[copy.length - 1] = { role: 'assistant', content: 'I am having trouble connecting right now. Please try again in a moment.' }
        return copy
      })
    } finally {
      setStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageHeader title="AI Health Assistant" subtitle="Ask about symptoms, medications, wellness, and more" action={
        messages.length > 0 && (
          <button onClick={() => setMessages([])} className="btn-secondary flex items-center gap-2 text-sm">
            <RotateCcw size={16} /> New Chat
          </button>
        )
      } />

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center mb-6 animate-pulse-glow">
              <Brain className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-primary-c mb-2">MediCore AI Assistant</h2>
            <p className="text-secondary-c mb-8 max-w-md">Your 24/7 AI-powered health companion. Ask me anything about your health, symptoms, or wellness.</p>

            <div className="grid sm:grid-cols-2 gap-3 w-full max-w-2xl">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="glass-card p-4 text-left text-sm text-secondary-c hover:scale-[1.02] transition-all flex items-start gap-2"
                >
                  <Sparkles size={16} className="text-accent flex-shrink-0 mt-0.5" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center mr-2 flex-shrink-0">
                  <Brain className="text-white" size={16} />
                </div>
              )}
              <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                {msg.content ? (
                  <div className="prose-sm whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-muted-c" />
                    <span className="text-muted-c text-sm">Thinking...</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="mt-4">
        <div className="glass-card p-2 flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your health..."
            rows={1}
            disabled={streaming}
            className="input-field border-none bg-transparent flex-1 resize-none max-h-32"
            style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
            className="btn-primary !p-3 flex-shrink-0 disabled:opacity-50"
          >
            {streaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="text-xs text-muted-c text-center mt-2 flex items-center justify-center gap-1">
          <AlertCircle size={12} />
          This AI assistant provides general information only, not medical advice. Always consult a healthcare professional.
        </p>
      </div>
    </div>
  )
}
