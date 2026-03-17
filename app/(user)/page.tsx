'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Crown, Shield, TrendingUp, Sparkles, Star } from 'lucide-react'
import { SpotlightSearch } from '@/components/search/spotlight-search'
import { LuxuryCarCard } from '@/components/cars/luxury-car-card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  images: string[]
  max_speed: number
  acceleration: number
  power: number
  seats: number
  price_per_day: number
  rating: number
  review_count: number
}

const brands = [
  { name: 'Ferrari', initial: 'F' },
  { name: 'Lamborghini', initial: 'L' },
  { name: 'Porsche', initial: 'P' },
  { name: 'Rolls-Royce', initial: 'RR' },
  { name: 'Bentley', initial: 'B' },
  { name: 'McLaren', initial: 'M' },
]

// Sample data for when database is empty or loading
const sampleVehicles: Vehicle[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    brand: 'Ferrari',
    model: 'SF90 Stradale',
    year: 2024,
    images: ['https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800'],
    max_speed: 340,
    acceleration: 2.5,
    power: 1000,
    seats: 2,
    price_per_day: 2500,
    rating: 4.9,
    review_count: 47,
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    brand: 'Lamborghini',
    model: 'Huracán EVO',
    year: 2024,
    images: ['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800'],
    max_speed: 325,
    acceleration: 2.9,
    power: 640,
    seats: 2,
    price_per_day: 2200,
    rating: 4.8,
    review_count: 63,
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    brand: 'Porsche',
    model: '911 GT3 RS',
    year: 2024,
    images: ['https://images.unsplash.com/photo-1614162692292-7ac56d7f373e?w=800'],
    max_speed: 312,
    acceleration: 3.2,
    power: 525,
    seats: 2,
    price_per_day: 1800,
    rating: 4.9,
    review_count: 89,
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    brand: 'Rolls-Royce',
    model: 'Ghost',
    year: 2024,
    images: ['https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=800'],
    max_speed: 250,
    acceleration: 4.8,
    power: 571,
    seats: 5,
    price_per_day: 1500,
    rating: 5.0,
    review_count: 34,
  },
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    brand: 'Bentley',
    model: 'Continental GT',
    year: 2024,
    images: ['https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800'],
    max_speed: 333,
    acceleration: 3.6,
    power: 659,
    seats: 4,
    price_per_day: 1400,
    rating: 4.7,
    review_count: 52,
  },
  {
    id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    brand: 'McLaren',
    model: '720S Spider',
    year: 2024,
    images: ['https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800'],
    max_speed: 341,
    acceleration: 2.8,
    power: 720,
    seats: 2,
    price_per_day: 2300,
    rating: 4.8,
    review_count: 41,
  },
]

