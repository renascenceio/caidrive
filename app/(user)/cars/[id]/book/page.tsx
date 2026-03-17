"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { ArrowLeft, CalendarIcon, MapPin, Clock, Shield } from "lucide-react"
import { format, addDays } from "date-fns"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  images: string[]
  price_per_day: number
  deposit_amount: number
  max_speed: number
  acceleration: number
  power: number
  seats: number
  rating: number
  companies: {
    name: string
  }
}

export default function BookingPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)

  // Date selection
  const initialPickup = searchParams.get("pickup")
  const initialReturn = searchParams.get("return")

  const [pickupDate, setPickupDate] = useState<Date>(
    initialPickup ? new Date(initialPickup) : addDays(new Date(), 1)
  )
  const [returnDate, setReturnDate] = useState<Date>(
    initialReturn ? new Date(initialReturn) : addDays(new Date(), 3)
  )

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      // Check authentication
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push(`/auth/login?redirect=/cars/${params.id}/book`)
        return
      }

      setUser(user)

      // Fetch vehicle
      const { data, error } = await supabase
        .from("vehicles")
        .select("*, companies(name)")
        .eq("id", params.id)
        .single()

      if (error || !data) {
        router.push("/cars")
        return
      }

      setVehicle(data)
      setLoading(false)
    }

    fetchData()
  }, [params.id, router])

  if (loading || !vehicle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const days = Math.ceil(
    (returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container flex items-center gap-4 h-16 px-4">
          <Link href={`/cars/${params.id}`}>
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-foreground">
            Complete Booking
          </h1>
        </div>
      </header>

      <main className="container px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Booking Details */}
          <div className="space-y-6">
            {/* Vehicle Card */}
            <Card className="bg-card border-border overflow-hidden">
              <div className="aspect-video bg-muted">
                {vehicle.images?.[0] && (
                  <img
                    src={vehicle.images[0]}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {vehicle.brand} {vehicle.model}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.year} • {vehicle.companies?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-accent">
                      ${vehicle.price_per_day}
                    </p>
                    <p className="text-xs text-muted-foreground">per day</p>
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">
                      {vehicle.max_speed}
                    </p>
                    <p className="text-xs text-muted-foreground">km/h</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">
                      {vehicle.acceleration}s
                    </p>
                    <p className="text-xs text-muted-foreground">0-100</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">
                      {vehicle.power}
                    </p>
                    <p className="text-xs text-muted-foreground">bhp</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">
                      {vehicle.seats}
                    </p>
                    <p className="text-xs text-muted-foreground">seats</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date Selection */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Select Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pickup Date */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Pickup Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-border bg-muted",
                          !pickupDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {pickupDate ? (
                          format(pickupDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border">
                      <Calendar
                        mode="single"
                        selected={pickupDate}
                        onSelect={(date) => {
                          if (date) {
                            setPickupDate(date)
                            if (date >= returnDate) {
                              setReturnDate(addDays(date, 1))
                            }
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Return Date */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Return Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-border bg-muted",
                          !returnDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {returnDate ? (
                          format(returnDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border">
                      <Calendar
                        mode="single"
                        selected={returnDate}
                        onSelect={(date) => date && setReturnDate(date)}
                        disabled={(date) => date <= pickupDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Duration */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Duration
                    </span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {days} {days === 1 ? "day" : "days"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Pickup Location */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Pickup Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4">
                  <p className="font-medium text-foreground">
                    {vehicle.companies?.name} - Main Office
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Dubai Marina, UAE
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Pickup time: 10:00 AM
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Protection Info */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Included Protection
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your booking includes basic collision damage waiver and
                      theft protection. Additional coverage options available at
                      pickup.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Checkout */}
          <div className="lg:sticky lg:top-24 h-fit">
            <CheckoutForm
              vehicle={vehicle}
              pickupDate={pickupDate}
              returnDate={returnDate}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
