'use client'

import { useEffect, useState } from 'react'
import { ScrollText, Loader2, User, Shield, FileEdit, Trash2, LogIn, UserPlus } from 'lucide-react'
import { PageHeader, EmptyState, SectionCard } from '@/components/ui-components'

interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string | null
  details: string | null
  createdAt: string
  user: { firstName: string; lastName: string; email: string } | null
}

const actionIcons: Record<string, any> = {
  LOGIN: LogIn, LOGOUT: LogIn, REGISTER: UserPlus,
  CREATE: FileEdit, UPDATE: FileEdit, DELETE: Trash2,
  SUSPEND: Shield, ACTIVATE: Shield, VERIFY: Shield, UNVERIFY: Shield,
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/admin/audit-logs').then(r => r.json()).then(d => setLogs(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>

  const actions = ['all', ...new Set(logs.map(l => l.action))]
  const filtered = logs.filter(l => filter === 'all' || l.action === filter)

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="System activity and security logs" />

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {actions.slice(0, 10).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filter === f ? 'gradient-accent text-white' : 'glass-card text-secondary-c'}`}>
            {f === 'all' ? 'All Actions' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <SectionCard><EmptyState icon={ScrollText} title="No logs found" /></SectionCard>
      ) : (
        <div className="space-y-2">
          {filtered.map(log => {
            const Icon = actionIcons[log.action] || FileEdit
            return (
              <div key={log.id} className="glass-card p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  log.action.includes('DELETE') || log.action.includes('SUSPEND') ? 'bg-red-500/20 text-danger' :
                  log.action.includes('CREATE') || log.action.includes('VERIFY') || log.action.includes('ACTIVATE') ? 'bg-emerald-500/20 text-success' :
                  'bg-blue-500/20 text-accent'
                }`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-primary-c">{log.action}</span>
                    <span className="badge badge-accent">{log.entity}</span>
                  </div>
                  {log.details && <p className="text-sm text-secondary-c truncate">{log.details}</p>}
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-c">
                    {log.user && <span className="flex items-center gap-1"><User size={10} /> {log.user.firstName} {log.user.lastName}</span>}
                    <span>· {new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
