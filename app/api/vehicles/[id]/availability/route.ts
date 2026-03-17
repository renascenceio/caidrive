import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addDays } from 'date-fns'

// GET - Fetch vehicle availability for next 30 days
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const thirtyDaysLater = addDays(today, 30)
    
    // Get vehicle details
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id, brand, model, status, price_per_day')
      .eq('id', id)
      .single()
    
    if (vehicleError || !vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }
    
    // Get bookings for this vehicle in the next 30 days
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, pickup_date, return_date, status')
      .eq('vehicle_id', id)
      .in('status', ['pending', 'confirmed', 'active'])
      .gte('return_date', today.toISOString())
      .lte('pickup_date', thirtyDaysLater.toISOString())
      .order('pickup_date', { ascending: true })
    
    if (bookingsError) throw bookingsError
    
    // Calculate availability for each day
    const availability: Array<{ date: string; available: boolean; bookingId?: string }> = []
    
    for (let i = 0; i < 30; i++) {
      const date = addDays(today, i)
      const dateStr = date.toISOString().split('T')[0]
      
      // Check if this date falls within any booking
      const overlappingBooking = bookings?.find(booking => {
        const pickupDate = new Date(booking.pickup_date)
        const returnDate = new Date(booking.return_date)
        pickupDate.setHours(0, 0, 0, 0)
        returnDate.setHours(23, 59, 59, 999)
        return date >= pickupDate && date <= returnDate
      })
      
      availability.push({
        date: dateStr,
        available: !overlappingBooking,
        bookingId: overlappingBooking?.id,
      })
    }
    
    // Get the next available date
    const nextAvailable = availability.find(a => a.available)?.date
    
    // Get current booking if vehicle is on ride
    const currentBooking = bookings?.find(b => {
      const pickupDate = new Date(b.pickup_date)
      const returnDate = new Date(b.return_date)
      return today >= pickupDate && today <= returnDate && b.status === 'active'
    })
    
    // Calculate return date for current booking
    const returnsOn = currentBooking ? currentBooking.return_date : null
    
    return NextResponse.json({
      vehicle: {
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        status: vehicle.status,
        price_per_day: vehicle.price_per_day,
      },
      availability,
      bookings: bookings?.map(b => ({
        id: b.id,
        pickup_date: b.pickup_date,
        return_date: b.return_date,
        status: b.status,
      })),
      summary: {
        isCurrentlyAvailable: vehicle.status === 'available' && !currentBooking,
        nextAvailableDate: nextAvailable,
        returnsOn,
        totalBookedDays: availability.filter(a => !a.available).length,
        totalAvailableDays: availability.filter(a => a.available).length,
      },
    })
  } catch (error: any) {
    console.error('Error fetching vehicle availability:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
