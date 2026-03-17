'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Bell, Car, Gift, Shield, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  type: 'booking' | 'promo' | 'system' | 'review'
  title: string
  message: string
  read: boolean
  created_at: string
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    async function loadNotifications() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // For now, show sample notifications since we don't have a notifications table
      setNotifications([
        {
          id: '1',
          type: 'booking',
          title: 'Booking Confirmed',
          message: 'Your booking for Ferrari SF90 has been confirmed for tomorrow.',
          read: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          type: 'promo',
          title: 'Weekend Special',
          message: 'Get 15% off on all weekend bookings! Use code WEEKEND15.',
          read: true,
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          type: 'system',
          title: 'Document Verified',
          message: 'Your driving license has been verified successfully.',
          read: true,
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ])
      setLoading(false)
    }
    loadNotifications()
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Car className="h-5 w-5" />
      case 'promo': return <Gift className="h-5 w-5" />
      case 'system': return <Shield className="h-5 w-5" />
      default: return <Bell className="h-5 w-5" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/profile">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Notifications</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 rounded-xl p-4 border ${
                notification.read 
                  ? 'bg-card border-border' 
                  : 'bg-accent/5 border-accent/20'
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                notification.read ? 'bg-muted' : 'bg-accent/10'
              }`}>
                <span className={notification.read ? 'text-muted-foreground' : 'text-accent'}>
                  {getIcon(notification.type)}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{notification.title}</p>
                  {!notification.read && (
                    <span className="h-2 w-2 rounded-full bg-accent" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDate(notification.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <Button variant="outline" className="w-full mt-6">
          <CheckCircle className="mr-2 h-4 w-4" />
          Mark all as read
        </Button>
      )}
    </div>
  )
}
