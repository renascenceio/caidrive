'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Search, Star, ChevronRight, Gauge, Zap, Heart } from 'lucide-react'

// Brand logos - matching home page
const topBrands = [
  { name: 'Ferrari', logo: 'https://www.carlogos.org/car-logos/ferrari-logo.png' },
  { name: 'BMW', logo: 'https://www.carlogos.org/car-logos/bmw-logo.png' },
  { name: 'Bentley', logo: 'https://www.carlogos.org/car-logos/bentley-logo.png' },
  { name: 'Porsche', logo: 'https://www.carlogos.org/car-logos/porsche-logo.png' },
  { name: 'Lamborghini', logo: 'https://www.carlogos.org/car-logos/lamborghini-logo.png' },
  { name: 'Mercedes', logo: 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png' },
  { name: 'Rolls-Royce', logo: 'https://www.carlogos.org/car-logos/rolls-royce-logo.png' },
  { name: 'McLaren', logo: 'https://www.carlogos.org/car-logos/mclaren-logo.png' },
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

export default function MobileGaragePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)

  useEffect(() => {
    async function fetchVehicles() {
      const supabase = createClient()
      
      let query = supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'available')

      if (selectedBrand) {
        query = query.eq('brand', selectedBrand)
      }

      query = query.order('rating', { ascending: false })

      const { data } = await query
      setVehicles(data || [])
      setLoading(false)
    }
    
    fetchVehicles()
  }, [selectedBrand])

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header - Matching Home Page */}
      <header className="px-5 pt-12 pb-6">
        <h1 className="text-2xl font-bold mb-6">Garage</h1>

        {/* Search Bar - Glass effect matching Home Page */}
        <Link href="/mobile/search" className="block">
          <div className={cn(
            "flex items-center gap-3 px-4 py-4 rounded-2xl",
            "bg-card/80 backdrop-blur-xl border border-border/50 shadow-sm"
          )}>
            <Search className="h-5 w-5 text-muted-foreground" />
            <span className="text-base text-muted-foreground">Search any car</span>
          </div>
        </Link>
      </header>

      {/* Content */}
      <div className="px-5 space-y-8">
        {/* Brands Section - Matching Home Page */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Filter by Brand</h2>
            {selectedBrand && (
              <button 
                onClick={() => setSelectedBrand(null)}
                className="text-sm text-accent font-medium"
              >
                Clear filter
              </button>
            )}
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {topBrands.map((brand) => (
              <button 
                key={brand.name}
                onClick={() => setSelectedBrand(selectedBrand === brand.name ? null : brand.name)}
                className={cn(
                  "flex flex-col items-center gap-2 flex-shrink-0 transition-all",
                  selectedBrand === brand.name && "scale-105"
                )}
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl bg-card/80 backdrop-blur-xl border flex items-center justify-center p-2 shadow-sm transition-all hover:shadow-md",
                  selectedBrand === brand.name 
                    ? "border-accent bg-accent/10" 
                    : "border-border/50"
                )}>
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <span className={cn(
                  "text-xs",
                  selectedBrand === brand.name 
                    ? "text-accent font-medium" 
                    : "text-muted-foreground"
                )}>
                  {brand.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* All Cars Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {selectedBrand ? `${selectedBrand} Cars` : 'All Cars'}
            </h2>
            <span className="text-sm text-muted-foreground">{vehicles.length} available</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 rounded-3xl bg-secondary animate-pulse" />
              ))
            ) : vehicles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No cars found</p>
                {selectedBrand && (
                  <button 
                    onClick={() => setSelectedBrand(null)}
                    className="mt-2 text-accent font-medium"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            ) : (
              vehicles.map((car) => (
                <VehicleCard key={car.id} car={car} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function VehicleCard({ car }: { car: Vehicle }) {
  const [wishlisted, setWishlisted] = useState(false)

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
                  setWishlisted(!wishlisted)
                }}
                className="p-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/20"
              >
                <Heart className={cn(
                  "h-4 w-4 transition-all",
                  wishlisted ? "fill-accent text-accent" : "text-white"
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
