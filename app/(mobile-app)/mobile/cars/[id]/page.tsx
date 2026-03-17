'use client'

import { useState, useEffect, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { 
  ArrowLeft, Heart, Star, Gauge, Zap, Users, Power, 
  ChevronRight, ChevronDown
} from 'lucide-react'

interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  images: string[]
  price_per_day: number
  original_price?: number
  deposit_amount: number
  rating: number
  review_count: number
  max_speed: number
  acceleration: number
  seats: number
  horsepower: number
  engine: string
  transmission: string
  fuel_consumption: string
  drivetrain: string
  description: string
  mileage_limit: number
}

export default function MobileCarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [wishlisted, setWishlisted] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    async function fetchVehicle() {
      const supabase = createClient()
      
      const { data } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single()

      setVehicle(data)
      setLoading(false)
    }
    
    fetchVehicle()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background animate-pulse">
        <div className="h-80 bg-secondary" />
        <div className="p-4 space-y-4">
          <div className="h-8 bg-secondary rounded-lg w-3/4" />
          <div className="h-4 bg-secondary rounded-lg w-1/2" />
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Vehicle not found</p>
      </div>
    )
  }

  const images = vehicle.images?.length > 0 
    ? vehicle.images 
    : ['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800']

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-semibold">{vehicle.brand} {vehicle.model}</h1>
          <button 
            onClick={() => setWishlisted(!wishlisted)}
            className="p-2 -mr-2"
          >
            <Heart className={cn(
              "h-5 w-5 transition-all",
              wishlisted ? "fill-accent text-accent" : ""
            )} />
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative h-64 bg-secondary">
        <Image
          src={images[selectedImageIndex]}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          className="object-cover"
        />
        
        {/* Image Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === selectedImageIndex ? "bg-white w-6" : "bg-white/50"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-5 py-6 space-y-6">
        {/* Title & Rating */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">{vehicle.brand} {vehicle.model}</h1>
            <Link href={`/mobile/cars/${id}/reviews`} className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{vehicle.rating?.toFixed(1) || '4.7'}</span>
              <span className="text-sm text-muted-foreground">View reviews ({vehicle.review_count || 34})</span>
            </Link>
          </div>
          
          {/* Price */}
          <div className="flex items-baseline gap-2">
            {vehicle.original_price && (
              <span className="text-lg text-muted-foreground line-through">${vehicle.original_price.toLocaleString()}/day</span>
            )}
            <span className="text-xl font-bold text-accent">${vehicle.price_per_day?.toLocaleString() || '1,899'}/day</span>
          </div>
        </div>

        {/* Quick Specs - Matching PDF exactly */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-3 bg-card rounded-2xl border border-border">
            <Gauge className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-bold">{vehicle.max_speed || 296} km/h</p>
            <p className="text-xs text-muted-foreground">Max speed</p>
          </div>
          <div className="text-center p-3 bg-card rounded-2xl border border-border">
            <Zap className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-bold">{vehicle.acceleration || 2.7} sec</p>
            <p className="text-xs text-muted-foreground">Acceleration</p>
          </div>
          <div className="text-center p-3 bg-card rounded-2xl border border-border">
            <Users className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-bold">{vehicle.seats || 5}</p>
            <p className="text-xs text-muted-foreground">Seats</p>
          </div>
          <div className="text-center p-3 bg-card rounded-2xl border border-border">
            <Power className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-bold">{vehicle.horsepower || 510} bhp</p>
            <p className="text-xs text-muted-foreground">Power</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="font-semibold mb-2">Description</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {vehicle.description || 'Lorem ipsum dolor sit amet consectetur. Consectetur lorem fusce euismod viverra egestas fermentum. Arcu sollicitudin tincidunt pellentesque integer diam. Id amet ac congue leo hendrerit. Cras pellentesque orci at posuere.'}
          </p>
        </div>

        {/* About Booking - Matching PDF */}
        <div>
          <h2 className="font-semibold mb-3">About Booking</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-card rounded-2xl border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Deposit Amount</p>
              <p className="font-bold text-accent">${vehicle.deposit_amount?.toLocaleString() || '1,256'}</p>
            </div>
            <div className="p-3 bg-card rounded-2xl border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Price per Day</p>
              <p className="font-bold">${vehicle.price_per_day?.toLocaleString() || '1,899'}/day</p>
            </div>
            <div className="p-3 bg-card rounded-2xl border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Mileage Limit</p>
              <p className="font-bold">{vehicle.mileage_limit || 250} km</p>
            </div>
          </div>
        </div>

        {/* Technical Specifications - Matching PDF */}
        <div>
          <h2 className="font-semibold mb-3">Technical specification</h2>
          <div className="bg-card rounded-2xl border border-border divide-y divide-border">
            <SpecRow label="Power" value={`${vehicle.horsepower || 440} bhp`} />
            <SpecRow label="Engine" value={vehicle.engine || '3.9 liters'} />
            <SpecRow label="0-100 / 0-200" value="3.1 s / 9.2 s" />
            <SpecRow label="Top speed" value={`${vehicle.max_speed || 296} km/h`} />
            <SpecRow label="Transmission" value={vehicle.transmission || 'Automatic'} />
            <SpecRow label="Fuel Consumption" value={vehicle.fuel_consumption || '11.9 liters'} />
            <SpecRow label="Drive train" value={vehicle.drivetrain || 'RWD'} />
            <SpecRow label="Seats" value={`Sports / ${vehicle.seats || 4} pos.`} />
          </div>
        </div>

        {/* Reviews Section - Matching PDF */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Reviews</h2>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{vehicle.rating?.toFixed(1) || '4.7'}</span>
              <span className="text-sm text-muted-foreground">{vehicle.review_count || 34} reviews</span>
            </div>
          </div>
          
          {/* Sample Review */}
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <span className="font-semibold">JD</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">October 2, 2023</p>
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Lorem ipsum dolor sit amet consectetur. Consectetur lorem fusce euismod viverra egestas fermentum. Arcu sollicitudin tincidunt pellentesque integer diam.
            </p>
          </div>
          
          <Link 
            href={`/mobile/cars/${id}/reviews`}
            className="block text-center text-sm text-accent font-medium mt-3"
          >
            View all reviews
          </Link>
        </div>
      </div>

      {/* Fixed Bottom Bar - Matching PDF */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border p-4 pb-8">
        <div className="flex items-center justify-between">
          <div>
            {vehicle.original_price && (
              <p className="text-sm text-muted-foreground line-through">${vehicle.original_price.toLocaleString()}/day</p>
            )}
            <p className="text-xl font-bold text-accent">${vehicle.price_per_day?.toLocaleString() || '1,899'}/day</p>
          </div>
          
          <Link 
            href={`/mobile/cars/${id}/book`}
            className="flex-1 ml-4"
          >
            <button className="w-full py-4 bg-accent text-white font-semibold rounded-2xl">
              Book Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
