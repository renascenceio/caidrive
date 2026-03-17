"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { ArrowLeft, Heart, Star, Fuel, Users } from "lucide-react"

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
  }
}

export default function WishlistPage() {
  const router = useRouter()
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWishlist = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/app/login")
        return
      }

      const { data } = await supabase
        .from('wishlists')
        .select(`
          id,
          vehicle:vehicles(id, brand, model, price_per_day, images, rating, fuel_type, seats)
        `)
        .eq('user_id', user.id)

      if (data) {
        setWishlist(data as unknown as WishlistItem[])
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">My Wishlist</h1>
        <span className="ml-auto text-sm text-muted-foreground">
          {wishlist.length} {wishlist.length === 1 ? 'car' : 'cars'}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-accent" />
            </div>
            <p className="font-medium mb-1">Your wishlist is empty</p>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Save your favorite cars to book them later
            </p>
            <Link
              href="/app/garage"
              className="px-6 py-3 rounded-xl bg-accent text-white font-medium"
            >
              Browse Cars
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                <Link href={`/app/cars/${item.vehicle.id}`}>
                  <div className="relative h-40">
                    <Image
                      src={item.vehicle.images?.[0] || "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800"}
                      alt={item.vehicle.model}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleRemove(item.id)
                      }}
                      className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center"
                    >
                      <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                    </button>
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">{item.vehicle.brand}</p>
                      <h3 className="font-semibold">{item.vehicle.model}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span>{item.vehicle.rating?.toFixed(1) || '4.5'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Fuel className="h-4 w-4" />
                      {item.vehicle.fuel_type || 'Petrol'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {item.vehicle.seats || 5} seats
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-accent">AED {item.vehicle.price_per_day}</span>
                      <span className="text-sm text-muted-foreground">/day</span>
                    </div>
                    <Link
                      href={`/app/cars/${item.vehicle.id}/book`}
                      className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
