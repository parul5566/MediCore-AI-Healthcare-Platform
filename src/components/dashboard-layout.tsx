'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard, Calendar, FileText, Pill, FlaskConical,
  Users, MessageSquare, Brain, Settings, Bell, LogOut,
  Menu, X, HeartPulse, Activity, Shield, Stethoscope,
  ClipboardList, UserCheck, BarChart3, ScrollText, Search
} from 'lucide-react'
import Logo from '@/components/logo'
import ThemeToggle from '@/components/theme-toggle'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useNotifications } from '@/hooks/use-notifications'

const navConfig: Record<string, { label: string; icon: React.ElementType; href: string }[]> = {
  patient: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/patient' },
    { label: 'Appointments', icon: Calendar, href: '/dashboard/patient/appointments' },
    { label: 'Health Records', icon: FileText, href: '/dashboard/patient/records' },
    { label: 'Prescriptions', icon: Pill, href: '/dashboard/patient/prescriptions' },
    { label: 'Lab Reports', icon: FlaskConical, href: '/dashboard/patient/lab-reports' },
    { label: 'Family Members', icon: Users, href: '/dashboard/patient/family' },
    { label: 'Messages', icon: MessageSquare, href: '/dashboard/patient/messages' },
    { label: 'AI Assistant', icon: Brain, href: '/dashboard/patient/ai-assistant' },
    { label: 'Profile', icon: Settings, href: '/dashboard/patient/profile' },
  ],
  doctor: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/doctor' },
    { label: 'Appointments', icon: Calendar, href: '/dashboard/doctor/appointments' },
    { label: 'Patients', icon: Users, href: '/dashboard/doctor/patients' },
    { label: 'Prescriptions', icon: Pill, href: '/dashboard/doctor/prescriptions' },
    { label: 'Messages', icon: MessageSquare, href: '/dashboard/doctor/messages' },
    { label: 'AI Copilot', icon: Brain, href: '/dashboard/doctor/ai-copilot' },
    { label: 'Schedule', icon: Calendar, href: '/dashboard/doctor/schedule' },
    { label: 'Profile', icon: Settings, href: '/dashboard/doctor/profile' },
  ],
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/admin' },
    { label: 'Users', icon: Users, href: '/dashboard/admin/users' },
    { label: 'Doctors', icon: Stethoscope, href: '/dashboard/admin/doctors' },
    { label: 'Appointments', icon: Calendar, href: '/dashboard/admin/appointments' },
    { label: 'Analytics', icon: BarChart3, href: '/dashboard/admin/analytics' },
    { label: 'Audit Logs', icon: ScrollText, href: '/dashboard/admin/audit-logs' },
    { label: 'Notifications', icon: Bell, href: '/dashboard/admin/notifications' },
    { label: 'Profile', icon: Settings, href: '/dashboard/admin/profile' },
  ],
}

const roleIcon: Record<string, React.ElementType> = {
  PATIENT: HeartPulse,
  DOCTOR: Stethoscope,
  ADMIN: Shield,
}

const roleColor: Record<string, string> = {
  PATIENT: 'from-rose-500 to-pink-500',
  DOCTOR: 'from-blue-500 to-cyan-500',
  ADMIN: 'from-violet-500 to-purple-500',
}

export default function DashboardLayout({ children, role }: { children: React.ReactNode; role: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, logout } = useCurrentUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const { notifications, unreadCount, markAsRead, fetchNotifications } = useNotifications()

  useEffect(() => {
    if (!loading && user && user.role !== role.toUpperCase()) {
      router.push(`/dashboard/${user.role.toLowerCase()}`)
    }
  }, [user, loading, role, router])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center animate-pulse-glow">
            <Activity className="text-white" size={32} />
          </div>
          <p className="text-secondary-c">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const navItems = navConfig[role] || []
  const RoleIcon = roleIcon[user.role] || HeartPulse
  const colorClass = roleColor[user.role] || 'from-blue-500 to-cyan-500'

  return (
    <div className="min-h-screen flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`glass-sidebar fixed lg:sticky top-0 left-0 h-screen w-72 z-40 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-8 px-2">
            <Link href="/">
              <Logo size="sm" />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg glass-card"
            >
              <X size={18} />
            </button>
          </div>

          {/* User card */}
          <div className="glass-card p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-primary-c truncate">{user.firstName} {user.lastName}</div>
                <div className="text-xs text-muted-c flex items-center gap-1">
                  <RoleIcon size={12} />
                  {user.role}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto space-y-1">
            {navItems.map(item => {
              const isActive = pathname === item.href || (item.href !== `/dashboard/${role}` && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'gradient-accent text-white shadow-lg'
                      : 'text-secondary-c hover:bg-[var(--bg-glass)]'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-secondary-c hover:bg-red-500/10 hover:text-danger transition-all mt-4"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="glass sticky top-0 z-20 px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg glass-card"
            >
              <Menu size={20} />
            </button>

            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-c" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="input-field pl-10 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) fetchNotifications() }}
                  className="p-2.5 rounded-xl glass-card relative"
                >
                  <Bell size={18} className="text-secondary-c" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 mt-2 w-80 glass-card p-2 z-40 max-h-96 overflow-y-auto animate-fade-in">
                      <div className="px-3 py-2 font-semibold text-primary-c border-b border-c mb-2">
                        Notifications
                      </div>
                      {notifications.length === 0 ? (
                        <p className="text-sm text-muted-c px-3 py-4 text-center">No notifications</p>
                      ) : (
                        notifications.slice(0, 10).map(n => (
                          <div
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`p-3 rounded-xl cursor-pointer hover:bg-[var(--bg-glass)] ${!n.read ? 'border-l-2 border-accent' : ''}`}
                          >
                            <div className="font-medium text-sm text-primary-c">{n.title}</div>
                            <div className="text-xs text-secondary-c mt-1">{n.message}</div>
                            <div className="text-xs text-muted-c mt-1">{new Date(n.createdAt).toLocaleDateString()}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>

              <ThemeToggle />

              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-sm`}>
                {user.firstName[0]}{user.lastName[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
