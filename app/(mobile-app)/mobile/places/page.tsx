'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Search, MapPin, Star, Percent, Utensils, Hotel, Fuel, Camera, ChevronRight } from 'lucide-react'

interface Place {
  id: string
  name: string
  category: string
  description: string
  image_url: string
  discount_percent: number
  location: { address: string }
  rating?: number
}

const categories = [
  { id: 'all', label: 'All', icon: MapPin },
  { id: 'restaurant', label: 'Dining', icon: Utensils },
  { id: 'hotel', label: 'Hotels', icon: Hotel },
  { id: 'gas_station', label: 'Gas', icon: Fuel },
  { id: 'attraction', label: 'Attractions', icon: Camera },
]

export default function MobilePlacesPage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchPlaces() {
      const supabase = createClient()
      
      let query = supabase.from('places').select('*')

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      if (search) {
        query = query.ilike('name', `%${search}%`)
      }

      const { data } = await query.order('discount_percent', { ascending: false })
      setPlaces(data || [])
      setLoading(false)
    }
    
    fetchPlaces()
  }, [selectedCategory, search])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-3">
          <h1 className="text-xl font-semibold mb-3">Partner Places</h1>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search places..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm",
                "bg-secondary/50 border border-border/50",
                "focus:outline-none focus:border-accent/50"
              )}
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isActive = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                    isActive 
                      ? "bg-accent text-white" 
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 flex flex-col gap-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-40 rounded-3xl bg-secondary animate-pulse" />
          ))
        ) : (
          places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))
        )}
      </div>
    </div>
  )
}

function PlaceCard({ place }: { place: Place }) {
  const categoryIcons: Record<string, any> = {
    restaurant: Utensils,
    hotel: Hotel,
    gas_station: Fuel,
    attraction: Camera,
  }
  const Icon = categoryIcons[place.category] || MapPin

  return (
    <Link href={`/mobile/places/${place.id}`} className="block">
      <div className="relative rounded-3xl overflow-hidden group">
        <div className="relative h-44">
          <Image
            src={place.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'}
            alt={place.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          
          {/* Discount Badge */}
          {place.discount_percent > 0 && (
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-accent text-white">
              <Percent className="h-3 w-3" />
              <span className="text-xs font-bold">{place.discount_percent}% OFF</span>
            </div>
          )}

          {/* Rating */}
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/10 backdrop-blur-md">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-white">{place.rating?.toFixed(1) || '4.5'}</span>
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 backdrop-blur-md">
                <Icon className="h-3 w-3 text-white/70" />
                <span className="text-[10px] font-medium text-white/90 uppercase tracking-wider">
                  {place.category.replace('_', ' ')}
                </span>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-white">{place.name}</h3>
            
            <div className="flex items-center gap-1 mt-1 text-white/70">
              <MapPin className="h-3 w-3" />
              <span className="text-xs truncate">{place.location?.address || 'Dubai, UAE'}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
