'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { ArrowLeft, Calendar, MapPin, User, Car } from 'lucide-react'

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

  // Mock rides for demo
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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/driver" className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold">History</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex gap-4 border-b border-white/10">
          <button
            onClick={() => setTab('upcoming')}
            className={cn(
              "pb-3 text-sm font-medium transition-colors relative",
              tab === 'upcoming' ? "text-white" : "text-white/40"
            )}
          >
            Upcoming Rides
            {tab === 'upcoming' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
          <button
            onClick={() => setTab('previous')}
            className={cn(
              "pb-3 text-sm font-medium transition-colors relative",
              tab === 'previous' ? "text-white" : "text-white/40"
            )}
          >
            Previous rides
            {tab === 'previous' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        </div>
      </div>

      {/* Rides List */}
      <div className="px-5 pb-24 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-accent rounded-full" />
          </div>
        ) : displayRides.length === 0 ? (
          <div className="text-center py-12">
            <Car className="h-12 w-12 mx-auto mb-3 text-white/20" />
            <p className="text-white/40">No rides found</p>
          </div>
        ) : (
          displayRides.map((ride) => (
            <Link key={ride.id} href={`/driver/rides/${ride.id}`}>
              <div className="bg-[#111111] rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors">
                {/* Car Image */}
                <div className="relative h-36 bg-gradient-to-b from-white/5 to-transparent">
                  <Image
                    src={ride.vehicle?.images?.[0] || 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=600'}
                    alt={`${ride.vehicle?.brand} ${ride.vehicle?.model}`}
                    fill
                    className="object-contain"
                  />
                  {/* License Plate Badge */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <span className="text-xs font-mono font-semibold">CSR2 CSB</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold mb-0.5">
                    {ride.vehicle?.brand} {ride.vehicle?.model}
                  </h3>
                  <p className="text-white/40 text-xs mb-3">
                    {ride.vehicle?.color}, {ride.vehicle?.year}, {ride.vehicle?.license_plate}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3.5 w-3.5 text-white/40" />
                      <span className="text-white/60">Drop Date & Time</span>
                    </div>
                    <p className="text-sm font-medium pl-5">
                      {new Date(ride.pickup_date).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}{' '}
                      {new Date(ride.pickup_date).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>

                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-white/40" />
                      <span className="text-white/60">Drop Address</span>
                    </div>
                    <p className="text-sm font-medium pl-5">{ride.pickup_location?.address}</p>

                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-accent" />
                      <span className="text-white/60">Collect address</span>
                    </div>
                    <p className="text-sm font-medium pl-5">{ride.return_location?.address}</p>

                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-3.5 w-3.5 text-white/40" />
                      <span className="text-white/60">Client</span>
                    </div>
                    <p className="text-sm font-medium pl-5">{ride.customer?.full_name}</p>
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
