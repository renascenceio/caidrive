'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Calendar, Clock, MapPin, X, Check } from 'lucide-react'
import type { BookingData } from '../page'

interface DateTimeStepProps {
  data: BookingData
  onChange: (updates: Partial<BookingData>) => void
  onNext: () => void
}

const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM'
]

export function DateTimeStep({ data, onChange, onNext }: DateTimeStepProps) {
  const [showFromCalendar, setShowFromCalendar] = useState(false)
  const [showToCalendar, setShowToCalendar] = useState(false)

  const isValid = data.startDate && data.endDate && 
    (data.deliveryLocation === 'pickup' || data.deliveryAddress)

  return (
    <div className="px-5 py-6 pb-32">
      {/* Date Range */}
      <section className="mb-8">
        <h2 className="font-semibold text-base mb-4">Date range</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">From</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="date"
                value={data.startDate}
                onChange={(e) => onChange({ startDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl border border-border/50 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">To</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="date"
                value={data.endDate}
                onChange={(e) => onChange({ endDate: e.target.value })}
                min={data.startDate || new Date().toISOString().split('T')[0]}
                className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl border border-border/50 text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Select Time */}
      <section className="mb-8">
        <h2 className="font-semibold text-base mb-4">Select time</h2>
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => onChange({ pickupTime: '09:00 AM' })}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-medium transition-colors",
              data.pickupTime.includes('AM') && parseInt(data.pickupTime) < 12
                ? "bg-foreground text-background"
                : "bg-white border border-border/50"
            )}
          >
            Morning
          </button>
          <button
            onClick={() => onChange({ pickupTime: '03:00 PM' })}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-medium transition-colors",
              data.pickupTime.includes('PM')
                ? "bg-foreground text-background"
                : "bg-white border border-border/50"
            )}
          >
            Evening
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {TIME_SLOTS.map(time => (
            <button
              key={time}
              onClick={() => onChange({ pickupTime: time })}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm transition-colors",
                data.pickupTime === time
                  ? "bg-foreground text-background"
                  : "bg-white border border-border/50"
              )}
            >
              {time}
            </button>
          ))}
        </div>
      </section>

      {/* Details Summary */}
      {data.startDate && data.endDate && (
        <section className="mb-8">
          <h2 className="font-semibold text-base mb-4">Details</h2>
          <div className="bg-white rounded-xl border border-border/50 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Selected dates</span>
              <span>{new Date(data.startDate).toLocaleDateString()} - {new Date(data.endDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Full booking date</span>
              <span>{new Date(data.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Number of Days</span>
              <span>{Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24))} days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pickup time</span>
              <span>{data.pickupTime}</span>
            </div>
          </div>
        </section>
      )}

      {/* Delivery Location */}
      <section className="mb-8">
        <h2 className="font-semibold text-base mb-4">Delivery location</h2>
        
        {/* Map Placeholder */}
        <div className="h-40 bg-secondary/50 rounded-xl mb-4 flex items-center justify-center">
          <MapPin className="h-8 w-8 text-muted-foreground" />
        </div>

        {/* Delivery Options */}
        <div className="space-y-3">
          <button
            onClick={() => onChange({ deliveryLocation: 'pickup' })}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl border transition-colors text-left",
              data.deliveryLocation === 'pickup'
                ? "border-foreground bg-white"
                : "border-border/50 bg-white"
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center",
              data.deliveryLocation === 'pickup'
                ? "border-foreground bg-foreground"
                : "border-muted-foreground"
            )}>
              {data.deliveryLocation === 'pickup' && <Check className="h-3 w-3 text-background" />}
            </div>
            <div>
              <p className="font-medium">Pickup at Office</p>
              <p className="text-sm text-muted-foreground">Collect from our location</p>
            </div>
          </button>

          <button
            onClick={() => onChange({ deliveryLocation: 'delivery' })}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl border transition-colors text-left",
              data.deliveryLocation === 'delivery'
                ? "border-foreground bg-white"
                : "border-border/50 bg-white"
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center",
              data.deliveryLocation === 'delivery'
                ? "border-foreground bg-foreground"
                : "border-muted-foreground"
            )}>
              {data.deliveryLocation === 'delivery' && <Check className="h-3 w-3 text-background" />}
            </div>
            <div>
              <p className="font-medium">Deliver to Address</p>
              <p className="text-sm text-muted-foreground">We bring the car to you</p>
            </div>
          </button>
        </div>

        {/* Address Input (if delivery selected) */}
        {data.deliveryLocation === 'delivery' && (
          <div className="mt-4">
            <label className="text-sm text-muted-foreground mb-2 block">Delivery address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={data.deliveryAddress}
                onChange={(e) => onChange({ deliveryAddress: e.target.value })}
                placeholder="1 E 2nd St, New York, NY 10003, USA"
                className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl border border-border/50 text-sm"
              />
            </div>
          </div>
        )}
      </section>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#f5f5f7] border-t border-border/30 p-5 pb-8">
        <button
          onClick={onNext}
          disabled={!isValid}
          className={cn(
            "w-full py-4 rounded-2xl font-semibold text-base transition-all",
            isValid
              ? "bg-foreground text-background"
              : "bg-foreground/30 text-background/50 cursor-not-allowed"
          )}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
