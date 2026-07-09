'use client'

import { useEffect, useState } from 'react'
import { FlaskConical, Loader2, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { PageHeader, EmptyState, StatusBadge, SectionCard } from '@/components/ui-components'

interface LabReport {
  id: string
  testName: string
  category: string
  results: any
  summary: string | null
  status: string
  date: string
  doctor: { user: { firstName: string; lastName: string } } | null
}

const resultIcon: Record<string, any> = {
  NORMAL: CheckCircle,
  HIGH: AlertTriangle,
  LOW: AlertTriangle,
  ABNORMAL: XCircle,
}

const resultColor: Record<string, string> = {
  NORMAL: 'text-success',
  HIGH: 'text-warning',
  LOW: 'text-info',
  ABNORMAL: 'text-danger',
}

export default function LabReports() {
  const [reports, setReports] = useState<LabReport[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/lab-reports').then(r => r.json()).then(d => setReports(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>

  return (
    <div>
      <PageHeader title="Lab Reports" subtitle="Your laboratory test results and reports" />

      {reports.length === 0 ? (
        <SectionCard><EmptyState icon={FlaskConical} title="No lab reports yet" /></SectionCard>
      ) : (
        <div className="space-y-4">
          {reports.map(report => {
            const results = typeof report.results === 'string' ? JSON.parse(report.results) : report.results
            const isExpanded = expanded === report.id
            const Icon = FlaskConical
            return (
              <div key={report.id} className="glass-card p-5">
                <button onClick={() => setExpanded(isExpanded ? null : report.id)} className="w-full flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Icon className="text-white" size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-primary-c">{report.testName}</div>
                      <div className="text-xs text-muted-c">{new Date(report.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={report.status} />
                    {isExpanded ? <ChevronUp size={18} className="text-muted-c" /> : <ChevronDown size={18} className="text-muted-c" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-4 animate-fade-in">
                    {report.summary && (
                      <div className="p-3 rounded-xl bg-[var(--bg-glass)] mb-4">
                        <p className="text-sm font-medium text-secondary-c">Summary: <span className="text-primary-c">{report.summary}</span></p>
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-muted-c border-b border-c">
                            <th className="pb-2 font-medium">Parameter</th>
                            <th className="pb-2 font-medium">Value</th>
                            <th className="pb-2 font-medium">Range</th>
                            <th className="pb-2 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.map((r: any, i: number) => {
                            const RIcon = resultIcon[r.status] || CheckCircle
                            return (
                              <tr key={i} className="border-b border-c last:border-0">
                                <td className="py-3 text-secondary-c">{r.parameter}</td>
                                <td className="py-3 font-medium text-primary-c">{r.value} {r.unit}</td>
                                <td className="py-3 text-muted-c">{r.referenceRange}</td>
                                <td className="py-3">
                                  <span className={`flex items-center gap-1 font-medium ${resultColor[r.status] || 'text-secondary-c'}`}>
                                    <RIcon size={14} />
                                    {r.status}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {report.doctor && <p className="text-xs text-muted-c mt-3">Ordered by Dr. {report.doctor.user.firstName} {report.doctor.user.lastName}</p>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
