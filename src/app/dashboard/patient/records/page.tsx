'use client'

import { useEffect, useState } from 'react'
import { FileText, AlertCircle, Pill, Syringe, Activity, Heart, Loader2 } from 'lucide-react'
import { PageHeader, EmptyState, StatusBadge } from '@/components/ui-components'

const typeConfig: Record<string, { icon: any; color: string; label: string }> = {
  CONDITION: { icon: AlertCircle, color: 'from-amber-500 to-orange-500', label: 'Condition' },
  ALLERGY: { icon: AlertCircle, color: 'from-red-500 to-rose-500', label: 'Allergy' },
  MEDICATION: { icon: Pill, color: 'from-blue-500 to-indigo-500', label: 'Medication' },
  VACCINATION: { icon: Syringe, color: 'from-emerald-500 to-teal-500', label: 'Vaccination' },
  PROCEDURE: { icon: Activity, color: 'from-purple-500 to-pink-500', label: 'Procedure' },
  IMAGING: { icon: Heart, color: 'from-cyan-500 to-blue-500', label: 'Imaging' },
}

export default function HealthRecords() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/medical-records').then(r => r.json()).then(d => setRecords(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }, [])

  const filtered = records.filter(r => filter === 'all' || r.type === filter)

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>

  return (
    <div>
      <PageHeader title="Health Records" subtitle="Your complete medical history and electronic health records" />

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'CONDITION', 'ALLERGY', 'MEDICATION', 'VACCINATION', 'PROCEDURE'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filter === f ? 'gradient-accent text-white' : 'glass-card text-secondary-c'}`}>
            {f === 'all' ? 'All Records' : typeConfig[f]?.label || f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-6"><EmptyState icon={FileText} title="No records found" /></div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/30 to-transparent" />

          <div className="space-y-4">
            {filtered.map(record => {
              const config = typeConfig[record.type] || typeConfig.CONDITION
              return (
                <div key={record.id} className="relative flex gap-4 animate-fade-in">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0 z-10`}>
                    <config.icon className="text-white" size={20} />
                  </div>
                  <div className="glass-card p-4 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-primary-c">{record.title}</h3>
                          <span className="badge badge-accent">{config.label}</span>
                          {record.severity && <StatusBadge status={record.severity === 'MILD' ? 'CONFIRMED' : record.severity === 'MODERATE' ? 'PENDING' : 'CANCELLED'} />}
                        </div>
                        {record.description && <p className="text-sm text-secondary-c mt-1">{record.description}</p>}
                        {record.doctor && <p className="text-xs text-muted-c mt-2">By {record.doctor.user.firstName} {record.doctor.user.lastName}</p>}
                        <p className="text-xs text-muted-c mt-1">{new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
