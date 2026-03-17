'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { 
  ArrowLeft, 
  Share2, 
  Heart, 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  Globe, 
  Percent,
  Navigation,
  ChevronRight,
  Utensils,
  Hotel,
  Fuel,
  Camera,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react'

interface Place {
  id: string
  name: string
  category: string
  description: string
  image_url: string
  discount_percent: number
  location: { 
    address: string
    lat?: number
    lng?: number
  }
  rating?: number
  phone?: string
  website?: string
  hours?: string
  amenities?: string[]
}

export default function PlaceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  const [place, setPlace] = useState<Place | null>(null)
  const [loading, setLoading] = useState(true)
  const [wishlisted, setWishlisted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchPlace() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('id', id)
        .single()
      
      if (data) {
        setPlace(data)
      }
      setLoading(false)
    }
    
    if (id) fetchPlace()
  }, [id])

  const categoryIcons: Record<string, any> = {
    restaurant: Utensils,
    hotel: Hotel,
    gas_station: Fuel,
    attraction: Camera,
  }

  const copyAddress = () => {
    if (place?.location?.address) {
      navigator.clipboard.writeText(place.location.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openMaps = () => {
    if (place?.location?.address) {
      const query = encodeURIComponent(place.location.address)
      window.open(`https://maps.google.com/?q=${query}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7]">
        <div className="h-72 bg-[#e5e5e7] animate-pulse" />
        <div className="p-5 space-y-4">
          <div className="h-8 w-2/3 bg-[#e5e5e7] rounded-lg animate-pulse" />
          <div className="h-4 w-1/2 bg-[#e5e5e7] rounded animate-pulse" />
          <div className="h-24 bg-[#e5e5e7] rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center p-5">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#e5e5e7] flex items-center justify-center">
            <MapPin className="h-8 w-8 mobile-text-muted" />
          </div>
          <h2 className="text-xl font-semibold mobile-text-dark mb-2">Place Not Found</h2>
          <p className="mobile-text-muted mb-4">This place may have been removed or doesn't exist.</p>
          <button 
            onClick={() => router.back()}
            className="px-6 py-3 bg-[#161821] text-white rounded-full font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const Icon = categoryIcons[place.category] || MapPin

  return (
    <div className="min-h-screen bg-[#f5f5f7] pb-20">
      {/* Hero Image */}
      <div className="relative h-72">
        <Image
          src={place.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'}
          alt={place.name}
          fill
          className="object-cover"
          priority
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        
        {/* Header - Floating on Image */}
        <div className="absolute top-0 left-0 right-0 z-50 px-4 py-3 pt-safe">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm"
            >
              <ArrowLeft className="h-5 w-5 mobile-text-dark" />
            </button>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {/* Share functionality */}}
                className="p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm"
              >
                <Share2 className="h-5 w-5 mobile-text-dark" />
              </button>
              <button 
                onClick={() => setWishlisted(!wishlisted)}
                className="p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm"
              >
                <Heart className={cn(
                  "h-5 w-5 transition-all mobile-text-dark",
                  wishlisted ? "fill-[#dd3155] text-[#dd3155]" : ""
                )} />
              </button>
            </div>
          </div>
        </div>

        {/* Discount Badge */}
        {place.discount_percent > 0 && (
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#dd3155] text-white">
            <Percent className="h-4 w-4" />
            <span className="text-sm font-bold">{place.discount_percent}% OFF</span>
          </div>
        )}

        {/* Rating */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/20 backdrop-blur-md">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-semibold text-white">{place.rating?.toFixed(1) || '4.5'}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 -mt-4 relative z-10">
        {/* Main Info Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#e5e5e7]">
          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f5f5f7]">
              <Icon className="h-3.5 w-3.5 mobile-text-muted" />
              <span className="text-xs font-medium mobile-text-muted uppercase tracking-wider">
                {place.category.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Name */}
          <h1 className="text-2xl font-bold mobile-text-dark mb-2">{place.name}</h1>
          
          {/* Location */}
          <div className="flex items-center gap-1.5 mb-4">
            <MapPin className="h-4 w-4 mobile-text-muted" />
            <span className="text-sm mobile-text-muted">{place.location?.address || 'Dubai, UAE'}</span>
          </div>

          {/* Description */}
          {place.description && (
            <p className="text-sm mobile-text-muted leading-relaxed">
              {place.description}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <button 
            onClick={openMaps}
            className="bg-white rounded-2xl p-4 text-center border border-[#e5e5e7] active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-[#f5f5f7] flex items-center justify-center">
              <Navigation className="h-5 w-5 mobile-text-dark" />
            </div>
            <p className="text-xs font-medium mobile-text-dark">Directions</p>
          </button>
          
          {place.phone && (
            <a 
              href={`tel:${place.phone}`}
              className="bg-white rounded-2xl p-4 text-center border border-[#e5e5e7] active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-[#f5f5f7] flex items-center justify-center">
                <Phone className="h-5 w-5 mobile-text-dark" />
              </div>
              <p className="text-xs font-medium mobile-text-dark">Call</p>
            </a>
          )}
          
          {place.website && (
            <a 
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-4 text-center border border-[#e5e5e7] active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-[#f5f5f7] flex items-center justify-center">
                <Globe className="h-5 w-5 mobile-text-dark" />
              </div>
              <p className="text-xs font-medium mobile-text-dark">Website</p>
            </a>
          )}
          
          {!place.phone && !place.website && (
            <>
              <button 
                onClick={copyAddress}
                className="bg-white rounded-2xl p-4 text-center border border-[#e5e5e7] active:scale-95 transition-transform"
              >
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-[#f5f5f7] flex items-center justify-center">
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 mobile-text-dark" />}
                </div>
                <p className="text-xs font-medium mobile-text-dark">{copied ? 'Copied!' : 'Copy'}</p>
              </button>
              <button 
                onClick={() => setWishlisted(!wishlisted)}
                className="bg-white rounded-2xl p-4 text-center border border-[#e5e5e7] active:scale-95 transition-transform"
              >
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-[#f5f5f7] flex items-center justify-center">
                  <Heart className={cn("h-5 w-5", wishlisted ? "fill-[#dd3155] text-[#dd3155]" : "mobile-text-dark")} />
                </div>
                <p className="text-xs font-medium mobile-text-dark">{wishlisted ? 'Saved' : 'Save'}</p>
              </button>
            </>
          )}
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-2xl p-5 mt-4 border border-[#e5e5e7]">
          <h2 className="font-semibold text-base mb-4 mobile-text-dark">Details</h2>
          
          <div className="space-y-4">
            {/* Hours */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#f5f5f7] flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 mobile-text-dark" />
              </div>
              <div>
                <p className="text-xs mobile-text-muted uppercase tracking-wide">Hours</p>
                <p className="text-sm font-medium mobile-text-dark">{place.hours || 'Open 24 hours'}</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#f5f5f7] flex items-center justify-center flex-shrink-0">
                <MapPin className="h-4 w-4 mobile-text-dark" />
              </div>
              <div className="flex-1">
                <p className="text-xs mobile-text-muted uppercase tracking-wide">Address</p>
                <p className="text-sm font-medium mobile-text-dark">{place.location?.address || 'Dubai, UAE'}</p>
              </div>
              <button 
                onClick={copyAddress}
                className="p-2 rounded-lg bg-[#f5f5f7]"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 mobile-text-muted" />}
              </button>
            </div>

            {/* Phone */}
            {place.phone && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#f5f5f7] flex items-center justify-center flex-shrink-0">
                  <Phone className="h-4 w-4 mobile-text-dark" />
                </div>
                <div className="flex-1">
                  <p className="text-xs mobile-text-muted uppercase tracking-wide">Phone</p>
                  <a href={`tel:${place.phone}`} className="text-sm font-medium mobile-text-dark">
                    {place.phone}
                  </a>
                </div>
              </div>
            )}

            {/* Website */}
            {place.website && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#f5f5f7] flex items-center justify-center flex-shrink-0">
                  <Globe className="h-4 w-4 mobile-text-dark" />
                </div>
                <div className="flex-1">
                  <p className="text-xs mobile-text-muted uppercase tracking-wide">Website</p>
                  <a 
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#dd3155] flex items-center gap-1"
                  >
                    Visit website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Discount Info */}
        {place.discount_percent > 0 && (
          <div className="bg-gradient-to-r from-[#dd3155] to-[#ff6b6b] rounded-2xl p-5 mt-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Percent className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{place.discount_percent}% Partner Discount</h3>
                <p className="text-sm text-white/80">Show your CaiDrive booking to redeem</p>
              </div>
            </div>
          </div>
        )}

        {/* Map Preview */}
        <div className="bg-white rounded-2xl overflow-hidden mt-4 border border-[#e5e5e7]">
          <div className="h-40 bg-[#e5e5e7] relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-8 w-8 mobile-text-muted mx-auto mb-2" />
                <p className="text-sm mobile-text-muted">Map Preview</p>
              </div>
            </div>
          </div>
          <button 
            onClick={openMaps}
            className="w-full p-4 flex items-center justify-between"
          >
            <span className="font-medium mobile-text-dark">Get Directions</span>
            <ChevronRight className="h-5 w-5 mobile-text-muted" />
          </button>
        </div>
      </div>
    </div>
  )
}
