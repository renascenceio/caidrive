'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { ArrowLeft, Heart, Star, Gauge, Zap, Fuel, Users } from 'lucide-react'

interface WishlistItem {
  id: string
  vehicle: {
    id: string
    brand: string
    model: string
    price_per_day: number
    images: string[]
    rating: number
    fuel_type: string
    seats: number
    max_speed: number
    acceleration: number
  }
}

// Mock wishlist data matching PDF design
const mockWishlist: WishlistItem[] = [
  {
    id: '1',
    vehicle: {
      id: 'v1',
      brand: 'Ferrari',
      model: 'Portofino',
      price_per_day: 2500,
      images: ['https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800'],
      rating: 4.9,
      fuel_type: 'Petrol',
      seats: 2,
      max_speed: 320,
      acceleration: 3.5
    }
  },
  {
    id: '2',
    vehicle: {
      id: 'v2',
      brand: 'Lamborghini',
      model: 'Huracan',
      price_per_day: 3000,
      images: ['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800'],
      rating: 4.8,
      fuel_type: 'Petrol',
      seats: 2,
      max_speed: 325,
      acceleration: 2.9
    }
  },
  {
    id: '3',
    vehicle: {
      id: 'v3',
      brand: 'Porsche',
      model: '911 Turbo S',
      price_per_day: 2200,
      images: ['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800'],
      rating: 4.9,
      fuel_type: 'Petrol',
      seats: 4,
      max_speed: 330,
      acceleration: 2.7
    }
  }
]

export default function WishlistPage() {
  const router = useRouter()
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWishlist = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/mobile/login')
        return
      }

      const { data } = await supabase
        .from('wishlists')
        .select(`
          id,
          vehicle:vehicles(id, brand, model, price_per_day, images, rating, fuel_type, seats, max_speed, acceleration)
        `)
        .eq('user_id', user.id)

      if (data && data.length > 0) {
        setWishlist(data as unknown as WishlistItem[])
      } else {
        // Use mock data if no data
        setWishlist(mockWishlist)
      }
      setLoading(false)
    }
    fetchWishlist()
  }, [router])

  const handleRemove = async (wishlistId: string) => {
    const supabase = createClient()
    await supabase
      .from('wishlists')
      .delete()
      .eq('id', wishlistId)
    
    setWishlist(wishlist.filter(w => w.id !== wishlistId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center gap-4 px-4 py-3">
            <button onClick={() => router.back()} className="p-2 -ml-2">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">Wishlist</h1>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-secondary animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 -ml-2">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">Wishlist</h1>
          </div>
          <span className="text-sm text-muted-foreground">
            {wishlist.length} cars
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <Heart className="h-10 w-10 text-accent" />
            </div>
            <p className="font-semibold text-lg mb-1">Your wishlist is empty</p>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              Save your favorite cars to book them later
            </p>
            <Link
              href="/mobile/garage"
              className={cn(
                "px-8 py-3.5 rounded-2xl font-semibold",
                "bg-accent text-white"
              )}
            >
              Browse Cars
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-3xl border border-border overflow-hidden"
              >
                {/* Car Image */}
                <Link href={`/mobile/cars/${item.vehicle.id}`}>
                  <div className="relative h-44">
                    <Image
                      src={item.vehicle.images?.[0] || 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800'}
                      alt={item.vehicle.model}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleRemove(item.id)
                      }}
                      className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center"
                    >
                      <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                    </button>
                    {/* Rating badge */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold">{item.vehicle.rating?.toFixed(1) || '4.8'}</span>
                    </div>
                  </div>
                </Link>

                {/* Car Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.vehicle.brand}</p>
                      <h3 className="font-bold text-lg">{item.vehicle.model}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-accent">${item.vehicle.price_per_day}</span>
                      <span className="text-sm text-muted-foreground">/day</span>
                    </div>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="text-center p-2 bg-secondary/50 rounded-xl">
                      <Gauge className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs font-medium">{item.vehicle.max_speed || 320}</p>
                      <p className="text-[10px] text-muted-foreground">km/h</p>
                    </div>
                    <div className="text-center p-2 bg-secondary/50 rounded-xl">
                      <Zap className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs font-medium">{item.vehicle.acceleration || 3.5}s</p>
                      <p className="text-[10px] text-muted-foreground">0-100</p>
                    </div>
                    <div className="text-center p-2 bg-secondary/50 rounded-xl">
                      <Fuel className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs font-medium">{item.vehicle.fuel_type || 'Petrol'}</p>
                      <p className="text-[10px] text-muted-foreground">Fuel</p>
                    </div>
                    <div className="text-center p-2 bg-secondary/50 rounded-xl">
                      <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs font-medium">{item.vehicle.seats || 2}</p>
                      <p className="text-[10px] text-muted-foreground">Seats</p>
                    </div>
                  </div>

                  {/* Book Now Button */}
                  <Link
                    href={`/mobile/cars/${item.vehicle.id}/book`}
                    className={cn(
                      "block w-full py-3.5 rounded-2xl font-semibold text-center",
                      "bg-accent text-white"
                    )}
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
