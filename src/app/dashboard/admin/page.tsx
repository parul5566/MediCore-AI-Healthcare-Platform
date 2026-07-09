'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Calendar, DollarSign, Pill, FlaskConical, Stethoscope, CheckCircle, Clock, TrendingUp, Loader2, ChevronRight, UserCheck, AlertCircle } from 'lucide-react'
import { StatCard, SectionCard, EmptyState, StatusBadge, PageHeader } from '@/components/ui-components'
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'

interface AdminData {
  stats: {
    totalUsers: number
    totalPatients: number
    totalDoctors: number
    totalAppointments: number
    pendingAppointments: number
    completedAppointments: number
    totalPrescriptions: number
    totalLabReports: number
    verifiedDoctors: number
    unverifiedDoctors: number
    revenue: number
  }
  recentUsers: any[]
  unverifiedDoctors: any[]
  daysData: { day: string; appointments: number }[]
  roleDistribution: { name: string; value: number; color: string }[]
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard').then(r => r.json()).then(d => setData(d)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>
  if (!data) return null

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Platform overview and system management" />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Users" value={data.stats.totalUsers} icon={Users} color="from-violet-500 to-purple-500" />
        <StatCard title="Appointments" value={data.stats.totalAppointments} icon={Calendar} color="from-blue-500 to-cyan-500" />
        <StatCard title="Revenue" value={`$${data.stats.revenue.toLocaleString()}`} icon={DollarSign} color="from-emerald-500 to-teal-500" />
        <StatCard title="Doctors" value={data.stats.totalDoctors} icon={Stethoscope} color="from-amber-500 to-orange-500" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <StatCard title="Patients" value={data.stats.totalPatients} icon={Users} color="from-rose-500 to-pink-500" />
        <StatCard title="Verified Doctors" value={data.stats.verifiedDoctors} icon={UserCheck} color="from-cyan-500 to-blue-500" />
        <StatCard title="Pending Appts" value={data.stats.pendingAppointments} icon={Clock} color="from-orange-500 to-red-500" />
        <StatCard title="Completed" value={data.stats.completedAppointments} icon={CheckCircle} color="from-emerald-500 to-green-500" />
        <StatCard title="Prescriptions" value={data.stats.totalPrescriptions} icon={Pill} color="from-purple-500 to-pink-500" />
        <StatCard title="Lab Reports" value={data.stats.totalLabReports} icon={FlaskConical} color="from-indigo-500 to-violet-500" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <SectionCard title="Appointments - Last 7 Days" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.daysData}>
              <defs>
                <linearGradient id="apptGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="appointments" stroke="#3b82f6" strokeWidth={2} fill="url(#apptGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="User Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.roleDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e: any) => e.name}>
                {data.roleDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Unverified Doctors */}
        <SectionCard title="Pending Doctor Verifications" action={<Link href="/dashboard/admin/doctors" className="text-sm text-accent font-semibold flex items-center gap-1 hover:underline">View all <ChevronRight size={14} /></Link>}>
          {data.unverifiedDoctors.length === 0 ? (
            <EmptyState icon={CheckCircle} title="All doctors verified" />
          ) : (
            <div className="space-y-3">
              {data.unverifiedDoctors.map((d: any) => (
                <div key={d.id} className="glass-card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center"><AlertCircle className="text-white" size={18} /></div>
                  <div className="flex-1"><div className="font-semibold text-primary-c">{d.user.firstName} {d.user.lastName}</div><div className="text-xs text-muted-c">{d.specialization} · {d.licenseNumber}</div></div>
                  <span className="badge badge-warning">Pending</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Recent Users */}
        <SectionCard title="Recent Registrations" action={<Link href="/dashboard/admin/users" className="text-sm text-accent font-semibold flex items-center gap-1 hover:underline">View all <ChevronRight size={14} /></Link>}>
          <div className="space-y-3">
            {data.recentUsers.slice(0, 5).map((u: any) => (
              <div key={u.id} className="glass-card p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${u.role === 'PATIENT' ? 'bg-gradient-to-br from-rose-500 to-pink-500' : u.role === 'DOCTOR' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : 'bg-gradient-to-br from-violet-500 to-purple-500'}`}>{u.firstName[0]}{u.lastName[0]}</div>
                <div className="flex-1 min-w-0"><div className="font-semibold text-primary-c truncate">{u.firstName} {u.lastName}</div><div className="text-xs text-muted-c">{u.email}</div></div>
                <span className="badge badge-accent">{u.role}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
