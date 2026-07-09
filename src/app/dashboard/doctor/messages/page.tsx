'use client'

import { useEffect, useState, useRef } from 'react'
import { MessageSquare, Send, Loader2, ArrowLeft, Search } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/ui-components'

interface Conversation {
  userId: string
  lastMessage: string
  unread: number
  user: { id: string; firstName: string; lastName: string; role: string }
}

interface ChatMessage {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
  read: boolean
}

export default function PatientMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/messages').then(r => r.json()).then(d => setConversations(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (activeChat) {
      fetch(`/api/messages?with=${activeChat}`).then(r => r.json()).then(d => setMessages(Array.isArray(d) ? d : []))
    }
  }, [activeChat])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !activeChat) return
    const content = input
    setInput('')

    // Optimistic update
    const optimistic: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: 'me',
      receiverId: activeChat,
      content,
      createdAt: new Date().toISOString(),
      read: true,
    }
    setMessages(prev => [...prev, optimistic])

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: activeChat, content }),
    })

    // Refresh conversations
    fetch('/api/messages').then(r => r.json()).then(d => setConversations(Array.isArray(d) ? d : []))
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>

  return (
    <div>
      <PageHeader title="Messages" subtitle="Secure messaging with your doctors" />

      <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-14rem)]">
        {/* Conversation list */}
        <div className={`glass-card p-4 overflow-y-auto ${activeChat ? 'hidden md:block' : ''}`}>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-c" />
            <input placeholder="Search..." className="input-field pl-9 py-2 text-sm" />
          </div>
          {conversations.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No conversations" description="Start messaging from an appointment." />
          ) : (
            <div className="space-y-2">
              {conversations.map(c => (
                <button
                  key={c.userId}
                  onClick={() => setActiveChat(c.userId)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${activeChat === c.userId ? 'gradient-accent text-white' : 'hover:bg-[var(--bg-glass)]'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${activeChat === c.userId ? 'bg-white/20' : 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'}`}>
                      {c.user?.firstName[0]}{c.user?.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium truncate ${activeChat === c.userId ? 'text-white' : 'text-primary-c'}`}>{c.user?.firstName} {c.user?.lastName}</div>
                      <div className={`text-xs truncate ${activeChat === c.userId ? 'text-white/70' : 'text-muted-c'}`}>{c.lastMessage}</div>
                    </div>
                    {c.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center flex-shrink-0">{c.unread}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat panel */}
        <div className={`md:col-span-2 glass-card flex flex-col ${!activeChat ? 'hidden md:flex' : ''}`}>
          {activeChat ? (
            <>
              <div className="p-4 border-b border-c flex items-center gap-3">
                <button onClick={() => setActiveChat(null)} className="md:hidden p-2 rounded-lg glass-card"><ArrowLeft size={18} /></button>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                  {conversations.find(c => c.userId === activeChat)?.user?.firstName[0]}
                </div>
                <div>
                  <div className="font-semibold text-primary-c">{conversations.find(c => c.userId === activeChat)?.user?.firstName} {conversations.find(c => c.userId === activeChat)?.user?.lastName}</div>
                  <div className="text-xs text-success flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-success inline-block" /> Online</div>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={msg.senderId === 'me' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.senderId === 'me' ? 'text-white/70' : 'text-muted-c'}`}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-c flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder="Type a message..."
                  rows={1}
                  className="input-field flex-1 resize-none"
                />
                <button onClick={sendMessage} disabled={!input.trim()} className="btn-primary !p-3 disabled:opacity-50">
                  <Send size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <EmptyState icon={MessageSquare} title="Select a conversation" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
