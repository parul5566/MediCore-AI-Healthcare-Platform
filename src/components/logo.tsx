'use client'

import { Activity } from 'lucide-react'

export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { icon: 18, text: 'text-base', container: 'gap-1.5' },
    md: { icon: 24, text: 'text-xl', container: 'gap-2' },
    lg: { icon: 32, text: 'text-2xl', container: 'gap-2.5' },
  }
  const s = sizes[size]

  return (
    <div className={`flex items-center ${s.container}`}>
      <div
        className="gradient-bg rounded-xl flex items-center justify-center text-white shadow-lg"
        style={{ width: s.icon + 16, height: s.icon + 16 }}
      >
        <Activity size={s.icon} strokeWidth={2.5} />
      </div>
      <div>
        <span className={`font-bold ${s.text} text-primary-c`}>
          Medi<span className="gradient-text">Core</span>
        </span>
        <span className="text-[10px] font-semibold text-muted-c block leading-none -mt-0.5 tracking-wider">
          AI HEALTHCARE
        </span>
      </div>
    </div>
  )
}
