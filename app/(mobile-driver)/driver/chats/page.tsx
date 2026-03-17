'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Bell, Search, MessageCircle } from 'lucide-react'

interface Chat {
  id: string
  customer: {
    id: string
    full_name: string
    avatar_url: string
  }
  last_message: string
  last_message_time: string
  unread_count: number
}

export default function DriverChatsPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchChats() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      // Fetch active bookings to get chat threads
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          id,
          customer:profiles!bookings_user_id_fkey(id, full_name, avatar_url)
        `)
        .eq('driver_id', user.id)
        .in('status', ['confirmed', 'active', 'pickup_pending', 'dropoff_pending'])
        .order('pickup_date', { ascending: true })

      // Mock chat data
      const chatData: Chat[] = (bookings || []).map(b => ({
        id: b.id,
        customer: b.customer as Chat['customer'],
        last_message: 'Hello, I am on my way!',
        last_message_time: '09:00AM',
        unread_count: Math.floor(Math.random() * 3)
      }))

      setChats(chatData)
      setLoading(false)
    }
    
    fetchChats()
  }, [])

  // Mock chats for demo
  const mockChats: Chat[] = [
    {
      id: '1',
      customer: { id: '1', full_name: 'Mr. Alex', avatar_url: '' },
      last_message: 'Hello, I am ready for pickup',
      last_message_time: '09:00AM',
      unread_count: 2
    },
    {
      id: '2',
      customer: { id: '2', full_name: 'John Smith', avatar_url: '' },
      last_message: 'Thanks for the great service!',
      last_message_time: 'Yesterday',
      unread_count: 0
    },
    {
      id: '3',
      customer: { id: '3', full_name: 'Sarah Johnson', avatar_url: '' },
      last_message: 'Can you arrive a bit earlier?',
      last_message_time: 'Mon',
      unread_count: 1
    }
  ]

  const displayChats = chats.length > 0 ? chats : mockChats
  
  const filteredChats = displayChats.filter(chat =>
    chat.customer.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <Image src="/cai-logo.svg" alt="CAI" width={60} height={24} className="invert" />
          <Link href="/driver/notifications" className="relative p-2">
            <Bell className="h-5 w-5 text-white/60" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-accent rounded-full" />
          </Link>
        </div>

        <h1 className="text-xl font-semibold mb-4">Chats</h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/20"
          />
        </div>
      </header>

      {/* Chats List */}
      <div className="px-5 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-accent rounded-full" />
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 text-white/20" />
            <p className="text-white/40">No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChats.map((chat) => (
              <Link key={chat.id} href={`/driver/chats/${chat.id}`}>
                <div className="flex items-center gap-3 p-4 bg-[#111111] rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
                  {/* Avatar */}
                  <div className="relative h-12 w-12 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                    {chat.customer.avatar_url ? (
                      <Image
                        src={chat.customer.avatar_url}
                        alt={chat.customer.full_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-lg font-bold text-white/60">
                        {chat.customer.full_name[0]}
                      </div>
                    )}
                    {chat.unread_count > 0 && (
                      <div className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-bold">{chat.unread_count}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">{chat.customer.full_name}</h3>
                      <span className="text-xs text-white/40">{chat.last_message_time}</span>
                    </div>
                    <p className="text-sm text-white/60 truncate">{chat.last_message}</p>
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
