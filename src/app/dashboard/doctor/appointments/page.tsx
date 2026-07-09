'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, Video, MapPin, Check, X, FileText, Loader2, User } from 'lucide-react'
import { PageHeader, StatusBadge, EmptyState, SectionCard } from '@/components/ui-components'

interface Appointment {
  id: string
  date: string
  time: string
  duration: number
  status: string
  type: string
  reason: string | null
  symptoms: string | null
  notes: string | null
  diagnosis: string | null
  patient: { user: { firstName: string; lastName: string }; bloodGroup: string | null; gender: string | null; dateOfBirth: Date | null }
}

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showNotes, setShowNotes] = useState<string | null>(null)

  const fetchApts = () => fetch('/api/appointments').then(r => r.json()).then(d => setAppointments(Array.isArray(d) ? d : [])).finally(() => setLoading(false))

  useEffect(() => { fetchApts() }, [])

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) fetchApts()
  }

  const saveNotes = async (id: string, notes: string, diagnosis: string) => {
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'COMPLETED', notes, diagnosis }),
    })
    if (res.ok) {
      setShowNotes(null)
      fetchApts()
    }
  }

  const filtered = appointments.filter(a => filter === 'all' || a.status === filter)

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>

  return (
    <div>
      <PageHeader title="Appointments" subtitle="Manage your patient consultations" />

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
        <div className="space-y-3">
          {filtered.map(apt => (
            <div key={apt.id} className="glass-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <User className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-primary-c">{apt.patient.user.firstName} {apt.patient.user.lastName}</h3>
                    <StatusBadge status={apt.status} />
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-c flex-wrap">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {apt.time}</span>
                    <span className="flex items-center gap-1">{apt.type === 'VIDEO' ? <Video size={14} /> : <MapPin size={14} />} {apt.type.replace('_', ' ')}</span>
                  </div>
                  {apt.reason && <p className="text-sm text-secondary-c mt-2">Reason: {apt.reason}</p>}
                  {apt.symptoms && <p className="text-sm text-muted-c mt-1">Symptoms: {apt.symptoms}</p>}
                  {apt.diagnosis && <div className="mt-3 p-3 rounded-xl bg-[var(--bg-glass)]"><p className="text-sm font-medium text-secondary-c">Diagnosis: <span className="text-primary-c">{apt.diagnosis}</span></p>{apt.notes && <p className="text-sm text-muted-c mt-1">{apt.notes}</p>}</div>}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {apt.status === 'PENDING' && <button onClick={() => updateStatus(apt.id, 'CONFIRMED')} className="btn-primary text-sm flex items-center gap-1"><Check size={14} /> Confirm</button>}
                    {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                      <>
                        <button onClick={() => setShowNotes(apt.id)} className="btn-secondary text-sm flex items-center gap-1"><FileText size={14} /> Complete & Notes</button>
                        <button onClick={() => updateStatus(apt.id, 'CANCELLED')} className="btn-danger text-sm flex items-center gap-1"><X size={14} /> Cancel</button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {showNotes === apt.id && (
                <NotesForm initialNotes={apt.notes || ''} initialDiagnosis={apt.diagnosis || ''} onSave={(notes, diag) => saveNotes(apt.id, notes, diag)} onCancel={() => setShowNotes(null)} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NotesForm({ initialNotes, initialDiagnosis, onSave, onCancel }: { initialNotes: string; initialDiagnosis: string; onSave: (n: string, d: string) => void; onCancel: () => void }) {
  const [notes, setNotes] = useState(initialNotes)
  const [diagnosis, setDiagnosis] = useState(initialDiagnosis)

  return (
    <div className="mt-4 p-4 rounded-xl bg-[var(--bg-glass)] animate-fade-in">
      <h4 className="font-semibold text-primary-c mb-3">Clinical Notes & Diagnosis</h4>
      <div className="space-y-3">
        <input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Diagnosis..." className="input-field" />
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Clinical notes, observations, treatment plan..." className="input-field min-h-[100px] resize-none" />
        <div className="flex gap-2">
          <button onClick={() => onSave(notes, diagnosis)} className="btn-primary text-sm flex-1">Complete Visit</button>
          <button onClick={onCancel} className="btn-secondary text-sm">Cancel</button>
        </div>
      </div>
    </div>
  )
}
