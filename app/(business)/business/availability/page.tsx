'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Car, ChevronLeft, ChevronRight, Calendar, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  color: string
  license_plate: string
  images: string[]
  status: string
}

interface Booking {
  id: string
  vehicle_id: string
  start_date: string
  end_date: string
  status: string
  user_id: string
  profiles?: {
    full_name: string
  }
  driver_id?: string
  drivers?: {
    name: string
  }
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function CalendarRow({ 
  vehicle, 
  year,
  month,
  days, 
  bookings,
  onToggleAvailability 
}: { 
  vehicle: Vehicle
  year: number
  month: number
  days: number[]
  bookings: Booking[]
  onToggleAvailability: (id: string, currentStatus: string) => void
}) {
  const [hoveredBooking, setHoveredBooking] = useState<Booking | null>(null)
  
  // Get bookings for this vehicle that overlap with this month
  const vehicleBookings = bookings.filter(b => {
    const start = new Date(b.start_date)
    const end = new Date(b.end_date)
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)
    return start <= monthEnd && end >= monthStart
  })

  const getBookingForDay = (day: number) => {
    const date = new Date(year, month, day)
    return vehicleBookings.find(b => {
      const start = new Date(b.start_date)
      const end = new Date(b.end_date)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      return date >= start && date <= end
    })
  }
  
