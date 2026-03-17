'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Bell, Trash2 } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  created_at: string
  read: boolean
}

export default function DriverNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNotifications() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      setNotifications(data || [])
      setLoading(false)
    }
    
    fetchNotifications()
  }, [])

  const clearAll = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
      
      setNotifications([])
    }
  }

  // Group notifications by time period
  const groupNotifications = (items: Notification[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const thisWeekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastWeekStart = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)

    const groups: { [key: string]: Notification[] } = {
      'Today': [],
      'Yesterday': [],
      'This week': [],
      'Last week': [],
    }

    items.forEach(item => {
      const date = new Date(item.created_at)
      if (date >= today) {
        groups['Today'].push(item)
      } else if (date >= yesterday) {
        groups['Yesterday'].push(item)
      } else if (date >= thisWeekStart) {
        groups['This week'].push(item)
      } else if (date >= lastWeekStart) {
        groups['Last week'].push(item)
      }
    })

    return groups
  }

  // Mock notifications for demo
  const mockNotifications: Notification[] = [
    {
      id: '1',
      title: 'Lorem Ipsum dolor sit amet is simply',
      message: 'Lorem Ipsum is simply dummy text of the printing and',
      created_at: new Date().toISOString(),
      read: false
    },
    {
      id: '2',
      title: 'Lorem Ipsum dolor sit amet is simply',
      message: 'Lorem Ipsum is simply dummy text of the printing and',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: '3',
      title: 'Lorem Ipsum dolor sit',
      message: 'Lorem Ipsum is simply dummy text of the printing and',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: '4',
      title: 'Lorem Ipsum dolor sit',
      message: 'Lorem Ipsum is simply dummy text of the printing and',
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: '5',
      title: 'Lorem Ipsum dolor sit',
      message: 'Lorem Ipsum is simply dummy text of the printing and',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: '6',
      title: 'Lorem Ipsum dolor sit',
      message: 'Lorem Ipsum is simply dummy text of the printing and',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      read: true
    },
  ]

  const displayNotifications = notifications.length > 0 ? notifications : mockNotifications
  const groupedNotifications = groupNotifications(displayNotifications)

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000))
    
    if (diff >= 7) {
      return `${time} | ${date.getDate()}, ${date.toLocaleString('en-US', { month: 'short' }).toUpperCase()}`
    }
    return time
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/driver" className="p-2 -ml-2">
              <ArrowLeft className="h-5 w-5 text-gray-900" />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
          </div>
          <button
            onClick={clearAll}
            className="text-accent text-sm font-medium"
          >
            Clear all
          </button>
        </div>
      </header>

      {/* Notifications List */}
      <div className="px-5 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-gray-200 border-t-accent rounded-full" />
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([period, items]) => (
            items.length > 0 && (
              <div key={period} className="mt-6">
                <h2 className="text-sm font-medium text-gray-500 mb-3">{period}</h2>
                <div className="space-y-3">
                  {items.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex gap-3 p-4 bg-gray-50 rounded-2xl"
                    >
                      <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Bell className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
                            {notification.title}
                          </h3>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {formatTime(notification.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))
        )}
      </div>
    </div>
  )
}
