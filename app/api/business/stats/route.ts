import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get company
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    // Get bookings stats for this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: bookings, count: totalBookings } = await supabase
      .from('bookings')
      .select('*, vehicle:vehicles!inner(company_id)', { count: 'exact' })
      .eq('vehicle.company_id', company.id)
      .gte('created_at', startOfMonth.toISOString())

    // Calculate stats
    const totalSales = bookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0
    const cancellations = bookings?.filter(b => b.status === 'cancelled').length || 0
    const completed = bookings?.filter(b => b.status === 'completed').length || 0
    
    // Get vehicle count
    const { count: vehicleCount } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id)

    // Get active bookings
    const { count: activeBookings } = await supabase
      .from('bookings')
      .select('*, vehicle:vehicles!inner(company_id)', { count: 'exact', head: true })
      .eq('vehicle.company_id', company.id)
      .in('status', ['confirmed', 'active'])

    const utilization = vehicleCount ? Math.round((activeBookings || 0) / vehicleCount * 100) : 0

    return NextResponse.json({
      totalBookings: totalBookings || 0,
      totalBookingsChange: 12.5, // Would calculate from previous month
      totalSales,
      totalSalesChange: 8.3,
      cancellations,
      cancellationsChange: -5.2,
      cancellationShare: totalBookings ? Math.round(cancellations / totalBookings * 100) : 0,
      carsBooked: activeBookings || 0,
      carsDelivered: completed,
      utilization,
      utilizationChange: 4.2,
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
