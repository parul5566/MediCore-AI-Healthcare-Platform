'use client'

import { useState, useCallback } from 'react'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.read).length)
      }
    } catch {
      // silent fail
    }
  }, [])

  const markAsRead = useCallback(async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {
      // silent fail
    }
  }, [])

  return { notifications, unreadCount, markAsRead, fetchNotifications }
}
