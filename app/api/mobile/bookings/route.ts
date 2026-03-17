import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch user's bookings
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const role = searchParams.get('role') // 'user' or 'driver'

    let query = supabase
      .from('bookings')
      .select(`
        *,
        vehicle:vehicles(*),
        company:companies(id, name, logo_url),
        customer:profiles!bookings_user_id_fkey(full_name, phone, avatar_url),
        driver:profiles!bookings_driver_id_fkey(full_name, phone, avatar_url)
      `)

    // Filter by role
    if (role === 'driver') {
      query = query.eq('driver_id', user.id)
    } else {
      query = query.eq('user_id', user.id)
    }

    // Filter by status
    if (status) {
      if (status === 'upcoming') {
        query = query.in('status', ['pending', 'confirmed'])
      } else if (status === 'active') {
        query = query.eq('status', 'active')
      } else if (status === 'completed') {
        query = query.in('status', ['completed', 'cancelled'])
      } else {
        query = query.eq('status', status)
      }
    }

    const { data, error } = await query.order('pickup_date', { ascending: status !== 'completed' })

    if (error) throw error

    return NextResponse.json({ bookings: data })
  } catch (error: any) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      vehicle_id,
      pickup_date,
      return_date,
      pickup_location,
      return_location,
      discount_code,
    } = body

    // Get vehicle details
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*, company:companies(*)')
      .eq('id', vehicle_id)
      .single()

    if (vehicleError || !vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Calculate price
    const pickupDate = new Date(pickup_date)
    const returnDate = new Date(return_date)
    const days = Math.ceil((returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24))
    let total_price = vehicle.price_per_day * days

    // Apply discount if provided
    let discount_amount = 0
    if (discount_code) {
      // Simple discount logic - could be expanded
      if (discount_code === 'FIRST20') {
        discount_amount = total_price * 0.2
        total_price -= discount_amount
      }
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        vehicle_id,
        company_id: vehicle.company_id,
        pickup_date,
        return_date,
        pickup_location,
        return_location,
        total_price,
        deposit_paid: vehicle.deposit_amount,
        discount_code,
        discount_amount,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single()

    if (bookingError) throw bookingError

    // Create notification for business
    await supabase.from('notifications').insert({
      user_id: vehicle.company?.owner_id,
      title: 'New Booking Request',
      message: `New booking for ${vehicle.brand} ${vehicle.model}`,
      type: 'booking',
    })

    // Update analytics
    await updateAnalytics(supabase, vehicle.company_id, 'booking_created', total_price)

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function updateAnalytics(supabase: any, companyId: string, event: string, amount?: number) {
  const today = new Date().toISOString().split('T')[0]

  // Upsert daily analytics
  const { data: existing } = await supabase
    .from('analytics')
    .select('*')
    .eq('company_id', companyId)
    .eq('date', today)
    .single()

  if (existing) {
    await supabase
      .from('analytics')
      .update({
        total_bookings: existing.total_bookings + (event === 'booking_created' ? 1 : 0),
        total_revenue: existing.total_revenue + (amount || 0),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
  } else {
    await supabase.from('analytics').insert({
      company_id: companyId,
      date: today,
      total_bookings: event === 'booking_created' ? 1 : 0,
      total_revenue: amount || 0,
    })
  }
}
