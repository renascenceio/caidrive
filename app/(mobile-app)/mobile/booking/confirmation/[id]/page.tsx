"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Check, Calendar, MapPin, Car, Phone, MessageCircle, Download, Home } from "lucide-react"

interface Booking {
  id: string
  start_date: string
  end_date: string
  total_amount: number
  deposit_amount: number
  status: string
  pickup_location: string
  vehicle: {
    brand: string
    model: string
    images: string[]
    license_plate: string
  }
  company: {
    name: string
    phone: string
  }
}

export default function BookingConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [booking, setBooking] = useState<Booking | null>(null)

  useEffect(() => {
    const fetchBooking = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicle:vehicles(brand, model, images, license_plate),
          company:companies(name, phone)
        `)
        .eq('id', id)
        .single()
      
      if (data) setBooking(data as unknown as Booking)
    }
    fetchBooking()
  }, [id])

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Success Header */}
      <div className="bg-green-500/10 pt-12 pb-8 px-6 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-500 mb-4">
          <Check className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-muted-foreground">
          Your booking has been successfully placed
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Booking ID: <span className="font-mono font-medium text-foreground">{booking.id.slice(0, 8).toUpperCase()}</span>
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 space-y-4">
        {/* Vehicle Card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="relative h-40">
            <Image
              src={booking.vehicle.images?.[0] || "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800"}
              alt={booking.vehicle.model}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <p className="text-xs text-muted-foreground uppercase">{booking.vehicle.brand}</p>
            <h2 className="text-lg font-bold">{booking.vehicle.model}</h2>
            {booking.vehicle.license_plate && (
              <p className="text-sm text-muted-foreground mt-1">
                Plate: {booking.vehicle.license_plate}
              </p>
            )}
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
          <h3 className="font-semibold">Booking Details</h3>
          
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pick-up</p>
              <p className="font-medium">{formatDate(booking.start_date)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Return</p>
              <p className="font-medium">{formatDate(booking.end_date)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{booking.pickup_location}</p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold mb-4">Payment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Paid</span>
              <span className="font-semibold">AED {booking.total_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Security Deposit</span>
              <span>AED {booking.deposit_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Contact */}
        {booking.company && (
          <div className="bg-card rounded-2xl border border-border p-4">
            <h3 className="font-semibold mb-4">Need Help?</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{booking.company.name}</p>
                <p className="text-sm text-muted-foreground">{booking.company.phone}</p>
              </div>
              <div className="flex gap-2">
                <a 
                  href={`tel:${booking.company.phone}`}
                  className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"
                >
                  <Phone className="h-5 w-5 text-accent" />
                </a>
                <button className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-accent" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 space-y-3 border-t border-border bg-card">
        <button className={cn(
          "w-full py-3.5 rounded-xl font-medium",
          "bg-secondary/50 border border-border",
          "flex items-center justify-center gap-2"
        )}>
          <Download className="h-5 w-5" />
          <span>Download Receipt</span>
        </button>
        <Link 
          href="/mobile"
          className={cn(
            "w-full py-4 rounded-xl font-semibold",
            "bg-accent text-white",
            "flex items-center justify-center gap-2",
            "transition-all active:scale-[0.98]"
          )}
        >
          <Home className="h-5 w-5" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  )
}
