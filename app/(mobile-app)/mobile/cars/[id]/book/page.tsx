"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { ArrowLeft, Calendar, Clock, MapPin, Shield, CreditCard, Check, ChevronRight } from "lucide-react"

interface Vehicle {
  id: string
  brand: string
  model: string
  price_per_day: number
  images: string[]
  deposit_amount: number
}

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const [bookingData, setBookingData] = useState({
    pickupDate: "",
    pickupTime: "10:00",
    returnDate: "",
    returnTime: "10:00",
    pickupLocation: "delivery",
    pickupAddress: "",
    deliveryNotes: "",
    insurance: "basic",
    paymentMethod: "card"
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
    if (!bookingData.pickupDate || !bookingData.returnDate) return 1
    const pickup = new Date(bookingData.pickupDate)
    const returnDate = new Date(bookingData.returnDate)
    const diff = Math.ceil((returnDate.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(diff, 1)
  }

  const days = calculateDays()
  const rentalPrice = (vehicle?.price_per_day || 0) * days
  const insurancePrice = bookingData.insurance === "premium" ? 150 * days : bookingData.insurance === "full" ? 300 * days : 0
  const deliveryFee = bookingData.pickupLocation === "delivery" ? 100 : 0
  const totalPrice = rentalPrice + insurancePrice + deliveryFee
  const depositAmount = vehicle?.deposit_amount || 3000

  const handleConfirmBooking = async () => {
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
        company_id: vehicle?.company_id,
        start_date: `${bookingData.pickupDate}T${bookingData.pickupTime}:00`,
        end_date: `${bookingData.returnDate}T${bookingData.returnTime}:00`,
        pickup_location: bookingData.pickupAddress || 'Office Pickup',
        dropoff_location: bookingData.pickupAddress || 'Office Return',
        total_amount: totalPrice,
        deposit_amount: depositAmount,
        status: 'pending',
        insurance_type: bookingData.insurance,
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button 
          onClick={() => step > 1 ? setStep(step - 1) : router.back()}
          className="p-2 rounded-full hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">
          {step === 1 ? "Select Dates" : step === 2 ? "Delivery & Insurance" : "Payment"}
        </h1>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 px-6 py-4">
        {[1, 2, 3].map((s) => (
          <div 
            key={s}
            className={cn(
              "flex-1 h-1 rounded-full transition-colors",
              s <= step ? "bg-accent" : "bg-secondary"
            )}
          />
        ))}
      </div>

      {/* Vehicle Summary */}
      <div className="flex items-center gap-4 px-6 py-4 bg-secondary/30 mx-4 rounded-2xl mb-4">
        <div className="relative h-16 w-24 rounded-xl overflow-hidden">
          <Image
            src={vehicle.images?.[0] || "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400"}
            alt={vehicle.model}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase">{vehicle.brand}</p>
          <p className="font-semibold">{vehicle.model}</p>
          <p className="text-sm text-accent font-medium">AED {vehicle.price_per_day}/day</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 overflow-auto">
        {step === 1 && (
          <div className="space-y-6">
            {/* Pickup Date & Time */}
            <div className="bg-card rounded-2xl p-4 border border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                Pick-up
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Date</label>
                  <input
                    type="date"
                    value={bookingData.pickupDate}
                    onChange={(e) => setBookingData({ ...bookingData, pickupDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Time</label>
                  <select
                    value={bookingData.pickupTime}
                    onChange={(e) => setBookingData({ ...bookingData, pickupTime: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm"
                  >
                    {Array.from({ length: 13 }, (_, i) => i + 8).map(hour => (
                      <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                        {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Return Date & Time */}
            <div className="bg-card rounded-2xl p-4 border border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                Return
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Date</label>
                  <input
                    type="date"
                    value={bookingData.returnDate}
                    onChange={(e) => setBookingData({ ...bookingData, returnDate: e.target.value })}
                    min={bookingData.pickupDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Time</label>
                  <select
                    value={bookingData.returnTime}
                    onChange={(e) => setBookingData({ ...bookingData, returnTime: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm"
                  >
                    {Array.from({ length: 13 }, (_, i) => i + 8).map(hour => (
                      <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                        {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Duration Summary */}
            {bookingData.pickupDate && bookingData.returnDate && (
              <div className="bg-accent/10 rounded-2xl p-4 border border-accent/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rental Duration</span>
                  <span className="font-semibold">{days} {days === 1 ? 'day' : 'days'}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Pickup Location */}
            <div className="bg-card rounded-2xl p-4 border border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                Delivery Option
              </h3>
              <div className="space-y-3">
                <label className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors",
                  bookingData.pickupLocation === "delivery" ? "border-accent bg-accent/5" : "border-border"
                )}>
                  <input
                    type="radio"
                    name="pickup"
                    checked={bookingData.pickupLocation === "delivery"}
                    onChange={() => setBookingData({ ...bookingData, pickupLocation: "delivery" })}
                    className="sr-only"
                  />
                  <div className={cn(
                    "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                    bookingData.pickupLocation === "delivery" ? "border-accent" : "border-muted-foreground"
                  )}>
                    {bookingData.pickupLocation === "delivery" && (
                      <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Delivery to my location</p>
                    <p className="text-sm text-muted-foreground">+AED 100</p>
                  </div>
                </label>

                <label className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors",
                  bookingData.pickupLocation === "office" ? "border-accent bg-accent/5" : "border-border"
                )}>
                  <input
                    type="radio"
                    name="pickup"
                    checked={bookingData.pickupLocation === "office"}
                    onChange={() => setBookingData({ ...bookingData, pickupLocation: "office" })}
                    className="sr-only"
                  />
                  <div className={cn(
                    "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                    bookingData.pickupLocation === "office" ? "border-accent" : "border-muted-foreground"
                  )}>
                    {bookingData.pickupLocation === "office" && (
                      <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Pick up from office</p>
                    <p className="text-sm text-muted-foreground">Free</p>
                  </div>
                </label>
              </div>

              {bookingData.pickupLocation === "delivery" && (
                <div className="mt-4 space-y-2">
                  <label className="text-xs text-muted-foreground">Delivery Address</label>
                  <input
                    type="text"
                    value={bookingData.pickupAddress}
                    onChange={(e) => setBookingData({ ...bookingData, pickupAddress: e.target.value })}
                    placeholder="Enter your address"
                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-sm"
                  />
                </div>
              )}
            </div>

            {/* Insurance */}
            <div className="bg-card rounded-2xl p-4 border border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                Insurance
              </h3>
              <div className="space-y-3">
                {[
                  { id: "basic", name: "Basic", desc: "Standard coverage included", price: 0 },
                  { id: "premium", name: "Premium", desc: "Reduced excess, 24/7 support", price: 150 },
                  { id: "full", name: "Full Coverage", desc: "Zero excess, VIP support", price: 300 }
                ].map(opt => (
                  <label key={opt.id} className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors",
                    bookingData.insurance === opt.id ? "border-accent bg-accent/5" : "border-border"
                  )}>
                    <input
                      type="radio"
                      name="insurance"
                      checked={bookingData.insurance === opt.id}
                      onChange={() => setBookingData({ ...bookingData, insurance: opt.id })}
                      className="sr-only"
                    />
                    <div className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                      bookingData.insurance === opt.id ? "border-accent" : "border-muted-foreground"
                    )}>
                      {bookingData.insurance === opt.id && (
                        <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{opt.name}</p>
                      <p className="text-sm text-muted-foreground">{opt.desc}</p>
                    </div>
                    <span className="font-medium">
                      {opt.price === 0 ? "Included" : `+AED ${opt.price}/day`}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            {/* Payment Method */}
            <div className="bg-card rounded-2xl p-4 border border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-accent" />
                Payment Method
              </h3>
              <div className="space-y-3">
                {[
                  { id: "card", name: "Credit/Debit Card", icon: "💳" },
                  { id: "apple", name: "Apple Pay", icon: "" },
                  { id: "cash", name: "Cash on Delivery", icon: "💵" }
                ].map(method => (
                  <label key={method.id} className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors",
                    bookingData.paymentMethod === method.id ? "border-accent bg-accent/5" : "border-border"
                  )}>
                    <input
                      type="radio"
                      name="payment"
                      checked={bookingData.paymentMethod === method.id}
                      onChange={() => setBookingData({ ...bookingData, paymentMethod: method.id })}
                      className="sr-only"
                    />
                    <div className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                      bookingData.paymentMethod === method.id ? "border-accent" : "border-muted-foreground"
                    )}>
                      {bookingData.paymentMethod === method.id && (
                        <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                      )}
                    </div>
                    <span className="text-xl">{method.icon}</span>
                    <span className="font-medium">{method.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-card rounded-2xl p-4 border border-border">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rental ({days} {days === 1 ? 'day' : 'days'})</span>
                  <span>AED {rentalPrice.toLocaleString()}</span>
                </div>
                {insurancePrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Insurance</span>
                    <span>AED {insurancePrice.toLocaleString()}</span>
                  </div>
                )}
                {deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>AED {deliveryFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span className="text-accent">AED {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Security Deposit (refundable)</span>
                  <span>AED {depositAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="p-4 border-t border-border bg-card">
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && (!bookingData.pickupDate || !bookingData.returnDate)}
            className={cn(
              "w-full py-4 rounded-xl font-semibold",
              "bg-accent text-white",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2",
              "transition-all active:scale-[0.98]"
            )}
          >
            <span>Continue</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={handleConfirmBooking}
            disabled={loading}
            className={cn(
              "w-full py-4 rounded-xl font-semibold",
              "bg-accent text-white",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2",
              "transition-all active:scale-[0.98]"
            )}
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <Check className="h-5 w-5" />
                <span>Confirm Booking</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
