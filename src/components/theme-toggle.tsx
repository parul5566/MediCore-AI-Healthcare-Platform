'use client'

import { useTheme } from '@/components/theme-provider'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl glass-card flex items-center justify-center transition-all hover:scale-105"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon size={18} className="text-secondary-c" />
      ) : (
        <Sun size={18} className="text-secondary-c" />
      )}
    </button>
  )
}
