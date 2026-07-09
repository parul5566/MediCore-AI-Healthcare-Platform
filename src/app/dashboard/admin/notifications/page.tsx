'use client'

import { useEffect, useState } from 'react'
import { Bell, Loader2, CheckCheck, Trash2 } from 'lucide-react'
import { PageHeader, EmptyState, SectionCard } from '@/components/ui-components'

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifs = () => fetch('/api/notifications').then(r => r.json()).then(d => setNotifications(Array.isArray(d) ? d : [])).finally(() => setLoading(false))

  useEffect(() => { fetchNotifs() }, [])

  const markAllRead = async () => {
    await Promise.all(notifications.filter(n => !n.read).map(n => fetch(`/api/notifications/${n.id}`, { method: 'PATCH' })))
    fetchNotifs()
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>

  return (
    <div>
      <PageHeader title="Notifications" subtitle="System notifications and alerts" action={
        notifications.some(n => !n.read) && <button onClick={markAllRead} className="btn-secondary flex items-center gap-2 text-sm"><CheckCheck size={16} /> Mark all read</button>
      } />

      {notifications.length === 0 ? (
        <SectionCard><EmptyState icon={Bell} title="No notifications" /></SectionCard>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} className={`glass-card p-4 flex items-start gap-3 ${!n.read ? 'border-l-2 border-accent' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0"><Bell className="text-white" size={18} /></div>
              <div className="flex-1">
                <div className="flex items-center gap-2"><span className="font-semibold text-primary-c">{n.title}</span>{!n.read && <span className="w-2 h-2 rounded-full bg-accent" />}</div>
                <p className="text-sm text-secondary-c mt-1">{n.message}</p>
                <p className="text-xs text-muted-c mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <span className="badge badge-accent">{n.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
