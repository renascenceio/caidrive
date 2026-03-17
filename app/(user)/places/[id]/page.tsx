"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Percent, 
  Star, 
  ArrowLeft, 
  Navigation,
  Copy,
  Check,
  Utensils,
  Hotel,
  Fuel,
  Camera,
  Car,
  Ticket,
  ChevronRight
} from "lucide-react"

interface Place {
  id: string
  name: string
  category: string
  description: string | null
  image_url: string | null
  discount_percent: number
  address: string | null
  phone?: string | null
  website?: string | null
  opening_hours?: string | null
  rating?: number
  review_count?: number
}

const categoryIcons: Record<string, typeof Utensils> = {
  restaurant: Utensils,
  hotel: Hotel,
  gas_station: Fuel,
  attraction: Camera,
}

const categoryLabels: Record<string, string> = {
  restaurant: "Restaurant",
  hotel: "Hotel",
  gas_station: "Fuel Station",
  attraction: "Attraction",
}

// Mock data matching the places page
const mockPlaces: Place[] = [
  {
    id: "1",
    name: "Pierchic",
    category: "restaurant",
    description: "Award-winning seafood restaurant with stunning views over the Arabian Gulf. Perched at the end of a wooden pier, Pierchic offers an unparalleled dining experience with the freshest catches prepared by world-class chefs. The romantic setting, combined with exceptional service, makes it perfect for special occasions.",
    image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
    discount_percent: 15,
    address: "Al Qasr Hotel, Madinat Jumeirah, Dubai",
    phone: "+971 4 432 3232",
    website: "https://www.jumeirah.com/pierchic",
    opening_hours: "12:30 PM - 11:30 PM",
    rating: 4.8,
    review_count: 1247,
  },
  {
    id: "2",
    name: "Nobu Dubai",
    category: "restaurant",
    description: "World-famous Japanese cuisine with a unique twist by Chef Nobu Matsuhisa. Experience the signature dishes that have made Nobu a global sensation, including the legendary Black Cod with Miso and Yellowtail Sashimi with Jalapeño.",
    image_url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
    discount_percent: 10,
    address: "Atlantis, The Palm, Dubai",
    phone: "+971 4 426 2626",
    website: "https://www.noburestaurants.com/dubai",
    opening_hours: "6:00 PM - 12:00 AM",
    rating: 4.7,
    review_count: 2156,
  },
  {
    id: "3",
    name: "Burj Al Arab",
    category: "hotel",
    description: "Iconic luxury hotel offering unparalleled service and breathtaking views. Standing on its own artificial island, the Burj Al Arab is one of the most luxurious hotels in the world. Every suite offers panoramic views of the Arabian Gulf, and the hotel features nine restaurants and bars.",
    image_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
    discount_percent: 20,
    address: "Jumeirah Beach Road, Dubai",
    phone: "+971 4 301 7777",
    website: "https://www.jumeirah.com/burj-al-arab",
    opening_hours: "24 Hours",
    rating: 4.9,
    review_count: 8934,
  },
  {
    id: "4",
    name: "ADNOC Service Station",
    category: "gas_station",
    description: "Premium fuel services with convenience store and car wash. ADNOC stations offer high-quality fuel, quick service, and a range of amenities including fresh coffee, snacks, and car care services.",
    image_url: "https://images.unsplash.com/photo-1565620731358-e8c038abc8d1?w=800",
    discount_percent: 5,
    address: "Sheikh Zayed Road, Dubai",
    phone: "+971 800 300",
    opening_hours: "24 Hours",
    rating: 4.2,
    review_count: 456,
  },
  {
    id: "5",
    name: "Dubai Frame",
    category: "attraction",
    description: "Iconic landmark offering panoramic views of old and new Dubai. The Dubai Frame is an architectural masterpiece that frames spectacular views of the city. At 150 meters tall, it features a glass-floored sky deck and museum exhibits.",
    image_url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
    discount_percent: 25,
    address: "Zabeel Park, Dubai",
    phone: "+971 4 317 1777",
    website: "https://www.thedubaiframe.com",
    opening_hours: "9:00 AM - 9:00 PM",
    rating: 4.6,
    review_count: 15678,
  },
  {
    id: "6",
    name: "Zuma Dubai",
    category: "restaurant",
    description: "Contemporary Japanese izakaya-style dining in the heart of DIFC. Zuma brings sophisticated and modern Japanese cuisine to Dubai with its robata grill, sushi counter, and main dining room.",
    image_url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800",
    discount_percent: 12,
    address: "DIFC Gate Village, Dubai",
    phone: "+971 4 425 5660",
    website: "https://www.zumarestaurant.com/dubai",
    opening_hours: "12:00 PM - 1:00 AM",
    rating: 4.7,
    review_count: 3421,
  },
  {
    id: "7",
    name: "Four Seasons Resort",
    category: "hotel",
    description: "Beachfront luxury with private beach and world-class spa. Four Seasons Resort Dubai at Jumeirah Beach offers refined elegance with direct beach access, multiple pools, and exceptional dining options.",
    image_url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    discount_percent: 15,
    address: "Jumeirah Beach Road, Dubai",
    phone: "+971 4 270 7777",
    website: "https://www.fourseasons.com/dubaijb",
    opening_hours: "24 Hours",
    rating: 4.8,
    review_count: 4521,
  },
  {
    id: "8",
    name: "Museum of the Future",
    category: "attraction",
    description: "Architectural marvel showcasing innovations that will shape the world. The Museum of the Future is a hub of innovation featuring immersive exhibits on space, ecology, health, and spirituality.",
    image_url: "https://images.unsplash.com/photo-1597659840241-37e2b9c2f55f?w=800",
    discount_percent: 18,
    address: "Sheikh Zayed Road, Dubai",
    phone: "+971 800 2071",
    website: "https://www.museumofthefuture.ae",
    opening_hours: "10:00 AM - 7:30 PM",
    rating: 4.7,
    review_count: 21456,
  },
]

