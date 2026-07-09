import Link from 'next/link'
import { Activity, Brain, Shield, Calendar, Stethoscope, HeartPulse, Video, FileText, Bell, MessageCircle, Zap, Lock, Users, ChevronRight } from 'lucide-react'
import Logo from '@/components/logo'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-secondary-c hover:text-accent font-medium transition-colors">
              Login
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 badge badge-accent mb-6">
              <Zap size={14} />
              <span>AI-Powered Healthcare Platform</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6 text-primary-c">
              The Future of <span className="gradient-text">Healthcare</span> is Here
            </h1>
            <p className="text-lg text-secondary-c mb-8 max-w-xl">
              Experience intelligent healthcare management with AI-powered diagnostics, telemedicine,
              electronic health records, and seamless multi-role dashboards for patients, doctors, and administrators.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="btn-primary inline-flex items-center gap-2">
                Get Started Free
                <ChevronRight size={18} />
              </Link>
              <Link href="/login" className="btn-secondary">
                Sign In
              </Link>
            </div>
            <div className="flex gap-8 mt-10">
              {[
                { label: 'AI Features', value: '10+' },
                { label: 'User Roles', value: '3' },
                { label: 'Uptime', value: '99.9%' },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-c">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative animate-fade-in">
            <div className="glass-card p-8 relative overflow-hidden">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Brain, label: 'AI Assistant', color: 'from-purple-500 to-pink-500', desc: '24/7 health guidance' },
                  { icon: Video, label: 'Telemedicine', color: 'from-blue-500 to-cyan-500', desc: 'Video consultations' },
                  { icon: HeartPulse, label: 'Health Monitor', color: 'from-rose-500 to-red-500', desc: 'Real-time vitals' },
                  { icon: FileText, label: 'EHR', color: 'from-emerald-500 to-teal-500', desc: 'Digital records' },
                ].map((card, i) => (
                  <div
                    key={card.label}
                    className="glass-card p-5"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
                      <card.icon className="text-white" size={24} />
                    </div>
                    <div className="font-semibold text-primary-c">{card.label}</div>
                    <div className="text-xs text-muted-c mt-1">{card.desc}</div>
                  </div>
                ))}
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-primary-c">
            Everything You Need for <span className="gradient-text">Modern Healthcare</span>
          </h2>
          <p className="text-secondary-c max-w-2xl mx-auto">
            A comprehensive platform powered by AI, designed for patients, doctors, and healthcare administrators.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Brain, title: 'AI Health Assistant', desc: 'Get instant health guidance, symptom analysis, and wellness recommendations powered by advanced AI.', color: 'from-purple-500 to-pink-500' },
            { icon: Stethoscope, title: 'AI Clinical Copilot', desc: 'Doctors get AI-assisted clinical notes, visit summaries, and decision support tools.', color: 'from-blue-500 to-indigo-500' },
            { icon: Video, title: 'Telemedicine', desc: 'Book and manage video, voice, and in-person consultations with smart scheduling.', color: 'from-cyan-500 to-blue-500' },
            { icon: FileText, title: 'Electronic Health Records', desc: 'Complete medical history timeline with conditions, allergies, medications, and lab results.', color: 'from-emerald-500 to-teal-500' },
            { icon: Calendar, title: 'Smart Appointments', desc: 'AI-optimized scheduling with waitlist automation, reminders, and queue management.', color: 'from-amber-500 to-orange-500' },
            { icon: Shield, title: 'Enterprise Security', desc: 'Role-based access control, audit logs, and secure architecture with data protection.', color: 'from-rose-500 to-red-500' },
            { icon: HeartPulse, title: 'Health Analytics', desc: 'Track vital metrics, health trends, and receive predictive insights about your wellbeing.', color: 'from-pink-500 to-rose-500' },
            { icon: Users, title: 'Multi-Role Platform', desc: 'Dedicated dashboards for patients, doctors, and administrators with tailored experiences.', color: 'from-violet-500 to-purple-500' },
          ].map((feature, i) => (
            <div key={feature.title} className="glass-card p-6 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="text-white" size={28} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-primary-c">{feature.title}</h3>
              <p className="text-sm text-secondary-c leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="glass-card p-8 lg:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3 text-primary-c">How It Works</h2>
            <p className="text-secondary-c">Get started in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Create Your Account', desc: 'Register as a patient or doctor in under a minute. Your data is encrypted and secure.' },
              { num: '02', title: 'Set Up Your Profile', desc: 'Add your medical history, preferences, and health information to personalize your experience.' },
              { num: '03', title: 'Start Your Journey', desc: 'Book appointments, chat with AI, access records, and manage your health all in one place.' },
            ].map(step => (
              <div key={step.num} className="text-center">
                <div className="text-5xl font-bold gradient-text mb-4">{step.num}</div>
                <h3 className="text-xl font-bold mb-2 text-primary-c">{step.title}</h3>
                <p className="text-sm text-secondary-c">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-primary-c">
            Built for <span className="gradient-text">Every Role</span>
          </h2>
          <p className="text-secondary-c">Tailored experiences for each healthcare stakeholder</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: HeartPulse,
              title: 'For Patients',
              color: 'from-rose-500 to-pink-500',
              features: ['AI Health Assistant', 'Book Appointments', 'Health Records', 'Lab Reports', 'Prescriptions', 'Family Management'],
            },
            {
              icon: Stethoscope,
              title: 'For Doctors',
              color: 'from-blue-500 to-cyan-500',
              features: ['Patient Management', 'AI Clinical Copilot', 'e-Prescriptions', 'Smart Calendar', 'Secure Messaging', 'Clinical Analytics'],
            },
            {
              icon: Shield,
              title: 'For Administrators',
              color: 'from-violet-500 to-purple-500',
              features: ['User Management', 'Doctor Verification', 'Platform Analytics', 'Audit Logs', 'Revenue Reports', 'System Monitoring'],
            },
          ].map(role => (
            <div key={role.title} className="glass-card p-8">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-5`}>
                <role.icon className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-primary-c">{role.title}</h3>
              <ul className="space-y-2">
                {role.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-secondary-c">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="glass-card p-8 lg:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 gradient-bg opacity-5" />
          <div className="relative z-10">
            <Lock className="mx-auto mb-4 text-accent" size={48} />
            <h2 className="text-4xl font-bold mb-4 text-primary-c">
              Ready to Transform Your <span className="gradient-text">Healthcare Experience?</span>
            </h2>
            <p className="text-secondary-c max-w-2xl mx-auto mb-8">
              Join MediCore AI today and experience the future of healthcare management.
              Secure, intelligent, and built for everyone.
            </p>
            <Link href="/register" className="btn-primary inline-flex items-center gap-2 text-base">
              Create Your Free Account
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-c px-6 py-8 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-muted-c">
            © 2026 MediCore AI. Built for better healthcare.
          </p>
          <div className="flex items-center gap-6 text-sm text-secondary-c">
            <span className="flex items-center gap-1.5">
              <Shield size={14} /> HIPAA-Ready
            </span>
            <span className="flex items-center gap-1.5">
              <Lock size={14} /> Secure
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
