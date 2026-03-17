import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch reviews
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const vehicle_id = searchParams.get('vehicle_id')
    const user_id = searchParams.get('user_id')

    let query = supabase
      .from('reviews')
      .select(`
        *,
        user:profiles!reviews_user_id_fkey(full_name, avatar_url),
        vehicle:vehicles(brand, model, images)
      `)

    if (vehicle_id) {
      query = query.eq('vehicle_id', vehicle_id)
    }

    if (user_id) {
      query = query.eq('user_id', user_id)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ reviews: data })
  } catch (error: any) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create a review
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { vehicle_id, booking_id, rating, comment } = await request.json()

    if (!vehicle_id || !rating) {
      return NextResponse.json({ error: 'Vehicle ID and rating required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Check if user has already reviewed this vehicle for this booking
    if (booking_id) {
      const { data: existing } = await supabase
        .from('reviews')
        .select('id')
        .eq('booking_id', booking_id)
        .single()

      if (existing) {
        return NextResponse.json({ error: 'Already reviewed this booking' }, { status: 400 })
      }
    }

    // Create review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        vehicle_id,
        booking_id,
        rating,
        comment,
      })
      .select()
      .single()

    if (error) throw error

    // Update vehicle rating
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('vehicle_id', vehicle_id)

    if (reviews && reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      await supabase
        .from('vehicles')
        .update({ 
          rating: Math.round(avgRating * 10) / 10,
          review_count: reviews.length 
        })
        .eq('id', vehicle_id)
    }

    return NextResponse.json({ review }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
