'use client'

import { useEffect, useState } from 'react'
import { Stethoscope, Loader2, CheckCircle, XCircle, Star, Award } from 'lucide-react'
import { PageHeader, StatusBadge, EmptyState } from '@/components/ui-components'

interface Doctor {
  id: string
  specialization: string
  licenseNumber: string
  experience: number
  consultationFee: number
  rating: number
  verified: boolean
  bio: string | null
  qualification: string | null
  user: { firstName: string; lastName: string; email: string; phone: string | null }
}

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchDoctors = () => fetch('/api/admin/doctors').then(r => r.json()).then(d => setDoctors(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  useEffect(() => { fetchDoctors() }, [])

  const handleAction = async (doctorId: string, action: string) => {
    await fetch('/api/admin/doctors', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorId, action }),
    })
    fetchDoctors()
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>

  const filtered = doctors.filter(d => filter === 'all' || (filter === 'verified' ? d.verified : !d.verified))

  return (
    <div>
      <PageHeader title="Doctor Management" subtitle="Verify and manage doctor profiles" />

      <div className="flex gap-2 mb-6">
        {['all', 'verified', 'unverified'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? 'gradient-accent text-white' : 'glass-card text-secondary-c'}`}>
            {f === 'all' ? 'All Doctors' : f === 'verified' ? 'Verified' : 'Pending'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-6"><EmptyState icon={Stethoscope} title="No doctors found" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(d => (
            <div key={d.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">{d.user.firstName[0]}{d.user.lastName[0]}</div>
                  <div><div className="font-semibold text-primary-c">{d.user.firstName} {d.user.lastName}</div><div className="text-xs text-muted-c">{d.specialization}</div></div>
                </div>
                {d.verified ? <Award className="text-success" size={20} /> : <span className="badge badge-warning">Pending</span>}
              </div>

              <div className="space-y-1 text-xs text-muted-c mb-4">
                <p>📧 {d.user.email}</p>
                <p>🔑 License: {d.licenseNumber}</p>
                <p>⭐ {d.rating} · {d.experience} yrs experience</p>
                <p>💰 ${d.consultationFee} consultation</p>
                {d.qualification && <p>🎓 {d.qualification}</p>}
              </div>

              {d.bio && <p className="text-xs text-secondary-c mb-3 line-clamp-2">{d.bio}</p>}

              <div className="flex gap-2">
                {!d.verified ? (
                  <button onClick={() => handleAction(d.id, 'verify')} className="btn-primary text-sm flex-1 flex items-center justify-center gap-1"><CheckCircle size={14} /> Verify</button>
                ) : (
                  <button onClick={() => handleAction(d.id, 'unverify')} className="btn-danger text-sm flex-1 flex items-center justify-center gap-1"><XCircle size={14} /> Unverify</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
