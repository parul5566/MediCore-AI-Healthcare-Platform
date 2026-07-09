'use client'

import { useEffect, useState } from 'react'
import { Pill, Loader2, Clock, User } from 'lucide-react'
import { PageHeader, EmptyState, StatusBadge, SectionCard } from '@/components/ui-components'

interface Prescription {
  id: string
  date: string
  status: string
  notes: string | null
  medications: any
  doctor: { user: { firstName: string; lastName: string }; specialization: string }
}

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/prescriptions').then(r => r.json()).then(d => setPrescriptions(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>

  return (
    <div>
      <PageHeader title="Prescriptions" subtitle="Your medication history and active prescriptions" />

      {prescriptions.length === 0 ? (
        <SectionCard><EmptyState icon={Pill} title="No prescriptions yet" /></SectionCard>
      ) : (
        <div className="space-y-4">
          {prescriptions.map(rx => {
            const meds = typeof rx.medications === 'string' ? JSON.parse(rx.medications) : rx.medications
            const isExpanded = expanded === rx.id
            return (
              <div key={rx.id} className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Pill className="text-white" size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-primary-c">Dr. {rx.doctor.user.firstName} {rx.doctor.user.lastName}</div>
                      <div className="text-xs text-muted-c">{rx.doctor.specialization}</div>
                    </div>
                  </div>
                  <StatusBadge status={rx.status} />
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-c mb-3">
                  <span className="flex items-center gap-1"><Clock size={12} /> {new Date(rx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="flex items-center gap-1"><User size={12} /> {meds.length} medication{meds.length !== 1 ? 's' : ''}</span>
                </div>

                <div className="space-y-2">
                  {meds.map((med: any, i: number) => (
                    <div key={i} className="glass-card p-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="font-medium text-primary-c">{med.name} <span className="text-secondary-c">{med.dosage}</span></div>
                        <div className="text-xs text-muted-c">{med.frequency} · {med.duration}</div>
                      </div>
                      {isExpanded && med.instructions && <p className="text-sm text-muted-c mt-2">💡 {med.instructions}</p>}
                    </div>
                  ))}
                </div>

                {rx.notes && <div className="mt-3 p-3 rounded-xl bg-[var(--bg-glass)]"><p className="text-sm text-secondary-c">📝 {rx.notes}</p></div>}

                <button onClick={() => setExpanded(isExpanded ? null : rx.id)} className="text-sm text-accent font-semibold mt-3">
                  {isExpanded ? 'Show less' : 'Show instructions'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
