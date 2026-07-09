'use client'

import { useEffect, useState } from 'react'
import { Users, Loader2, X, FileText, Pill, FlaskConical, Activity, ChevronRight } from 'lucide-react'
import { PageHeader, EmptyState, SectionCard, StatusBadge } from '@/components/ui-components'

interface Patient {
  id: string
  user: { firstName: string; lastName: string; email: string; phone: string | null }
  dateOfBirth: string | null
  gender: string | null
  bloodGroup: string | null
  address: string | null
  height: number | null
  weight: number | null
}

export default function DoctorPatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patientData, setPatientData] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    fetch('/api/doctor/dashboard').then(r => r.json()).then(d => setPatients(d.patients || [])).finally(() => setLoading(false))
  }, [])

  const viewPatient = async (p: Patient) => {
    setSelectedPatient(p)
    setLoadingDetail(true)
    const [records, prescriptions, labReports] = await Promise.all([
      fetch(`/api/medical-records?patientId=${p.id}`).then(r => r.json()),
      fetch('/api/prescriptions').then(r => r.json()),
      fetch('/api/lab-reports').then(r => r.json()),
    ])
    setPatientData({
      records: Array.isArray(records) ? records.filter((r: any) => r.patientId === p.id) : [],
      prescriptions: Array.isArray(prescriptions) ? prescriptions.filter((rx: any) => rx.patientId === p.id) : [],
      labReports: Array.isArray(labReports) ? labReports.filter((l: any) => l.patientId === p.id) : [],
    })
    setLoadingDetail(false)
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>

  return (
    <div>
      <PageHeader title="My Patients" subtitle="View patient records and medical history" />

      {patients.length === 0 ? (
        <SectionCard><EmptyState icon={Users} title="No patients yet" /></SectionCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map(p => {
            const age = p.dateOfBirth ? Math.floor((Date.now() - new Date(p.dateOfBirth).getTime()) / 31536000000) : null
            return (
              <button key={p.id} onClick={() => viewPatient(p)} className="glass-card p-5 text-left hover:scale-[1.02] transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold">{p.user.firstName[0]}{p.user.lastName[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-primary-c truncate">{p.user.firstName} {p.user.lastName}</div>
                    <div className="text-xs text-muted-c">{age ? `${age} yrs` : ''} · {p.gender || 'N/A'}</div>
                  </div>
                  <ChevronRight size={18} className="text-muted-c" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {p.bloodGroup && <span className="badge badge-danger">{p.bloodGroup}</span>}
                  {p.height && <span className="badge badge-accent">{p.height}cm</span>}
                  {p.weight && <span className="badge badge-info">{p.weight}kg</span>}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Patient detail modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedPatient(null)}>
          <div className="glass-card p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold">{selectedPatient.user.firstName[0]}{selectedPatient.user.lastName[0]}</div>
                <div>
                  <h2 className="text-xl font-bold text-primary-c">{selectedPatient.user.firstName} {selectedPatient.user.lastName}</h2>
                  <p className="text-sm text-muted-c">{selectedPatient.user.email} · {selectedPatient.user.phone || 'No phone'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="p-2 rounded-lg glass-card"><X size={18} /></button>
            </div>

            {loadingDetail ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-accent" size={24} /></div>
            ) : patientData ? (
              <div className="space-y-6">
                {/* Medical Records */}
                <SectionCard title="Medical History">
                  {patientData.records.length === 0 ? <p className="text-sm text-muted-c">No records</p> : (
                    <div className="space-y-2">
                      {patientData.records.map((r: any) => (
                        <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg bg-[var(--bg-glass)]">
                          <FileText size={16} className="text-accent" />
                          <div className="flex-1"><span className="font-medium text-primary-c text-sm">{r.title}</span><span className="text-xs text-muted-c ml-2">{r.type}</span></div>
                          <span className="text-xs text-muted-c">{new Date(r.date).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>

                {/* Prescriptions */}
                <SectionCard title="Prescriptions">
                  {patientData.prescriptions.length === 0 ? <p className="text-sm text-muted-c">No prescriptions</p> : (
                    <div className="space-y-2">
                      {patientData.prescriptions.map((rx: any) => {
                        const meds = typeof rx.medications === 'string' ? JSON.parse(rx.medications) : rx.medications
                        return (
                          <div key={rx.id} className="p-3 rounded-lg bg-[var(--bg-glass)]">
                            <div className="flex items-center justify-between"><span className="font-medium text-primary-c text-sm">{meds.map((m: any) => m.name).join(', ')}</span><StatusBadge status={rx.status} /></div>
                            <span className="text-xs text-muted-c">{new Date(rx.date).toLocaleDateString()}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </SectionCard>

                {/* Lab Reports */}
                <SectionCard title="Lab Reports">
                  {patientData.labReports.length === 0 ? <p className="text-sm text-muted-c">No lab reports</p> : (
                    <div className="space-y-2">
                      {patientData.labReports.map((l: any) => (
                        <div key={l.id} className="flex items-center gap-3 p-2 rounded-lg bg-[var(--bg-glass)]">
                          <FlaskConical size={16} className="text-emerald-500" />
                          <div className="flex-1"><span className="font-medium text-primary-c text-sm">{l.testName}</span></div>
                          <StatusBadge status={l.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
