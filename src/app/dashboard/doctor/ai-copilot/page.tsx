'use client'

import { useState, useRef, useEffect } from 'react'
import { Brain, Send, Sparkles, Loader2, FileText, ClipboardList, Stethoscope, RotateCcw, Copy, Check } from 'lucide-react'
import { PageHeader } from '@/components/ui-components'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const templates = [
  {
    icon: FileText,
    title: 'SOAP Note',
    prompt: 'Generate a SOAP note for a patient presenting with persistent headaches for 2 weeks, rated 6/10, worsened by stress. No visual disturbances. Vitals normal. Patient has history of hypertension.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: ClipboardList,
    title: 'Visit Summary',
    prompt: 'Create a visit summary for a routine cardiac follow-up. Patient reports feeling well, tolerating medication. BP 128/82, HR 72. Continue current treatment plan. Follow-up in 3 months.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Stethoscope,
    title: 'Clinical Note',
    prompt: 'Draft a clinical note for a new patient consultation for Type 2 Diabetes management. A1C 7.8%, fasting glucose 142 mg/dL. Patient is overweight and sedentary. Starting Metformin.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: FileText,
    title: 'Referral Letter',
    prompt: 'Write a referral letter to a cardiologist for a patient with new-onset atrial fibrillation discovered on routine ECG. Patient is asymptomatic, 58 years old.',
    color: 'from-amber-500 to-orange-500',
  },
]

export default function ClinicalCopilot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [copied, setCopied] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return
    const userMessage: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
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

      if (!fullText) {
        setMessages(prev => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'assistant', content: 'Unable to generate response. Please try again.' }
          return copy
        })
      }
    } catch {
      setMessages(prev => {
        const copy = [...prev]
        copy[copy.length - 1] = { role: 'assistant', content: 'Connection error. Please try again.' }
        return copy
      })
    } finally {
      setStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const copyLastResponse = () => {
    const last = messages.filter(m => m.role === 'assistant').pop()
    if (last) {
      navigator.clipboard.writeText(last.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageHeader
        title="AI Clinical Copilot"
        subtitle="Generate clinical notes, SOAP notes, visit summaries, and more"
        action={
          <div className="flex gap-2">
            {messages.length > 0 && messages.some(m => m.role === 'assistant' && m.content) && (
              <button onClick={copyLastResponse} className="btn-secondary flex items-center gap-2 text-sm">
                {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}
              </button>
            )}
            {messages.length > 0 && (
              <button onClick={() => setMessages([])} className="btn-secondary flex items-center gap-2 text-sm">
                <RotateCcw size={16} /> New
              </button>
            )}
          </div>
        }
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 animate-pulse-glow">
              <Brain className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-primary-c mb-2">Clinical Copilot</h2>
            <p className="text-secondary-c mb-8 max-w-md">Your AI-powered clinical documentation assistant. Generate professional notes in seconds.</p>
            <div className="grid sm:grid-cols-2 gap-3 w-full max-w-2xl">
              {templates.map(t => (
                <button key={t.title} onClick={() => sendMessage(t.prompt)} className="glass-card p-4 text-left hover:scale-[1.02] transition-all">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center mb-2`}><t.icon className="text-white" size={20} /></div>
                  <div className="font-semibold text-primary-c">{t.title}</div>
                  <div className="text-xs text-muted-c mt-1 line-clamp-2">{t.prompt.slice(0, 80)}...</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              {msg.role === 'assistant' && <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-2 flex-shrink-0"><Brain className="text-white" size={16} /></div>}
              <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                {msg.content ? <div className="whitespace-pre-wrap text-sm">{msg.content}</div> : <div className="flex items-center gap-2"><Loader2 size={16} className="animate-spin text-muted-c" /><span className="text-muted-c text-sm">Generating...</span></div>}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4">
        <div className="glass-card p-2 flex items-end gap-2">
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Describe patient encounter or ask for documentation..." rows={1} disabled={streaming} className="input-field border-none bg-transparent flex-1 resize-none max-h-32" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }} />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || streaming} className="btn-primary !p-3 flex-shrink-0 disabled:opacity-50">{streaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}</button>
        </div>
      </div>
    </div>
  )
}
