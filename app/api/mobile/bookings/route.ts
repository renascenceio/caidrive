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
      pickup_time,
      pickup_location,
      return_location,
      delivery_type,
      payment_method,
      driver_license,
      passport,
      discount_code,
    } = body

    // Get vehicle details with company
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*, company:companies(*)')
      .eq('id', vehicle_id)
      .single()

    if (vehicleError || !vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Check vehicle availability
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('vehicle_id', vehicle_id)
      .in('status', ['pending', 'confirmed', 'active'])
      .or(`and(pickup_date.lte.${return_date},return_date.gte.${pickup_date})`)

    if (existingBookings && existingBookings.length > 0) {
      return NextResponse.json({ 
        error: 'Vehicle is not available for the selected dates' 
      }, { status: 400 })
    }

    // Calculate price
    const pickupDateObj = new Date(pickup_date)
    const returnDateObj = new Date(return_date)
    const days = Math.max(1, Math.ceil((returnDateObj.getTime() - pickupDateObj.getTime()) / (1000 * 60 * 60 * 24)))
    let subtotal = vehicle.price_per_day * days
    const deposit = vehicle.deposit_amount || Math.round(subtotal * 0.5)

    // Apply discount if provided
    let discount_amount = 0
    if (discount_code) {
      if (discount_code === 'FIRST20') {
        discount_amount = subtotal * 0.2
      } else if (discount_code === 'WELCOME10') {
        discount_amount = subtotal * 0.1
      }
      subtotal -= discount_amount
    }

    const total_price = subtotal + deposit

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        vehicle_id,
        company_id: vehicle.company_id,
        pickup_date,
        return_date,
        pickup_time,
        pickup_location,
        return_location,
        delivery_type,
        total_price,
        subtotal,
        deposit_amount: deposit,
        discount_code,
        discount_amount,
        payment_method,
        status: 'pending',
        payment_status: 'pending',
        // Store document info
        driver_license_info: driver_license,
        passport_info: passport,
      })
      .select()
      .single()

    if (bookingError) throw bookingError

    // Update vehicle status to 'booked'
    await supabase
      .from('vehicles')
      .update({ status: 'booked' })
      .eq('id', vehicle_id)

    // Create notification for business owner
    if (vehicle.company?.owner_id) {
      await supabase.from('notifications').insert({
        user_id: vehicle.company.owner_id,
        title: 'New Booking Request',
        message: `New booking for ${vehicle.brand} ${vehicle.model} from ${new Date(pickup_date).toLocaleDateString()} to ${new Date(return_date).toLocaleDateString()}`,
        type: 'booking',
        metadata: {
          booking_id: booking.id,
          vehicle_id: vehicle.id,
          total_price,
        },
      })
    }

    // Create notification for customer
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Booking Confirmed',
      message: `Your booking for ${vehicle.brand} ${vehicle.model} has been received. We'll confirm shortly.`,
      type: 'booking',
      metadata: {
        booking_id: booking.id,
        vehicle_id: vehicle.id,
      },
    })

    // Update analytics
    await updateAnalytics(supabase, vehicle.company_id, 'booking_created', total_price)

    // Get user profile for return
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone, avatar_url')
      .eq('id', user.id)
      .single()

    return NextResponse.json({ 
      booking: {
        ...booking,
        vehicle,
        customer: profile,
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function updateAnalytics(supabase: any, companyId: string, event: string, amount?: number) {
  if (!companyId) return

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
