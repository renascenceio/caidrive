'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Calendar, Clock, Car, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'

interface ScheduledRide {
  id: string
  pickup_date: string
  return_date: string
  pickup_location: { address: string }
  customer: { full_name: string }
  vehicle: { brand: string; model: string }
}

export default function DriverSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [rides, setRides] = useState<ScheduledRide[]>([])
  const [loading, setLoading] = useState(true)

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  useEffect(() => {
    async function fetchRides() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      const dayStart = new Date(selectedDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(selectedDate)
      dayEnd.setHours(23, 59, 59, 999)

      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:profiles!bookings_user_id_fkey(full_name),
          vehicle:vehicles(brand, model)
        `)
        .eq('driver_id', user.id)
        .in('status', ['confirmed', 'active'])
        .gte('pickup_date', dayStart.toISOString())
        .lte('pickup_date', dayEnd.toISOString())
        .order('pickup_date', { ascending: true })

      setRides(data || [])
      setLoading(false)
    }
    
    fetchRides()
  }, [selectedDate])

  const goToPreviousWeek = () => {
    setWeekStart(addDays(weekStart, -7))
  }

  const goToNextWeek = () => {
    setWeekStart(addDays(weekStart, 7))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Schedule</h1>
            <button 
              onClick={() => {
                setSelectedDate(new Date())
                setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
              }}
              className="text-xs text-blue-600 font-medium px-3 py-1.5 bg-blue-500/10 rounded-lg"
            >
              Today
            </button>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={goToPreviousWeek} className="p-2 hover:bg-secondary rounded-lg">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="font-medium">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </span>
            <button onClick={goToNextWeek} className="p-2 hover:bg-secondary rounded-lg">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => {
              const isSelected = isSameDay(day, selectedDate)
              const isToday = isSameDay(day, new Date())
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "flex flex-col items-center py-2 rounded-xl transition-colors",
                    isSelected 
                      ? "bg-blue-600 text-white" 
                      : isToday 
                        ? "bg-blue-500/10 text-blue-600"
                        : "hover:bg-secondary"
                  )}
                >
                  <span className="text-[10px] font-medium uppercase">
                    {format(day, 'EEE')}
                  </span>
                  <span className={cn(
                    "text-lg font-semibold",
                    !isSelected && !isToday && "text-foreground"
                  )}>
                    {format(day, 'd')}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4">
        <h2 className="font-semibold mb-3">
          {format(selectedDate, 'EEEE, MMMM d')}
        </h2>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : rides.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-semibold mb-1">No rides scheduled</h3>
            <p className="text-sm text-muted-foreground">You have no rides on this day</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rides.map((ride) => (
              <div 
                key={ride.id}
                className="p-4 bg-card rounded-2xl border border-border/50"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{format(new Date(ride.pickup_date), 'h:mm a')}</p>
                    <p className="text-sm text-muted-foreground">{ride.customer?.full_name}</p>
                    
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Car className="h-3 w-3" />
                      <span>{ride.vehicle?.brand} {ride.vehicle?.model}</span>
                    </div>
                    
                    <div className="flex items-start gap-2 mt-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{ride.pickup_location?.address || 'Pick-up location'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
