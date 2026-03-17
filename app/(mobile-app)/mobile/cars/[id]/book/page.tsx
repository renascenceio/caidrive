"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { 
  ArrowLeft, Star, Gauge, Zap, Users, Power, 
  MapPin, ChevronRight, CreditCard, Wallet, Apple, 
  Bitcoin, DollarSign, Check
} from "lucide-react"

interface Vehicle {
  id: string
  brand: string
  model: string
  price_per_day: number
  images: string[]
  deposit_amount: number
  rating: number
  max_speed: number
  acceleration: number
  seats: number
  horsepower: number
}

export default function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  
  const [bookingData, setBookingData] = useState({
    pickupDate: "2024-04-02",
    returnDate: "2024-04-04",
    drivingLicense: "AA456767",
    passport: "AA 4567 NH",
    paymentMethod: "paypal",
    deliveryLocation: "1 E 2nd St, New York, NY 10003, USA"
  })

  useEffect(() => {
    const fetchVehicle = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single()
      
      if (data) setVehicle(data)
    }
    fetchVehicle()
  }, [id])

  const calculateDays = () => {
    const pickup = new Date(bookingData.pickupDate)
    const returnDate = new Date(bookingData.returnDate)
    const diff = Math.ceil((returnDate.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(diff, 1)
  }

  const days = calculateDays()
  const pricePerDay = vehicle?.price_per_day || 1678
  const discountPercent = 5
  const bonusDiscount = 78
  const bookingAmount = pricePerDay * days
  const discountAmount = Math.round(bookingAmount * (discountPercent / 100))
  const depositAmount = vehicle?.deposit_amount || 78
  const totalPay = bookingAmount - discountAmount - bonusDiscount + depositAmount

  const handleConfirmBooking = async () => {
    if (!termsAccepted) return
    
    setLoading(true)
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push("/mobile/login")
      return
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        vehicle_id: id,
        start_date: bookingData.pickupDate,
        end_date: bookingData.returnDate,
        pickup_location: bookingData.deliveryLocation,
        dropoff_location: bookingData.deliveryLocation,
        total_amount: totalPay,
        deposit_amount: depositAmount,
        status: 'pending',
        payment_method: bookingData.paymentMethod
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    router.push(`/mobile/booking/confirmation/${booking.id}`)
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-4 px-4 py-3">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Booking Details</h1>
        </div>
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* Car Summary Card - Matching PDF */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="relative h-40">
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

        {/* Map & Delivery Location */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="h-32 bg-secondary/50 relative">
            {/* Placeholder map */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-accent" />
            </div>
          </div>
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Delivery location</p>
            <p className="text-sm font-medium">{bookingData.deliveryLocation}</p>
          </div>
        </div>

        {/* Price & View More */}
        <div className="flex items-center justify-between bg-card border border-border rounded-2xl p-4">
          <div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="text-lg font-bold">${pricePerDay.toLocaleString()}/day</p>
          </div>
          <button className="text-sm text-accent font-medium flex items-center gap-1">
            View more <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Booking Details - Date & Documents */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
          <p className="text-xs text-muted-foreground">Make minimum payment, make the booking</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Booking Date</p>
              <p className="text-sm font-medium">02 Apr, 2024</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Return Date</p>
              <p className="text-sm font-medium">04 Apr, 2024</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Driving License</p>
              <p className="text-sm font-medium">{bookingData.drivingLicense}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Passport</p>
              <p className="text-sm font-medium">{bookingData.passport}</p>
            </div>
          </div>
        </div>

        {/* Payment Method - Matching PDF exactly */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="font-semibold mb-4">Payment Method</h3>
          <div className="space-y-2">
            <PaymentOption 
              id="paypal" 
              name="PayPal" 
              icon={<div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">P</div>}
              selected={bookingData.paymentMethod === "paypal"}
              onSelect={() => setBookingData({...bookingData, paymentMethod: "paypal"})}
            />
            <PaymentOption 
              id="card" 
              name="Credit/Debit Card" 
              icon={<CreditCard className="h-5 w-5 text-muted-foreground" />}
              selected={bookingData.paymentMethod === "card"}
              onSelect={() => setBookingData({...bookingData, paymentMethod: "card"})}
            />
            <PaymentOption 
              id="apple" 
              name="Apple Pay" 
              icon={<Apple className="h-5 w-5" />}
              selected={bookingData.paymentMethod === "apple"}
              onSelect={() => setBookingData({...bookingData, paymentMethod: "apple"})}
            />
            <PaymentOption 
              id="samsung" 
              name="Samsung Pay" 
              icon={<div className="w-6 h-6 bg-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">S</div>}
              selected={bookingData.paymentMethod === "samsung"}
              onSelect={() => setBookingData({...bookingData, paymentMethod: "samsung"})}
            />
            <PaymentOption 
              id="cash" 
              name="Cash" 
              icon={<DollarSign className="h-5 w-5 text-green-600" />}
              selected={bookingData.paymentMethod === "cash"}
              onSelect={() => setBookingData({...bookingData, paymentMethod: "cash"})}
            />
            <PaymentOption 
              id="crypto" 
              name="Crypto" 
              icon={<Bitcoin className="h-5 w-5 text-orange-500" />}
              selected={bookingData.paymentMethod === "crypto"}
              onSelect={() => setBookingData({...bookingData, paymentMethod: "crypto"})}
            />
          </div>
        </div>

        {/* Booking Info Summary - Matching PDF */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="font-semibold mb-4">Booking Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Booking Date</span>
              <span>2 Apr 2024 - 4 Apr 2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Number of Days</span>
              <span>{days} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price per Day</span>
              <span>${pricePerDay.toLocaleString()}/day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-green-600">{discountPercent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bonus Discount</span>
              <span className="text-green-600">${bonusDiscount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Booking Amount</span>
              <span>${bookingAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deposit Amount</span>
              <span>${depositAmount}</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between font-bold text-base">
              <span>Total Pay</span>
              <span className="text-accent">${totalPay.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Terms & Conditions Checkbox */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div 
            className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
              termsAccepted ? "bg-accent border-accent" : "border-muted-foreground"
            )}
            onClick={() => setTermsAccepted(!termsAccepted)}
          >
            {termsAccepted && <Check className="h-3 w-3 text-white" />}
          </div>
          <span className="text-sm">
            I agree with{' '}
            <Link href="/mobile/terms" className="text-accent underline">Terms & Conditions</Link>.
          </span>
        </label>
      </div>

      {/* Fixed Bottom Button - Matching PDF */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border p-4 pb-8">
        <button
          onClick={handleConfirmBooking}
          disabled={!termsAccepted || loading}
          className={cn(
            "w-full py-4 rounded-2xl font-semibold text-base",
            "bg-accent text-white",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all active:scale-[0.98]"
          )}
        >
          {loading ? "Processing..." : "Proceed to Pay"}
        </button>
      </div>
    </div>
  )
}

function PaymentOption({ 
  id, 
  name, 
  icon, 
  selected, 
  onSelect 
}: { 
  id: string
  name: string
  icon: React.ReactNode
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-4 p-3 rounded-xl border transition-colors",
        selected ? "border-accent bg-accent/5" : "border-border"
      )}
    >
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
        {icon}
      </div>
      <span className="flex-1 text-left font-medium">{name}</span>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </button>
  )
}
