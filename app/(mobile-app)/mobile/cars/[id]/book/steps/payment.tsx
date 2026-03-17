'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { 
  Star, Gauge, Zap, Users, Power, MapPin, ChevronRight, 
  CreditCard, Apple, Wallet, Bitcoin, DollarSign, Check
} from 'lucide-react'
import type { BookingData } from '../page'

interface PaymentStepProps {
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
  onSubmit: () => void
  loading: boolean
}

const PAYMENT_METHODS = [
  { id: 'paypal', name: 'PayPal', icon: 'P', iconBg: 'bg-blue-600' },
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
  { id: 'apple', name: 'Apple Pay', icon: Apple },
  { id: 'samsung', name: 'Samsung Pay', icon: 'S', iconBg: 'bg-blue-800' },
  { id: 'cash', name: 'Cash', icon: DollarSign, iconColor: 'text-green-600' },
  { id: 'crypto', name: 'Crypto', icon: Bitcoin, iconColor: 'text-orange-500' },
]

export function PaymentStep({ 
  data, 
  vehicle, 
  days, 
  subtotal, 
  deposit, 
  total,
  onChange,
  onSubmit,
  loading
}: PaymentStepProps) {
  const [showCardForm, setShowCardForm] = useState(false)

  const handlePaymentSelect = (methodId: string) => {
    onChange({ paymentMethod: methodId })
    if (methodId === 'card') {
      setShowCardForm(true)
    } else {
      setShowCardForm(false)
    }
  }

  return (
    <div className="px-5 py-6 pb-40 min-h-[calc(100vh-72px)]">
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
          </div>
        </div>
      </div>

      {/* Location & Price */}
      <div className="flex items-center justify-between bg-white border border-border/30 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Delivery</p>
            <p className="text-sm font-medium truncate max-w-[150px]">
              {data.deliveryLocation === 'delivery' ? data.deliveryAddress : 'Office Pickup'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-bold">${total.toLocaleString()}</p>
        </div>
      </div>

      {/* Dates & Documents Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white border border-border/30 rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">Dates</p>
          <p className="text-sm font-medium">
            {data.startDate && data.endDate 
              ? `${new Date(data.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - ${new Date(data.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`
              : '-'}
          </p>
        </div>
        <div className="bg-white border border-border/30 rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">License</p>
          <p className="text-sm font-medium truncate">{data.licenseNumber}</p>
        </div>
        <div className="bg-white border border-border/30 rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">Passport</p>
          <p className="text-sm font-medium truncate">{data.passportNumber}</p>
        </div>
        <div className="bg-white border border-border/30 rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">Duration</p>
          <p className="text-sm font-medium">{days} days</p>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white border border-border/30 rounded-2xl p-4 mb-6">
        <h3 className="font-semibold mb-4">Payment Method</h3>
        <div className="space-y-2">
          {PAYMENT_METHODS.map(method => (
            <button
              key={method.id}
              onClick={() => handlePaymentSelect(method.id)}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-xl border transition-colors",
                data.paymentMethod === method.id 
                  ? "border-foreground bg-secondary/30" 
                  : "border-border/50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                method.iconBg || "bg-secondary"
              )}>
                {typeof method.icon === 'string' ? (
                  <span className="text-white font-bold">{method.icon}</span>
                ) : (
                  <method.icon className={cn("h-5 w-5", method.iconColor)} />
                )}
              </div>
              <span className="flex-1 text-left font-medium">{method.name}</span>
              {data.paymentMethod === method.id && (
                <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                  <Check className="h-3 w-3 text-background" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Card Form (if card selected) */}
        {showCardForm && data.paymentMethod === 'card' && (
          <div className="mt-4 pt-4 border-t border-border/30 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Card Number</label>
              <input
                type="text"
                value={data.cardNumber || ''}
                onChange={(e) => onChange({ cardNumber: e.target.value })}
                placeholder="0000 0000 0000 0000"
                className="w-full px-4 py-3 bg-secondary/30 rounded-xl border border-border/50 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Card Holder</label>
              <input
                type="text"
                value={data.cardHolder || ''}
                onChange={(e) => onChange({ cardHolder: e.target.value })}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-secondary/30 rounded-xl border border-border/50 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Expiry</label>
                <input
                  type="text"
                  value={data.cardExpiry || ''}
                  onChange={(e) => onChange({ cardExpiry: e.target.value })}
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 bg-secondary/30 rounded-xl border border-border/50 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">CVV</label>
                <input
                  type="text"
                  value={data.cardCvv || ''}
                  onChange={(e) => onChange({ cardCvv: e.target.value })}
                  placeholder="123"
                  className="w-full px-4 py-3 bg-secondary/30 rounded-xl border border-border/50 text-sm"
                />
              </div>
            </div>
          </div>
        )}
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
            <span className="text-muted-foreground">Booking Amount</span>
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

      {/* Terms Checkbox */}
      <label className="flex items-center gap-3 cursor-pointer mb-6">
        <div 
          className={cn(
            "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
            data.termsAccepted ? "bg-foreground border-foreground" : "border-muted-foreground"
          )}
          onClick={() => onChange({ termsAccepted: !data.termsAccepted })}
        >
          {data.termsAccepted && <Check className="h-3 w-3 text-background" />}
        </div>
        <span className="text-sm">
          I agree with{' '}
          <Link href="/mobile/terms" className="text-accent underline">Terms & Conditions</Link>.
        </span>
      </label>

      {/* Fixed Bottom Button - Floating above bottom nav */}
      <div className="fixed bottom-[80px] left-0 right-0 px-5">
        <button
          onClick={onSubmit}
          disabled={!data.termsAccepted || loading}
          className={cn(
            "w-full py-4 rounded-full font-semibold text-base transition-all shadow-lg",
            data.termsAccepted && !loading
              ? "bg-foreground text-background active:scale-[0.98]"
              : "bg-muted-foreground text-background cursor-not-allowed"
          )}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            "Proceed to Pay"
          )}
        </button>
      </div>
    </div>
  )
}
