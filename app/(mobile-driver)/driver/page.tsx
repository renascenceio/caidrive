'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Bell, Calendar, MapPin, User, Check, Clock, Gauge } from 'lucide-react'

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
  const [alertsEnabled, setAlertsEnabled] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (profile?.full_name) {
        setDriverName(profile.full_name.split(' ')[0])
      }

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <Image src="/cai-logo.svg" alt="CAI" width={60} height={24} className="dark:invert" />
          <Link href="/driver/notifications" className="relative p-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-accent rounded-full" />
          </Link>
        </div>
      </header>

      {/* Welcome Section */}
      <div className="px-5 pb-6">
        <p className="text-muted-foreground text-sm mb-0.5">Hi {driverName}</p>
        <h1 className="text-2xl font-bold">Welcome back!</h1>
      </div>

      {/* Stats Cards */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-card border border-border/50">
            <Clock className="h-5 w-5 text-accent mb-2" />
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-muted-foreground">Rides Today</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border/50">
            <Gauge className="h-5 w-5 text-accent mb-2" />
            <p className="text-2xl font-bold">248</p>
            <p className="text-xs text-muted-foreground">KM Driven</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border/50">
            <Check className="h-5 w-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold">98%</p>
            <p className="text-xs text-muted-foreground">On Time</p>
          </div>
        </div>
      </div>

      {/* Alert Toggle */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border/50">
          <div>
            <span className="font-semibold">Get Alert</span>
            <p className="text-xs text-muted-foreground">Receive new ride notifications</p>
          </div>
          <button 
            onClick={() => setAlertsEnabled(!alertsEnabled)}
            className={cn(
              "w-12 h-7 rounded-full relative transition-colors",
              alertsEnabled ? "bg-accent" : "bg-secondary"
            )}
          >
            <div className={cn(
              "absolute top-1 h-5 w-5 bg-white rounded-full transition-all shadow-sm",
              alertsEnabled ? "right-1" : "left-1"
            )} />
          </button>
        </div>
      </div>

      {/* Section Title */}
      <div className="px-5 mb-4">
        <h2 className="font-semibold">Pending Orders</h2>
      </div>

      {/* Ride Alerts */}
      <div className="px-5 space-y-4 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-muted-foreground/20 border-t-accent rounded-full" />
          </div>
        ) : (
          displayAlerts.map((alert) => (
            <div key={alert.id} className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm">
              {/* Car Image */}
              <div className="relative h-44 bg-gradient-to-b from-secondary/50 to-transparent">
                <Image
                  src={alert.vehicle?.images?.[0] || 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=600'}
                  alt={`${alert.vehicle?.brand} ${alert.vehicle?.model}`}
                  fill
                  className="object-contain p-4"
                />
                {/* License Plate Badge */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50">
                  <span className="text-sm font-mono font-bold">{alert.vehicle?.license_plate || 'CSR2 CSB'}</span>
                </div>
              </div>

              {/* Car Info */}
              <div className="p-4">
                <h3 className="text-lg font-bold mb-0.5">
                  {alert.vehicle?.brand} {alert.vehicle?.model}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {alert.vehicle?.color} &bull; {alert.vehicle?.year}
                </p>

                {/* Details */}
                <div className="space-y-3 mb-5">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Drop Date & Time</p>
                      <p className="text-sm font-semibold">
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
                    <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Drop Address</p>
                      <p className="text-sm font-semibold">{alert.pickup_location?.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Client</p>
                      <p className="text-sm font-semibold">{alert.customer?.full_name}</p>
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
                      Accept Order
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
