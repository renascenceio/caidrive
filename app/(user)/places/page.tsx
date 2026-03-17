"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { MapPin, Utensils, Hotel, Fuel, Camera, Percent, Star, ArrowRight, Clock } from "lucide-react"

interface Place {
  id: string
  name: string
  category: string
  description: string | null
  image_url: string | null
  discount_percent: number
  address: string | null
}

const categories = [
  { id: 'all', label: 'All', icon: null },
  { id: 'restaurant', label: 'Dining', icon: Utensils },
  { id: 'hotel', label: 'Hotels', icon: Hotel },
  { id: 'gas_station', label: 'Fuel', icon: Fuel },
  { id: 'attraction', label: 'Explore', icon: Camera },
]

const categoryLabels: Record<string, string> = {
  restaurant: "Restaurant",
  hotel: "Hotel",
  gas_station: "Fuel Station",
  attraction: "Attraction",
}

// Mock data for demonstration
const mockPlaces: Place[] = [
  {
    id: "1",
    name: "Pierchic",
    category: "restaurant",
    description: "Award-winning seafood restaurant with stunning views over the Arabian Gulf",
    image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
    discount_percent: 15,
    address: "Al Qasr Hotel, Madinat Jumeirah",
  },
  {
    id: "2",
    name: "Nobu Dubai",
    category: "restaurant",
    description: "World-famous Japanese cuisine with a unique twist by Chef Nobu Matsuhisa",
    image_url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
    discount_percent: 10,
    address: "Atlantis, The Palm",
  },
  {
    id: "3",
    name: "Burj Al Arab",
    category: "hotel",
    description: "Iconic luxury hotel offering unparalleled service and breathtaking views",
    image_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
    discount_percent: 20,
    address: "Jumeirah Beach Road",
  },
  {
    id: "4",
    name: "ADNOC Service Station",
    category: "gas_station",
    description: "Premium fuel services with convenience store and car wash",
    image_url: "https://images.unsplash.com/photo-1565620731358-e8c038abc8d1?w=800",
    discount_percent: 5,
    address: "Sheikh Zayed Road",
  },
  {
    id: "5",
    name: "Dubai Frame",
    category: "attraction",
    description: "Iconic landmark offering panoramic views of old and new Dubai",
    image_url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
    discount_percent: 25,
    address: "Zabeel Park",
  },
  {
    id: "6",
    name: "Zuma Dubai",
    category: "restaurant",
    description: "Contemporary Japanese izakaya-style dining in the heart of DIFC",
    image_url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800",
    discount_percent: 12,
    address: "DIFC Gate Village",
  },
  {
    id: "7",
    name: "Four Seasons Resort",
    category: "hotel",
    description: "Beachfront luxury with private beach and world-class spa",
    image_url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    discount_percent: 15,
    address: "Jumeirah Beach Road",
  },
  {
    id: "8",
    name: "Museum of the Future",
    category: "attraction",
    description: "Architectural marvel showcasing innovations that will shape the world",
    image_url: "https://images.unsplash.com/photo-1597659840241-37e2b9c2f55f?w=800",
    discount_percent: 18,
    address: "Sheikh Zayed Road",
  },
]

