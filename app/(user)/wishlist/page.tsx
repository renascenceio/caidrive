'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { CarCard } from '@/components/cars/car-card'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Vehicle } from '@/types/database'

interface WishlistItem {
  id: string
  vehicle_id: string
  vehicle: Vehicle
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlist()
  }, [])

  async function fetchWishlist() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        id,
        vehicle_id,
        vehicle:vehicles(*)
      `)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching wishlist:', error)
    } else {
      setWishlist(data as WishlistItem[] || [])
    }
    setLoading(false)
  }

  async function removeFromWishlist(vehicleId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Please sign in to manage your wishlist')
      return
    }

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('vehicle_id', vehicleId)

    if (error) {
      toast.error('Failed to remove from wishlist')
    } else {
      setWishlist(prev => prev.filter(item => item.vehicle_id !== vehicleId))
      toast.success('Removed from wishlist')
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4">
              <Skeleton className="aspect-[16/10] rounded-xl" />
              <Skeleton className="mt-4 h-6 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        <p className="mt-1 text-muted-foreground">
          {wishlist.length > 0 
            ? `${wishlist.length} saved vehicle${wishlist.length > 1 ? 's' : ''}`
            : 'Save your favorite cars here'}
        </p>
      </div>

      {wishlist.length === 0 ? (
        <Empty className="py-16">
          <EmptyMedia variant="icon">
            <Heart className="h-10 w-10" />
          </EmptyMedia>
          <EmptyTitle>Your wishlist is empty</EmptyTitle>
          <EmptyDescription>
            Start adding cars to your wishlist by tapping the heart icon on any vehicle.
          </EmptyDescription>
          <Link href="/cars">
            <Button className="mt-4">Browse Cars</Button>
          </Link>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item) => (
            <CarCard
              key={item.id}
              vehicle={item.vehicle}
              isWishlisted={true}
              onWishlistToggle={() => removeFromWishlist(item.vehicle_id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
