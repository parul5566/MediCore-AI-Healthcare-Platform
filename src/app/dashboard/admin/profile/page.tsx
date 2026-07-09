'use client'

import { useEffect, useState } from 'react'
import { Save, Loader2, Mail, Phone, MapPin, User, Calendar, Droplet, Ruler } from 'lucide-react'
import { PageHeader, SectionCard } from '@/components/ui-components'
import { useCurrentUser } from '@/hooks/use-current-user'

export default function ProfilePage() {
  const { user, loading: userLoading } = useCurrentUser()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(d => setProfile(d)).finally(() => setLoading(false))
  }, [])

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    // patient
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContact: '',
    height: '',
    weight: '',
    // doctor
    bio: '',
    consultationFee: '',
    qualification: '',
  })

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        address: profile.patient?.address || profile.doctor?.bio || '',
        city: profile.patient?.city || '',
        state: profile.patient?.state || '',
        zipCode: profile.patient?.zipCode || '',
        emergencyContact: profile.patient?.emergencyContact || '',
        height: profile.patient?.height?.toString() || '',
        weight: profile.patient?.weight?.toString() || '',
        bio: profile.doctor?.bio || '',
        consultationFee: profile.doctor?.consultationFee?.toString() || '',
        qualification: profile.doctor?.qualification || '',
      })
    }
  }, [profile])

  const handleSave = async () => {
    setSaving(true)
    const data: any = {
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
    }

    if (user?.role === 'PATIENT') {
      data.patientData = {
        address: form.address,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        emergencyContact: form.emergencyContact,
        height: form.height ? parseFloat(form.height) : null,
        weight: form.weight ? parseFloat(form.weight) : null,
      }
    } else if (user?.role === 'DOCTOR') {
      data.doctorData = {
        bio: form.bio,
        consultationFee: form.consultationFee ? parseFloat(form.consultationFee) : null,
        qualification: form.qualification,
      }
    }

    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (userLoading || loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>

  const role = user?.role || 'PATIENT'

  return (
    <div>
      <PageHeader title="Profile Settings" subtitle="Manage your personal information and preferences" action={
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> {saved ? 'Saved!' : 'Save Changes'}</>}
        </button>
      } />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="glass-card p-6 text-center">
          <div className={`w-24 h-24 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white font-bold text-3xl ${
            role === 'PATIENT' ? 'bg-gradient-to-br from-rose-500 to-pink-500' :
            role === 'DOCTOR' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
            'bg-gradient-to-br from-violet-500 to-purple-500'
          }`}>
            {form.firstName[0]}{form.lastName[0]}
          </div>
          <h2 className="text-xl font-bold text-primary-c">{form.firstName} {form.lastName}</h2>
          <p className="text-sm text-muted-c">{user?.email}</p>
          <span className="badge badge-accent mt-2">{role}</span>
          {role === 'PATIENT' && profile?.patient && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="glass-card p-2"><span className="text-muted-c text-xs block">Blood</span><span className="font-bold text-primary-c">{profile.patient.bloodGroup || 'N/A'}</span></div>
              <div className="glass-card p-2"><span className="text-muted-c text-xs block">Gender</span><span className="font-bold text-primary-c">{profile.patient.gender || 'N/A'}</span></div>
            </div>
          )}
        </div>

        {/* Edit form */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Personal Information">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-c block mb-1.5">First Name</label>
                <div className="relative"><User size={18} className="absolute left-3 top-3 text-muted-c" /><input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="input-field pl-10" /></div>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-c block mb-1.5">Last Name</label>
                <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-c block mb-1.5">Email</label>
                <div className="relative"><Mail size={18} className="absolute left-3 top-3 text-muted-c" /><input value={user?.email || ''} disabled className="input-field pl-10 opacity-60" /></div>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-c block mb-1.5">Phone</label>
                <div className="relative"><Phone size={18} className="absolute left-3 top-3 text-muted-c" /><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field pl-10" placeholder="(555) 123-4567" /></div>
              </div>
            </div>
          </SectionCard>

          {role === 'PATIENT' && (
            <SectionCard title="Health & Contact Info">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-secondary-c block mb-1.5">Address</label>
                  <div className="relative"><MapPin size={18} className="absolute left-3 top-3 text-muted-c" /><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input-field pl-10" placeholder="123 Main St" /></div>
                </div>
                <div><label className="text-sm font-medium text-secondary-c block mb-1.5">City</label><input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="input-field" /></div>
                <div><label className="text-sm font-medium text-secondary-c block mb-1.5">State</label><input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="input-field" /></div>
                <div><label className="text-sm font-medium text-secondary-c block mb-1.5">ZIP</label><input value={form.zipCode} onChange={e => setForm({ ...form, zipCode: e.target.value })} className="input-field" /></div>
                <div><label className="text-sm font-medium text-secondary-c block mb-1.5">Emergency Contact</label><input value={form.emergencyContact} onChange={e => setForm({ ...form, emergencyContact: e.target.value })} className="input-field" placeholder="Phone number" /></div>
                <div><label className="text-sm font-medium text-secondary-c block mb-1.5">Height (cm)</label><div className="relative"><Ruler size={18} className="absolute left-3 top-3 text-muted-c" /><input type="number" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} className="input-field pl-10" /></div></div>
                <div><label className="text-sm font-medium text-secondary-c block mb-1.5">Weight (kg)</label><input type="number" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} className="input-field" /></div>
              </div>
            </SectionCard>
          )}

          {role === 'DOCTOR' && (
            <SectionCard title="Professional Information">
              <div className="space-y-4">
                <div><label className="text-sm font-medium text-secondary-c block mb-1.5">Qualification</label><input value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} className="input-field" placeholder="MD, PhD..." /></div>
                <div><label className="text-sm font-medium text-secondary-c block mb-1.5">Consultation Fee ($)</label><input type="number" value={form.consultationFee} onChange={e => setForm({ ...form, consultationFee: e.target.value })} className="input-field" /></div>
                <div><label className="text-sm font-medium text-secondary-c block mb-1.5">Bio</label><textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="input-field min-h-[100px] resize-none" placeholder="Tell patients about yourself..." /></div>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  )
}
