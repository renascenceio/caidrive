'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Search, ArrowLeft, X, Star, Clock, SlidersHorizontal, Mic, TrendingUp, Sparkles } from 'lucide-react'

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

interface Brand {
  name: string
  logo: string
  count: number
}

// Brand logos mapping
const brandLogos: Record<string, string> = {
  'Ferrari': 'https://www.carlogos.org/car-logos/ferrari-logo.png',
  'BMW': 'https://www.carlogos.org/car-logos/bmw-logo.png',
  'Bentley': 'https://www.carlogos.org/car-logos/bentley-logo.png',
  'Porsche': 'https://www.carlogos.org/car-logos/porsche-logo.png',
  'Audi': 'https://www.carlogos.org/car-logos/audi-logo.png',
  'Mercedes-Benz': 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png',
  'Lamborghini': 'https://www.carlogos.org/car-logos/lamborghini-logo.png',
  'Rolls-Royce': 'https://www.carlogos.org/car-logos/rolls-royce-logo.png',
  'McLaren': 'https://www.carlogos.org/car-logos/mclaren-logo.png',
  'Aston Martin': 'https://www.carlogos.org/car-logos/aston-martin-logo.png',
  'Bugatti': 'https://www.carlogos.org/car-logos/bugatti-logo.png',
  'Maserati': 'https://www.carlogos.org/car-logos/maserati-logo.png',
}

export default function MobileSearchPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  
  // Dynamic data from database
  const [availableBrands, setAvailableBrands] = useState<Brand[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [popularSearches, setPopularSearches] = useState<string[]>([])
  const [isListening, setIsListening] = useState(false)

  // Load brands dynamically from database
  useEffect(() => {
    async function loadBrands() {
      const supabase = createClient()
      const { data } = await supabase
        .from('vehicles')
        .select('brand')
        .eq('status', 'available')
      
      if (data) {
        const brandCounts = data.reduce((acc, v) => {
          acc[v.brand] = (acc[v.brand] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        const brands = Object.entries(brandCounts)
          .map(([name, count]) => ({
            name,
            logo: brandLogos[name] || '',
            count
          }))
          .sort((a, b) => b.count - a.count)
        
        setAvailableBrands(brands)
        // Top 5 as popular searches
        setPopularSearches(brands.slice(0, 5).map(b => b.name))
      }
    }
    
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentCarSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
    
    loadBrands()
  }, [])

  // Save search to recent
  const saveRecentSearch = useCallback((term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentCarSearches', JSON.stringify(updated))
  }, [recentSearches])

  // Search with debounce
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

  // Voice recognition
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in your browser')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setSearch(transcript)
      saveRecentSearch(transcript)
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const handleSelectBrand = (brand: string) => {
    setSearch(brand)
    saveRecentSearch(brand)
  }

  const handleSelectResult = (car: Vehicle) => {
    saveRecentSearch(`${car.brand} ${car.model}`)
    router.push(`/mobile/cars/${car.id}`)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentCarSearches')
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
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
              ref={inputRef}
              type="text"
              placeholder="Search by brand, model, or features..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className={cn(
                "w-full pl-12 pr-24 py-4 rounded-2xl text-base",
                "bg-card border border-border",
                "focus:outline-none focus:border-accent/50",
                "placeholder:text-muted-foreground/70"
              )}
            />
            <div className="absolute right-3 flex items-center gap-1">
              {search ? (
                <button 
                  onClick={() => setSearch('')}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              ) : (
                <>
                  <button 
                    onClick={startVoiceRecognition}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      isListening ? "bg-accent/20 text-accent" : "hover:bg-secondary"
                    )}
                  >
                    <Mic className={cn("h-5 w-5", isListening && "animate-pulse")} />
                  </button>
                  <button 
                    onClick={() => router.push('/mobile/filters')}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Voice Listening Indicator */}
          {isListening && (
            <div className="mt-3 flex items-center justify-center gap-2 text-accent">
              <div className="flex gap-1">
                <span className="w-1 h-4 bg-accent rounded-full animate-pulse" />
                <span className="w-1 h-6 bg-accent rounded-full animate-pulse delay-75" />
                <span className="w-1 h-4 bg-accent rounded-full animate-pulse delay-150" />
              </div>
              <span className="text-sm font-medium">Listening...</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-6">
        {showResults ? (
          // Search Results
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Results</h2>
              <span className="text-sm text-muted-foreground">{results.length} cars found</span>
            </div>
            
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-secondary animate-pulse" />
              ))
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <h3 className="font-semibold mb-1">No results found</h3>
                <p className="text-sm text-muted-foreground mb-4">Try a different search term</p>
                <button 
                  onClick={() => setSearch('')}
                  className="text-accent font-medium text-sm"
                >
                  Clear search
                </button>
              </div>
            ) : (
              results.map((car) => (
                <button
                  key={car.id}
                  onClick={() => handleSelectResult(car)}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl bg-card border border-border hover:border-accent/30 transition-colors text-left"
                >
                  <div className="relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-secondary">
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
                </button>
              ))
            )}
          </div>
        ) : (
          // Initial State with AI-like suggestions
          <div className="space-y-8">
            {/* Quick Filters / AI Suggestions */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-accent" />
                <h2 className="font-semibold">Quick suggestions</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Sports car', 'Luxury sedan', 'SUV', 'Convertible', 'Electric'].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => setSearch(suggestion)}
                    className="px-4 py-2 bg-card border border-border rounded-xl text-sm hover:border-accent/50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </section>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <h2 className="font-semibold">Recent searches</h2>
                  </div>
                  <button 
                    onClick={clearRecentSearches}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectBrand(term)}
                      className="flex items-center gap-4 w-full p-3 rounded-2xl hover:bg-secondary/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium flex-1 text-left">{term}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Popular / Trending Brands */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-accent" />
                <h2 className="font-semibold">Popular brands</h2>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {availableBrands.slice(0, 8).map((brand) => (
                  <button
                    key={brand.name}
                    onClick={() => handleSelectBrand(brand.name)}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border border-border hover:border-accent/30 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2">
                      {brand.logo ? (
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      ) : (
                        <span className="text-lg font-bold">{brand.name.charAt(0)}</span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-center truncate w-full">{brand.name}</span>
                    <span className="text-[10px] text-muted-foreground">{brand.count} cars</span>
                  </button>
                ))}
              </div>
            </section>

            {/* All Brands List */}
            <section>
              <h2 className="font-semibold mb-4">All brands</h2>
              <div className="space-y-2">
                {availableBrands.map((brand) => (
                  <button
                    key={brand.name}
                    onClick={() => handleSelectBrand(brand.name)}
                    className="flex items-center gap-4 w-full p-3 rounded-2xl hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white border border-border flex items-center justify-center p-2">
                      {brand.logo ? (
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      ) : (
                        <span className="text-lg font-bold">{brand.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-medium">{brand.name}</span>
                      <p className="text-xs text-muted-foreground">{brand.count} available</p>
                    </div>
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
