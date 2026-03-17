import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch single booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        vehicle:vehicles(*),
        company:companies(id, name, logo_url, phone),
        customer:profiles!bookings_user_id_fkey(full_name, phone, avatar_url, email),
        driver:profiles!bookings_driver_id_fkey(full_name, phone, avatar_url)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    // Check authorization
    if (booking.user_id !== user.id && booking.driver_id !== user.id) {
      // Check if user is company owner
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, company_id')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'business' || profile?.company_id !== booking.company_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    return NextResponse.json({ booking })
  } catch (error: any) {
    console.error('Error fetching booking:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - Update booking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, driver_id, payment_status } = body

    // Get current booking
    const { data: existingBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, vehicle:vehicles(*), company:companies(*)')
      .eq('id', id)
      .single()

    if (fetchError || !existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Build update object
    const updateData: Record<string, any> = {}
    if (status) updateData.status = status
    if (driver_id) updateData.driver_id = driver_id
    if (payment_status) updateData.payment_status = payment_status

    // Update booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Handle status-specific actions
    if (status === 'confirmed') {
      // Notify user
      await supabase.from('notifications').insert({
        user_id: existingBooking.user_id,
        title: 'Booking Confirmed',
        message: `Your booking for ${existingBooking.vehicle?.brand} ${existingBooking.vehicle?.model} has been confirmed!`,
        type: 'booking',
      })

      // Update vehicle status
      await supabase
        .from('vehicles')
        .update({ status: 'booked' })
        .eq('id', existingBooking.vehicle_id)
    }

    if (status === 'active') {
      // Notify user that ride has started
      await supabase.from('notifications').insert({
        user_id: existingBooking.user_id,
        title: 'Ride Started',
        message: 'Your ride has started. Enjoy!',
        type: 'booking',
      })

      // Update driver status
      if (existingBooking.driver_id) {
        await supabase
          .from('drivers')
          .update({ status: 'on_trip' })
          .eq('user_id', existingBooking.driver_id)
      }
    }

    if (status === 'completed') {
      // Update vehicle status back to available
      await supabase
        .from('vehicles')
        .update({ status: 'available' })
        .eq('id', existingBooking.vehicle_id)

      // Update driver status
      if (existingBooking.driver_id) {
        await supabase
          .from('drivers')
          .update({ status: 'available' })
          .eq('user_id', existingBooking.driver_id)
      }

      // Notify user
      await supabase.from('notifications').insert({
        user_id: existingBooking.user_id,
        title: 'Ride Completed',
        message: 'Thanks for riding with us! Please leave a review.',
        type: 'booking',
      })

      // Update analytics with completed booking
      await updateAnalytics(supabase, existingBooking.company_id, 'booking_completed', existingBooking.total_price)
    }

    if (status === 'cancelled') {
      // Update vehicle status back to available
      await supabase
        .from('vehicles')
        .update({ status: 'available' })
        .eq('id', existingBooking.vehicle_id)

      // Notify parties
      await supabase.from('notifications').insert({
        user_id: existingBooking.user_id,
        title: 'Booking Cancelled',
        message: 'Your booking has been cancelled.',
        type: 'booking',
      })
    }

    return NextResponse.json({ booking })
  } catch (error: any) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function updateAnalytics(supabase: any, companyId: string, event: string, amount?: number) {
  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('analytics')
    .select('*')
    .eq('company_id', companyId)
    .eq('date', today)
    .single()

  if (existing) {
    const updates: Record<string, any> = { updated_at: new Date().toISOString() }
    
    if (event === 'booking_completed') {
      updates.completed_bookings = (existing.completed_bookings || 0) + 1
      updates.total_revenue = (existing.total_revenue || 0) + (amount || 0)
    }

    await supabase.from('analytics').update(updates).eq('id', existing.id)
  }
}
