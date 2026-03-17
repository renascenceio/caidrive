'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, Calendar, MapPin, User, Camera, X, ChevronRight,
  Plus, Check
} from 'lucide-react'

type PhotoPosition = 'side' | 'front' | 'back' | 'another'

interface Photos {
  side: string | null
  front: string | null
  back: string | null
  another: string | null
}

export default function HandoverPage() {
  const params = useParams()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [photos, setPhotos] = useState<Photos>({
    side: null,
    front: null,
    back: null,
    another: null
  })
  const [activePhotoSlot, setActivePhotoSlot] = useState<PhotoPosition | null>(null)
  const [drivingLicense, setDrivingLicense] = useState('AA4765685')
  const [carOdometer, setCarOdometer] = useState('1250.00')
  const [cashCollected, setCashCollected] = useState('')
  const [loading, setLoading] = useState(false)

  // Mock ride data
  const ride = {
    id: params.id,
    pickup_date: '2024-09-12T12:00:00',
    pickup_location: { address: '1 E 2nd St, New York, NY 10003, USA' },
    customer: { full_name: 'Mr. Alex' },
    vehicle: {
      brand: 'Ferrari',
      model: 'F8 Tributo',
      color: 'Red',
      year: 2019,
      license_plate: 'J92450',
      images: ['https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=600']
    },
    notes: 'Lorem ipsum dolor sit amet consectetur. Blandit duis et vel eget ipsum duis augue. Turpis arcu nibh ut libero nunc.'
  }

  const handlePhotoClick = (position: PhotoPosition) => {
    setActivePhotoSlot(position)
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && activePhotoSlot) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotos(prev => ({
          ...prev,
          [activePhotoSlot]: e.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  const removePhoto = (position: PhotoPosition) => {
    setPhotos(prev => ({
      ...prev,
      [position]: null
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const supabase = createClient()
    await supabase
      .from('bookings')
      .update({ 
        status: 'active',
        handover_data: {
          driving_license: drivingLicense,
          odometer: carOdometer,
          cash_collected: cashCollected,
          photos,
          timestamp: new Date().toISOString()
        }
      })
      .eq('id', params.id)

    router.push('/driver/rides')
  }

  const recommendations = [
    { label: 'Rules of "City"', href: `/driver/rides/${params.id}/rules` },
    { label: 'Driving Precautions', href: `/driver/rides/${params.id}/precautions` },
    { label: 'Places to Visit', href: `/driver/rides/${params.id}/places` },
    { label: 'Place for Photo', href: `/driver/rides/${params.id}/photo-spots` },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <Link href={`/driver/rides`} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold">Handover</h1>
        </div>
      </header>

      <div className="px-5 pb-24 space-y-6">
        {/* Car Card */}
        <div className="bg-[#111111] rounded-2xl overflow-hidden border border-white/5">
          {/* Car Image */}
          <div className="relative h-36 bg-gradient-to-b from-white/5 to-transparent">
            <Image
              src={ride.vehicle.images[0]}
              alt={`${ride.vehicle.brand} ${ride.vehicle.model}`}
              fill
              className="object-contain"
            />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <span className="text-xs font-mono font-semibold">CSR2 CSB</span>
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-semibold mb-0.5">
              {ride.vehicle.brand} {ride.vehicle.model}
            </h3>
            <p className="text-white/40 text-xs mb-4">
              {ride.vehicle.color}, {ride.vehicle.year}, {ride.vehicle.license_plate}
            </p>

            {/* Ride Details */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-3.5 w-3.5 text-white/40" />
                </div>
                <div>
                  <p className="text-white/40 text-xs">Drop Date & Time</p>
                  <p className="text-sm font-medium">12 September, 2024 12:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-3.5 w-3.5 text-white/40" />
                </div>
                <div>
                  <p className="text-white/40 text-xs">Drop Address</p>
                  <p className="text-sm font-medium">{ride.pickup_location.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <User className="h-3.5 w-3.5 text-white/40" />
                </div>
                <div>
                  <p className="text-white/40 text-xs">Client</p>
                  <p className="text-sm font-medium">{ride.customer.full_name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <p className="text-white/60 text-sm">{ride.notes}</p>

        {/* Driving License Input */}
        <div>
          <label className="text-sm text-white/60 mb-2 block">Driving License</label>
          <input
            type="text"
            value={drivingLicense}
            onChange={(e) => setDrivingLicense(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
            placeholder="Enter driving license number"
          />
        </div>

        {/* Car Odometer Input */}
        <div>
          <label className="text-sm text-white/60 mb-2 block">Car Odometer</label>
          <div className="relative">
            <input
              type="text"
              value={carOdometer}
              onChange={(e) => setCarOdometer(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 pr-12"
              placeholder="Enter odometer reading"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">km</span>
          </div>
        </div>

        {/* Car Condition Photos */}
        <div>
          <label className="text-sm text-white/60 mb-1 block">Car Condition</label>
          <p className="text-xs text-white/40 mb-3">
            Hello! take pictures of the car before handover (side, front, back, another side)
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="grid grid-cols-2 gap-3">
            {(['side', 'front', 'back', 'another'] as const).map((position) => (
              <div key={position} className="relative">
                {photos[position] ? (
                  <div className="relative h-24 rounded-xl overflow-hidden">
                    <Image
                      src={photos[position]!}
                      alt={position}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => removePhoto(position)}
                      className="absolute top-2 right-2 h-6 w-6 bg-black/60 rounded-full flex items-center justify-center"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-xs capitalize">
                      {position === 'another' ? 'Another Side' : position}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handlePhotoClick(position)}
                    className="w-full h-24 bg-white/5 border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-colors"
                  >
                    <Plus className="h-5 w-5 text-white/40" />
                    <span className="text-xs text-white/40 capitalize">
                      {position === 'another' ? 'Another Side' : position}
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cash Collected */}
        <div>
          <label className="text-sm text-white/60 mb-2 block">Cash collected</label>
          <input
            type="text"
            value={cashCollected}
            onChange={(e) => setCashCollected(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
            placeholder="Enter Cash Amount"
          />
        </div>

        {/* Provide Recommendations */}
        <div>
          <label className="text-sm text-white/60 mb-3 block">Provide Recommendations</label>
          <div className="space-y-2">
            {recommendations.map((item) => (
              <Link key={item.label} href={item.href}>
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                  <span className="text-sm font-medium">{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-white/40" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Submit
            </>
          )}
        </button>
      </div>
    </div>
  )
}
