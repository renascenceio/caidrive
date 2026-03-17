import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch user profile with stats
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error

    // Get booking stats
    const { count: totalBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: completedBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed')

    const { data: bookingsWithPrice } = await supabase
      .from('bookings')
      .select('total_price')
      .eq('user_id', user.id)
      .eq('status', 'completed')

    const totalSpent = bookingsWithPrice?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0

    // Get document verification status
    const { data: documents } = await supabase
      .from('documents')
      .select('type, verification_status')
      .eq('user_id', user.id)

    // Get wishlist count
    const { count: wishlistCount } = await supabase
      .from('wishlists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Get reviews count
    const { count: reviewsCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return NextResponse.json({
      profile: {
        ...profile,
        email: user.email,
      },
      stats: {
        totalBookings: totalBookings || 0,
        completedBookings: completedBookings || 0,
        totalSpent,
        wishlistCount: wishlistCount || 0,
        reviewsCount: reviewsCount || 0,
      },
      documents: documents || [],
    })
  } catch (error: any) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()

    // Remove fields that shouldn't be updated directly
    delete updates.id
    delete updates.role
    delete updates.level
    delete updates.company_id

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ profile })
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
