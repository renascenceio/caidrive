'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Search, ArrowLeft, X, Star, Gauge, Zap, Clock, TrendingUp } from 'lucide-react'

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

const recentSearches = ['Ferrari', 'Lamborghini', 'Sports car', 'Luxury SUV']
const popularBrands = ['Ferrari', 'Lamborghini', 'Porsche', 'BMW', 'Mercedes', 'Bentley']

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
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50 px-4 py-3 safe-area-top">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search cars..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className={cn(
                "w-full pl-10 pr-10 py-2.5 rounded-xl text-sm",
                "bg-secondary/50 border border-border/50",
                "focus:outline-none focus:border-accent/50"
              )}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4">
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
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-card border border-border/30 hover:border-border transition-colors">
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
                      <p className="text-sm font-bold text-accent">AED {car.price_per_day?.toLocaleString() || '1,500'}</p>
                      <p className="text-xs text-muted-foreground">/day</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        ) : (
          // Initial State
          <div className="space-y-8">
            {/* Recent Searches */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-semibold text-sm">Recent Searches</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearch(term)}
                    className="px-3 py-1.5 bg-secondary rounded-full text-sm"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </section>

            {/* Popular Brands */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-semibold text-sm">Popular Brands</h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {popularBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSearch(brand)}
                    className="p-4 bg-card rounded-2xl border border-border/30 hover:border-border transition-colors text-center"
                  >
                    <span className="font-medium text-sm">{brand}</span>
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