export default function PlaceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [place, setPlace] = useState<Place | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    async function fetchPlace() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .eq("id", params.id)
        .single()

      if (!error && data) {
        setPlace(data)
      } else {
        // Fallback to mock data
        const mockPlace = mockPlaces.find(p => p.id === params.id)
        if (mockPlace) {
          setPlace(mockPlace)
        }
      }
      setLoading(false)
    }

    fetchPlace()
  }, [params.id])

  const copyAddress = () => {
    if (place?.address) {
      navigator.clipboard.writeText(place.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openMaps = () => {
    if (place?.address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-[50vh] bg-muted animate-pulse" />
        <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-10">
          <div className="bg-card rounded-3xl p-8 space-y-4">
            <div className="h-8 bg-muted rounded-lg w-1/3 animate-pulse" />
            <div className="h-4 bg-muted rounded-lg w-2/3 animate-pulse" />
            <div className="h-4 bg-muted rounded-lg w-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Place not found</h2>
          <p className="text-muted-foreground mb-6">This location doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/places')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Places
          </Button>
        </div>
      </div>
    )
  }

  const CategoryIcon = categoryIcons[place.category] || MapPin

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image */}
      <div className="relative h-[50vh] min-h-[400px]">
        {place.image_url && (
          <Image
            src={place.image_url}
            alt={place.name}
            fill
            className={cn(
              "object-cover transition-opacity duration-500",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            priority
          />
        )}
        
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Back button */}
        <div className="absolute top-6 left-6 z-20">
          <Link href="/places">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl",
              "bg-white/10 backdrop-blur-md border border-white/20",
              "text-white font-medium",
              "transition-all duration-300 hover:bg-white/20"
            )}>
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </div>
          </Link>
        </div>
        
        {/* Discount Badge */}
        {place.discount_percent > 0 && (
          <div className="absolute top-6 right-6 z-20">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl",
              "bg-accent backdrop-blur-md",
              "text-white font-bold shadow-lg"
            )}>
              <Percent className="h-4 w-4" />
              <span>{place.discount_percent}% OFF</span>
            </div>
          </div>
        )}
      </div>

      {/* Content Card */}
      <div className="max-w-4xl mx-auto px-4 -mt-32 relative z-10">
        <div className={cn(
          "bg-card rounded-3xl border border-border/50",
          "shadow-xl shadow-black/5"
        )}>
          {/* Header */}
          <div className="p-8 pb-6">
            {/* Category & Rating */}
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg",
                "bg-secondary text-secondary-foreground"
              )}>
                <CategoryIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{categoryLabels[place.category]}</span>
              </div>
              
              {place.rating && (
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{place.rating}</span>
                  {place.review_count && (
                    <span className="text-muted-foreground text-sm">
                      ({place.review_count.toLocaleString()} reviews)
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {place.name}
            </h1>
            
            {/* Description */}
            {place.description && (
              <p className="text-muted-foreground text-lg leading-relaxed">
                {place.description}
              </p>
            )}
          </div>
          
          {/* Divider */}
          <div className="h-px bg-border mx-8" />
          
          {/* Details Grid */}
          <div className="p-8 pt-6 grid gap-4">
            {/* Address */}
            {place.address && (
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground mb-1">Address</p>
                  <p className="font-medium text-foreground">{place.address}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyAddress}
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center",
                      "bg-secondary hover:bg-secondary/80 transition-colors"
                    )}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={openMaps}
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center",
                      "bg-secondary hover:bg-secondary/80 transition-colors"
                    )}
                  >
                    <Navigation className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            )}
            
            {/* Opening Hours */}
            {place.opening_hours && (
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Opening Hours</p>
                  <p className="font-medium text-foreground">{place.opening_hours}</p>
                </div>
              </div>
            )}
            
            {/* Phone */}
            {place.phone && (
              <a 
                href={`tel:${place.phone}`}
                className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Phone</p>
                  <p className="font-medium text-foreground">{place.phone}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground self-center" />
              </a>
            )}
            
            {/* Website */}
            {place.website && (
              <a 
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <Globe className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Website</p>
                  <p className="font-medium text-foreground">{new URL(place.website).hostname}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground self-center" />
              </a>
            )}
          </div>
          
          {/* Discount Card */}
          {place.discount_percent > 0 && (
            <>
              <div className="h-px bg-border mx-8" />
              
              <div className="p-8">
                <div className={cn(
                  "relative overflow-hidden rounded-2xl p-6",
                  "bg-gradient-to-br from-accent/10 via-accent/5 to-transparent",
                  "border border-accent/20"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center",
                      "bg-accent text-white"
                    )}>
                      <Ticket className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        CAI Member Discount
                      </h3>
                      <p className="text-muted-foreground">
                        Show your CAI membership to receive {place.discount_percent}% off
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-accent">{place.discount_percent}%</p>
                      <p className="text-sm text-muted-foreground">OFF</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Actions */}
          <div className="p-8 pt-0">
            <div className="flex flex-col sm:flex-row gap-3">
              {place.phone && (
                <a href={`tel:${place.phone}`} className="flex-1">
                  <Button size="lg" className="w-full gap-2">
                    <Phone className="h-4 w-4" />
                    Call Now
                  </Button>
                </a>
              )}
              <button 
                onClick={openMaps}
                className="flex-1"
              >
                <Button size="lg" variant="outline" className="w-full gap-2">
                  <Navigation className="h-4 w-4" />
                  Get Directions
                </Button>
              </button>
            </div>
          </div>
        </div>
        
        {/* Nearby Cars CTA */}
        <div className={cn(
          "mt-6 p-6 rounded-2xl",
          "bg-card border border-border/50",
          "flex items-center gap-4"
        )}>
          <div className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center",
            "bg-secondary"
          )}>
            <Car className="h-6 w-6 text-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Need a ride?</h3>
            <p className="text-sm text-muted-foreground">Browse luxury cars available for pickup nearby</p>
          </div>
          <Link href="/cars">
            <Button variant="outline" size="sm" className="gap-2">
              Browse Garage
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
