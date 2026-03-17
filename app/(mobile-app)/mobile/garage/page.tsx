'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Search, SlidersHorizontal, Star, Gauge, Zap, Heart, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'

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
  power: number
}

const brands = ['Ferrari', 'Lamborghini', 'Porsche', 'BMW', 'Mercedes', 'Bentley', 'Rolls-Royce', 'McLaren']

export default function MobileGaragePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    async function fetchVehicles() {
      const supabase = createClient()
      
      let query = supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'available')

      if (search) {
        query = query.or(`brand.ilike.%${search}%,model.ilike.%${search}%`)
      }

      if (selectedBrands.length > 0) {
        query = query.in('brand', selectedBrands)
      }

      query = query
        .gte('price_per_day', priceRange[0])
        .lte('price_per_day', priceRange[1])
        .order('rating', { ascending: false })

      const { data } = await query
      setVehicles(data || [])
      setLoading(false)
    }
    
    fetchVehicles()
  }, [search, selectedBrands, priceRange])

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    )
  }

  const clearFilters = () => {
    setSelectedBrands([])
    setPriceRange([0, 10000])
  }

  const hasFilters = selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 10000

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-3">
          <h1 className="text-xl font-semibold mb-3">Garage</h1>
          
          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search cars..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm",
                  "bg-secondary/50 border border-border/50",
                  "focus:outline-none focus:border-accent/50"
                )}
              />
            </div>
            
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative rounded-xl h-10 w-10">
                  <SlidersHorizontal className="h-4 w-4" />
                  {hasFilters && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {selectedBrands.length || '!'}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
                <SheetHeader className="mb-6">
                  <div className="flex items-center justify-between">
                    <SheetTitle>Filters</SheetTitle>
                    {hasFilters && (
                      <button onClick={clearFilters} className="text-xs text-accent font-medium">
                        Clear all
                      </button>
                    )}
                  </div>
                </SheetHeader>

                <div className="space-y-8">
                  {/* Brands */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Brands</h3>
                    <div className="flex flex-wrap gap-2">
                      {brands.map((brand) => (
                        <button
                          key={brand}
                          onClick={() => toggleBrand(brand)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                            selectedBrands.includes(brand)
                              ? "bg-accent text-white"
                              : "bg-secondary text-foreground"
                          )}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Price per day</h3>
                    <div className="px-2">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        min={0}
                        max={10000}
                        step={100}
                        className="mb-4"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>AED {priceRange[0].toLocaleString()}</span>
                        <span>AED {priceRange[1].toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <Button 
                    className="w-full rounded-xl" 
                    onClick={() => setFilterOpen(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Active Filters */}
        {hasFilters && (
          <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
            {selectedBrands.map((brand) => (
              <button
                key={brand}
                onClick={() => toggleBrand(brand)}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium"
              >
                {brand}
                <X className="h-3 w-3" />
              </button>
            ))}
            {(priceRange[0] > 0 || priceRange[1] < 10000) && (
              <span className="px-2 py-1 rounded-full bg-secondary text-xs font-medium">
                AED {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()}
              </span>
            )}
          </div>
        )}
      </header>

      {/* Results */}
      <div className="p-4">
        <p className="text-sm text-muted-foreground mb-4">{vehicles.length} cars available</p>
        
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 rounded-3xl bg-secondary animate-pulse" />
            ))
          ) : (
            vehicles.map((car) => (
              <VehicleCard key={car.id} car={car} />
            ))
          )}
        </div>
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
                <span>{car.power || 500} bhp</span>
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
