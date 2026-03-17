'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Search, MessageCircle, Check, CheckCheck } from 'lucide-react'

interface Chat {
  id: string
  customer: {
    id: string
    full_name: string
    avatar_url: string
  }
  vehicle: {
    brand: string
    model: string
  }
  last_message: string
  last_message_time: string
  unread_count: number
  is_read: boolean
}

export default function DriverChatsPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchChats() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      // For now, use mock data
      setChats([])
      setLoading(false)
    }
    
    fetchChats()
  }, [])

  // Mock chats for demo
  const mockChats: Chat[] = [
    {
      id: '1',
      customer: {
        id: 'c1',
        full_name: 'Mr. Alex Johnson',
        avatar_url: 'https://randomuser.me/api/portraits/men/1.jpg'
      },
      vehicle: { brand: 'Ferrari', model: 'F8 Tributo' },
      last_message: 'Thank you! See you at 2 PM for the pickup.',
      last_message_time: '2024-09-12T10:30:00',
      unread_count: 2,
      is_read: false
    },
    {
      id: '2',
      customer: {
        id: 'c2',
        full_name: 'Sarah Williams',
        avatar_url: 'https://randomuser.me/api/portraits/women/2.jpg'
      },
      vehicle: { brand: 'Lamborghini', model: 'Huracan' },
      last_message: 'Can we change the pickup location?',
      last_message_time: '2024-09-11T16:45:00',
      unread_count: 0,
      is_read: true
    },
    {
      id: '3',
      customer: {
        id: 'c3',
        full_name: 'Mohammed Al-Rashid',
        avatar_url: 'https://randomuser.me/api/portraits/men/3.jpg'
      },
      vehicle: { brand: 'Porsche', model: '911 GT3' },
      last_message: 'Perfect, I will be waiting at the hotel lobby.',
      last_message_time: '2024-09-10T09:15:00',
      unread_count: 0,
      is_read: true
    },
    {
      id: '4',
      customer: {
        id: 'c4',
        full_name: 'Emily Chen',
        avatar_url: 'https://randomuser.me/api/portraits/women/4.jpg'
      },
      vehicle: { brand: 'Bentley', model: 'Continental GT' },
      last_message: 'The car was amazing! Thank you for the great service.',
      last_message_time: '2024-09-09T18:20:00',
      unread_count: 0,
      is_read: true
    }
  ]

  const displayChats = chats.length > 0 ? chats : mockChats

  const filteredChats = displayChats.filter(chat => 
    chat.customer.full_name.toLowerCase().includes(search.toLowerCase()) ||
    chat.vehicle.brand.toLowerCase().includes(search.toLowerCase()) ||
    chat.vehicle.model.toLowerCase().includes(search.toLowerCase())
  )

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-xl font-bold mb-4">Chats</h1>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full pl-11 pr-4 py-3 rounded-2xl text-sm",
              "bg-secondary/50 border border-border/50",
              "focus:outline-none focus:border-accent/50 focus:bg-secondary/70",
              "transition-all"
            )}
          />
        </div>
      </header>

      {/* Chats List */}
      <div className="px-5 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-muted-foreground/20 border-t-accent rounded-full" />
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-2xl bg-secondary mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">No conversations</h3>
            <p className="text-sm text-muted-foreground">
              {search ? 'No chats match your search' : 'Start chatting with customers'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredChats.map((chat) => (
              <Link key={chat.id} href={`/driver/chats/${chat.id}`}>
                <div className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl transition-all",
                  "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10",
                  "dark:from-white/5 dark:to-white/[0.02]",
                  "hover:from-white/15 hover:to-white/10 dark:hover:from-white/10 dark:hover:to-white/5"
                )}>
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="h-14 w-14 rounded-full overflow-hidden ring-2 ring-white/10">
                      <Image
                        src={chat.customer.avatar_url}
                        alt={chat.customer.full_name}
                        width={56}
                        height={56}
                        className="object-cover"
                      />
                    </div>
                    {chat.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-background">
                        {chat.unread_count}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className={cn(
                        "font-semibold truncate",
                        !chat.is_read && "text-foreground"
                      )}>
                        {chat.customer.full_name}
                      </h3>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatTime(chat.last_message_time)}
                      </span>
                    </div>
                    
                    <p className="text-xs text-accent mb-1">
                      {chat.vehicle.brand} {chat.vehicle.model}
                    </p>
                    
                    <div className="flex items-center gap-1.5">
                      {chat.is_read ? (
                        <CheckCheck className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                      ) : (
                        <Check className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      )}
                      <p className={cn(
                        "text-sm truncate",
                        chat.is_read ? "text-muted-foreground" : "text-foreground font-medium"
                      )}>
                        {chat.last_message}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
