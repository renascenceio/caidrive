'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, Calendar, MapPin, User, MessageSquare, Phone,
  Navigation, X
} from 'lucide-react'

export default function CollectionPage() {
  const params = useParams()
  const router = useRouter()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [loading, setLoading] = useState(false)

  // Mock ride data
  const ride = {
    id: params.id,
    pickup_date: '2024-09-12T12:00:00',
    pickup_location: { address: '1 E 2nd St, New York, NY 10003, USA' },
    customer: { 
      full_name: 'Mr. Alex',
      phone: '+1234567890',
      experience_level: 'Beginner'
    },
    vehicle: {
      brand: 'Ferrari',
      model: 'F8 Tributo',
      color: 'Red',
      year: 2019,
      license_plate: 'J92450',
      images: ['https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=600']
    }
  }

  const handleCollection = async () => {
    setLoading(true)
    
    const supabase = createClient()
    await supabase
      .from('bookings')
      .update({ 
        status: 'collection_started',
        collection_started_at: new Date().toISOString()
      })
      .eq('id', params.id)

    // Navigate to map/navigation
    router.push(`/driver/rides/${params.id}/navigate`)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <Image src="/cai-logo.svg" alt="CAI" width={60} height={24} className="invert" />
        </div>
      </header>

      {/* Title */}
      <div className="px-5 pb-4">
        <h1 className="text-xl font-semibold">Rides</h1>
      </div>

      <div className="px-5 pb-24">
        {/* Client Info Card */}
        <div className="bg-[#111111] rounded-2xl p-4 mb-4 border border-white/5">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative h-14 w-14 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
              <div className="h-full w-full flex items-center justify-center text-xl font-bold text-white/60">
                {ride.customer.full_name[0]}
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{ride.customer.full_name}</h3>
              <p className="text-white/40 text-sm">{ride.customer.experience_level}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors">
                <MessageSquare className="h-4 w-4" />
                Send Message
              </button>
              <a 
                href={`tel:${ride.customer.phone}`}
                className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
            </div>
          </div>
        </div>

        {/* Car Card */}
        <div className="bg-[#111111] rounded-2xl overflow-hidden border border-white/5">
          {/* Car Image */}
          <div className="relative h-44 bg-gradient-to-b from-white/5 to-transparent">
            <Image
              src={ride.vehicle.images[0]}
              alt={`${ride.vehicle.brand} ${ride.vehicle.model}`}
              fill
              className="object-contain"
            />
            {/* License Plate Badge */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <span className="text-sm font-mono font-semibold">CSR2 CSB</span>
            </div>
          </div>

          {/* Car Info */}
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-0.5">
              {ride.vehicle.brand} {ride.vehicle.model}
            </h3>
            <p className="text-white/40 text-sm mb-5">
              {ride.vehicle.color}, {ride.vehicle.year}, {ride.vehicle.license_plate}
            </p>

            {/* Ride Details */}
            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-white/40" />
                </div>
                <div>
                  <p className="text-white/40 text-xs">Drop Date & Time</p>
                  <p className="text-sm font-medium">12 September, 2024 12:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-white/40 text-xs">Collection Address</p>
                  <p className="text-sm font-medium">{ride.pickup_location.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white/40" />
                </div>
                <div>
                  <p className="text-white/40 text-xs">Client</p>
                  <p className="text-sm font-medium">{ride.customer.full_name}</p>
                </div>
              </div>
            </div>

            {/* Collection Button */}
            <button
              onClick={handleCollection}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold bg-accent text-white hover:bg-accent/90 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  Collection
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Icons */}
      <div className="fixed bottom-24 right-5 flex flex-col gap-3">
        <button className="h-12 w-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
          <Navigation className="h-5 w-5" />
        </button>
        <button className="h-12 w-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
          <MessageSquare className="h-5 w-5" />
        </button>
        <button className="h-12 w-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
          <MapPin className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
