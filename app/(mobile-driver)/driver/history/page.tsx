'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Calendar, MapPin, User, Car, ChevronRight, CheckCircle2, XCircle } from 'lucide-react'

interface Ride {
  id: string
  pickup_date: string
  return_date: string
  pickup_location: { address: string }
  return_location: { address: string }
  status: string
  customer: { full_name: string }
  vehicle: {
    brand: string
    model: string
    color: string
    year: number
    license_plate: string
    images: string[]
  }
}

export default function DriverHistoryPage() {
  const [tab, setTab] = useState<'upcoming' | 'previous'>('upcoming')
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      const statusFilter = tab === 'upcoming' 
        ? ['confirmed', 'active', 'pickup_pending'] 
        : ['completed', 'cancelled']

      const { data } = await supabase
        .from('bookings')
        .select(`
          id, pickup_date, return_date, pickup_location, return_location, status,
          customer:profiles!bookings_user_id_fkey(full_name),
          vehicle:vehicles(brand, model, color, year, license_plate, images)
        `)
        .eq('driver_id', user.id)
        .in('status', statusFilter)
        .order('pickup_date', { ascending: tab === 'upcoming' })
        .limit(20)

      setRides(data || [])
      setLoading(false)
    }
    
    fetchData()
  }, [tab])

  const mockRides: Ride[] = [
    {
      id: 'mock-1',
      pickup_date: '2024-09-12T12:00:00',
      return_date: '2024-09-15T12:00:00',
      pickup_location: { address: '1 E 2nd St, New York, NY 10003, USA' },
      return_location: { address: '4 E 2nd St, New York, NY 10003, USA' },
      status: 'confirmed',
      customer: { full_name: 'Mr. Alex' },
      vehicle: {
        brand: 'Ferrari',
        model: 'F8 Tributo',
        color: 'Red',
        year: 2019,
        license_plate: 'J92450',
        images: ['https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=600']
      }
    },
    {
      id: 'mock-2',
      pickup_date: '2024-09-18T10:00:00',
      return_date: '2024-09-20T18:00:00',
      pickup_location: { address: '500 5th Ave, New York, NY 10036' },
      return_location: { address: '500 5th Ave, New York, NY 10036' },
      status: 'completed',
      customer: { full_name: 'John Smith' },
      vehicle: {
        brand: 'Lamborghini',
        model: 'Huracan',
        color: 'Yellow',
        year: 2023,
        license_plate: 'LMB001',
        images: ['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600']
      }
    }
  ]

  const displayRides = rides.length > 0 ? rides : mockRides

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-xl font-bold">History</h1>
      </header>

      {/* Tabs */}
      <div className="px-5 mb-6">
        <div className="flex p-1.5 bg-secondary/50 rounded-2xl backdrop-blur-sm">
          <button
            onClick={() => setTab('upcoming')}
            className={cn(
              "flex-1 py-3 text-sm font-semibold rounded-xl transition-all",
              tab === 'upcoming' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Upcoming
          </button>
          <button
            onClick={() => setTab('previous')}
            className={cn(
              "flex-1 py-3 text-sm font-semibold rounded-xl transition-all",
              tab === 'previous' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Previous
          </button>
        </div>
      </div>

      {/* Rides List */}
      <div className="px-5 pb-24 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-muted-foreground/20 border-t-accent rounded-full" />
          </div>
        ) : displayRides.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-2xl bg-secondary mx-auto mb-4 flex items-center justify-center">
              <Car className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">No rides found</h3>
            <p className="text-sm text-muted-foreground">
              {tab === 'upcoming' ? 'No upcoming rides scheduled' : 'No previous rides yet'}
            </p>
          </div>
        ) : (
          displayRides.map((ride) => (
            <Link key={ride.id} href={`/driver/rides/${ride.id}`}>
              <div className="relative rounded-3xl overflow-hidden group">
                {/* Car Image */}
                <div className="relative h-44">
                  <Image
                    src={ride.vehicle?.images?.[0] || 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=600'}
                    alt={`${ride.vehicle?.brand} ${ride.vehicle?.model}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                      <span className="text-xs font-semibold text-white uppercase tracking-wider">{ride.vehicle?.brand}</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl backdrop-blur-md border",
                      ride.status === 'completed' 
                        ? "bg-green-500/20 border-green-500/30" 
                        : ride.status === 'cancelled'
                        ? "bg-red-500/20 border-red-500/30"
                        : "bg-accent/20 border-accent/30"
                    )}>
                      {ride.status === 'completed' ? (
                        <CheckCircle2 className="h-3 w-3 text-green-400" />
                      ) : ride.status === 'cancelled' ? (
                        <XCircle className="h-3 w-3 text-red-400" />
                      ) : null}
                      <span className={cn(
                        "text-xs font-semibold uppercase tracking-wider",
                        ride.status === 'completed' ? "text-green-400" 
                          : ride.status === 'cancelled' ? "text-red-400" 
                          : "text-accent"
                      )}>
                        {ride.status}
                      </span>
                    </div>
                  </div>

                  {/* Car Info Overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-lg font-bold text-white mb-0.5">
                      {ride.vehicle?.brand} {ride.vehicle?.model}
                    </h3>
                    <p className="text-white/70 text-xs">
                      {ride.vehicle?.color} &bull; {ride.vehicle?.year} &bull; {ride.vehicle?.license_plate}
                    </p>
                  </div>
                </div>

                {/* Details Panel - Glassmorphism */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 dark:from-white/5 dark:to-white/[0.02] p-4 -mt-2 rounded-b-3xl">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
                          <Calendar className="h-3.5 w-3.5 text-accent" />
                        </div>
                        <span className="text-muted-foreground">
                          {new Date(ride.pickup_date).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <span className="text-muted-foreground">{ride.customer?.full_name}</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <span className="text-muted-foreground truncate max-w-[200px]">{ride.pickup_location?.address}</span>
                      </div>
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
