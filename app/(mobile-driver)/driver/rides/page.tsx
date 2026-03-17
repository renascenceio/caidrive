'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { 
  Calendar, MapPin, User, MessageSquare, Phone,
  Navigation, Play, ArrowUpRight, Car
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-muted-foreground/20 border-t-accent rounded-full" />
      </div>
    )
  }

  if (!activeRide && !mockRide) {
    return (
      <div className="min-h-screen bg-background">
        <header className="px-5 pt-12 pb-4">
          <h1 className="text-xl font-bold">Current Ride</h1>
        </header>
        <div className="flex flex-col items-center justify-center py-20 px-5">
          <div className="h-20 w-20 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Car className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-1">No Active Ride</h2>
          <p className="text-muted-foreground text-sm text-center">You don&apos;t have any active rides at the moment.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-xl font-bold">Current Ride</h1>
      </header>

      <div className="px-5 pb-24">
        {/* Client Info Card */}
        <div className="bg-card rounded-2xl p-4 mb-4 border border-border/50">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
              {ride.customer?.avatar_url ? (
                <Image
                  src={ride.customer.avatar_url}
                  alt={ride.customer.full_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xl font-bold text-muted-foreground">
                  {ride.customer?.full_name?.[0] || 'C'}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg truncate">{ride.customer?.full_name}</h3>
              <p className="text-muted-foreground text-sm">{ride.customer?.experience_level || 'Beginner'}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="h-10 w-10 rounded-xl bg-secondary border border-border/50 flex items-center justify-center hover:bg-secondary/80 transition-colors">
                <MessageSquare className="h-4 w-4" />
              </button>
              <a 
                href={`tel:${ride.customer?.phone}`}
                className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center hover:bg-accent/20 transition-colors"
              >
                <Phone className="h-4 w-4 text-accent" />
              </a>
            </div>
          </div>
        </div>

        {/* Car Card */}
        <div className="bg-card rounded-2xl overflow-hidden border border-border/50">
          {/* Car Image */}
          <div className="relative h-48 bg-gradient-to-b from-secondary/50 to-transparent">
            <Image
              src={ride.vehicle?.images?.[0] || 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=600'}
              alt={`${ride.vehicle?.brand} ${ride.vehicle?.model}`}
              fill
              className="object-contain p-4"
            />
            {/* License Plate Badge */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50">
              <span className="text-sm font-mono font-bold">{ride.vehicle?.license_plate || 'CSR2 CSB'}</span>
            </div>
          </div>

          {/* Car Info */}
          <div className="p-4">
            <h3 className="text-lg font-bold mb-0.5">
              {ride.vehicle?.brand} {ride.vehicle?.model}
            </h3>
            <p className="text-muted-foreground text-sm mb-5">
              {ride.vehicle?.color} &bull; {ride.vehicle?.year}
            </p>

            {/* Ride Details */}
            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Drop Date & Time</p>
                  <p className="text-sm font-semibold">
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
                <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Drop Address</p>
                  <p className="text-sm font-semibold">{ride.pickup_location?.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Client</p>
                  <p className="text-sm font-semibold">{ride.customer?.full_name}</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Link href={`/driver/rides/${ride.id}/handover`}>
              <button className="w-full py-3.5 rounded-xl font-semibold bg-accent text-white hover:bg-accent/90 transition-all flex items-center justify-center gap-2">
                <ArrowUpRight className="h-4 w-4" />
                Handover
              </button>
            </Link>

            {/* Additional Actions */}
            <div className="flex gap-2 mt-3">
              <Link href={`/driver/rides/${ride.id}/collection`} className="flex-1">
                <button className="w-full py-3 rounded-xl font-medium bg-secondary border border-border/50 hover:bg-secondary/80 transition-all flex items-center justify-center gap-2 text-sm">
                  <Navigation className="h-4 w-4" />
                  Collection
                </button>
              </Link>
              <Link href={`/driver/rides/${ride.id}/drive`} className="flex-1">
                <button className="w-full py-3 rounded-xl font-medium bg-secondary border border-border/50 hover:bg-secondary/80 transition-all flex items-center justify-center gap-2 text-sm">
                  <Play className="h-4 w-4" />
                  Start Drive
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
