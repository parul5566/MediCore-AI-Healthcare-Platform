'use client'

import { useEffect, useState } from 'react'
import { Users, Plus, X, Loader2, Phone, Heart } from 'lucide-react'
import { PageHeader, EmptyState, SectionCard } from '@/components/ui-components'

interface FamilyMember {
  id: string
  name: string
  relationship: string
  dateOfBirth: string | null
  gender: string | null
  bloodGroup: string | null
  phone: string | null
  medicalInfo: string | null
}

export default function FamilyMembers() {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  const fetchMembers = () => fetch('/api/family-members').then(r => r.json()).then(d => { setMembers(Array.isArray(d) ? d : []) }).finally(() => setLoading(false))

  useEffect(() => { fetchMembers() }, [])

  const handleAdd = async (data: any) => {
    const res = await fetch('/api/family-members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setShowAdd(false)
      fetchMembers()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this family member?')) return
    await fetch(`/api/family-members?id=${id}`, { method: 'DELETE' })
    fetchMembers()
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>

  return (
    <div>
      <PageHeader
        title="Family Members"
        subtitle="Manage health information for your family"
        action={<button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Member</button>}
      />

      {members.length === 0 ? (
        <SectionCard><EmptyState icon={Users} title="No family members added" description="Add family members to track their health information." /></SectionCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(m => (
            <div key={m.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                  <Users className="text-white" size={20} />
                </div>
                <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg glass-card text-muted-c hover:text-danger"><X size={16} /></button>
              </div>
              <h3 className="font-semibold text-primary-c">{m.name}</h3>
              <p className="text-sm text-secondary-c">{m.relationship}</p>
              <div className="mt-3 space-y-1 text-xs text-muted-c">
                {m.dateOfBirth && <p>Born: {new Date(m.dateOfBirth).toLocaleDateString()}</p>}
                {m.gender && <p>Gender: {m.gender}</p>}
                {m.bloodGroup && <p className="flex items-center gap-1"><Heart size={12} className="text-danger" /> Blood: {m.bloodGroup}</p>}
                {m.phone && <p className="flex items-center gap-1"><Phone size={12} /> {m.phone}</p>}
                {m.medicalInfo && <p className="mt-2 p-2 rounded-lg bg-[var(--bg-glass)]">{m.medicalInfo}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddMemberModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  )
}

function AddMemberModal({ onClose, onAdd }: { onClose: () => void; onAdd: (data: any) => Promise<void> }) {
  const [form, setForm] = useState({ name: '', relationship: '', dateOfBirth: '', gender: 'MALE', bloodGroup: '', phone: '', medicalInfo: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onAdd(form)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="glass-card p-6 w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-primary-c">Add Family Member</h2>
          <button onClick={onClose} className="p-2 rounded-lg glass-card"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required placeholder="Full name" className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input required placeholder="Relationship (e.g. Spouse, Child)" className="input-field" value={form.relationship} onChange={e => setForm({ ...form, relationship: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" placeholder="Date of birth" className="input-field" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
            <select className="input-field" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select className="input-field" value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
              <option value="">Blood group</option>
              {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <input placeholder="Phone" className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <textarea placeholder="Medical info (optional)" className="input-field min-h-[60px] resize-none" value={form.medicalInfo} onChange={e => setForm({ ...form, medicalInfo: e.target.value })} />
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Adding...' : 'Add Member'}</button>
        </form>
      </div>
    </div>
  )
}
