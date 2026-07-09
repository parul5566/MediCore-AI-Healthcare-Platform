'use client'

import { useEffect, useState } from 'react'
import { Users, Search, Loader2, Ban, CheckCircle, Mail, Phone } from 'lucide-react'
import { PageHeader, StatusBadge, EmptyState } from '@/components/ui-components'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  status: string
  phone: string | null
  createdAt: string
  patient?: any
  doctor?: any
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const fetchUsers = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (roleFilter !== 'all') params.set('role', roleFilter)
    fetch(`/api/admin/users?${params}`).then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300)
    return () => clearTimeout(timer)
  }, [search, roleFilter])

  const handleAction = async (userId: string, action: string) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action }),
    })
    fetchUsers()
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>

  return (
    <div>
      <PageHeader title="User Management" subtitle="Manage all platform users" />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-c" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="input-field pl-10" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-field sm:w-48">
          <option value="all">All Roles</option>
          <option value="PATIENT">Patients</option>
          <option value="DOCTOR">Doctors</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {users.length === 0 ? (
        <div className="glass-card p-6"><EmptyState icon={Users} title="No users found" /></div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-c text-muted-c">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Joined</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-c last:border-0 hover:bg-[var(--bg-glass)]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs ${u.role === 'PATIENT' ? 'bg-gradient-to-br from-rose-500 to-pink-500' : u.role === 'DOCTOR' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : 'bg-gradient-to-br from-violet-500 to-purple-500'}`}>{u.firstName[0]}{u.lastName[0]}</div>
                        <div><div className="font-medium text-primary-c">{u.firstName} {u.lastName}</div><div className="text-xs text-muted-c flex items-center gap-1"><Mail size={10} /> {u.email}</div></div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="badge badge-accent">{u.role}</span></td>
                    <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                    <td className="px-4 py-3 text-muted-c hidden md:table-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {u.status === 'ACTIVE' ? (
                        <button onClick={() => handleAction(u.id, 'suspend')} className="text-sm text-danger font-medium flex items-center gap-1 hover:underline"><Ban size={14} /> Suspend</button>
                      ) : (
                        <button onClick={() => handleAction(u.id, 'activate')} className="text-sm text-success font-medium flex items-center gap-1 hover:underline"><CheckCircle size={14} /> Activate</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
