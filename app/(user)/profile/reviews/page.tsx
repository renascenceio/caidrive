'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Star, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function ReviewsPage() {
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<any[]>([])

  useEffect(() => {
    async function loadReviews() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('reviews')
        .select('*, vehicle:vehicles(brand, model, images)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setReviews(data || [])
      setLoading(false)
    }
    loadReviews()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/profile">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">My Reviews</h1>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Star className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No reviews yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Complete a booking to leave your first review
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl bg-card p-4 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden">
                  {review.vehicle?.images?.[0] && (
                    <img 
                      src={review.vehicle.images[0]} 
                      alt={`${review.vehicle.brand} ${review.vehicle.model}`}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {review.vehicle?.brand} {review.vehicle?.model}
                  </p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
