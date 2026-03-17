'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon, ChevronRight } from 'lucide-react'
import { format, differenceInDays, addDays } from 'date-fns'
import { cn } from '@/lib/utils'

interface DesktopBookingBarProps {
  vehicleId: string
  pricePerDay: number
  depositAmount: number
}

export function DesktopBookingBar({ vehicleId, pricePerDay, depositAmount }: DesktopBookingBarProps) {
  const router = useRouter()
  const [pickupDate, setPickupDate] = useState<Date | undefined>(undefined)
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined)
  
  const days = pickupDate && returnDate ? differenceInDays(returnDate, pickupDate) + 1 : 0
  const subtotal = days * pricePerDay
  const serviceFee = 25
  const total = subtotal + serviceFee

  const handleBookNow = () => {
    if (pickupDate && returnDate) {
      const params = new URLSearchParams({
        pickup: format(pickupDate, 'yyyy-MM-dd'),
        return: format(returnDate, 'yyyy-MM-dd'),
      })
      router.push(`/cars/${vehicleId}/book?${params.toString()}`)
    } else {
      router.push(`/cars/${vehicleId}/book`)
    }
  }

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-bold text-accent">${pricePerDay}</span>
            <span className="text-muted-foreground">/day</span>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Pick-up Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start h-11",
                      !pickupDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {pickupDate ? format(pickupDate, 'EEE, MMM d') : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={pickupDate}
                    onSelect={(date) => {
                      setPickupDate(date)
                      if (date && (!returnDate || returnDate <= date)) {
                        setReturnDate(addDays(date, 1))
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Return Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start h-11",
                      !returnDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {returnDate ? format(returnDate, 'EEE, MMM d') : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={setReturnDate}
                    disabled={(date) => date < (pickupDate || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {days > 0 && (
            <div className="space-y-3 text-sm mb-6 pb-6 border-b border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">${pricePerDay} x {days} days</span>
                <span>${subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Insurance</span>
                <span className="text-green-600">Included</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service fee</span>
                <span>${serviceFee}</span>
              </div>
              {depositAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deposit (refundable)</span>
                  <span>${depositAmount}</span>
                </div>
              )}
            </div>
          )}

          {days > 0 && (
            <div className="flex justify-between text-lg font-bold mb-6">
              <span>Total</span>
              <span className="text-accent">${total}</span>
            </div>
          )}

          <Button 
            className="w-full h-12 text-base" 
            size="lg"
            onClick={handleBookNow}
          >
            {days > 0 ? `Book Now - $${total}` : 'Select Dates to Book'}
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Free cancellation up to 24 hours before pickup
          </p>
        </div>
      </div>

      {/* Floating Bottom Bar for Desktop (shows when scrolled) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl p-4 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-2xl font-bold text-accent">${pricePerDay}</span>
            <span className="text-muted-foreground">/day</span>
          </div>
          <Button 
            className="h-12 px-8" 
            size="lg"
            onClick={handleBookNow}
          >
            Book Now
          </Button>
        </div>
      </div>
    </>
  )
}
