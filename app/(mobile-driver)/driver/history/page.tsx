'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Calendar, MapPin, User, Car, ChevronRight } from 'lucide-react'

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
      status: 'confirmed',
      customer: { full_name: 'John Smith' },
      vehicle: {
        brand: 'Ferrari',
        model: 'F8 Tributo',
        color: 'Red',
        year: 2019,
        license_plate: 'J92450',
        images: ['https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=600']
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
      <div className="px-5 mb-4">
        <div className="flex p-1 bg-secondary rounded-xl">
          <button
            onClick={() => setTab('upcoming')}
            className={cn(
              "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all",
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
              "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all",
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
      <div className="px-5 pb-24 space-y-3">
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
              <div className="bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-border transition-colors">
                <div className="flex gap-4 p-4">
                  {/* Car Image */}
                  <div className="relative h-24 w-32 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
                    <Image
                      src={ride.vehicle?.images?.[0] || 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=600'}
                      alt={`${ride.vehicle?.brand} ${ride.vehicle?.model}`}
                      fill
                      className="object-contain p-2"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold truncate">
                          {ride.vehicle?.brand} {ride.vehicle?.model}
                        </h3>
                        <p className="text-muted-foreground text-xs">
                          {ride.vehicle?.color} &bull; {ride.vehicle?.year}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                        <span className="text-muted-foreground truncate">
                          {new Date(ride.pickup_date).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground truncate">{ride.customer?.full_name}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground truncate">{ride.pickup_location?.address}</span>
                      </div>
                    </div>
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