function PlaceCard({ place }: { place: Place }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  
  return (
    <Link 
      href={`/places/${place.id}`}
      className={cn(
      "group relative h-[380px] rounded-3xl overflow-hidden cursor-pointer block",
      "transition-all duration-500 ease-out",
      "hover:shadow-2xl hover:shadow-black/20 dark:hover:shadow-black/40",
      "hover:-translate-y-2 hover:scale-[1.02]"
    )}>
      {/* Background Image */}
      {place.image_url && (
        <Image
          src={place.image_url}
          alt={place.name}
          fill
          className={cn(
            "object-cover transition-transform duration-700 ease-out",
            "group-hover:scale-110",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
        />
      )}
      
      {/* Loading skeleton */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Dark gradient overlay */}
      <div className={cn(
        "absolute inset-0",
        "bg-gradient-to-t from-black/80 via-black/30 to-black/10",
        "transition-opacity duration-300",
        "group-hover:from-black/90"
      )} />

      {/* Top Glass Badges */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-start justify-between">
        {/* Category Badge */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-2xl",
          "bg-white/10 backdrop-blur-md border border-white/20",
          "shadow-lg"
        )}>
          <span className="text-xs font-medium text-white uppercase tracking-wider">
            {categoryLabels[place.category]}
          </span>
        </div>

        {/* Discount Badge */}
        {place.discount_percent > 0 && (
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-2xl",
            "bg-accent/90 backdrop-blur-md border border-accent",
            "shadow-lg"
          )}>
            <Percent className="h-3.5 w-3.5 text-white" />
            <span className="text-sm font-bold text-white">{place.discount_percent}% OFF</span>
          </div>
        )}
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-2">
          {place.name}
        </h3>
        
        {/* Description */}
        {place.description && (
          <p className="text-sm text-white/70 line-clamp-2 mb-4">
            {place.description}
          </p>
        )}

        {/* Bottom Row */}
        <div className={cn(
          "flex items-center justify-between pt-4",
          "border-t border-white/10"
        )}>
          {/* Location */}
          {place.address && (
            <div className="flex items-center gap-2 text-white/60">
              <MapPin className="h-4 w-4" />
              <span className="text-sm truncate max-w-[180px]">{place.address}</span>
            </div>
          )}
          
          {/* CTA Button */}
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl",
            "bg-white/10 backdrop-blur-md border border-white/20",
            "text-sm font-medium text-white",
            "transition-all duration-300",
            "group-hover:bg-white group-hover:text-black"
          )}>
            <span>Details</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>(mockPlaces)
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState("all")

  useEffect(() => {
    async function fetchPlaces() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .order("discount_percent", { ascending: false })

      if (!error && data && data.length > 0) {
        setPlaces(data)
      }
      setLoading(false)
    }

    fetchPlaces()
  }, [])

  const filteredPlaces =
    activeCategory === "all"
      ? places
      : places.filter((place) => place.category === activeCategory)

  // Get featured place (highest discount)
  const featuredPlace = [...places].sort((a, b) => b.discount_percent - a.discount_percent)[0]

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-24">
        {/* Hero Section */}
        <section className="relative px-4 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-3 mb-10">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Exclusive Partnerships
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Partner Locations
              </h1>
              <p className="text-muted-foreground max-w-lg">
                Unlock exclusive discounts at premium restaurants, hotels, and experiences. 
                Show your CAI membership for instant savings.
              </p>
            </div>

            {/* Featured Place - Glassmorphism Hero Card */}
            {featuredPlace && (
              <Link 
                href={`/places/${featuredPlace.id}`}
                className={cn(
                "group relative h-[450px] rounded-3xl overflow-hidden cursor-pointer block",
                "transition-all duration-500 ease-out",
                "hover:shadow-2xl hover:shadow-black/20 dark:hover:shadow-black/40"
              )}>
                {featuredPlace.image_url && (
                  <Image
                    src={featuredPlace.image_url}
                    alt={featuredPlace.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                
                {/* Top badges */}
                <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-2xl",
                    "bg-white/10 backdrop-blur-md border border-white/20"
                  )}>
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium text-white">Featured Partner</span>
                  </div>
                  
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-2xl",
                    "bg-accent/90 backdrop-blur-md"
                  )}>
                    <Percent className="h-4 w-4 text-white" />
                    <span className="text-lg font-bold text-white">{featuredPlace.discount_percent}% OFF</span>
                  </div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 max-w-xl">
                  <p className="text-sm font-medium text-white/60 uppercase tracking-wider mb-2">
                    {categoryLabels[featuredPlace.category]}
                  </p>
                  <h2 className="text-4xl font-bold text-white mb-3">{featuredPlace.name}</h2>
                  <p className="text-white/70 mb-6 line-clamp-2">{featuredPlace.description}</p>
                  
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex items-center gap-2 px-5 py-3 rounded-xl",
                      "bg-white text-black font-medium",
                      "transition-all duration-300 hover:scale-105"
                    )}>
                      View Details
                      <ArrowRight className="h-4 w-4" />
                    </div>
                    
                    {featuredPlace.address && (
                      <div className="flex items-center gap-2 text-white/60">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{featuredPlace.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )}
          </div>
        </section>

        {/* Category Filter - Glassmorphism pills */}
        <section className="px-4 py-6 sticky top-16 z-20">
          <div className="max-w-6xl mx-auto">
            <div className={cn(
              "inline-flex items-center gap-2 p-2 rounded-2xl",
              "bg-card/50 backdrop-blur-md border border-border/50"
            )}>
              {categories.map((category) => {
                const Icon = category.icon
                const isActive = activeCategory === category.id
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap",
                      "text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-foreground text-background shadow-lg"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {category.label}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Places Grid */}
        <section className="px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-[380px] rounded-3xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : filteredPlaces.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No places found</h3>
                <p className="text-muted-foreground">
                  Check back later for new partner locations
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPlaces.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
