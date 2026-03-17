'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Search, Bell, Star, ChevronRight, Gauge, Zap, Heart, TrendingUp } from 'lucide-react'

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

export default function MobileHomePage() {
  const [featuredCars, setFeaturedCars] = useState<Vehicle[]>([])
  const [popularCars, setPopularCars] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('Guest')

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      
      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        if (profile?.full_name) {
          setUserName(profile.full_name.split(' ')[0])
        }
      }

      // Get featured cars (highest rated)
      const { data: featured } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'available')
        .order('rating', { ascending: false })
        .limit(5)

      // Get popular cars (most reviews)
      const { data: popular } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'available')
        .order('review_count', { ascending: false })
        .limit(10)

      setFeaturedCars(featured || [])
      setPopularCars(popular || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs text-muted-foreground">Welcome back</p>
            <h1 className="text-lg font-semibold">{userName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/app/notifications" className="relative p-2 rounded-full hover:bg-secondary">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-accent rounded-full" />
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <Link href="/app/search" className="block">
            <div className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl",
              "bg-secondary/50 border border-border/50"
            )}>
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Search any car, anywhere...</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-8">
        {/* Featured Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Featured</h2>
            <Link href="/app/garage" className="text-xs text-accent font-medium flex items-center gap-1">
              See all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-72 h-48 rounded-3xl bg-secondary animate-pulse" />
              ))
            ) : (
              featuredCars.map((car) => (
                <FeaturedCarCard key={car.id} car={car} />
              ))
            )}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-secondary/30 border border-border/30">
            <TrendingUp className="h-5 w-5 text-accent mb-2" />
            <p className="text-2xl font-bold">500+</p>
            <p className="text-xs text-muted-foreground">Luxury Cars</p>
          </div>
          <div className="p-4 rounded-2xl bg-secondary/30 border border-border/30">
            <Star className="h-5 w-5 text-amber-500 mb-2" />
            <p className="text-2xl font-bold">4.9</p>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </div>
          <div className="p-4 rounded-2xl bg-secondary/30 border border-border/30">
            <Heart className="h-5 w-5 text-accent mb-2" />
            <p className="text-2xl font-bold">50+</p>
            <p className="text-xs text-muted-foreground">Brands</p>
          </div>
        </section>

        {/* Popular Cars */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Popular Cars</h2>
            <Link href="/app/garage" className="text-xs text-accent font-medium flex items-center gap-1">
              See all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-secondary animate-pulse" />
              ))
            ) : (
              popularCars.slice(0, 4).map((car) => (
                <PopularCarCard key={car.id} car={car} />
              ))
            )}
          </div>
        </section>

        {/* Promo Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-accent to-accent/80 p-6">
          <div className="relative z-10">
            <p className="text-xs text-white/80 font-medium mb-1">Limited Time</p>
            <h3 className="text-xl font-bold text-white mb-2">20% Off First Ride</h3>
            <p className="text-xs text-white/70 mb-4">Use code FIRST20 at checkout</p>
            <Link 
              href="/app/garage"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-accent font-medium text-sm rounded-xl"
            >
              Book Now
            </Link>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-10">
            <Car className="h-40 w-40" />
          </div>
        </section>
      </div>
    </div>
  )
}

function FeaturedCarCard({ car }: { car: Vehicle }) {
  return (
    <Link href={`/app/cars/${car.id}`} className="flex-shrink-0 w-72 snap-start">
      <div className="relative h-48 rounded-3xl overflow-hidden group">
        <Image
          src={car.images?.[0] || 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800'}
          alt={`${car.brand} ${car.model}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Rating Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 backdrop-blur-md">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-medium text-white">{car.rating?.toFixed(1) || '4.5'}</span>
        </div>

        {/* Heart */}
        <button className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-md">
          <Heart className="h-4 w-4 text-white" />
        </button>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-xs text-white/70 mb-0.5">{car.brand}</p>
          <h3 className="text-base font-semibold text-white mb-2">{car.model}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Gauge className="h-3 w-3 text-white/70" />
                <span className="text-xs text-white/70">{car.max_speed || 300} km/h</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-white/70" />
                <span className="text-xs text-white/70">{car.acceleration || 3.5}s</span>
              </div>
            </div>
            <p className="text-sm font-bold text-white">
              AED {car.price_per_day?.toLocaleString() || '1,500'}<span className="text-xs font-normal">/day</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}

function PopularCarCard({ car }: { car: Vehicle }) {
  return (
    <Link href={`/app/cars/${car.id}`}>
      <div className="flex items-center gap-4 p-3 rounded-2xl bg-card border border-border/30 hover:border-border transition-colors">
        <div className="relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0">
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
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs text-muted-foreground">{car.rating?.toFixed(1) || '4.5'}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-accent">AED {car.price_per_day?.toLocaleString() || '1,500'}</p>
          <p className="text-xs text-muted-foreground">/day</p>
        </div>
      </div>
    </Link>
  )
}

function Car({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
    </svg>
  )
}
