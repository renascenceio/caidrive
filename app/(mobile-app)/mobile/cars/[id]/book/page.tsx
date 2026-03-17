'use client'

import { useState, useEffect, use, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { 
  ArrowLeft, Calendar, Clock, MapPin, ChevronRight, 
  Car, FileText, CreditCard, Check, X, RotateCcw
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
  const [hasSavedDetails, setHasSavedDetails] = useState(false)
  const [showDraftPrompt, setShowDraftPrompt] = useState(false)
  const [draftData, setDraftData] = useState<{ formData: BookingData; currentStep: number } | null>(null)
  const lastSavedRef = useRef<string>('')
  
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

  // Load saved user details and check for drafts
  useEffect(() => {
    const loadUserData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check for existing draft
      try {
        const draftRes = await fetch(`/api/user/booking-drafts/${id}`)
        if (draftRes.ok) {
          const draftResult = await draftRes.json()
          if (draftResult.hasDraft && draftResult.draft) {
            setDraftData({
              formData: draftResult.draft.formData,
              currentStep: draftResult.draft.currentStep
            })
            setShowDraftPrompt(true)
          }
        }
      } catch (e) {
        console.error('Error loading draft:', e)
      }

      // Load saved user details
      try {
        const detailsRes = await fetch('/api/user/saved-details')
        if (detailsRes.ok) {
          const detailsResult = await detailsRes.json()
          if (detailsResult.hasSavedDetails && detailsResult.details) {
            setHasSavedDetails(true)
            // Pre-fill the form with saved details
            setBookingData(prev => ({
              ...prev,
              licenseFirstName: detailsResult.details.licenseFirstName || prev.licenseFirstName,
              licenseSurname: detailsResult.details.licenseSurname || prev.licenseSurname,
              licenseNumber: detailsResult.details.licenseNumber || prev.licenseNumber,
              licenseAddress: detailsResult.details.licenseAddress || prev.licenseAddress,
              licenseExpiry: detailsResult.details.licenseExpiry || prev.licenseExpiry,
              licenseCountry: detailsResult.details.licenseCountry || prev.licenseCountry,
              licenseImage: detailsResult.details.licenseImage || prev.licenseImage,
              isInternational: detailsResult.details.isInternational || prev.isInternational,
              passportFirstName: detailsResult.details.passportFirstName || prev.passportFirstName,
              passportSurname: detailsResult.details.passportSurname || prev.passportSurname,
              passportNumber: detailsResult.details.passportNumber || prev.passportNumber,
              passportCountry: detailsResult.details.passportCountry || prev.passportCountry,
              passportExpiry: detailsResult.details.passportExpiry || prev.passportExpiry,
              passportImage: detailsResult.details.passportImage || prev.passportImage,
              paymentMethod: detailsResult.details.preferredPaymentMethod || prev.paymentMethod,
            }))
          }
        }
      } catch (e) {
        console.error('Error loading saved details:', e)
      }
    }
    
    loadUserData()
  }, [id])

  // Auto-save draft when booking data changes
  const saveDraft = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const dataString = JSON.stringify({ bookingData, currentStep })
    if (dataString === lastSavedRef.current) return // No changes
    
    try {
      await fetch(`/api/user/booking-drafts/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: bookingData,
          currentStep,
        }),
      })
      lastSavedRef.current = dataString
    } catch (e) {
      console.error('Error saving draft:', e)
    }
  }, [bookingData, currentStep, id])

  // Debounced auto-save
  useEffect(() => {
    // Don't save on confirmation step
    if (currentStep >= STEPS.length - 1) return
    
    const timer = setTimeout(() => {
      saveDraft()
    }, 2000) // Save 2 seconds after last change

    return () => clearTimeout(timer)
  }, [bookingData, currentStep, saveDraft])

  const updateBookingData = (updates: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...updates }))
  }

  const restoreDraft = () => {
    if (draftData) {
      setBookingData(draftData.formData)
      setCurrentStep(draftData.currentStep)
    }
    setShowDraftPrompt(false)
  }

  const discardDraft = async () => {
    setShowDraftPrompt(false)
    // Delete the draft
    try {
      await fetch(`/api/user/booking-drafts/${id}`, { method: 'DELETE' })
    } catch (e) {
      console.error('Error deleting draft:', e)
    }
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

    try {
      // Call API to create booking - handles all business logic
      const response = await fetch('/api/mobile/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: id,
          pickup_date: bookingData.startDate,
          return_date: bookingData.endDate,
          pickup_time: bookingData.pickupTime,
          pickup_location: bookingData.deliveryLocation === 'delivery' ? bookingData.deliveryAddress : 'Office Pickup',
          return_location: bookingData.deliveryLocation === 'delivery' ? bookingData.deliveryAddress : 'Office Dropoff',
          delivery_type: bookingData.deliveryLocation,
          payment_method: bookingData.paymentMethod,
          // Document info
          driver_license: {
            first_name: bookingData.licenseFirstName,
            surname: bookingData.licenseSurname,
            number: bookingData.licenseNumber,
            address: bookingData.licenseAddress,
            expiry: bookingData.licenseExpiry,
            country: bookingData.licenseCountry,
            image: bookingData.licenseImage,
            is_international: bookingData.isInternational,
          },
          passport: {
            first_name: bookingData.passportFirstName,
            surname: bookingData.passportSurname,
            number: bookingData.passportNumber,
            country: bookingData.passportCountry,
            expiry: bookingData.passportExpiry,
            image: bookingData.passportImage,
          },
          // Card details if applicable
          card_details: bookingData.paymentMethod === 'card' ? {
            number: bookingData.cardNumber,
            holder: bookingData.cardHolder,
            expiry: bookingData.cardExpiry,
          } : null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create booking')
      }

      // Save user details for future bookings
      try {
        await fetch('/api/user/saved-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            licenseFirstName: bookingData.licenseFirstName,
            licenseSurname: bookingData.licenseSurname,
            licenseNumber: bookingData.licenseNumber,
            licenseAddress: bookingData.licenseAddress,
            licenseExpiry: bookingData.licenseExpiry,
            licenseCountry: bookingData.licenseCountry,
            licenseImage: bookingData.licenseImage,
            isInternational: bookingData.isInternational,
            passportFirstName: bookingData.passportFirstName,
            passportSurname: bookingData.passportSurname,
            passportNumber: bookingData.passportNumber,
            passportCountry: bookingData.passportCountry,
            passportExpiry: bookingData.passportExpiry,
            passportImage: bookingData.passportImage,
            paymentMethod: bookingData.paymentMethod,
          }),
        })
      } catch (e) {
        console.error('Error saving user details:', e)
      }

      // Delete the draft after successful booking
      try {
        await fetch(`/api/user/booking-drafts/${id}`, { method: 'DELETE' })
      } catch (e) {
        console.error('Error deleting draft:', e)
      }

      setBookingId(result.booking.id)
      setLoading(false)
      nextStep() // Go to confirmation
    } catch (error: any) {
      console.error('[v0] Booking error:', error)
      setLoading(false)
      alert(error.message || 'Failed to create booking. Please try again.')
    }
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
      {/* Draft Restore Prompt */}
      {showDraftPrompt && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-5">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-[#dd3155]/10 rounded-full mx-auto mb-4">
              <RotateCcw className="h-6 w-6 text-[#dd3155]" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2 mobile-text-dark">Resume Your Booking?</h3>
            <p className="text-sm mobile-text-muted text-center mb-6">
              You have an unfinished booking for this car. Would you like to continue where you left off?
            </p>
            <div className="flex gap-3">
              <button
                onClick={discardDraft}
                className="flex-1 py-3 text-sm font-medium mobile-text-muted bg-[#f5f5f7] rounded-xl"
              >
                Start Fresh
              </button>
              <button
                onClick={restoreDraft}
                className="flex-1 py-3 text-sm font-medium text-white bg-[#161821] rounded-xl"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#f5f5f7] border-b border-[#e5e5e7]">
        <div className="flex items-center gap-4 px-5 py-4">
          <button onClick={prevStep} className="p-1 -ml-1">
            {currentStep === STEPS.length - 1 ? (
              <X className="h-5 w-5 mobile-text-dark" />
            ) : (
              <ArrowLeft className="h-5 w-5 mobile-text-dark" />
            )}
          </button>
          <h1 className="text-lg font-semibold mobile-text-dark">{STEPS[currentStep].title}</h1>
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
                    idx <= currentStep ? "bg-[#161821]" : "bg-[#161821]/20"
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
