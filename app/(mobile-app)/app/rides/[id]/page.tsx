"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { ArrowLeft, Calendar, MapPin, Phone, MessageCircle, Navigation, Clock, CreditCard, Shield, AlertTriangle, CheckCircle } from "lucide-react"

interface Booking {
  id: string
  status: string
  start_date: string
  end_date: string
  pickup_location: string
  dropoff_location: string
  total_amount: number
  deposit_amount: number
  insurance_type: string
  vehicle: {
    brand: string
    model: string
    images: string[]
    license_plate: string
    fuel_type: string
  }
  company: {
    name: string
    phone: string
  }
  driver?: {
    full_name: string
    phone: string
    avatar_url: string
  }
}

export default function RideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)

  useEffect(() => {
    const fetchBooking = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicle:vehicles(brand, model, images, license_plate, fuel_type),
          company:companies(name, phone),
          driver:drivers(full_name, phone, avatar_url)
        `)
        .eq('id', id)
        .single()
      
      if (data) setBooking(data as unknown as Booking)
    }
    fetchBooking()
  }, [id])

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: CheckCircle, label: 'Confirmed' }
      case 'active':
        return { color: 'text-green-500', bg: 'bg-green-500/10', icon: Navigation, label: 'In Progress' }
      case 'completed':
        return { color: 'text-gray-500', bg: 'bg-gray-500/10', icon: CheckCircle, label: 'Completed' }
      case 'cancelled':
        return { color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertTriangle, label: 'Cancelled' }
      default:
        return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Clock, label: 'Pending' }
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCancelBooking = async () => {
    const supabase = createClient()
    await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
    
    setShowCancelModal(false)
    router.push('/app/rides')
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  const statusConfig = getStatusConfig(booking.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">Booking Details</h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4 overflow-auto">
        {/* Status */}
        <div className={cn(
          "p-4 rounded-2xl flex items-center gap-3",
          statusConfig.bg
        )}>
          <StatusIcon className={cn("h-6 w-6", statusConfig.color)} />
          <div>
            <p className={cn("font-semibold", statusConfig.color)}>{statusConfig.label}</p>
            <p className="text-sm text-muted-foreground">
              Booking #{booking.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Vehicle Card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="relative h-48">
            <Image
              src={booking.vehicle.images?.[0] || "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800"}
              alt={booking.vehicle.model}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <p className="text-xs text-muted-foreground uppercase">{booking.vehicle.brand}</p>
            <h2 className="text-xl font-bold">{booking.vehicle.model}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>Plate: {booking.vehicle.license_plate || 'N/A'}</span>
              <span>{booking.vehicle.fuel_type || 'Petrol'}</span>
            </div>
          </div>
        </div>

        {/* Date & Location */}
        <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Pick-up</p>
              <p className="font-medium">{formatDate(booking.start_date)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Return</p>
              <p className="font-medium">{formatDate(booking.end_date)}</p>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Pick-up Location</p>
              <p className="font-medium">{booking.pickup_location}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Drop-off Location</p>
              <p className="font-medium">{booking.dropoff_location}</p>
            </div>
          </div>
        </div>

        {/* Driver (if assigned) */}
        {booking.driver && (
          <div className="bg-card rounded-2xl border border-border p-4">
            <h3 className="font-semibold mb-4">Your Driver</h3>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full overflow-hidden bg-secondary">
                {booking.driver.avatar_url ? (
                  <Image
                    src={booking.driver.avatar_url}
                    alt={booking.driver.full_name}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold text-muted-foreground">
                    {booking.driver.full_name?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{booking.driver.full_name}</p>
                <p className="text-sm text-muted-foreground">Driver</p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`tel:${booking.driver.phone}`}
                  className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center"
                >
                  <Phone className="h-5 w-5 text-green-500" />
                </a>
                <button className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-accent" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Summary */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-accent" />
            Payment Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rental Total</span>
              <span>AED {booking.total_amount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Security Deposit</span>
              <span>AED {booking.deposit_amount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Insurance</span>
              <span className="capitalize">{booking.insurance_type || 'Basic'}</span>
            </div>
          </div>
        </div>

        {/* Company Contact */}
        {booking.company && (
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{booking.company.name}</p>
                <p className="text-sm text-muted-foreground">{booking.company.phone}</p>
              </div>
              <a
                href={`tel:${booking.company.phone}`}
                className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"
              >
                <Phone className="h-5 w-5 text-accent" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {(booking.status === 'pending' || booking.status === 'confirmed') && (
        <div className="p-4 border-t border-border bg-card">
          <button
            onClick={() => setShowCancelModal(true)}
            className="w-full py-3.5 rounded-xl font-medium text-red-500 bg-red-500/10 border border-red-500/20"
          >
            Cancel Booking
          </button>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm">
            <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-7 w-7 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Cancel Booking?</h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Are you sure you want to cancel this booking? Cancellation fees may apply.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 rounded-xl font-medium bg-secondary"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 py-3 rounded-xl font-medium text-white bg-red-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
