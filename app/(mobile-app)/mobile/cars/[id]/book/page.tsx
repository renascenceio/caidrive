'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { 
  ArrowLeft, Calendar, Clock, MapPin, ChevronRight, 
  Car, FileText, CreditCard, Check, X
} from 'lucide-react'

// Step components
import { DateTimeStep } from './steps/date-time'
import { DrivingLicenseStep } from './steps/driving-license'
import { PassportStep } from './steps/passport'
import { BookingDetailsStep } from './steps/booking-details'
import { PaymentStep } from './steps/payment'
import { ConfirmationStep } from './steps/confirmation'

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

export interface BookingData {
  // Date & Time
  startDate: string
  endDate: string
  pickupTime: string
  deliveryLocation: string
  deliveryAddress: string
  // Driving License
  licenseFirstName: string
  licenseSurname: string
  licenseNumber: string
  licenseAddress: string
  licenseExpiry: string
  licenseCountry: string
  licenseImage: string | null
  isInternational: boolean
  // Passport
  passportFirstName: string
  passportSurname: string
  passportNumber: string
  passportCountry: string
  passportExpiry: string
  passportImage: string | null
  // Payment
  paymentMethod: string
  cardNumber?: string
  cardHolder?: string
  cardExpiry?: string
  cardCvv?: string
  // Terms
  termsAccepted: boolean
}

const STEPS = [
  { id: 'date-time', title: 'Select Date & Time', icon: Calendar },
  { id: 'driving-license', title: 'Driving License', icon: FileText },
  { id: 'passport', title: 'Passport', icon: FileText },
  { id: 'booking-details', title: 'Booking Details', icon: Car },
  { id: 'payment', title: 'Payment Method', icon: CreditCard },
  { id: 'confirmation', title: 'Confirmation', icon: Check },
]

export default function MobileBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  
  const [bookingData, setBookingData] = useState<BookingData>({
    startDate: '',
    endDate: '',
    pickupTime: '09:00 AM',
    deliveryLocation: 'pickup',
    deliveryAddress: '',
    licenseFirstName: '',
    licenseSurname: '',
    licenseNumber: '',
    licenseAddress: '',
    licenseExpiry: '',
    licenseCountry: 'United States of America',
    licenseImage: null,
    isInternational: false,
    passportFirstName: '',
    passportSurname: '',
    passportNumber: '',
    passportCountry: 'United States of America',
    passportExpiry: '',
    passportImage: null,
    paymentMethod: 'card',
    termsAccepted: false,
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

  const updateBookingData = (updates: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    } else {
      router.back()
    }
  }

  const handleSubmitBooking = async () => {
    setLoading(true)
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login?redirect=' + encodeURIComponent(`/mobile/cars/${id}/book`))
      return
    }

    // Calculate totals
    const days = calculateDays()
    const subtotal = (vehicle?.price_per_day || 0) * days
    const deposit = vehicle?.deposit_amount || 0
    const total = subtotal + deposit

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        vehicle_id: id,
        start_date: bookingData.startDate,
        end_date: bookingData.endDate,
        pickup_location: bookingData.deliveryLocation === 'delivery' ? bookingData.deliveryAddress : 'Office Pickup',
        dropoff_location: bookingData.deliveryLocation === 'delivery' ? bookingData.deliveryAddress : 'Office Dropoff',
        total_amount: total,
        deposit_amount: deposit,
        status: 'pending',
        payment_method: bookingData.paymentMethod,
        // Store document info in notes
        notes: JSON.stringify({
          license: {
            name: `${bookingData.licenseFirstName} ${bookingData.licenseSurname}`,
            number: bookingData.licenseNumber,
            country: bookingData.licenseCountry,
            expiry: bookingData.licenseExpiry,
          },
          passport: {
            name: `${bookingData.passportFirstName} ${bookingData.passportSurname}`,
            number: bookingData.passportNumber,
            country: bookingData.passportCountry,
            expiry: bookingData.passportExpiry,
          }
        })
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Booking error:', error)
      setLoading(false)
      return
    }

    setBookingId(booking.id)
    setLoading(false)
    nextStep() // Go to confirmation
  }

  const calculateDays = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 1
    const start = new Date(bookingData.startDate)
    const end = new Date(bookingData.endDate)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(diff, 1)
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  const days = calculateDays()
  const subtotal = vehicle.price_per_day * days
  const deposit = vehicle.deposit_amount || Math.round(subtotal * 0.5)
  const total = subtotal + deposit

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'date-time':
        return (
          <DateTimeStep 
            data={bookingData} 
            onChange={updateBookingData} 
            onNext={nextStep}
          />
        )
      case 'driving-license':
        return (
          <DrivingLicenseStep 
            data={bookingData} 
            onChange={updateBookingData} 
            onNext={nextStep}
          />
        )
      case 'passport':
        return (
          <PassportStep 
            data={bookingData} 
            onChange={updateBookingData} 
            onNext={nextStep}
          />
        )
      case 'booking-details':
        return (
          <BookingDetailsStep 
            data={bookingData}
            vehicle={vehicle}
            days={days}
            subtotal={subtotal}
            deposit={deposit}
            total={total}
            onChange={updateBookingData}
            onNext={nextStep}
          />
        )
      case 'payment':
        return (
          <PaymentStep 
            data={bookingData}
            vehicle={vehicle}
            days={days}
            subtotal={subtotal}
            deposit={deposit}
            total={total}
            onChange={updateBookingData}
            onSubmit={handleSubmitBooking}
            loading={loading}
          />
        )
      case 'confirmation':
        return (
          <ConfirmationStep 
            bookingId={bookingId}
            vehicle={vehicle}
            data={bookingData}
            total={total}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#f5f5f7] border-b border-border/30">
        <div className="flex items-center gap-4 px-5 py-4">
          <button onClick={prevStep} className="p-1 -ml-1">
            {currentStep === STEPS.length - 1 ? (
              <X className="h-5 w-5" />
            ) : (
              <ArrowLeft className="h-5 w-5" />
            )}
          </button>
          <h1 className="text-lg font-semibold">{STEPS[currentStep].title}</h1>
        </div>
        
        {/* Progress Bar */}
        {currentStep < STEPS.length - 1 && (
          <div className="px-5 pb-4">
            <div className="flex gap-1">
              {STEPS.slice(0, -1).map((step, idx) => (
                <div 
                  key={step.id}
                  className={cn(
                    "flex-1 h-1 rounded-full transition-colors",
                    idx <= currentStep ? "bg-foreground" : "bg-foreground/20"
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step Content */}
      {renderStep()}
    </div>
  )
}
