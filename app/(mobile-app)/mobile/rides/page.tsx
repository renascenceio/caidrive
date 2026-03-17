'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Calendar, MapPin, Clock, ChevronRight, Car } from 'lucide-react'
import { format } from 'date-fns'

interface Booking {
  id: string
  pickup_date: string
  return_date: string
  status: string
  total_price: number
  pickup_location: { address: string }
  vehicle: {
    brand: string
    model: string
    images: string[]
  }
}

const tabs = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Past' },
]

export default function MobileRidesPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    async function fetchBookings() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      let query = supabase
        .from('bookings')
        .select(`
          *,
          vehicle:vehicles(brand, model, images)
        `)
        .eq('user_id', user.id)

      if (activeTab === 'upcoming') {
        query = query.in('status', ['pending', 'confirmed'])
      } else if (activeTab === 'active') {
        query = query.eq('status', 'active')
      } else {
        query = query.in('status', ['completed', 'cancelled'])
      }

      const { data } = await query.order('pickup_date', { ascending: activeTab !== 'completed' })
      setBookings(data || [])
      setLoading(false)
    }
    
    fetchBookings()
  }, [activeTab])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-3">
          <h1 className="text-xl font-semibold mb-3">My Rides</h1>
          
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-secondary rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-secondary animate-pulse" />
          ))
        ) : bookings.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        )}
      </div>
    </div>
  )
}

function BookingCard({ booking }: { booking: Booking }) {
  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-500',
    confirmed: 'bg-blue-500/10 text-blue-500',
    active: 'bg-green-500/10 text-green-500',
    completed: 'bg-muted text-muted-foreground',
    cancelled: 'bg-red-500/10 text-red-500',
  }

  return (
    <Link href={`/mobile/rides/${booking.id}`}>
      <div className="p-4 bg-card rounded-2xl border border-border/50 hover:border-border transition-colors">
        <div className="flex gap-4">
          {/* Car Image */}
          <div className="relative w-24 h-20 rounded-xl overflow-hidden flex-shrink-0">
            <Image
              src={booking.vehicle?.images?.[0] || 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400'}
              alt={`${booking.vehicle?.brand} ${booking.vehicle?.model}`}
              fill
              className="object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-xs text-muted-foreground">{booking.vehicle?.brand}</p>
                <h3 className="font-semibold truncate">{booking.vehicle?.model}</h3>
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-medium capitalize",
                statusColors[booking.status]
              )}>
                {booking.status}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <Calendar className="h-3 w-3" />
              <span>
                {format(new Date(booking.pickup_date), 'MMM d')} - {format(new Date(booking.return_date), 'MMM d, yyyy')}
              </span>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-[120px]">{booking.pickup_location?.address || 'Dubai'}</span>
              </div>
              <p className="font-semibold text-sm">
                AED {booking.total_price?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function EmptyState({ tab }: { tab: string }) {
  const messages: Record<string, { title: string; description: string }> = {
    upcoming: {
      title: 'No upcoming rides',
      description: 'Browse our garage to find your perfect ride',
    },
    active: {
      title: 'No active rides',
      description: "You don't have any rides in progress",
    },
    completed: {
      title: 'No past rides',
      description: 'Your completed rides will appear here',
    },
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
        <Car className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold mb-1">{messages[tab].title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{messages[tab].description}</p>
      {tab === 'upcoming' && (
        <Link 
          href="/mobile/garage"
          className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium"
        >
          Browse Cars
        </Link>
      )}
    </div>
  )
}
