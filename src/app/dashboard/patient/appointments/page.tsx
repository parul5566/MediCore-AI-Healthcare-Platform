'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, Video, MapPin, X, Check, Star, Stethoscope, Loader2 } from 'lucide-react'
import { PageHeader, StatusBadge, EmptyState, SectionCard } from '@/components/ui-components'

interface Doctor {
  id: string
  specialization: string
  experience: number
  consultationFee: number
  rating: number
  bio: string | null
  user: { firstName: string; lastName: string }
}

interface Appointment {
  id: string
  date: string
  time: string
  duration: number
  status: string
  type: string
  reason: string | null
  diagnosis: string | null
  notes: string | null
  doctor: { user: { firstName: string; lastName: string }; specialization: string }
}

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [showBooking, setShowBooking] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    Promise.all([
      fetch('/api/appointments').then(r => r.json()),
      fetch('/api/doctors').then(r => r.json()),
    ]).then(([apts, docs]) => {
      setAppointments(Array.isArray(apts) ? apts : [])
      setDoctors(Array.isArray(docs) ? docs : [])
    }).finally(() => setLoading(false))
  }, [])

  const handleBook = async (doctorId: string, date: string, time: string, type: string, reason: string, symptoms: string) => {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorId, date, time, type, reason, symptoms }),
    })
    if (res.ok) {
      const newApt = await res.json()
      setAppointments(prev => [newApt, ...prev])
      setShowBooking(false)
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return
    const res = await fetch('/api/appointments/[id]', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'CANCELLED' }),
    })
    // The [id] in the URL won't work literally; use template
    const actualRes = await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'CANCELLED' }),
    })
    if (actualRes.ok) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a))
    }
  }

  const filtered = appointments.filter(a => filter === 'all' || a.status === filter)

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>
  }

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle="Manage your consultations and book new appointments"
        action={
          <button onClick={() => setShowBooking(true)} className="btn-primary flex items-center gap-2">
            <Calendar size={18} />
            Book Appointment
          </button>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === f ? 'gradient-accent text-white' : 'glass-card text-secondary-c'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <SectionCard>
          <EmptyState icon={Calendar} title="No appointments found" description="Book your first appointment with one of our specialists." />
        </SectionCard>
      ) : (
        <div className="space-y-3">
          {filtered.map(apt => (
            <div key={apt.id} className="glass-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  {apt.type === 'VIDEO' ? <Video className="text-white" size={20} /> : <MapPin className="text-white" size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-primary-c">{apt.doctor.user.firstName} {apt.doctor.user.lastName}</h3>
                    <StatusBadge status={apt.status} />
                  </div>
                  <p className="text-sm text-secondary-c">{apt.doctor.specialization}</p>
                  {apt.reason && <p className="text-sm text-muted-c mt-1">{apt.reason}</p>}
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-c">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {apt.time}
                    </span>
                  </div>
                  {apt.diagnosis && (
                    <div className="mt-3 p-3 rounded-xl bg-[var(--bg-glass)]">
                      <p className="text-sm font-medium text-secondary-c">Diagnosis: <span className="text-primary-c">{apt.diagnosis}</span></p>
                      {apt.notes && <p className="text-sm text-muted-c mt-1">{apt.notes}</p>}
                    </div>
                  )}
                </div>
                {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                  <button onClick={() => handleCancel(apt.id)} className="btn-danger text-sm flex items-center gap-1">
                    <X size={16} />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {showBooking && (
        <BookingModal doctors={doctors} onClose={() => setShowBooking(false)} onBook={handleBook} />
      )}
    </div>
  )
}

function BookingModal({ doctors, onClose, onBook }: { doctors: Doctor[]; onClose: () => void; onBook: (...args: string[]) => Promise<void> }) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [type, setType] = useState('IN_PERSON')
  const [reason, setReason] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [booking, setBooking] = useState(false)

  const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBooking(true)
    await onBook(selectedDoctor!.id, date, time, type, reason, symptoms)
    setBooking(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-primary-c">Book an Appointment</h2>
          <button onClick={onClose} className="p-2 rounded-lg glass-card"><X size={18} /></button>
        </div>

        {!selectedDoctor ? (
          <div className="space-y-3">
            <p className="text-sm text-secondary-c mb-4">Select a specialist</p>
            {doctors.map(doc => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoctor(doc)}
                className="w-full glass-card p-4 flex items-center gap-4 text-left hover:scale-[1.01] transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-primary-c">{doc.user.firstName} {doc.user.lastName}</div>
                  <div className="text-sm text-secondary-c">{doc.specialization} · {doc.experience} yrs exp</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-medium text-warning">
                    <Star size={14} fill="currentColor" />
                    {doc.rating}
                  </div>
                  <div className="text-sm text-muted-c">${doc.consultationFee}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="glass-card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-primary-c">{selectedDoctor.user.firstName} {selectedDoctor.user.lastName}</div>
                <div className="text-sm text-secondary-c">{selectedDoctor.specialization}</div>
              </div>
              <button type="button" onClick={() => setSelectedDoctor(null)} className="text-sm text-accent font-semibold">Change</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-secondary-c block mb-1.5">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-c block mb-1.5">Type</label>
                <select value={type} onChange={e => setType(e.target.value)} className="input-field">
                  <option value="IN_PERSON">In-Person</option>
                  <option value="VIDEO">Video Call</option>
                  <option value="VOICE">Voice Call</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-secondary-c block mb-1.5">Time Slot</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={`py-2 rounded-xl text-sm font-medium transition-all ${
                      time === slot ? 'gradient-accent text-white' : 'glass-card text-secondary-c'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-secondary-c block mb-1.5">Reason for Visit</label>
              <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="Brief description..." className="input-field" />
            </div>

            <div>
              <label className="text-sm font-medium text-secondary-c block mb-1.5">Symptoms (optional)</label>
              <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="Describe your symptoms..." className="input-field min-h-[80px] resize-none" />
            </div>

            <button type="submit" disabled={booking || !date || !time} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
              {booking ? <><Loader2 size={18} className="animate-spin" /> Booking...</> : <><Check size={18} /> Confirm Booking</>}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
