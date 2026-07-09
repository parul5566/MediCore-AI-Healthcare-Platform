'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Users, Calendar, DollarSign, TrendingUp, Stethoscope, Loader2 } from 'lucide-react'
import { PageHeader, StatCard, SectionCard } from '@/components/ui-components'
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'

interface Analytics {
  stats: any
  daysData: { day: string; appointments: number }[]
  roleDistribution: { name: string; value: number; color: string }[]
}

export default function AdminAnalytics() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard').then(r => r.json()).then(d => setData(d)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>
  if (!data) return null

  const appointmentStatusData = [
    { name: 'Completed', value: data.stats.completedAppointments, color: '#10b981' },
    { name: 'Pending', value: data.stats.pendingAppointments, color: '#f59e0b' },
    { name: 'Other', value: data.stats.totalAppointments - data.stats.completedAppointments - data.stats.pendingAppointments, color: '#6b7280' },
  ].filter(d => d.value > 0)

  return (
    <div>
      <PageHeader title="Platform Analytics" subtitle="Insights and metrics across the platform" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Revenue" value={`$${data.stats.revenue.toLocaleString()}`} icon={DollarSign} color="from-emerald-500 to-teal-500" />
        <StatCard title="Total Appointments" value={data.stats.totalAppointments} icon={Calendar} color="from-blue-500 to-cyan-500" />
        <StatCard title="Completion Rate" value={data.stats.totalAppointments > 0 ? `${Math.round((data.stats.completedAppointments / data.stats.totalAppointments) * 100)}%` : '0%'} icon={TrendingUp} color="from-purple-500 to-pink-500" />
        <StatCard title="Active Users" value={data.stats.totalUsers} icon={Users} color="from-amber-500 to-orange-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <SectionCard title="Appointments (7 Days)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.daysData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px' }} />
              <Bar dataKey="appointments" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Appointment Status">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={appointmentStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e: any) => `${e.name}: ${e.value}`}>
                {appointmentStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <SectionCard title="User Distribution" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.roleDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={12} width={80} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px' }} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {data.roleDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Quick Stats">
          <div className="space-y-4">
            <div className="flex items-center justify-between"><span className="text-sm text-secondary-c flex items-center gap-2"><Users size={16} className="text-rose-500" /> Patients</span><span className="font-bold text-primary-c">{data.stats.totalPatients}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-secondary-c flex items-center gap-2"><Stethoscope size={16} className="text-blue-500" /> Doctors</span><span className="font-bold text-primary-c">{data.stats.totalDoctors}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-secondary-c flex items-center gap-2"><DollarSign size={16} className="text-emerald-500" /> Avg Revenue/Apt</span><span className="font-bold text-primary-c">${data.stats.completedAppointments > 0 ? Math.round(data.stats.revenue / data.stats.completedAppointments) : 0}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-secondary-c flex items-center gap-2"><Calendar size={16} className="text-purple-500" /> Prescriptions</span><span className="font-bold text-primary-c">{data.stats.totalPrescriptions}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-secondary-c flex items-center gap-2"><TrendingUp size={16} className="text-amber-500" /> Lab Reports</span><span className="font-bold text-primary-c">{data.stats.totalLabReports}</span></div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
