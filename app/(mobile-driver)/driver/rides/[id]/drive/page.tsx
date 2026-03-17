'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { X, Clock, Navigation } from 'lucide-react'

export default function DrivePage() {
  const params = useParams()
  const router = useRouter()
  const [showEndConfirmation, setShowEndConfirmation] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleEndDrive = async () => {
    setLoading(true)
    
    const supabase = createClient()
    await supabase
      .from('bookings')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', params.id)

    router.push('/driver/rides')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative">
      {/* Map Background - Using a placeholder map image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80"
          alt="Map"
          fill
          className="object-cover opacity-90"
        />
        {/* Map overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      {/* Status Bar Time */}
      <div className="relative z-10 px-5 pt-12 text-white text-sm font-medium">
        9:41
      </div>

      {/* Route Info Card */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="bg-white rounded-t-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            {/* Time */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">21 min</p>
                <p className="text-sm text-gray-500">18.7 km</p>
              </div>
            </div>

            {/* ETA */}
            <div className="text-right">
              <p className="text-sm text-gray-500">Arrival</p>
              <p className="text-lg font-semibold text-gray-900">02:00 pm</p>
            </div>
          </div>

          {/* End Drive Button */}
          <button
            onClick={() => setShowEndConfirmation(true)}
            className="w-full py-4 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
          >
            <Navigation className="h-5 w-5" />
            End Drive
          </button>
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-12 right-5 z-10 h-10 w-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
      >
        <X className="h-5 w-5 text-gray-700" />
      </button>

      {/* End Drive Confirmation Modal */}
      {showEndConfirmation && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowEndConfirmation(false)}
          />
          <div className="relative bg-white rounded-t-3xl p-6 w-full max-w-lg animate-in slide-in-from-bottom duration-300">
            <button
              onClick={() => setShowEndConfirmation(false)}
              className="absolute top-4 right-4 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">End the Drive?</h3>
              <p className="text-gray-500">Are you sure you would like to end the drive?</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirmation(false)}
                className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                No need
              </button>
              <button
                onClick={handleEndDrive}
                disabled={loading}
                className="flex-1 py-3.5 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
