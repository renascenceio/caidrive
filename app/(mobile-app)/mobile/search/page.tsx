'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Search, ArrowLeft, X, Star, Clock, SlidersHorizontal } from 'lucide-react'

interface Vehicle {
  id: string
  brand: string
  model: string
  images: string[]
  price_per_day: number
  rating: number
  max_speed: number
  acceleration: number
}

// Brand suggestions with logos - Matching PDF
const brandSuggestions = [
  { name: 'Ferrari', logo: 'https://www.carlogos.org/car-logos/ferrari-logo.png' },
  { name: 'BMW', logo: 'https://www.carlogos.org/car-logos/bmw-logo.png' },
  { name: 'Bentley', logo: 'https://www.carlogos.org/car-logos/bentley-logo.png' },
  { name: 'Porsche', logo: 'https://www.carlogos.org/car-logos/porsche-logo.png' },
  { name: 'Audi', logo: 'https://www.carlogos.org/car-logos/audi-logo.png' },
]

// Recent searches - Matching PDF
const recentSearches = [
  { name: 'Ferrari', logo: 'https://www.carlogos.org/car-logos/ferrari-logo.png' },
  { name: 'Bentley', logo: 'https://www.carlogos.org/car-logos/bentley-logo.png' },
  { name: 'BMW', logo: 'https://www.carlogos.org/car-logos/bmw-logo.png' },
]

export default function MobileSearchPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (search.length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    const debounce = setTimeout(async () => {
      setLoading(true)
      const supabase = createClient()

      const { data } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'available')
        .or(`brand.ilike.%${search}%,model.ilike.%${search}%`)
        .limit(10)

      setResults(data || [])
      setShowResults(true)
      setLoading(false)
    }, 300)

    return () => clearTimeout(debounce)
  }, [search])

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header - Matching PDF */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Search car</h1>
        </div>
        
        {/* Search Input */}
        <div className="px-4 pb-4">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search your car"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className={cn(
                "w-full pl-12 pr-12 py-4 rounded-2xl text-base",
                "bg-card border border-border",
                "focus:outline-none focus:border-accent/50"
              )}
            />
            {search ? (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-4"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            ) : (
              <button 
                onClick={() => router.push('/mobile/search/filters')}
                className="absolute right-4"
              >
                <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 py-6">
        {showResults ? (
          // Search Results
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-secondary animate-pulse" />
              ))
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <h3 className="font-semibold mb-1">No results found</h3>
                <p className="text-sm text-muted-foreground">Try a different search term</p>
              </div>
            ) : (
              results.map((car) => (
                <Link key={car.id} href={`/mobile/cars/${car.id}`}>
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-card border border-border hover:border-accent/30 transition-colors">
                    <div className="relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={car.images?.[0] || 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400'}
                        alt={`${car.brand} ${car.model}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{car.brand}</p>
                      <h3 className="font-medium truncate">{car.model}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs text-muted-foreground">{car.rating?.toFixed(1) || '4.5'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-accent">${car.price_per_day?.toLocaleString() || '1,500'}</p>
                      <p className="text-xs text-muted-foreground">/day</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        ) : (
          // Initial State - Matching PDF exactly
          <div className="space-y-8">
            {/* Suggestions */}
            <section>
              <h2 className="font-semibold mb-4">Suggestion</h2>
              <div className="space-y-3">
                {brandSuggestions.map((brand) => (
                  <button
                    key={brand.name}
                    onClick={() => setSearch(brand.name)}
                    className="flex items-center gap-4 w-full p-3 rounded-2xl hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center p-2">
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                    <span className="font-medium">{brand.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Recently Searches */}
            <section>
              <h2 className="font-semibold mb-4">Recently searches</h2>
              <div className="space-y-3">
                {recentSearches.map((brand) => (
                  <button
                    key={brand.name}
                    onClick={() => setSearch(brand.name)}
                    className="flex items-center gap-4 w-full p-3 rounded-2xl hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center p-2">
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                    <span className="font-medium">{brand.name}</span>
                    <Clock className="h-4 w-4 text-muted-foreground ml-auto" />
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
