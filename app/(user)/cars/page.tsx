'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { LuxuryCarCard } from '@/components/cars/luxury-car-card'
import { BrandFilter } from '@/components/cars/brand-logo'
import { createClient } from '@/lib/supabase/client'
import type { Vehicle } from '@/types/database'

const allBrands = ['Ferrari', 'BMW', 'Bentley', 'Porsche', 'Audi', 'Mercedes-Benz', 'Lamborghini', 'Rolls-Royce', 'Tesla', 'Maserati']

function CarsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [cars, setCars] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brand')?.split(',').filter(Boolean) || []
  )
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [seatsFilter, setSeatsFilter] = useState<number[]>([])
  const [filterOpen, setFilterOpen] = useState(false)

  const fetchCars = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    
    let query = supabase
      .from('vehicles')
      .select('*')
      .eq('status', 'available')
    
    if (searchQuery) {
      query = query.or(`brand.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%`)
    }
    
    if (selectedBrands.length > 0) {
      query = query.in('brand', selectedBrands)
    }
    
    if (priceRange[0] > 0) {
      query = query.gte('price_per_day', priceRange[0])
    }
    
    if (priceRange[1] < 5000) {
      query = query.lte('price_per_day', priceRange[1])
    }
    
    if (seatsFilter.length > 0) {
      query = query.in('seats', seatsFilter)
    }
    
    query = query.order('rating', { ascending: false })
    
    const { data } = await query
    setCars(data || [])
    setLoading(false)
  }, [searchQuery, selectedBrands, priceRange, seatsFilter])

  useEffect(() => {
    fetchCars()
  }, [fetchCars])

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    )
  }

  const handleSeatsToggle = (seats: number) => {
    setSeatsFilter(prev =>
      prev.includes(seats)
        ? prev.filter(s => s !== seats)
        : [...prev, seats]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedBrands([])
    setPriceRange([0, 5000])
    setSeatsFilter([])
    router.push('/cars')
  }

  const hasFilters = searchQuery || selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 5000 || seatsFilter.length > 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Browse Cars</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? 'Loading...' : `${cars.length} vehicles available`}
          </p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cars..."
              className="pl-9"
            />
          </div>
          
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <SlidersHorizontal className="h-4 w-4" />
                {hasFilters && (
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-accent" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Price Range */}
                <div>
                  <Label className="text-sm font-medium">Price per day</Label>
                  <div className="mt-4">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={5000}
                      step={50}
                      className="w-full"
                    />
                    <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}+</span>
                    </div>
                  </div>
                </div>
                
                {/* Brands */}
                <div>
                  <Label className="text-sm font-medium">Brands</Label>
                  <div className="mt-3 space-y-2">
                    {allBrands.map((brand) => (
                      <div key={brand} className="flex items-center gap-2">
                        <Checkbox
                          id={`brand-${brand}`}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => handleBrandToggle(brand)}
                        />
                        <Label htmlFor={`brand-${brand}`} className="text-sm font-normal">
                          {brand}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Seats */}
                <div>
                  <Label className="text-sm font-medium">Seats</Label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[2, 4, 5, 7].map((seats) => (
                      <Button
                        key={seats}
                        variant={seatsFilter.includes(seats) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSeatsToggle(seats)}
                      >
                        {seats}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={clearFilters}>
                    Clear All
                  </Button>
                  <Button className="flex-1" onClick={() => setFilterOpen(false)}>
                    Apply
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active Filters */}
      {hasFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {selectedBrands.map((brand) => (
            <Button
              key={brand}
              variant="secondary"
              size="sm"
              className="h-7 gap-1"
              onClick={() => handleBrandToggle(brand)}
            >
              {brand}
              <X className="h-3 w-3" />
            </Button>
          ))}
          {(priceRange[0] > 0 || priceRange[1] < 5000) && (
            <Button
              variant="secondary"
              size="sm"
              className="h-7 gap-1"
              onClick={() => setPriceRange([0, 5000])}
            >
              ${priceRange[0]} - ${priceRange[1]}
              <X className="h-3 w-3" />
            </Button>
          )}
          {seatsFilter.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              className="h-7 gap-1"
              onClick={() => setSeatsFilter([])}
            >
              {seatsFilter.join(', ')} seats
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-7" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Brand Quick Filter */}
      <div className="mt-6 -mx-1 overflow-x-auto px-1 pb-2">
        <BrandFilter
          brands={allBrands.slice(0, 5)}
          selectedBrands={selectedBrands}
          onBrandToggle={handleBrandToggle}
        />
      </div>

      {/* Cars Grid */}
      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-4">
                <Skeleton className="aspect-[16/10] rounded-xl" />
                <Skeleton className="mt-4 h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-16 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : cars.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
            <p className="text-lg font-medium">No cars found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your filters or search query
            </p>
            <Button className="mt-4" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <LuxuryCarCard
                key={car.id}
                id={car.id}
                brand={car.brand}
                model={car.model}
                year={car.year}
                image={car.images?.[0] || 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800'}
                maxSpeed={car.max_speed || 300}
                acceleration={car.acceleration || 3.5}
                power={car.power || 500}
                seats={car.seats || 4}
                pricePerDay={car.price_per_day}
                rating={car.rating || 4.5}
                reviewCount={car.review_count || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CarsPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-24 shrink-0 rounded-lg" />
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4">
            <Skeleton className="aspect-[16/10] rounded-xl" />
            <Skeleton className="mt-4 h-6 w-3/4" />
            <Skeleton className="mt-2 h-4 w-1/2" />
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="h-16 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CarsPage() {
  return (
    <Suspense fallback={<CarsPageSkeleton />}>
      <CarsPageContent />
    </Suspense>
  )
}
