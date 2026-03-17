'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Search, Star, ChevronRight, Gauge, Zap, Heart, Users, Power } from 'lucide-react'

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

          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 rounded-3xl bg-secondary animate-pulse" />
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
    <Link href={`/mobile/cars/${car.id}`} className="block">
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        {/* Car Image */}
        <div className="relative h-44">
          <Image
            src={car.images?.[0] || 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800'}
            alt={`${car.brand} ${car.model}`}
            fill
            className="object-cover"
          />
          
          {/* Rating Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-md">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-white">{car.rating?.toFixed(1) || '4.7'}</span>
          </div>

          {/* Wishlist Heart */}
          <button 
            onClick={(e) => {
              e.preventDefault()
              setIsWishlisted(!isWishlisted)
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-md"
          >
            <Heart className={cn(
              "h-4 w-4",
              isWishlisted ? "fill-accent text-accent" : "text-white"
            )} />
          </button>
        </div>

        {/* Car Info */}
        <div className="p-4">
          <h3 className="text-base font-semibold mb-3">{car.brand} {car.model}</h3>
          
          {/* Specs Row - Matching PDF exactly */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{car.max_speed || 296} km/h</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{car.acceleration || 2.7} sec</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{car.seats || 5} seats</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Power className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{car.horsepower || 510} bhp</span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-end">
            <p className="text-lg font-bold">
              ${car.price_per_day?.toLocaleString() || '1,899'}<span className="text-sm font-normal text-muted-foreground">/day</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
