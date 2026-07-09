'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, Video, MapPin, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader, StatusBadge, EmptyState } from '@/components/ui-components'

interface Appointment {
  id: string
  date: string
  time: string
  status: string
  type: string
  reason: string | null
  patient: { user: { firstName: string; lastName: string } }
}

export default function DoctorSchedule() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    fetch('/api/appointments').then(r => r.json()).then(d => setAppointments(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }, [])

  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const startWeekday = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const monthName = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  const getAppointmentsForDay = (day: number) => {
    return appointments.filter(a => {
      const aptDate = new Date(a.date)
      return aptDate.getDate() === day && aptDate.getMonth() === currentMonth.getMonth() && aptDate.getFullYear() === currentMonth.getFullYear()
    })
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>

  return (
    <div>
      <PageHeader title="Schedule" subtitle="View and manage your appointment calendar" />

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-primary-c">{monthName}</h2>
          <div className="flex gap-2">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 rounded-lg glass-card"><ChevronLeft size={18} /></button>
            <button onClick={() => setCurrentMonth(new Date())} className="btn-secondary text-sm">Today</button>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 rounded-lg glass-card"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-muted-c py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: startWeekday }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayAppts = getAppointmentsForDay(day)
            const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear()
            return (
              <div key={day} className={`min-h-[80px] p-2 rounded-xl border transition-all ${isToday ? 'border-accent bg-[var(--accent-glow)]' : 'border-c glass-card'} ${dayAppts.length > 0 ? '' : 'opacity-50'}`}>
                <div className={`text-xs font-medium mb-1 ${isToday ? 'text-accent' : 'text-secondary-c'}`}>{day}</div>
                {dayAppts.slice(0, 2).map(apt => (
                  <div key={apt.id} className="text-xs p-1 rounded mb-1 bg-[var(--bg-glass)] truncate">
                    <span className="text-muted-c">{apt.time}</span> {apt.patient.user.firstName[0]}{apt.patient.user.lastName[0]}
                  </div>
                ))}
                {dayAppts.length > 2 && <div className="text-xs text-accent font-medium">+{dayAppts.length - 2} more</div>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming list */}
      <div className="mt-6 glass-card p-6">
        <h3 className="font-bold text-primary-c mb-4">All Upcoming Appointments</h3>
        <div className="space-y-2">
          {appointments.filter(a => new Date(a.date) > new Date() && a.status !== 'CANCELLED' && a.status !== 'COMPLETED').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(apt => (
            <div key={apt.id} className="flex items-center gap-4 p-3 rounded-xl bg-[var(--bg-glass)]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">{apt.type === 'VIDEO' ? <Video className="text-white" size={16} /> : <MapPin className="text-white" size={16} />}</div>
              <div className="flex-1 min-w-0"><div className="font-medium text-primary-c text-sm">{apt.patient.user.firstName} {apt.patient.user.lastName}</div><div className="text-xs text-muted-c">{new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {apt.time}</div></div>
              <StatusBadge status={apt.status} />
            </div>
          ))}
          {appointments.filter(a => new Date(a.date) > new Date() && a.status !== 'CANCELLED' && a.status !== 'COMPLETED').length === 0 && <EmptyState icon={Calendar} title="No upcoming appointments" />}
        </div>
      </div>
    </div>
  )
}
