'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Bell, Calendar, MapPin, User, Check } from 'lucide-react'

interface RideAlert {
  id: string
  pickup_date: string
  pickup_location: { address: string }
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

export default function DriverOrdersPage() {
  const [driverName, setDriverName] = useState('Driver')
  const [alerts, setAlerts] = useState<RideAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      // Get driver profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (profile?.full_name) {
        setDriverName(profile.full_name.split(' ')[0])
      }

      // Get pending ride alerts (assigned but not accepted)
      const { data: pendingRides } = await supabase
        .from('bookings')
        .select(`
          id, pickup_date, pickup_location,
          customer:profiles!bookings_user_id_fkey(full_name),
          vehicle:vehicles(brand, model, color, year, license_plate, images)
        `)
        .eq('driver_id', user.id)
        .eq('status', 'pending_driver')
        .order('pickup_date', { ascending: true })

      setAlerts(pendingRides || [])
      setLoading(false)
    }
    
    fetchData()
  }, [])

  const handleAccept = async (rideId: string) => {
    setAcceptingId(rideId)
    const supabase = createClient()
    
    await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', rideId)

    // Remove from alerts
    setAlerts(prev => prev.filter(a => a.id !== rideId))
    setAcceptingId(null)
  }

  // Mock alert for demo
  const mockAlert: RideAlert = {
    id: 'mock-1',
    pickup_date: '2024-09-12T12:00:00',
    pickup_location: { address: '1 E 2nd St, New York, NY 10003, USA' },
    customer: { full_name: 'Mr. Alex' },
    vehicle: {
      brand: 'Ferrari',
      model: 'F8 Tributo',
      color: 'Red',
      year: 2019,
      license_plate: 'J92450',
      images: ['https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=600']
    }
  }

  const displayAlerts = alerts.length > 0 ? alerts : [mockAlert]

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

      {/* Welcome Section */}
      <div className="px-5 pb-6">
        <p className="text-white/40 text-sm">Hi {driverName}</p>
        <h1 className="text-2xl font-semibold">Welcome back!</h1>
      </div>

      {/* Alert Toggle */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
          <span className="font-medium">Get Alert</span>
          <div className="w-12 h-6 bg-accent rounded-full relative cursor-pointer">
            <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full" />
          </div>
        </div>
      </div>

      {/* Ride Alerts */}
      <div className="px-5 space-y-4 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-accent rounded-full" />
          </div>
        ) : (
          displayAlerts.map((alert) => (
            <div key={alert.id} className="bg-[#111111] rounded-2xl overflow-hidden border border-white/5">
              {/* Car Image */}
              <div className="relative h-40 bg-gradient-to-b from-white/5 to-transparent">
                <Image
                  src={alert.vehicle?.images?.[0] || 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=600'}
                  alt={`${alert.vehicle?.brand} ${alert.vehicle?.model}`}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Car Info */}
              <div className="p-4 pt-0">
                <h3 className="text-lg font-semibold mb-0.5">
                  {alert.vehicle?.brand} {alert.vehicle?.model}
                </h3>
                <p className="text-white/40 text-sm mb-4">
                  {alert.vehicle?.color}, {alert.vehicle?.year}, {alert.vehicle?.license_plate}
                </p>

                {/* Details */}
                <div className="space-y-3 mb-5">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-white/40" />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">Drop Date & Time</p>
                      <p className="text-sm font-medium">
                        {new Date(alert.pickup_date).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}{' '}
                        {new Date(alert.pickup_date).toLocaleTimeString('en-US', {
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
                      <p className="text-sm font-medium">{alert.pickup_location?.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white/40" />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">Client</p>
                      <p className="text-sm font-medium">{alert.customer?.full_name}</p>
                    </div>
                  </div>
                </div>

                {/* Accept Button */}
                <button
                  onClick={() => handleAccept(alert.id)}
                  disabled={acceptingId === alert.id}
                  className={cn(
                    "w-full py-3.5 rounded-xl font-semibold transition-all",
                    "bg-accent text-white hover:bg-accent/90",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "flex items-center justify-center gap-2"
                  )}
                >
                  {acceptingId === alert.id ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Accept
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
