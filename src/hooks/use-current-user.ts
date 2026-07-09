'use client'

import { useEffect, useState, useCallback } from 'react'

export interface CurrentUser {
  id: string
  role: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  patientId?: string
  doctorId?: string
  doctorVerified?: boolean
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        if (data.isLoggedIn) {
          setUser(data)
        } else {
          window.location.href = '/login'
        }
      } else {
        window.location.href = '/login'
      }
    } catch {
      window.location.href = '/login'
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return { user, loading, logout }
}
