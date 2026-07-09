'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Phone, Briefcase, Stethoscope, Eye, EyeOff, Loader2, AlertCircle, ChevronRight } from 'lucide-react'
import Logo from '@/components/logo'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    // Doctor-specific
    specialization: '',
    licenseNumber: '',
    experience: '',
    // Patient-specific
    dateOfBirth: '',
    gender: 'MALE',
    bloodGroup: 'O+',
  })

  const updateForm = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload: Record<string, unknown> = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role,
      }

      if (role === 'DOCTOR') {
        payload.specialization = form.specialization
        payload.licenseNumber = form.licenseNumber
        payload.experience = parseInt(form.experience) || 0
      } else {
        payload.dateOfBirth = form.dateOfBirth
        payload.gender = form.gender
        payload.bloodGroup = form.bloodGroup
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      router.push(`/dashboard/${role.toLowerCase()}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Logo size="lg" />
          </Link>
        </div>

        <div className="glass-card p-8">
          <h1 className="text-2xl font-bold text-primary-c mb-1">Create Account</h1>
          <p className="text-secondary-c text-sm mb-6">Join MediCore AI Healthcare Platform</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-sm text-danger">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-secondary-c">I am a...</p>
              <button
                onClick={() => { setRole('PATIENT'); setStep(2) }}
                className="w-full glass-card p-4 flex items-center gap-4 text-left transition-all hover:scale-[1.02]"
              >
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                  <User className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-primary-c">Patient</div>
                  <div className="text-xs text-muted-c">Book appointments, access records, chat with AI</div>
                </div>
                <ChevronRight className="text-muted-c" size={20} />
              </button>
              <button
                onClick={() => { setRole('DOCTOR'); setStep(2) }}
                className="w-full glass-card p-4 flex items-center gap-4 text-left transition-all hover:scale-[1.02]"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-primary-c">Doctor</div>
                  <div className="text-xs text-muted-c">Manage patients, prescriptions, AI clinical tools</div>
                </div>
                <ChevronRight className="text-muted-c" size={20} />
              </button>
            </div>
          )}

          {/* Step 2: Account Details */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 mb-2">
                <div className="h-1.5 flex-1 rounded-full gradient-bg" />
                <div className="h-1.5 flex-1 rounded-full gradient-bg" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-secondary-c block mb-1.5">First Name</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => updateForm('firstName', e.target.value)}
                    required
                    className="input-field"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-c block mb-1.5">Last Name</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => updateForm('lastName', e.target.value)}
                    required
                    className="input-field"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-secondary-c block mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-c" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    required
                    className="input-field pl-10"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-secondary-c block mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-c" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => updateForm('password', e.target.value)}
                    required
                    minLength={6}
                    className="input-field pl-10 pr-10"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-c hover:text-secondary-c"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-secondary-c block mb-1.5">Phone</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-c" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateForm('phone', e.target.value)}
                    className="input-field pl-10"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {/* Doctor-specific fields */}
              {role === 'DOCTOR' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-secondary-c block mb-1.5">Specialization</label>
                    <div className="relative">
                      <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-c" />
                      <input
                        type="text"
                        value={form.specialization}
                        onChange={(e) => updateForm('specialization', e.target.value)}
                        required
                        className="input-field pl-10"
                        placeholder="e.g., Cardiology"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-c block mb-1.5">License Number</label>
                    <input
                      type="text"
                      value={form.licenseNumber}
                      onChange={(e) => updateForm('licenseNumber', e.target.value)}
                      required
                      className="input-field"
                      placeholder="Medical License Number"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-c block mb-1.5">Years of Experience</label>
                    <input
                      type="number"
                      value={form.experience}
                      onChange={(e) => updateForm('experience', e.target.value)}
                      className="input-field"
                      placeholder="5"
                    />
                  </div>
                </>
              )}

              {/* Patient-specific fields */}
              {role === 'PATIENT' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-secondary-c block mb-1.5">Date of Birth</label>
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => updateForm('dateOfBirth', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-secondary-c block mb-1.5">Gender</label>
                      <select
                        value={form.gender}
                        onChange={(e) => updateForm('gender', e.target.value)}
                        className="input-field"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-secondary-c block mb-1.5">Blood Group</label>
                      <select
                        value={form.bloodGroup}
                        onChange={(e) => updateForm('bloodGroup', e.target.value)}
                        className="input-field"
                      >
                        {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-[2] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-secondary-c">
          Already have an account?{' '}
          <Link href="/login" className="text-accent font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
