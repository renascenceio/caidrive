'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Calendar, MapPin, Clock, Car, ChevronRight, ArrowLeft, RefreshCw } from 'lucide-react'
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

// Mock bookings matching PDF design
const mockBookings: Booking[] = [
  {
    id: '1',
    pickup_date: '2024-03-20',
    return_date: '2024-03-23',
    status: 'active',
    total_price: 7500,
    pickup_location: { address: 'Dubai Marina' },
    vehicle: {
      brand: 'Ferrari',
      model: 'Portofino',
      images: ['https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800']
    }
  },
  {
    id: '2',
    pickup_date: '2024-03-25',
    return_date: '2024-03-28',
    status: 'confirmed',
    total_price: 9000,
    pickup_location: { address: 'Palm Jumeirah' },
    vehicle: {
      brand: 'Lamborghini',
      model: 'Huracan EVO',
      images: ['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800']
    }
  },
  {
    id: '3',
    pickup_date: '2024-02-15',
    return_date: '2024-02-18',
    status: 'completed',
    total_price: 6600,
    pickup_location: { address: 'Downtown Dubai' },
    vehicle: {
      brand: 'Porsche',
      model: '911 Turbo S',
      images: ['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800']
    }
  }
]

import { CalendarClock, Zap, CheckCircle } from 'lucide-react'

const tabs = [
  { id: 'upcoming', label: 'Upcoming', icon: CalendarClock },
  { id: 'active', label: 'Active', icon: Zap },
  { id: 'completed', label: 'Completed', icon: CheckCircle },
]

export default function MobileRidesPage() {
  const router = useRouter()
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
      
      if (data && data.length > 0) {
        setBookings(data)
      } else {
        // Filter mock data based on tab
        const filtered = mockBookings.filter(b => {
          if (activeTab === 'upcoming') return ['pending', 'confirmed'].includes(b.status)
          if (activeTab === 'active') return b.status === 'active'
          return ['completed', 'cancelled'].includes(b.status)
        })
        setBookings(filtered)
      }
      setLoading(false)
    }
    
    fetchBookings()
  }, [activeTab])

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">My rides</h1>
        </div>
        
        {/* Tabs - Matching Places style */}
        <div className="flex gap-2 overflow-x-auto pb-4 px-4 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-accent text-white"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-4">
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
  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pending', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    confirmed: { label: 'Confirmed', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    active: { label: 'Active', color: 'text-green-500', bg: 'bg-green-500/10' },
    completed: { label: 'Completed', color: 'text-muted-foreground', bg: 'bg-secondary' },
    cancelled: { label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-500/10' },
  }

  const status = statusConfig[booking.status] || statusConfig.pending

  return (
    <Link href={`/mobile/rides/${booking.id}`}>
      <div className="bg-card rounded-3xl border border-border overflow-hidden hover:border-accent/30 transition-colors">
        {/* Car Image with overlay */}
        <div className="relative h-40">
          <Image
            src={booking.vehicle?.images?.[0] || 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800'}
            alt={`${booking.vehicle?.brand} ${booking.vehicle?.model}`}
            fill
            className="object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Status badge */}
          <span className={cn(
            "absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold",
            status.bg, status.color
          )}>
            {status.label}
          </span>

          {/* Car name overlay */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <p className="text-xs opacity-80">{booking.vehicle?.brand}</p>
            <h3 className="font-bold text-lg">{booking.vehicle?.model}</h3>
          </div>
        </div>

        {/* Booking Details */}
        <div className="p-4 space-y-3">
          {/* Date */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {format(new Date(booking.pickup_date), 'MMM d')} - {format(new Date(booking.return_date), 'MMM d, yyyy')}
              </p>
              <p className="text-xs text-muted-foreground">Rental Period</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
              <MapPin className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">{booking.pickup_location?.address || 'Dubai'}</p>
              <p className="text-xs text-muted-foreground">Pickup Location</p>
            </div>
          </div>

          {/* Price & View Details */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-bold text-lg">${booking.total_price?.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-1 text-accent font-medium text-sm">
              View Details
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function EmptyState({ tab }: { tab: string }) {
  const messages: Record<string, { title: string; description: string; icon: any }> = {
    upcoming: {
      title: 'No upcoming rides',
      description: 'Browse our collection to book your next adventure',
      icon: Car
    },
    active: {
      title: 'No active rides',
      description: "You don't have any rides in progress",
      icon: RefreshCw
    },
    completed: {
      title: 'No completed rides',
      description: 'Your ride history will appear here',
      icon: Clock
    },
  }

  const content = messages[tab]
  const Icon = content.icon

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-1">{content.title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">{content.description}</p>
      {tab === 'upcoming' && (
        <Link 
          href="/mobile/garage"
          className="px-8 py-3.5 bg-accent text-white rounded-2xl font-semibold"
        >
          Browse Cars
        </Link>
      )}
    </div>
  )
}
