'use client'

import { useEffect, useState } from 'react'
import { Pill, Loader2, Plus, X, Send, Users } from 'lucide-react'
import { PageHeader, EmptyState, SectionCard, StatusBadge } from '@/components/ui-components'

interface Patient {
  id: string
  user: { firstName: string; lastName: string }
}

interface Prescription {
  id: string
  date: string
  status: string
  notes: string | null
  medications: any
  patient: { user: { firstName: string; lastName: string } }
}

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const fetchData = async () => {
    const [rxRes, dashRes] = await Promise.all([
      fetch('/api/prescriptions').then(r => r.json()),
      fetch('/api/doctor/dashboard').then(r => r.json()),
    ])
    setPrescriptions(Array.isArray(rxRes) ? rxRes : [])
    setPatients(dashRes.patients || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleCreate = async (patientId: string, medications: any[], notes: string) => {
    const res = await fetch('/api/prescriptions/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, medications, notes }),
    })
    if (res.ok) {
      setShowCreate(false)
      fetchData()
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>

  return (
    <div>
      <PageHeader title="Prescriptions" subtitle="Create and manage e-prescriptions" action={
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> New Prescription</button>
      } />

      {prescriptions.length === 0 ? (
        <SectionCard><EmptyState icon={Pill} title="No prescriptions yet" description="Create your first e-prescription." /></SectionCard>
      ) : (
        <div className="space-y-4">
          {prescriptions.map(rx => {
            const meds = typeof rx.medications === 'string' ? JSON.parse(rx.medications) : rx.medications
            return (
              <div key={rx.id} className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"><Pill className="text-white" size={18} /></div>
                    <div><div className="font-semibold text-primary-c">{rx.patient.user.firstName} {rx.patient.user.lastName}</div><div className="text-xs text-muted-c">{new Date(rx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
                  </div>
                  <StatusBadge status={rx.status} />
                </div>
                <div className="space-y-2">
                  {meds.map((med: any, i: number) => (
                    <div key={i} className="glass-card p-3"><div className="flex items-center justify-between flex-wrap gap-2"><div className="font-medium text-primary-c">{med.name} <span className="text-secondary-c">{med.dosage}</span></div><div className="text-xs text-muted-c">{med.frequency} · {med.duration}</div></div></div>
                  ))}
                </div>
                {rx.notes && <div className="mt-3 p-3 rounded-xl bg-[var(--bg-glass)]"><p className="text-sm text-secondary-c">{rx.notes}</p></div>}
              </div>
            )
          })}
        </div>
      )}

      {showCreate && <CreatePrescriptionModal patients={patients} onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
    </div>
  )
}

function CreatePrescriptionModal({ patients, onClose, onCreate }: { patients: Patient[]; onClose: () => void; onCreate: (pid: string, meds: any[], notes: string) => Promise<void> }) {
  const [patientId, setPatientId] = useState('')
  const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const addMed = () => setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }])
  const removeMed = (i: number) => setMedications(medications.filter((_, idx) => idx !== i))
  const updateMed = (i: number, field: string, value: string) => setMedications(medications.map((m, idx) => idx === i ? { ...m, [field]: value } : m))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onCreate(patientId, medications.filter(m => m.name), notes)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-primary-c">New e-Prescription</h2>
          <button onClick={onClose} className="p-2 rounded-lg glass-card"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-secondary-c block mb-1.5">Patient</label>
            <select value={patientId} onChange={e => setPatientId(e.target.value)} required className="input-field">
              <option value="">Select patient...</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.user.firstName} {p.user.lastName}</option>)}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-secondary-c">Medications</label>
              <button type="button" onClick={addMed} className="text-sm text-accent font-semibold flex items-center gap-1"><Plus size={14} /> Add Medication</button>
            </div>
            <div className="space-y-3">
              {medications.map((med, i) => (
                <div key={i} className="glass-card p-3 relative">
                  {medications.length > 1 && <button type="button" onClick={() => removeMed(i)} className="absolute top-2 right-2 p-1 rounded-lg text-muted-c hover:text-danger"><X size={14} /></button>}
                  <input value={med.name} onChange={e => updateMed(i, 'name', e.target.value)} placeholder="Medication name" className="input-field mb-2" required />
                  <div className="grid grid-cols-3 gap-2">
                    <input value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} placeholder="10mg" className="input-field text-sm" />
                    <input value={med.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)} placeholder="Twice daily" className="input-field text-sm" />
                    <input value={med.duration} onChange={e => updateMed(i, 'duration', e.target.value)} placeholder="30 days" className="input-field text-sm" />
                  </div>
                  <input value={med.instructions} onChange={e => updateMed(i, 'instructions', e.target.value)} placeholder="Instructions (optional)" className="input-field mt-2 text-sm" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-secondary-c block mb-1.5">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes for the patient..." className="input-field min-h-[60px] resize-none" />
          </div>

          <button type="submit" disabled={saving || !patientId} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {saving ? 'Creating...' : 'Issue Prescription'}
          </button>
        </form>
      </div>
    </div>
  )
}
