import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Get driver status and stats
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get driver record
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select(`
        *,
        assigned_vehicle:vehicles(brand, model, images, license_plate)
      `)
      .eq('user_id', user.id)
      .single()

    if (driverError) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
    }

    // Get stats
    const { count: totalRides } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('driver_id', user.id)
      .eq('status', 'completed')

    const { data: completedBookings } = await supabase
      .from('bookings')
      .select('total_price')
      .eq('driver_id', user.id)
      .eq('status', 'completed')

    const totalEarnings = completedBookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0

    // Get average rating from completed bookings
    const { data: ratedBookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('driver_id', user.id)
      .eq('status', 'completed')

    let averageRating = 4.8 // Default
    if (ratedBookings && ratedBookings.length > 0) {
      const bookingIds = ratedBookings.map(b => b.id)
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .in('booking_id', bookingIds)

      if (reviews && reviews.length > 0) {
        averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      }
    }

    return NextResponse.json({
      driver,
      stats: {
        totalRides: totalRides || 0,
        totalEarnings,
        rating: Math.round(averageRating * 10) / 10,
        completionRate: 98, // Placeholder
      }
    })
  } catch (error: any) {
    console.error('Error fetching driver status:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - Update driver status (online/offline)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status } = await request.json()

    if (!['available', 'off_duty'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { data: driver, error } = await supabase
      .from('drivers')
      .update({ status })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    // Notify company of status change
    const { data: driverData } = await supabase
      .from('drivers')
      .select('company:companies(owner_id)')
      .eq('user_id', user.id)
      .single()

    if (driverData?.company?.owner_id) {
      await supabase.from('notifications').insert({
        user_id: driverData.company.owner_id,
        title: 'Driver Status Changed',
        message: `Driver is now ${status === 'available' ? 'online' : 'offline'}`,
        type: 'system',
      })
    }

    return NextResponse.json({ driver })
  } catch (error: any) {
    console.error('Error updating driver status:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
