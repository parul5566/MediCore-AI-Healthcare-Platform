'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Users, Clock, CheckCircle, ChevronRight, Brain, Pill, Star, Video, MapPin, Loader2 } from 'lucide-react'
import { StatCard, SectionCard, EmptyState, StatusBadge, PageHeader } from '@/components/ui-components'

interface Data {
  doctor: { id: string; specialization: string; rating: number; experience: number; verified: boolean }
  todayAppointments: any[]
  upcomingAppointments: any[]
  patients: any[]
  prescriptions: any[]
  stats: { today: number; upcoming: number; totalPatients: number; completed: number }
}

export default function DoctorDashboard() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/doctor/dashboard').then(r => r.json()).then(d => setData(d)).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="glass-card p-5"><div className="skeleton h-12 w-12 rounded-xl mb-3" /><div className="skeleton h-8 w-20 mb-2" /><div className="skeleton h-4 w-32" /></div>)}
      </div>
    )
  }

  if (!data) return null

  return (
    <div>
      <PageHeader
        title="Doctor Dashboard"
        subtitle={`Welcome back, Dr. ${data.doctor.specialization}`}
        action={
          <div className="flex items-center gap-2 glass-card px-4 py-2">
            <Star size={18} className="text-warning" fill="currentColor" />
            <span className="font-bold text-primary-c">{data.doctor.rating}</span>
            {!data.doctor.verified && <span className="badge badge-warning">Unverified</span>}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Today's Appointments" value={data.stats.today} icon={Clock} color="from-blue-500 to-cyan-500" />
        <StatCard title="Upcoming" value={data.stats.upcoming} icon={Calendar} color="from-purple-500 to-pink-500" />
        <StatCard title="Total Patients" value={data.stats.totalPatients} icon={Users} color="from-emerald-500 to-teal-500" />
        <StatCard title="Completed" value={data.stats.completed} icon={CheckCircle} color="from-amber-500 to-orange-500" />
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Link href="/dashboard/doctor/ai-copilot" className="glass-card p-5 flex items-center gap-4 hover:scale-[1.02] transition-all">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"><Brain className="text-white" size={24} /></div>
          <div><div className="font-semibold text-primary-c">AI Clinical Copilot</div><div className="text-xs text-muted-c">Generate clinical notes</div></div>
        </Link>
        <Link href="/dashboard/doctor/prescriptions" className="glass-card p-5 flex items-center gap-4 hover:scale-[1.02] transition-all">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center"><Pill className="text-white" size={24} /></div>
          <div><div className="font-semibold text-primary-c">Prescriptions</div><div className="text-xs text-muted-c">Manage e-prescriptions</div></div>
        </Link>
        <Link href="/dashboard/doctor/patients" className="glass-card p-5 flex items-center gap-4 hover:scale-[1.02] transition-all">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center"><Users className="text-white" size={24} /></div>
          <div><div className="font-semibold text-primary-c">Patients</div><div className="text-xs text-muted-c">View patient records</div></div>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <SectionCard title="Today's Schedule" action={<Link href="/dashboard/doctor/appointments" className="text-sm text-accent font-semibold flex items-center gap-1 hover:underline">View all <ChevronRight size={14} /></Link>}>
          {data.todayAppointments.length === 0 ? (
            <EmptyState icon={Calendar} title="No appointments today" />
          ) : (
            <div className="space-y-3">
              {data.todayAppointments.map(apt => (
                <div key={apt.id} className="glass-card p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    {apt.type === 'VIDEO' ? <Video className="text-white" size={20} /> : <MapPin className="text-white" size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-primary-c truncate">{apt.patient.user.firstName} {apt.patient.user.lastName}</div>
                    <div className="text-xs text-muted-c">{apt.reason || 'Consultation'}</div>
                    <div className="text-xs text-muted-c">{apt.time} · {apt.duration}min</div>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Recent Patients */}
        <SectionCard title="Recent Patients" action={<Link href="/dashboard/doctor/patients" className="text-sm text-accent font-semibold flex items-center gap-1 hover:underline">View all <ChevronRight size={14} /></Link>}>
          {data.patients.length === 0 ? (
            <EmptyState icon={Users} title="No patients yet" />
          ) : (
            <div className="space-y-3">
              {data.patients.slice(0, 5).map(p => (
                <div key={p.id} className="glass-card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">{p.user.firstName[0]}{p.user.lastName[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-primary-c truncate">{p.user.firstName} {p.user.lastName}</div>
                    <div className="text-xs text-muted-c">{p.bloodGroup || 'N/A'} · {p.gender || 'N/A'}</div>
                  </div>
                  <span className="text-xs text-muted-c">{p.dateOfBirth ? `${Math.floor((Date.now() - new Date(p.dateOfBirth).getTime()) / 31536000000)} yrs` : ''}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
