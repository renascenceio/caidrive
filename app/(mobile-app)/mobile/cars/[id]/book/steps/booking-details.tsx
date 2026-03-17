'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { 
  Star, Gauge, Zap, Users, Power, MapPin, ChevronRight, 
  Calendar, FileText, CreditCard
} from 'lucide-react'
import type { BookingData } from '../page'

interface BookingDetailsStepProps {
  data: BookingData
  vehicle: {
    id: string
    brand: string
    model: string
    price_per_day: number
    images: string[]
    rating?: number
    max_speed?: number
    acceleration?: number
    seats?: number
    horsepower?: number
  }
  days: number
  subtotal: number
  deposit: number
  total: number
  onChange: (updates: Partial<BookingData>) => void
  onNext: () => void
}

export function BookingDetailsStep({ 
  data, 
  vehicle, 
  days, 
  subtotal, 
  deposit, 
  total,
  onChange,
  onNext 
}: BookingDetailsStepProps) {
  const [showTerms, setShowTerms] = useState(false)

  return (
    <div className="px-5 py-6 pb-32">
      {/* Car Summary Card */}
      <div className="bg-white border border-border/30 rounded-2xl overflow-hidden mb-6">
        <div className="relative h-36">
          <Image
            src={vehicle.images?.[0] || "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800"}
            alt={vehicle.model}
            fill
            className="object-cover"
          />
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-md">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-white">{vehicle.rating?.toFixed(1) || '4.7'}</span>
          </div>
        </div>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">{vehicle.brand} {vehicle.model}</h2>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" />
              {vehicle.max_speed || 296} km/h
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3.5 w-3.5" />
              {vehicle.acceleration || 2.7} sec
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {vehicle.seats || 5} seats
            </span>
            <span className="flex items-center gap-1">
              <Power className="h-3.5 w-3.5" />
              {vehicle.horsepower || 510} bhp
            </span>
          </div>
        </div>
      </div>

      {/* Location Card */}
      <div className="bg-white border border-border/30 rounded-2xl overflow-hidden mb-6">
        <div className="h-28 bg-secondary/50 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="h-8 w-8 text-accent" />
          </div>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Delivery location</p>
            <p className="text-sm font-medium">
              {data.deliveryLocation === 'delivery' 
                ? data.deliveryAddress 
                : '1 E 2nd St, New York, NY 10003, USA'}
            </p>
          </div>
          <button className="p-2">
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Price Section */}
      <div className="flex items-center justify-between bg-white border border-border/30 rounded-2xl p-4 mb-6">
        <div>
          <p className="text-xs text-muted-foreground">Price</p>
          <p className="text-lg font-bold">${vehicle.price_per_day.toLocaleString()}/day</p>
        </div>
        <button className="text-sm text-accent font-medium flex items-center gap-1">
          View more <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Booking Info Box */}
      <div className="bg-white border border-border/30 rounded-2xl p-4 mb-6">
        <p className="text-xs text-muted-foreground mb-4">
          Make minimum payment, make the booking
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Booking Date</p>
              <p className="text-sm font-medium">
                {data.startDate 
                  ? new Date(data.startDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
                  : 'Select date'}
              </p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Return Date</p>
              <p className="text-sm font-medium">
                {data.endDate 
                  ? new Date(data.endDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
                  : 'Select date'}
              </p>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Driving License</p>
              <p className="text-sm font-medium truncate">{data.licenseNumber || 'Not provided'}</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Passport</p>
              <p className="text-sm font-medium truncate">{data.passportNumber || 'Not provided'}</p>
            </div>
          </button>
        </div>
      </div>

      {/* Booking Summary */}
      <div className="bg-white border border-border/30 rounded-2xl p-4 mb-6">
        <h3 className="font-semibold mb-4">Booking Info</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Booking Date</span>
            <span>
              {data.startDate && data.endDate 
                ? `${new Date(data.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - ${new Date(data.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`
                : '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Number of Days</span>
            <span>{days} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price per Day</span>
            <span>${vehicle.price_per_day.toLocaleString()}/day</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Deposit Amount</span>
            <span>${deposit.toLocaleString()}</span>
          </div>
          <div className="h-px bg-border my-2" />
          <div className="flex justify-between font-bold text-base">
            <span>Total Pay</span>
            <span className="text-accent">${total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#f5f5f7] border-t border-border/30 p-5 pb-8">
        <button
          onClick={onNext}
          className="w-full py-4 rounded-2xl font-semibold text-base bg-foreground text-background transition-all active:scale-[0.98]"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  )
}
