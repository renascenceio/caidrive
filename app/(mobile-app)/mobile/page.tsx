'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Search, Star, ChevronRight, Gauge, Zap, Heart } from 'lucide-react'

// Brand logos - matching PDF design
const topBrands = [
  { name: 'Ferrari', logo: 'https://www.carlogos.org/car-logos/ferrari-logo.png' },
  { name: 'BMW', logo: 'https://www.carlogos.org/car-logos/bmw-logo.png' },
  { name: 'Bentley', logo: 'https://www.carlogos.org/car-logos/bentley-logo.png' },
  { name: 'Porsche', logo: 'https://www.carlogos.org/car-logos/porsche-logo.png' },
  { name: 'Audi', logo: 'https://www.carlogos.org/car-logos/audi-logo.png' },
]

interface Vehicle {
  id: string
  brand: string
  model: string
  images: string[]
  price_per_day: number
  rating: number
  max_speed: number
  acceleration: number
  seats: number
  horsepower: number
}

export default function MobileHomePage() {
  const [popularCars, setPopularCars] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      // Get popular cars
      const { data: popular } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'available')
        .order('rating', { ascending: false })
        .limit(10)

      setPopularCars(popular || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header - CAI Branding */}
      <header className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">CAI</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">The Best Platform for</h1>
            <h1 className="text-xl font-bold text-accent">Car Rental</h1>
          </div>
        </div>

        {/* Search Bar - Matching PDF */}
        <Link href="/mobile/search" className="block">
          <div className={cn(
            "flex items-center gap-3 px-4 py-4 rounded-2xl",
            "bg-card border border-border shadow-sm"
          )}>
            <Search className="h-5 w-5 text-muted-foreground" />
            <span className="text-base text-muted-foreground">Search any car</span>
          </div>
        </Link>
      </header>

      {/* Content */}
      <div className="px-5 space-y-8">
        {/* Top Brands Section - Matching PDF */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Top Brands</h2>
            <Link href="/mobile/garage" className="text-sm text-accent font-medium flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {topBrands.map((brand) => (
              <Link 
                key={brand.name}
                href={`/mobile/garage?brand=${brand.name}`}
                className="flex flex-col items-center gap-2 flex-shrink-0"
              >
                <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center p-2 shadow-sm">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs text-muted-foreground">{brand.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Rides Section - Matching PDF exactly */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Popular rides</h2>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-56 rounded-3xl bg-secondary animate-pulse" />
              ))
            ) : (
              popularCars.map((car) => (
                <PopularRideCard key={car.id} car={car} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function PopularRideCard({ car }: { car: Vehicle }) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  return (
    <Link href={`/mobile/cars/${car.id}`}>
      <div className="relative rounded-3xl overflow-hidden group">
        {/* Image */}
        <div className="relative h-56">
          <Image
            src={car.images?.[0] || 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800'}
            alt={`${car.brand} ${car.model}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
              <Star className="h-3.5 w-3.5 fill-white text-white" />
              <span className="text-xs font-medium text-white">{car.rating?.toFixed(1) || '4.5'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 px-2.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <div className="flex items-center gap-1">
                  <Gauge className="h-3 w-3 text-white/70" />
                  <span className="text-xs font-medium text-white">{car.max_speed || 300}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-white/70" />
                  <span className="text-xs font-medium text-white">{car.acceleration || 3.5}s</span>
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setIsWishlisted(!isWishlisted)
                }}
                className="p-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/20"
              >
                <Heart className={cn(
                  "h-4 w-4 transition-all",
                  isWishlisted ? "fill-accent text-accent" : "text-white"
                )} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="inline-flex items-center px-2 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 mb-2">
              <span className="text-[10px] font-semibold text-white/90 uppercase tracking-wider">{car.brand}</span>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">{car.model}</h3>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2 text-xs text-white/70">
                <span>{car.seats || 4} seats</span>
                <span>•</span>
                <span>{car.horsepower || 500} bhp</span>
              </div>
              <p className="text-lg font-bold text-white">
                AED {car.price_per_day?.toLocaleString() || '1,500'}
                <span className="text-xs font-normal text-white/70">/day</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
