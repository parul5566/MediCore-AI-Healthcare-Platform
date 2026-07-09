import DashboardLayout from '@/components/dashboard-layout'

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout role="patient">{children}</DashboardLayout>
}
