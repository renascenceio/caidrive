'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Car, ChevronLeft, ChevronRight, Calendar, Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

// Mock data grouped by brand
const mockVehicles = {
  'Ferrari': [
    { id: '1', model: 'SF90 Stradale', year: 2024, color: 'Rosso Corsa', plate: 'J92450', image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=200', available: true },
    { id: '2', model: 'F8 Tributo', year: 2023, color: 'Giallo Modena', plate: 'K82341', image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=200', available: true },
  ],
  'Lamborghini': [
    { id: '3', model: 'Huracán EVO', year: 2024, color: 'Verde Mantis', plate: 'L73892', image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=200', available: true },
    { id: '4', model: 'Urus', year: 2024, color: 'Nero Noctis', plate: 'M64521', image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=200', available: false },
  ],
  'Porsche': [
    { id: '5', model: '911 GT3 RS', year: 2024, color: 'GT Silver', plate: 'N55432', image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f373e?w=200', available: true },
  ],
  'Rolls-Royce': [
    { id: '6', model: 'Ghost', year: 2024, color: 'Black Diamond', plate: 'P44321', image: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=200', available: true },
  ],
  'Bentley': [
    { id: '7', model: 'Continental GT', year: 2024, color: 'Beluga Black', plate: 'Q33210', image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=200', available: true },
  ],
  'McLaren': [
    { id: '8', model: '720S Spider', year: 2024, color: 'Papaya Spark', plate: 'R22109', image: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=200', available: true },
  ],
}

// Mock bookings data
const mockBookings: Record<string, { start: number; end: number; customer: string; driver: string }[]> = {
  '1': [{ start: 5, end: 8, customer: 'Ahmed Al Maktoum', driver: 'Mohammed' }],
  '3': [{ start: 12, end: 15, customer: 'Sarah Johnson', driver: 'Ali' }],
  '5': [{ start: 1, end: 3, customer: 'James Chen', driver: 'Hassan' }, { start: 20, end: 25, customer: 'Elena Petrova', driver: 'Omar' }],
  '6': [{ start: 10, end: 14, customer: 'Robert Williams', driver: 'Khalid' }],
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function CalendarRow({ 
  vehicle, 
  days, 
  bookings,
  onToggleAvailability 
}: { 
  vehicle: typeof mockVehicles['Ferrari'][0]
  days: number[]
  bookings: { start: number; end: number; customer: string; driver: string }[]
  onToggleAvailability: (id: string) => void
}) {
  const [hoveredBooking, setHoveredBooking] = useState<typeof bookings[0] | null>(null)
  
  return (
    <div className="flex items-stretch border-b border-border">
      {/* Car Info */}
      <div className="flex w-64 shrink-0 items-center gap-3 border-r border-border p-3 bg-card">
        <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-secondary">
          <Image src={vehicle.image} alt={vehicle.model} fill className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{vehicle.year} {vehicle.model}</p>
          <p className="text-xs text-muted-foreground">{vehicle.color} · {vehicle.plate}</p>
        </div>
        <Switch 
          checked={vehicle.available} 
          onCheckedChange={() => onToggleAvailability(vehicle.id)}
        />
      </div>
      
      {/* Calendar Days */}
      <div className="flex flex-1">
        {days.map((day) => {
          const booking = bookings.find(b => day >= b.start && day <= b.end)
          const isBooked = !!booking
          const isStart = booking?.start === day
          const isEnd = booking?.end === day
          
          return (
            <div 
              key={day}
              className={cn(
                "relative flex-1 min-w-[32px] h-12 border-r border-border/50 transition-colors",
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
              {hoveredBooking && isStart && (
                <div className="absolute top-full left-0 z-50 mt-1 w-48 rounded-lg border border-border bg-popover p-3 shadow-lg">
                  <p className="font-medium text-sm">{hoveredBooking.customer}</p>
                  <p className="text-xs text-muted-foreground mt-1">Driver: {hoveredBooking.driver}</p>
                  <p className="text-xs text-muted-foreground">Days {hoveredBooking.start} - {hoveredBooking.end}</p>
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
  const [vehicles, setVehicles] = useState(mockVehicles)
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December']

  const handleToggleAvailability = (id: string) => {
    setVehicles(prev => {
      const updated = { ...prev }
      for (const brand in updated) {
        updated[brand] = updated[brand].map(v => 
          v.id === id ? { ...v, available: !v.available } : v
        )
      }
      return updated
    })
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1))
  }

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
          {/* Days Header */}
          <div className="flex border-b border-border bg-secondary/50">
            <div className="w-64 shrink-0 border-r border-border p-3">
              <span className="text-sm font-medium">Vehicle</span>
            </div>
            <div className="flex flex-1">
              {days.map((day) => (
                <div key={day} className="flex-1 min-w-[32px] p-2 text-center border-r border-border/50">
                  <span className="text-xs font-medium">{day}</span>
                </div>
              ))}
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
                    days={days}
                    bookings={mockBookings[vehicle.id] || []}
                    onToggleAvailability={handleToggleAvailability}
                  />
                ))}
              </div>
            ))}
          </div>
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
          <Switch checked={true} disabled className="scale-75" />
          <span className="text-muted-foreground">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={false} disabled className="scale-75" />
          <span className="text-muted-foreground">Unavailable</span>
        </div>
      </div>
    </div>
  )
}
