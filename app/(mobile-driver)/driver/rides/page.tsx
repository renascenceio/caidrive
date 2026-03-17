'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { 
  Bell, Calendar, MapPin, User, MessageSquare, Phone,
  Navigation, Play, ArrowUpRight
} from 'lucide-react'

interface Ride {
  id: string
  pickup_date: string
  return_date: string
  pickup_location: { address: string }
  return_location: { address: string }
  status: string
  customer: { 
    full_name: string
    phone: string
    avatar_url: string
    experience_level: string
  }
  vehicle: {
    brand: string
    model: string
    color: string
    year: number
    license_plate: string
    images: string[]
  }
}

export default function DriverRidesPage() {
  const [activeRide, setActiveRide] = useState<Ride | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      // Get active/confirmed ride
      const { data: ride } = await supabase
        .from('bookings')
        .select(`
          id, pickup_date, return_date, pickup_location, return_location, status,
          customer:profiles!bookings_user_id_fkey(full_name, phone, avatar_url),
          vehicle:vehicles(brand, model, color, year, license_plate, images)
        `)
        .eq('driver_id', user.id)
        .in('status', ['confirmed', 'active', 'pickup_pending', 'dropoff_pending'])
        .order('pickup_date', { ascending: true })
        .limit(1)
        .single()

      setActiveRide(ride)
      setLoading(false)
    }
    
    fetchData()
  }, [])

  // Mock ride for demo
  const mockRide: Ride = {
    id: 'mock-ride-1',
    pickup_date: '2024-09-12T12:00:00',
    return_date: '2024-09-15T12:00:00',
    pickup_location: { address: '1 E 2nd St, New York, NY 10003, USA' },
    return_location: { address: '1 E 2nd St, New York, NY 10003, USA' },
    status: 'confirmed',
    customer: { 
      full_name: 'Mr. Alex',
      phone: '+1234567890',
      avatar_url: '',
      experience_level: 'Beginner'
    },
    vehicle: {
      brand: 'Ferrari',
      model: 'F8 Tributo',
      color: 'Red',
      year: 2019,
      license_plate: 'J92450',
      images: ['https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=600']
    }
  }

  const ride = activeRide || mockRide

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <Image src="/cai-logo.svg" alt="CAI" width={60} height={24} className="invert" />
          <Link href="/driver/notifications" className="relative p-2">
            <Bell className="h-5 w-5 text-white/60" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-accent rounded-full" />
          </Link>
        </div>
      </header>

      {/* Title */}
      <div className="px-5 pb-4">
        <h1 className="text-xl font-semibold">Rides</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-accent rounded-full" />
        </div>
      ) : (
        <div className="px-5 pb-24">
          {/* Client Info Card */}
          <div className="bg-[#111111] rounded-2xl p-4 mb-4 border border-white/5">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative h-14 w-14 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                {ride.customer?.avatar_url ? (
                  <Image
                    src={ride.customer.avatar_url}
                    alt={ride.customer.full_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xl font-bold text-white/60">
                    {ride.customer?.full_name?.[0] || 'C'}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{ride.customer?.full_name}</h3>
                <p className="text-white/40 text-sm">{ride.customer?.experience_level || 'Beginner'}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  Send Message
                </button>
                <a 
                  href={`tel:${ride.customer?.phone}`}
                  className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </a>
              </div>
            </div>
          </div>

          {/* Car Card */}
          <div className="bg-[#111111] rounded-2xl overflow-hidden border border-white/5">
            {/* Car Image */}
            <div className="relative h-44 bg-gradient-to-b from-white/5 to-transparent">
              <Image
                src={ride.vehicle?.images?.[0] || 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=600'}
                alt={`${ride.vehicle?.brand} ${ride.vehicle?.model}`}
                fill
                className="object-contain"
              />
              {/* License Plate Badge */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <span className="text-sm font-mono font-semibold">CSR2 CSB</span>
              </div>
            </div>

            {/* Car Info */}
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-0.5">
                {ride.vehicle?.brand} {ride.vehicle?.model}
              </h3>
              <p className="text-white/40 text-sm mb-5">
                {ride.vehicle?.color}, {ride.vehicle?.year}, {ride.vehicle?.license_plate}
              </p>

              {/* Ride Details */}
              <div className="space-y-3 mb-5">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 text-white/40" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Drop Date & Time</p>
                    <p className="text-sm font-medium">
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
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-white/40" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Drop Address</p>
                    <p className="text-sm font-medium">{ride.pickup_location?.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-white/40" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Client</p>
                    <p className="text-sm font-medium">{ride.customer?.full_name}</p>
                  </div>
                </div>
              </div>

              {/* Action Button - Changes based on ride status */}
              <Link href={`/driver/rides/${ride.id}/handover`}>
                <button className="w-full py-3.5 rounded-xl font-semibold bg-accent text-white hover:bg-accent/90 transition-all flex items-center justify-center gap-2">
                  <ArrowUpRight className="h-4 w-4" />
                  Handover
                </button>
              </Link>

              {/* Additional Actions */}
              <div className="flex gap-2 mt-3">
                <Link href={`/driver/rides/${ride.id}/collection`} className="flex-1">
                  <button className="w-full py-3 rounded-xl font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm">
                    <Navigation className="h-4 w-4" />
                    Collection
                  </button>
                </Link>
                <Link href={`/driver/rides/${ride.id}/drive`} className="flex-1">
                  <button className="w-full py-3 rounded-xl font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm">
                    <Play className="h-4 w-4" />
                    Start Drive
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