  return (
    <div className="flex items-stretch border-b border-border">
      {/* Car Info */}
      <div className="flex w-64 shrink-0 items-center gap-3 border-r border-border p-3 bg-card">
        <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-secondary">
          <Image 
            src={vehicle.images?.[0] || '/placeholder-car.jpg'} 
            alt={vehicle.model} 
            fill 
            className="object-cover" 
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{vehicle.year} {vehicle.model}</p>
          <p className="text-xs text-muted-foreground">{vehicle.color} · {vehicle.license_plate}</p>
        </div>
        <Switch 
          checked={vehicle.status === 'available'} 
          onCheckedChange={() => onToggleAvailability(vehicle.id, vehicle.status)}
        />
      </div>
      
      {/* Calendar Days */}
      <div className="flex flex-1">
        {days.map((day) => {
          const booking = getBookingForDay(day)
          const isBooked = !!booking && (booking.status === 'confirmed' || booking.status === 'pending' || booking.status === 'active')
          
          // Check if this is the start or end of the booking within this month
          const bookingStart = booking ? new Date(booking.start_date) : null
          const bookingEnd = booking ? new Date(booking.end_date) : null
          const isStart = bookingStart && bookingStart.getDate() === day && bookingStart.getMonth() === month
          const isEnd = bookingEnd && bookingEnd.getDate() === day && bookingEnd.getMonth() === month
          
          return (
            <div 
              key={day}
              className={cn(
                "relative flex-1 min-w-[32px] h-12 border-r border-border/50 transition-colors cursor-pointer",
                isBooked ? "bg-accent/20" : "bg-card hover:bg-secondary/50",
                isStart && "rounded-l-md",
                isEnd && "rounded-r-md"
              )}
              onMouseEnter={() => booking && setHoveredBooking(booking)}
              onMouseLeave={() => setHoveredBooking(null)}
            >
              {isStart && (
                <div className="absolute inset-y-1 left-1 right-0 bg-accent/30 rounded-l-md" />
              )}
              {hoveredBooking && hoveredBooking.id === booking?.id && isStart && (
                <div className="absolute top-full left-0 z-50 mt-1 w-56 rounded-lg border border-border bg-popover p-3 shadow-lg">
                  <p className="font-medium text-sm">{hoveredBooking.profiles?.full_name || 'Customer'}</p>
                  {hoveredBooking.drivers?.name && (
                    <p className="text-xs text-muted-foreground mt-1">Driver: {hoveredBooking.drivers.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(hoveredBooking.start_date).toLocaleDateString()} - {new Date(hoveredBooking.end_date).toLocaleDateString()}
                  </p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {hoveredBooking.status}
                  </Badge>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AvailabilityPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | '3months'>('month')
  const [vehicles, setVehicles] = useState<Record<string, Vehicle[]>>({})
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [companyId, setCompanyId] = useState<string | null>(null)
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December']

  // Fetch company ID
  useEffect(() => {
    async function fetchCompany() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (profile?.company_id) {
        setCompanyId(profile.company_id)
      }
    }
    fetchCompany()
  }, [])

  // Fetch vehicles and bookings when company ID is available
  useEffect(() => {
    if (!companyId) return

    async function fetchData() {
      setLoading(true)
      const supabase = createClient()

      // Fetch all vehicles for this company
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('company_id', companyId)
        .order('brand', { ascending: true })
        .order('model', { ascending: true })

      if (vehicleError) {
        console.error('[v0] Error fetching vehicles:', vehicleError)
      }

      // Group vehicles by brand
      const grouped: Record<string, Vehicle[]> = {}
      vehicleData?.forEach(v => {
        if (!grouped[v.brand]) {
          grouped[v.brand] = []
        }
        grouped[v.brand].push(v)
      })
      setVehicles(grouped)

      // Fetch all bookings for these vehicles for the current month view (+/- 1 month buffer)
      const vehicleIds = vehicleData?.map(v => v.id) || []
      if (vehicleIds.length > 0) {
        const startOfRange = new Date(year, month - 1, 1).toISOString()
        const endOfRange = new Date(year, month + 2, 0).toISOString()

        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            id,
            vehicle_id,
            start_date,
            end_date,
            status,
            user_id,
            profiles:user_id (full_name),
            driver_id,
            drivers:driver_id (name)
          `)
          .in('vehicle_id', vehicleIds)
          .gte('end_date', startOfRange)
          .lte('start_date', endOfRange)
          .in('status', ['pending', 'confirmed', 'active'])

        if (bookingError) {
          console.error('[v0] Error fetching bookings:', bookingError)
        }

        setBookings(bookingData || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [companyId, year, month])

  const handleToggleAvailability = async (vehicleId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'paused' : 'available'
    const supabase = createClient()

    const { error } = await supabase
      .from('vehicles')
      .update({ status: newStatus })
      .eq('id', vehicleId)

    if (error) {
      console.error('[v0] Error updating vehicle status:', error)
      return
    }

    // Update local state
    setVehicles(prev => {
      const updated = { ...prev }
      for (const brand in updated) {
        updated[brand] = updated[brand].map(v => 
          v.id === vehicleId ? { ...v, status: newStatus } : v
        )
      }
      return updated
    })
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1))
  }

  const totalVehicles = Object.values(vehicles).flat().length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Availability</h1>
          <p className="text-muted-foreground">Manage your fleet availability and bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('month')}
          >
            1 Month
          </Button>
          <Button 
            variant={viewMode === '3months' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('3months')}
          >
            3 Months
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <CardTitle className="text-lg">
            {monthNames[month]} {year}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : totalVehicles === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Car className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">No vehicles yet</p>
              <p className="text-sm text-muted-foreground">Add vehicles to your garage to see them here</p>
            </div>
          ) : (
            <>
              {/* Days Header */}
              <div className="flex border-b border-border bg-secondary/50">
                <div className="w-64 shrink-0 border-r border-border p-3">
                  <span className="text-sm font-medium">Vehicle</span>
                </div>
                <div className="flex flex-1">
                  {days.map((day) => {
                    const date = new Date(year, month, day)
                    const isToday = new Date().toDateString() === date.toDateString()
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6
                    
                    return (
                      <div 
                        key={day} 
                        className={cn(
                          "flex-1 min-w-[32px] p-2 text-center border-r border-border/50",
                          isToday && "bg-accent/20",
                          isWeekend && "bg-secondary/80"
                        )}
                      >
                        <span className={cn(
                          "text-xs font-medium",
                          isToday && "text-accent font-bold"
                        )}>{day}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* Vehicles by Brand */}
              <div className="max-h-[600px] overflow-auto">
                {Object.entries(vehicles).sort().map(([brand, cars]) => (
                  <div key={brand}>
                    {/* Brand Header */}
                    <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-secondary px-4 py-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">{brand}</span>
                      <Badge variant="secondary" className="ml-auto">{cars.length} cars</Badge>
                    </div>
                    
                    {/* Cars */}
                    {cars.map((vehicle) => (
                      <CalendarRow
                        key={vehicle.id}
                        vehicle={vehicle}
                        year={year}
                        month={month}
                        days={days}
                        bookings={bookings.filter(b => b.vehicle_id === vehicle.id)}
                        onToggleAvailability={handleToggleAvailability}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-8 rounded bg-card border border-border" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-8 rounded bg-accent/20" />
          <span className="text-muted-foreground">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-8 rounded bg-accent/20 border-l-4 border-accent" />
          <span className="text-muted-foreground">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={true} disabled className="scale-75" />
          <span className="text-muted-foreground">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={false} disabled className="scale-75" />
          <span className="text-muted-foreground">Paused</span>
        </div>
      </div>
    </div>
  )
}
