import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'upcoming'
    const now = new Date().toISOString()

    let query = supabase
      .from('bookings')
      .select(`
        *,
        vehicle:vehicles!inner(id, brand, model, year, color, plate_number, company_id, images),
        customer:profiles!bookings_user_id_fkey(id, full_name, email, phone, avatar_url),
        driver:drivers(id, full_name, phone)
      `)
      .eq('vehicle.company_id', company.id)

    if (type === 'upcoming') {
      query = query.gte('start_date', now).order('start_date', { ascending: true })
    } else if (type === 'ending') {
      query = query.lte('end_date', now).gte('end_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()).order('end_date', { ascending: true })
    } else if (type === 'ended') {
      query = query.lt('end_date', now).order('end_date', { ascending: false })
    }

    const { data: rides, error } = await query.limit(20)

    if (error) throw error

    return NextResponse.json({ rides: rides || [] })
  } catch (error) {
    console.error('Rides API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, driverId, status } = body

    const updates: Record<string, unknown> = {}
    if (driverId !== undefined) updates.driver_id = driverId
    if (status) updates.status = status

    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', bookingId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ booking: data })
  } catch (error) {
    console.error('Update ride error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
