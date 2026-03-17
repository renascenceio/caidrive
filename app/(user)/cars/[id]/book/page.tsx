"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  ArrowLeft, CalendarIcon, MapPin, Clock, Shield, CreditCard, 
  FileText, Upload, Camera, Check, ChevronDown, X,
  Apple, Wallet, Bitcoin, DollarSign, Star, Gauge, Zap, Users, Power
} from "lucide-react"
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
  horsepower?: number
  seats: number
  rating: number
  companies: {
    name: string
  }
}

const COUNTRIES = [
  { code: 'US', name: 'United States of America', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
]

const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
  { id: 'paypal', name: 'PayPal', iconText: 'P', iconBg: 'bg-blue-600' },
  { id: 'apple', name: 'Apple Pay', icon: Apple },
  { id: 'crypto', name: 'Cryptocurrency', icon: Bitcoin, iconColor: 'text-orange-500' },
]

const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM'
]

type Step = 'dates' | 'documents' | 'payment' | 'confirmation'

export default function BookingPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [currentStep, setCurrentStep] = useState<Step>('dates')
  const [submitting, setSubmitting] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  
  const licenseInputRef = useRef<HTMLInputElement>(null)
  const passportInputRef = useRef<HTMLInputElement>(null)

  // Date selection
  const initialPickup = searchParams.get("pickup")
  const initialReturn = searchParams.get("return")

  const [pickupDate, setPickupDate] = useState<Date>(
    initialPickup ? new Date(initialPickup) : addDays(new Date(), 1)
  )
  const [returnDate, setReturnDate] = useState<Date>(
    initialReturn ? new Date(initialReturn) : addDays(new Date(), 3)
  )
  const [pickupTime, setPickupTime] = useState('10:00 AM')
  const [deliveryLocation, setDeliveryLocation] = useState<'pickup' | 'delivery'>('pickup')
  const [deliveryAddress, setDeliveryAddress] = useState('')

  // Document data
  const [licenseData, setLicenseData] = useState({
    firstName: '',
    surname: '',
    number: '',
    address: '',
    expiry: '',
    country: 'United States of America',
    image: null as string | null,
  })
  const [passportData, setPassportData] = useState({
    firstName: '',
    surname: '',
    number: '',
    country: 'United States of America',
    expiry: '',
    image: null as string | null,
  })

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cardData, setCardData] = useState({
    number: '',
    holder: '',
    expiry: '',
    cvv: '',
  })
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Country picker modal
  const [showLicenseCountry, setShowLicenseCountry] = useState(false)
  const [showPassportCountry, setShowPassportCountry] = useState(false)

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

  const days = Math.ceil(
    (returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const subtotal = (vehicle?.price_per_day || 0) * days
  const deposit = vehicle?.deposit_amount || Math.round(subtotal * 0.5)
  const total = subtotal + deposit

  const handleFileUpload = (type: 'license' | 'passport') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (type === 'license') {
          setLicenseData(prev => ({ ...prev, image: reader.result as string }))
        } else {
          setPassportData(prev => ({ ...prev, image: reader.result as string }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const canProceedFromDates = pickupDate && returnDate && 
    (deliveryLocation === 'pickup' || deliveryAddress)

  const canProceedFromDocuments = licenseData.firstName && licenseData.surname && 
    licenseData.number && licenseData.expiry && 
    passportData.firstName && passportData.surname && 
    passportData.number && passportData.expiry

  const canSubmitPayment = termsAccepted && 
    (paymentMethod !== 'card' || (cardData.number && cardData.holder && cardData.expiry && cardData.cvv))

  const handleSubmitBooking = async () => {
    if (!user || !vehicle) return
    
    setSubmitting(true)
    const supabase = createClient()

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        vehicle_id: vehicle.id,
        start_date: format(pickupDate, 'yyyy-MM-dd'),
        end_date: format(returnDate, 'yyyy-MM-dd'),
        pickup_location: deliveryLocation === 'delivery' ? deliveryAddress : 'Office Pickup',
        dropoff_location: deliveryLocation === 'delivery' ? deliveryAddress : 'Office Dropoff',
        total_amount: total,
        deposit_amount: deposit,
        status: 'pending',
        payment_method: paymentMethod,
        notes: JSON.stringify({
          license: {
            name: `${licenseData.firstName} ${licenseData.surname}`,
            number: licenseData.number,
            country: licenseData.country,
            expiry: licenseData.expiry,
          },
          passport: {
            name: `${passportData.firstName} ${passportData.surname}`,
            number: passportData.number,
            country: passportData.country,
            expiry: passportData.expiry,
          }
        })
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Booking error:', error)
      setSubmitting(false)
      return
    }

    setBookingId(booking.id)
    setSubmitting(false)
    setCurrentStep('confirmation')
  }

  if (loading || !vehicle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container flex items-center gap-4 h-16 px-4">
          {currentStep !== 'confirmation' ? (
            <button 
              onClick={() => {
                if (currentStep === 'dates') router.back()
                else if (currentStep === 'documents') setCurrentStep('dates')
                else if (currentStep === 'payment') setCurrentStep('documents')
              }}
            >
              <Button variant="ghost" size="icon" className="hover:bg-muted">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </button>
          ) : (
            <div className="w-10" />
          )}
          <h1 className="text-lg font-semibold text-foreground">
            {currentStep === 'dates' && 'Select Date & Time'}
            {currentStep === 'documents' && 'Document Verification'}
            {currentStep === 'payment' && 'Payment'}
            {currentStep === 'confirmation' && 'Booking Confirmed'}
          </h1>
        </div>
        
        {/* Progress Steps */}
        {currentStep !== 'confirmation' && (
          <div className="container px-4 pb-4">
            <div className="flex gap-2">
              {['dates', 'documents', 'payment'].map((step, idx) => (
                <div 
                  key={step}
                  className={cn(
                    "flex-1 h-1 rounded-full transition-colors",
                    ['dates', 'documents', 'payment'].indexOf(currentStep) >= idx 
                      ? "bg-foreground" 
                      : "bg-foreground/20"
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="container px-4 py-6">
        {/* STEP 1: DATES */}
        {currentStep === 'dates' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              {/* Date Selection */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Select Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Pickup Date */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">From</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal border-border bg-muted"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(pickupDate, "PPP")}
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
                      <label className="text-sm text-muted-foreground mb-2 block">To</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal border-border bg-muted"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(returnDate, "PPP")}
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
                  </div>

                  {/* Duration */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Duration</span>
                    </div>
                    <span className="font-semibold text-foreground">
                      {days} {days === 1 ? "day" : "days"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Time Selection */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pickup Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {TIME_SLOTS.map(time => (
                      <button
                        key={time}
                        onClick={() => setPickupTime(time)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm transition-colors",
                          pickupTime === time
                            ? "bg-foreground text-background"
                            : "bg-muted hover:bg-muted/80"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pickup Location */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Option
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <button
                    onClick={() => setDeliveryLocation('pickup')}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-lg border transition-colors text-left",
                      deliveryLocation === 'pickup' ? "border-foreground bg-muted" : "border-border"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      deliveryLocation === 'pickup' ? "border-foreground bg-foreground" : "border-muted-foreground"
                    )}>
                      {deliveryLocation === 'pickup' && <Check className="h-3 w-3 text-background" />}
                    </div>
                    <div>
                      <p className="font-medium">Pickup at Office</p>
                      <p className="text-sm text-muted-foreground">{vehicle.companies?.name} - Main Office</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setDeliveryLocation('delivery')}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-lg border transition-colors text-left",
                      deliveryLocation === 'delivery' ? "border-foreground bg-muted" : "border-border"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      deliveryLocation === 'delivery' ? "border-foreground bg-foreground" : "border-muted-foreground"
                    )}>
                      {deliveryLocation === 'delivery' && <Check className="h-3 w-3 text-background" />}
                    </div>
                    <div>
                      <p className="font-medium">Deliver to My Location</p>
                      <p className="text-sm text-muted-foreground">Additional delivery charges may apply</p>
                    </div>
                  </button>

                  {deliveryLocation === 'delivery' && (
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Delivery Address</label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter your address"
                        className="w-full px-4 py-3 bg-muted rounded-lg border border-border text-sm"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Vehicle Summary */}
            <div className="lg:sticky lg:top-32 h-fit space-y-6">
              <Card className="bg-card border-border overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  {vehicle.images?.[0] && (
                    <Image
                      src={vehicle.images[0]}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-md">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium text-white">{vehicle.rating?.toFixed(1) || '4.7'}</span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h2 className="text-xl font-bold text-foreground">{vehicle.brand} {vehicle.model}</h2>
                  <p className="text-sm text-muted-foreground">{vehicle.year} • {vehicle.companies?.name}</p>
                  
                  <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <Gauge className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm font-semibold">{vehicle.max_speed}</p>
                      <p className="text-xs text-muted-foreground">km/h</p>
                    </div>
                    <div className="text-center">
                      <Zap className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm font-semibold">{vehicle.acceleration}s</p>
                      <p className="text-xs text-muted-foreground">0-100</p>
                    </div>
                    <div className="text-center">
                      <Power className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm font-semibold">{vehicle.power || vehicle.horsepower}</p>
                      <p className="text-xs text-muted-foreground">bhp</p>
                    </div>
                    <div className="text-center">
                      <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm font-semibold">{vehicle.seats}</p>
                      <p className="text-xs text-muted-foreground">seats</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Summary */}
              <Card className="bg-card border-border">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">${vehicle.price_per_day}/day x {days} days</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Deposit</span>
                    <span>${deposit.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-accent">${total.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={() => setCurrentStep('documents')}
                disabled={!canProceedFromDates}
                className="w-full py-6 text-base"
              >
                Continue to Documents
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: DOCUMENTS */}
        {currentStep === 'documents' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              {/* Driving License */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Driving License
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">First Name</label>
                      <input
                        type="text"
                        value={licenseData.firstName}
                        onChange={(e) => setLicenseData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="John"
                        className="w-full px-4 py-3 bg-muted rounded-lg border border-border text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Surname</label>
                      <input
                        type="text"
                        value={licenseData.surname}
                        onChange={(e) => setLicenseData(prev => ({ ...prev, surname: e.target.value }))}
                        placeholder="Doe"
                        className="w-full px-4 py-3 bg-muted rounded-lg border border-border text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">License Number</label>
                    <input
                      type="text"
                      value={licenseData.number}
                      onChange={(e) => setLicenseData(prev => ({ ...prev, number: e.target.value }))}
                      placeholder="AA1783585"
                      className="w-full px-4 py-3 bg-muted rounded-lg border border-border text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Expiry Date</label>
                      <input
                        type="date"
                        value={licenseData.expiry}
                        onChange={(e) => setLicenseData(prev => ({ ...prev, expiry: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-muted rounded-lg border border-border text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Country of Issue</label>
                      <button
                        onClick={() => setShowLicenseCountry(true)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-muted rounded-lg border border-border"
                      >
                        <span className="text-sm truncate">{licenseData.country}</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </button>
                    </div>
                  </div>

                  {/* License Upload */}
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Upload License Photo</label>
                    <input
                      ref={licenseInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload('license')}
                      className="hidden"
                    />
                    {licenseData.image ? (
                      <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                        <div className="relative w-16 h-12 rounded overflow-hidden bg-secondary">
                          <Image src={licenseData.image} alt="License" fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">License uploaded</p>
                        </div>
                        <button onClick={() => setLicenseData(prev => ({ ...prev, image: null }))}>
                          <X className="h-5 w-5 text-muted-foreground" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => licenseInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-muted rounded-lg border border-dashed border-border hover:border-foreground/50 transition-colors"
                      >
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Upload or take a photo</span>
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Passport */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Passport
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">First Name</label>
                      <input
                        type="text"
                        value={passportData.firstName}
                        onChange={(e) => setPassportData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="John"
                        className="w-full px-4 py-3 bg-muted rounded-lg border border-border text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Surname</label>
                      <input
                        type="text"
                        value={passportData.surname}
                        onChange={(e) => setPassportData(prev => ({ ...prev, surname: e.target.value }))}
                        placeholder="Doe"
                        className="w-full px-4 py-3 bg-muted rounded-lg border border-border text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Passport Number</label>
                    <input
                      type="text"
                      value={passportData.number}
                      onChange={(e) => setPassportData(prev => ({ ...prev, number: e.target.value }))}
                      placeholder="AA1783585"
                      className="w-full px-4 py-3 bg-muted rounded-lg border border-border text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Expiry Date</label>
                      <input
                        type="date"
                        value={passportData.expiry}
                        onChange={(e) => setPassportData(prev => ({ ...prev, expiry: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-muted rounded-lg border border-border text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Country</label>
                      <button
                        onClick={() => setShowPassportCountry(true)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-muted rounded-lg border border-border"
                      >
                        <span className="text-sm truncate">{passportData.country}</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </button>
                    </div>
                  </div>

                  {/* Passport Upload */}
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Upload Passport Photo</label>
                    <input
                      ref={passportInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload('passport')}
                      className="hidden"
                    />
                    {passportData.image ? (
                      <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                        <div className="relative w-16 h-12 rounded overflow-hidden bg-secondary">
                          <Image src={passportData.image} alt="Passport" fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Passport uploaded</p>
                        </div>
                        <button onClick={() => setPassportData(prev => ({ ...prev, image: null }))}>
                          <X className="h-5 w-5 text-muted-foreground" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => passportInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-muted rounded-lg border border-dashed border-border hover:border-foreground/50 transition-colors"
                      >
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Upload or take a photo</span>
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:sticky lg:top-32 h-fit space-y-6">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-muted">
                      {vehicle.images?.[0] && (
                        <Image src={vehicle.images[0]} alt={vehicle.model} fill className="object-cover" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{vehicle.brand} {vehicle.model}</h3>
                      <p className="text-sm text-muted-foreground">{days} days rental</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dates</span>
                      <span>{format(pickupDate, 'MMM d')} - {format(returnDate, 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pickup Time</span>
                      <span>{pickupTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Deposit</span>
                    <span>${deposit.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-accent">${total.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={() => setCurrentStep('payment')}
                disabled={!canProceedFromDocuments}
                className="w-full py-6 text-base"
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT */}
        {currentStep === 'payment' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              {/* Payment Methods */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {PAYMENT_METHODS.map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-lg border transition-colors",
                        paymentMethod === method.id ? "border-foreground bg-muted" : "border-border"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        method.iconBg || "bg-secondary"
                      )}>
                        {method.iconText ? (
                          <span className="text-white font-bold">{method.iconText}</span>
                        ) : (
                          <method.icon className={cn("h-5 w-5", method.iconColor)} />
                        )}
                      </div>
                      <span className="flex-1 text-left font-medium">{method.name}</span>
                      {paymentMethod === method.id && (
                        <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                          <Check className="h-3 w-3 text-background" />
                        </div>
                      )}
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Card Form */}
              {paymentMethod === 'card' && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Card Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Card Number</label>
                      <input
                        type="text"
                        value={cardData.number}
                        onChange={(e) => setCardData(prev => ({ ...prev, number: e.target.value }))}
                        placeholder="0000 0000 0000 0000"
                        className="w-full px-4 py-3 bg-muted rounded-lg border border-border text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Card Holder Name</label>
                      <input
                        type="text"
                        value={cardData.holder}
                        onChange={(e) => setCardData(prev => ({ ...prev, holder: e.target.value }))}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-muted rounded-lg border border-border text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Expiry Date</label>
                        <input
                          type="text"
                          value={cardData.expiry}
                          onChange={(e) => setCardData(prev => ({ ...prev, expiry: e.target.value }))}
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 bg-muted rounded-lg border border-border text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">CVV</label>
                        <input
                          type="text"
                          value={cardData.cvv}
                          onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
                          placeholder="123"
                          className="w-full px-4 py-3 bg-muted rounded-lg border border-border text-sm"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Terms */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div 
                  onClick={() => setTermsAccepted(!termsAccepted)}
                  className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                    termsAccepted ? "bg-foreground border-foreground" : "border-muted-foreground"
                  )}
                >
                  {termsAccepted && <Check className="h-3 w-3 text-background" />}
                </div>
                <span className="text-sm">
                  I agree with the{' '}
                  <Link href="/terms" className="text-accent underline">Terms & Conditions</Link>
                </span>
              </label>
            </div>

            {/* Right Column - Final Summary */}
            <div className="lg:sticky lg:top-32 h-fit space-y-6">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-muted">
                      {vehicle.images?.[0] && (
                        <Image src={vehicle.images[0]} alt={vehicle.model} fill className="object-cover" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{vehicle.brand} {vehicle.model}</h3>
                      <p className="text-sm text-muted-foreground">{days} days rental</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Booking Date</span>
                    <span>{format(pickupDate, 'MMM d')} - {format(returnDate, 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Number of Days</span>
                    <span>{days} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price per Day</span>
                    <span>${vehicle.price_per_day.toLocaleString()}/day</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Deposit</span>
                    <span>${deposit.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-accent">${total.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={handleSubmitBooking}
                disabled={!canSubmitPayment || submitting}
                className="w-full py-6 text-base"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Pay $${total.toLocaleString()}`
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: CONFIRMATION */}
        {currentStep === 'confirmation' && (
          <div className="max-w-xl mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Booking Successful!</h1>
            <p className="text-muted-foreground mb-8">
              Your booking has been confirmed. You will receive an email confirmation shortly.
            </p>

            <Card className="bg-card border-border mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-muted">
                    {vehicle.images?.[0] && (
                      <Image src={vehicle.images[0]} alt={vehicle.model} fill className="object-cover" />
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">{vehicle.brand} {vehicle.model}</h3>
                    <p className="text-sm text-muted-foreground">{vehicle.year}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booking Reference</span>
                    <span className="font-mono font-medium">{bookingId?.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dates</span>
                    <span>{format(pickupDate, 'MMM d')} - {format(returnDate, 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pickup Time</span>
                    <span>{pickupTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span>{deliveryLocation === 'delivery' ? 'Delivery' : 'Office Pickup'}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between font-bold">
                    <span>Total Paid</span>
                    <span className="text-accent">${total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Link href="/rides" className="flex-1">
                <Button variant="outline" className="w-full py-6">View My Bookings</Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button className="w-full py-6">Done</Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Country Picker Modals */}
      {showLicenseCountry && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-semibold">Select Country</h3>
              <button onClick={() => setShowLicenseCountry(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {COUNTRIES.map(country => (
                <button
                  key={country.code}
                  onClick={() => {
                    setLicenseData(prev => ({ ...prev, country: country.name }))
                    setShowLicenseCountry(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors",
                    licenseData.country === country.name && "bg-muted"
                  )}
                >
                  <span className="text-xl">{country.flag}</span>
                  <span className="text-sm">{country.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPassportCountry && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-semibold">Select Country</h3>
              <button onClick={() => setShowPassportCountry(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {COUNTRIES.map(country => (
                <button
                  key={country.code}
                  onClick={() => {
                    setPassportData(prev => ({ ...prev, country: country.name }))
                    setShowPassportCountry(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors",
                    passportData.country === country.name && "bg-muted"
                  )}
                >
                  <span className="text-xl">{country.flag}</span>
                  <span className="text-sm">{country.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
