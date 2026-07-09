'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, Video, MapPin, Loader2, User } from 'lucide-react'
import { PageHeader, StatusBadge, EmptyState, SectionCard } from '@/components/ui-components'

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/appointments').then(r => r.json()).then(d => setAppointments(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>

  const filtered = appointments.filter(a => filter === 'all' || a.status === filter)

  return (
    <div>
      <PageHeader title="All Appointments" subtitle="Monitor all appointments across the platform" />

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filter === f ? 'gradient-accent text-white' : 'glass-card text-secondary-c'}`}>
            {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <SectionCard><EmptyState icon={Calendar} title="No appointments found" /></SectionCard>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-c text-muted-c">
                  <th className="px-4 py-3 font-medium">Patient</th>
                  <th className="px-4 py-3 font-medium">Doctor</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Date & Time</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(apt => (
                  <tr key={apt.id} className="border-b border-c last:border-0 hover:bg-[var(--bg-glass)]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">{apt.patient?.user?.firstName?.[0]}{apt.patient?.user?.lastName?.[0]}</div>
                        <span className="text-primary-c">{apt.patient?.user?.firstName} {apt.patient?.user?.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">{apt.doctor?.user?.firstName?.[0]}{apt.doctor?.user?.lastName?.[0]}</div>
                        <span className="text-secondary-c">{apt.doctor?.user?.firstName} {apt.doctor?.user?.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-c hidden md:table-cell">
                      <div className="flex items-center gap-1 text-xs"><Calendar size={12} /> {new Date(apt.date).toLocaleDateString()}</div>
                      <div className="flex items-center gap-1 text-xs"><Clock size={12} /> {apt.time}</div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">{apt.type === 'VIDEO' ? <Video size={16} className="text-accent" /> : <MapPin size={16} className="text-muted-c" />}</td>
                    <td className="px-4 py-3"><StatusBadge status={apt.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
