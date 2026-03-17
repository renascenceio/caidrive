import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth, subMonths, format, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!profile?.company_id) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const companyId = profile.company_id
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // week, month, year

    // Calculate date ranges
    const now = new Date()
    let startDate: Date
    let endDate = now
    let previousStartDate: Date
    let previousEndDate: Date

    if (period === 'week') {
      startDate = startOfWeek(now, { weekStartsOn: 1 })
      endDate = endOfWeek(now, { weekStartsOn: 1 })
      previousStartDate = startOfWeek(subMonths(now, 0), { weekStartsOn: 1 })
      previousStartDate.setDate(previousStartDate.getDate() - 7)
      previousEndDate = new Date(previousStartDate)
      previousEndDate.setDate(previousEndDate.getDate() + 6)
    } else if (period === 'month') {
      startDate = startOfMonth(now)
      endDate = endOfMonth(now)
      previousStartDate = startOfMonth(subMonths(now, 1))
      previousEndDate = endOfMonth(subMonths(now, 1))
    } else {
      startDate = new Date(now.getFullYear(), 0, 1)
      endDate = new Date(now.getFullYear(), 11, 31)
      previousStartDate = new Date(now.getFullYear() - 1, 0, 1)
      previousEndDate = new Date(now.getFullYear() - 1, 11, 31)
    }

    // Get current period bookings
    const { data: currentBookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('company_id', companyId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Get previous period bookings for comparison
    const { data: previousBookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('company_id', companyId)
      .gte('created_at', previousStartDate.toISOString())
      .lte('created_at', previousEndDate.toISOString())

    // Calculate metrics
    const currentRevenue = currentBookings
      ?.filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.total_price || 0), 0) || 0

    const previousRevenue = previousBookings
      ?.filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.total_price || 0), 0) || 0

    const revenueChange = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0

    const currentTotalBookings = currentBookings?.length || 0
    const previousTotalBookings = previousBookings?.length || 0
    const bookingsChange = previousTotalBookings > 0 
      ? ((currentTotalBookings - previousTotalBookings) / previousTotalBookings) * 100 
      : 0

    const completedBookings = currentBookings?.filter(b => b.status === 'completed').length || 0
    const cancelledBookings = currentBookings?.filter(b => b.status === 'cancelled').length || 0

    // Get fleet stats
    const { count: totalVehicles } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)

    const { count: availableVehicles } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'available')

    const { count: bookedVehicles } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'booked')

    // Get driver stats
    const { count: totalDrivers } = await supabase
      .from('drivers')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)

    const { count: activeDrivers } = await supabase
      .from('drivers')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'on_trip')

    // Get daily revenue for chart
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    const dailyData = await Promise.all(
      days.map(async (day) => {
        const dayStart = new Date(day)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(day)
        dayEnd.setHours(23, 59, 59, 999)

        const { data: dayBookings } = await supabase
          .from('bookings')
          .select('total_price, status')
          .eq('company_id', companyId)
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString())

        const revenue = dayBookings
          ?.filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.total_price || 0), 0) || 0

        return {
          date: format(day, 'MMM d'),
          revenue,
          bookings: dayBookings?.length || 0,
        }
      })
    )

    // Get top vehicles
    const { data: vehicleStats } = await supabase
      .from('bookings')
      .select(`
        vehicle_id,
        total_price,
        vehicle:vehicles(brand, model, images)
      `)
      .eq('company_id', companyId)
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())

    const vehicleRevenue: Record<string, { revenue: number; count: number; vehicle: any }> = {}
    vehicleStats?.forEach(booking => {
      if (!booking.vehicle_id) return
      if (!vehicleRevenue[booking.vehicle_id]) {
        vehicleRevenue[booking.vehicle_id] = { revenue: 0, count: 0, vehicle: booking.vehicle }
      }
      vehicleRevenue[booking.vehicle_id].revenue += booking.total_price || 0
      vehicleRevenue[booking.vehicle_id].count += 1
    })

    const topVehicles = Object.entries(vehicleRevenue)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:profiles!bookings_user_id_fkey(full_name, avatar_url),
        vehicle:vehicles(brand, model)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      summary: {
        revenue: currentRevenue,
        revenueChange: Math.round(revenueChange),
        totalBookings: currentTotalBookings,
        bookingsChange: Math.round(bookingsChange),
        completedBookings,
        cancelledBookings,
        avgBookingValue: currentTotalBookings > 0 ? Math.round(currentRevenue / currentTotalBookings) : 0,
      },
      fleet: {
        total: totalVehicles || 0,
        available: availableVehicles || 0,
        booked: bookedVehicles || 0,
        utilization: totalVehicles ? Math.round((bookedVehicles || 0) / totalVehicles * 100) : 0,
      },
      drivers: {
        total: totalDrivers || 0,
        active: activeDrivers || 0,
        available: (totalDrivers || 0) - (activeDrivers || 0),
      },
      chartData: dailyData,
      topVehicles,
      recentActivity: recentActivity || [],
    })
  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
