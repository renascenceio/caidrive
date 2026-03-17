'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Check, Star, Calendar, MapPin, CreditCard, Download } from 'lucide-react'
import type { BookingData } from '../page'

interface ConfirmationStepProps {
  bookingId: string | null
  vehicle: {
    id: string
    brand: string
    model: string
    price_per_day: number
    images: string[]
    rating?: number
  }
  data: BookingData
  total: number
}

export function ConfirmationStep({ bookingId, vehicle, data, total }: ConfirmationStepProps) {
  return (
    <div className="px-5 py-6 pb-32">
      {/* Success Icon */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2 mobile-text-dark">Booking Successful!</h1>
        <p className="mobile-text-muted">
          Congratulations! Lorem ipsum dolor sit amet
          consectetur. Consectetur lorem fusce
          euismod viverra egestas fermentum.
        </p>
      </div>

      {/* Car Card */}
      <div className="bg-white border border-[#e5e5e7] rounded-2xl overflow-hidden mb-6">
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
          <h2 className="text-lg font-semibold mobile-text-dark">{vehicle.brand} {vehicle.model}</h2>
        </div>
      </div>

      {/* Booking Info */}
      <div className="bg-white border border-[#e5e5e7] rounded-2xl p-4 mb-6">
        <h3 className="font-semibold mb-4 mobile-text-dark">Booking Info</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#f5f5f7] flex items-center justify-center">
              <Calendar className="h-5 w-5 mobile-text-muted" />
            </div>
            <div className="flex-1">
              <p className="text-xs mobile-text-muted">Booking Date</p>
              <p className="text-sm font-medium mobile-text-dark">
                {data.startDate && data.endDate 
                  ? `${new Date(data.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(data.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`
                  : '-'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#f5f5f7] flex items-center justify-center">
              <MapPin className="h-5 w-5 mobile-text-muted" />
            </div>
            <div className="flex-1">
              <p className="text-xs mobile-text-muted">Pickup Location</p>
              <p className="text-sm font-medium mobile-text-dark">
                {data.deliveryLocation === 'delivery' ? data.deliveryAddress : 'Office Pickup'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#f5f5f7] flex items-center justify-center">
              <CreditCard className="h-5 w-5 mobile-text-muted" />
            </div>
            <div className="flex-1">
              <p className="text-xs mobile-text-muted">Payment Method</p>
              <p className="text-sm font-medium mobile-text-dark capitalize">{data.paymentMethod}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Price Summary */}
      <div className="bg-white border border-[#e5e5e7] rounded-2xl p-4 mb-6">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="mobile-text-muted">Booking Date</span>
            <span className="mobile-text-dark">
              {data.startDate && data.endDate 
                ? `${new Date(data.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - ${new Date(data.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`
                : '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="mobile-text-muted">Arrival at Store</span>
            <span className="mobile-text-dark">{data.pickupTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="mobile-text-muted">Price per Day</span>
            <span className="mobile-text-dark">${vehicle.price_per_day.toLocaleString()}/day</span>
          </div>
          <div className="flex justify-between">
            <span className="mobile-text-muted">Rate Discount</span>
            <span className="text-green-600">5%</span>
          </div>
          <div className="flex justify-between">
            <span className="mobile-text-muted">Booking Amount</span>
            <span className="mobile-text-dark">$78</span>
          </div>
          <div className="flex justify-between">
            <span className="mobile-text-muted">Deposit Amount</span>
            <span className="mobile-text-dark">$78</span>
          </div>
          <div className="h-px bg-[#e5e5e7] my-2" />
          <div className="flex justify-between font-bold text-base">
            <span className="mobile-text-dark">Total Pay</span>
            <span className="text-[#dd3155]">${total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Booking Reference */}
      {bookingId && (
        <div className="text-center text-sm mobile-text-muted mb-6">
          <p>Booking Reference:</p>
          <p className="font-mono font-medium mobile-text-dark">{bookingId.slice(0, 8).toUpperCase()}</p>
        </div>
      )}

      {/* Fixed Bottom Buttons - Above bottom nav */}
      <div className="fixed bottom-16 left-0 right-0 px-5 pb-4 bg-[#f5f5f7]">
        <div className="flex gap-3">
          <Link href={`/mobile/rides`} className="flex-1">
            <button className="w-full py-4 rounded-full font-semibold text-base bg-white border border-[#e5e5e7] shadow-lg transition-all active:scale-[0.98] mobile-text-dark">
              View Booking
            </button>
          </Link>
          <Link href="/mobile" className="flex-1">
            <button className="w-full py-4 rounded-full font-semibold text-base bg-[#161821] text-white shadow-lg transition-all active:scale-[0.98]">
              Done
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