export default function HomePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(sampleVehicles)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('status', 'available')
          .order('rating', { ascending: false })
          .limit(6)

        if (error) throw error
        if (data && data.length > 0) {
          setVehicles(data)
        }
      } catch (error) {
        // Using sample vehicles data as fallback
      } finally {
        setIsLoading(false)
      }
    }

    fetchVehicles()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-24">
        {/* Hero Section with Spotlight Search */}
        <section className="relative flex flex-col items-center justify-center px-4 py-16 sm:py-24 overflow-hidden">
          {/* Background gradient orbs - subtle */}
          <div className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-1/4 w-[300px] h-[300px] bg-[#3B82F6]/5 rounded-full blur-[100px]" />
          
          <div className="relative z-10 w-full max-w-4xl mx-auto space-y-8 text-center">
            {/* Tagline - smaller */}
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
                <span className="text-muted-foreground">Keeper of the</span>
                {' '}
                <span className="text-foreground">Keys</span>
              </h1>
              <p className="text-base text-muted-foreground max-w-lg mx-auto">
                Find and rent the world&apos;s most exclusive vehicles
              </p>
            </div>

            {/* Spotlight Search - prominent */}
            <div className="pt-4">
              <SpotlightSearch />
            </div>

            {/* Quick stats */}
            <div className="flex items-center justify-center gap-8 sm:gap-12 pt-6">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-foreground">500+</p>
                <p className="text-xs text-muted-foreground mt-1">Luxury Cars</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-foreground">50+</p>
                <p className="text-xs text-muted-foreground mt-1">Premium Brands</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-foreground">4.9</p>
                <p className="text-xs text-muted-foreground mt-1">Average Rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Logos */}
        <section className="px-4 py-8 border-y border-border/50 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
              {brands.map((brand) => (
                <Link
                  key={brand.name}
                  href={`/cars?brand=${brand.name}`}
                  className={cn(
                    "flex flex-col items-center gap-2 px-4 py-3 rounded-xl",
                    "hover:bg-card transition-all duration-300",
                    "group cursor-pointer"
                  )}
                >
                  <div className={cn(
                    "h-14 w-14 rounded-xl flex items-center justify-center",
                    "bg-card border border-border/50",
                    "group-hover:border-border group-hover:shadow-sm",
                    "transition-all duration-300"
                  )}>
                    <span className="text-lg font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                      {brand.initial}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground whitespace-nowrap transition-colors">
                    {brand.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Vehicles */}
        <section className="px-4 py-16">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Crown className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Featured Collection</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Exceptional Vehicles</h2>
              </div>
              <Link href="/cars">
                <Button variant="ghost" size="sm" className="gap-1 hidden sm:flex">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Vehicle Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <LuxuryCarCard
                  key={vehicle.id}
                  id={vehicle.id}
                  brand={vehicle.brand}
                  model={vehicle.model}
                  year={vehicle.year}
                  image={vehicle.images[0]}
                  maxSpeed={vehicle.max_speed}
                  acceleration={vehicle.acceleration}
                  power={vehicle.power}
                  seats={vehicle.seats}
                  pricePerDay={vehicle.price_per_day}
                  rating={vehicle.rating}
                  reviewCount={vehicle.review_count}
                />
              ))}
            </div>

            {/* Mobile View All Button */}
            <div className="flex justify-center mt-8 sm:hidden">
              <Link href="/cars">
                <Button variant="outline" size="lg" className="rounded-full gap-2">
                  View All Cars
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Why Choose CAI Drive?</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Experience the difference with our premium service
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={cn(
                "p-6 rounded-2xl bg-card border border-border/50",
                "hover:shadow-lg hover:shadow-black/5",
                "transition-all duration-300 group"
              )}>
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-5",
                  "bg-foreground/5"
                )}>
                  <Shield className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Fully Insured</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Comprehensive insurance coverage for complete peace of mind on every journey.
                </p>
              </div>

              <div className={cn(
                "p-6 rounded-2xl bg-card border border-border/50",
                "hover:shadow-lg hover:shadow-black/5",
                "transition-all duration-300 group"
              )}>
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-5",
                  "bg-foreground/5"
                )}>
                  <TrendingUp className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Best Rates</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Competitive pricing with price match guarantee on all luxury vehicles.
                </p>
              </div>

              <div className={cn(
                "p-6 rounded-2xl bg-card border border-border/50",
                "hover:shadow-lg hover:shadow-black/5",
                "transition-all duration-300 group"
              )}>
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-5",
                  "bg-foreground/5"
                )}>
                  <Sparkles className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">VIP Service</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  24/7 concierge support with doorstep delivery and collection.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">What Our Clients Say</h2>
              <p className="text-muted-foreground">
                Join thousands of satisfied customers
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Alexander M.', role: 'CEO, Tech Startup', rating: 5, comment: 'Incredible experience! The Ferrari SF90 exceeded all my expectations. Seamless booking and immaculate service.' },
                { name: 'Sarah K.', role: 'Fashion Designer', rating: 5, comment: 'The Rolls-Royce was in pristine condition. Perfect for Dubai Fashion Week. Will definitely use again!' },
                { name: 'James L.', role: 'Investment Banker', rating: 5, comment: 'Great service and amazing selection. The concierge service made everything effortless.' },
              ].map((review, i) => (
                <div key={i} className={cn(
                  "p-6 rounded-2xl bg-card border border-border/50",
                  "hover:shadow-lg hover:shadow-black/5 transition-all duration-300"
                )}>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        className={cn(
                          "h-4 w-4",
                          j < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed mb-5">&quot;{review.comment}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-semibold text-foreground">{review.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <div className={cn(
              "relative overflow-hidden rounded-2xl p-8 sm:p-12 text-center",
              "bg-foreground text-background"
            )}>
              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Ready to Experience Luxury?
                </h2>
                <p className="text-background/70 mb-8 max-w-lg mx-auto">
                  Join thousands of satisfied customers who have experienced the ultimate in automotive luxury.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/cars">
                    <Button size="lg" className="rounded-full px-8 bg-background text-foreground hover:bg-background/90">
                      Browse Collection
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button size="lg" variant="outline" className="rounded-full px-8 border-background/20 text-background hover:bg-background/10">
                      Create Account
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-4 py-10 border-t border-border">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-sm text-muted-foreground">
                  &copy; {new Date().getFullYear()} CAI Drive. All rights reserved.
                </p>
              </div>
              <div className="flex items-center gap-6">
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
                <Link href="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
