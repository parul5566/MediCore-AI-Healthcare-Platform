'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Pill, FlaskConical, Activity, HeartPulse, TrendingUp, Clock, Stethoscope, ChevronRight, Video, MapPin } from 'lucide-react'
import { StatCard, SectionCard, EmptyState, StatusBadge, PageHeader } from '@/components/ui-components'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart, BarChart, Bar } from 'recharts'

interface DashboardData {
  patient: {
    id: string
    bloodGroup: string | null
    height: number | null
    weight: number | null
    dateOfBirth: Date | null
    gender: string | null
  }
  upcomingAppointments: Array<{
    id: string
    date: string
    time: string
    status: string
    type: string
    reason: string | null
    doctor: { user: { firstName: string; lastName: string }; specialization: string }
  }>
  pastAppointments: Array<{
    id: string
    date: string
    status: string
    reason: string | null
    diagnosis: string | null
    doctor: { user: { firstName: string; lastName: string }; specialization: string }
  }>
  prescriptions: Array<{
    id: string
    date: string
    status: string
    notes: string | null
    doctor: { user: { firstName: string; lastName: string } }
  }>
  labReports: Array<{
    id: string
    testName: string
    status: string
    date: string
    summary: string | null
  }>
  metrics: Array<{
    id: string
    type: string
    value: number
    secondaryValue: number | null
    unit: string
    date: string
  }>
  stats: {
    totalAppointments: number
    upcoming: number
    activePrescriptions: number
    totalLabReports: number
  }
}

export default function PatientDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/patient/dashboard')
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-5">
            <div className="skeleton h-12 w-12 rounded-xl mb-3" />
            <div className="skeleton h-8 w-20 mb-2" />
            <div className="skeleton h-4 w-32" />
          </div>
        ))}
      </div>
    )
  }

  if (!data) return null

  // Prepare health metrics chart data (last 7 days, reversed)
  const chartMetrics = [...data.metrics].reverse()
  const heartRateData = chartMetrics.filter(m => m.type === 'HEART_RATE').map(m => ({
    date: new Date(m.date).toLocaleDateString('en-US', { weekday: 'short' }),
    value: m.value,
  }))
  const stepsData = chartMetrics.filter(m => m.type === 'STEPS').map(m => ({
    date: new Date(m.date).toLocaleDateString('en-US', { weekday: 'short' }),
    value: m.value,
  }))

  const todayMetrics = data.metrics.slice(0, 7)
  const getMetric = (type: string) => todayMetrics.find(m => m.type === type)

  return (
    <div>
      <PageHeader
        title="Health Dashboard"
        subtitle="Your health overview at a glance"
        action={
          <Link href="/dashboard/patient/appointments" className="btn-primary flex items-center gap-2">
            <Calendar size={18} />
            Book Appointment
          </Link>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Upcoming Appointments" value={data.stats.upcoming} icon={Calendar} color="from-blue-500 to-cyan-500" />
        <StatCard title="Active Prescriptions" value={data.stats.activePrescriptions} icon={Pill} color="from-purple-500 to-pink-500" />
        <StatCard title="Lab Reports" value={data.stats.totalLabReports} icon={FlaskConical} color="from-emerald-500 to-teal-500" />
        <StatCard title="Total Visits" value={data.stats.totalAppointments} icon={Stethoscope} color="from-amber-500 to-orange-500" />
      </div>

      {/* Health metrics overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {[
          { type: 'HEART_RATE', icon: HeartPulse, label: 'Heart Rate', color: 'text-rose-500', unit: 'bpm' },
          { type: 'BLOOD_PRESSURE', icon: Activity, label: 'Blood Pressure', color: 'text-blue-500', unit: 'mmHg' },
          { type: 'STEPS', icon: TrendingUp, label: 'Steps', color: 'text-emerald-500', unit: '' },
          { type: 'SLEEP', icon: Clock, label: 'Sleep', color: 'text-purple-500', unit: 'hrs' },
          { type: 'WEIGHT', icon: Activity, label: 'Weight', color: 'text-amber-500', unit: 'kg' },
          { type: 'GLUCOSE', icon: Activity, label: 'Glucose', color: 'text-cyan-500', unit: 'mg/dL' },
        ].map(m => {
          const metric = getMetric(m.type)
          const value = metric ? (m.type === 'BLOOD_PRESSURE' && metric.secondaryValue ? `${metric.value}/${metric.secondaryValue}` : metric.value) : '--'
          return (
            <div key={m.type} className="glass-card p-4 text-center">
              <m.icon className={`mx-auto mb-2 ${m.color}`} size={24} />
              <div className="text-xl font-bold text-primary-c">{value}</div>
              <div className="text-xs text-muted-c mt-1">{m.label}</div>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Heart Rate Chart */}
        <SectionCard title="Heart Rate Trend" action={<span className="badge badge-danger">Last 7 days</span>}>
          {heartRateData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={heartRateData}>
                <defs>
                  <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} fill="url(#hrGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={HeartPulse} title="No data available" />
          )}
        </SectionCard>

        {/* Steps Chart */}
        <SectionCard title="Daily Steps" action={<span className="badge badge-success">Last 7 days</span>}>
          {stepsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stepsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={TrendingUp} title="No data available" />
          )}
        </SectionCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <SectionCard
          title="Upcoming Appointments"
          action={<Link href="/dashboard/patient/appointments" className="text-sm text-accent font-semibold flex items-center gap-1 hover:underline">View all <ChevronRight size={14} /></Link>}
        >
          {data.upcomingAppointments.length === 0 ? (
            <EmptyState icon={Calendar} title="No upcoming appointments" description="Book an appointment with one of our specialists." />
          ) : (
            <div className="space-y-3">
              {data.upcomingAppointments.slice(0, 3).map(apt => (
                <div key={apt.id} className="glass-card p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    {apt.type === 'VIDEO' ? <Video className="text-white" size={20} /> : <MapPin className="text-white" size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-primary-c truncate">{apt.doctor.user.firstName} {apt.doctor.user.lastName}</div>
                    <div className="text-sm text-secondary-c">{apt.doctor.specialization}</div>
                    <div className="text-xs text-muted-c mt-1">
                      {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {apt.time}
                    </div>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Recent Lab Reports */}
        <SectionCard
          title="Recent Lab Reports"
          action={<Link href="/dashboard/patient/lab-reports" className="text-sm text-accent font-semibold flex items-center gap-1 hover:underline">View all <ChevronRight size={14} /></Link>}
        >
          {data.labReports.length === 0 ? (
            <EmptyState icon={FlaskConical} title="No lab reports yet" />
          ) : (
            <div className="space-y-3">
              {data.labReports.slice(0, 3).map(report => (
                <div key={report.id} className="glass-card p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                      <FlaskConical className="text-white" size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-primary-c truncate">{report.testName}</div>
                      <div className="text-xs text-muted-c">{new Date(report.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <StatusBadge status={report.status} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
