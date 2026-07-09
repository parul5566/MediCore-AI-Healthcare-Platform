'use client'

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color?: string
  trend?: string
}

export function StatCard({ title, value, icon: Icon, color = 'from-blue-500 to-cyan-500', trend }: StatCardProps) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="text-white" size={24} />
        </div>
        {trend && (
          <span className="text-xs font-semibold text-success badge badge-success">{trend}</span>
        )}
      </div>
      <div className="text-3xl font-bold text-primary-c">{value}</div>
      <div className="text-sm text-muted-c mt-1">{title}</div>
    </div>
  )
}

interface SectionCardProps {
  title?: string
  children: ReactNode
  action?: ReactNode
  className?: string
}

export function SectionCard({ title, children, action, className = '' }: SectionCardProps) {
  return (
    <div className={`glass-card p-6 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-primary-c">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-4">
        <Icon className="text-muted-c" size={32} />
      </div>
      <p className="font-semibold text-primary-c">{title}</p>
      {description && <p className="text-sm text-muted-c mt-1 max-w-sm">{description}</p>}
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { className: string; label: string }> = {
    PENDING: { className: 'badge-warning', label: 'Pending' },
    CONFIRMED: { className: 'badge-info', label: 'Confirmed' },
    COMPLETED: { className: 'badge-success', label: 'Completed' },
    CANCELLED: { className: 'badge-danger', label: 'Cancelled' },
    NO_SHOW: { className: 'badge-danger', label: 'No Show' },
    ACTIVE: { className: 'badge-success', label: 'Active' },
    EXPIRED: { className: 'badge-danger', label: 'Expired' },
    REVIEWED: { className: 'badge-info', label: 'Reviewed' },
    SUSPENDED: { className: 'badge-danger', label: 'Suspended' },
  }
  const config = map[status] || { className: 'badge-accent', label: status }

  return <span className={`badge ${config.className}`}>{config.label}</span>
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-primary-c">{title}</h1>
        {subtitle && <p className="text-secondary-c text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
