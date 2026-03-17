import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
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

    // Get bookings with deposits
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        deposit_amount,
        deposit_status,
        start_date,
        end_date,
        vehicle:vehicles!inner(id, brand, model, plate_number, company_id),
        customer:profiles!bookings_user_id_fkey(id, full_name, email)
      `)
      .eq('vehicle.company_id', company.id)
      .not('deposit_amount', 'is', null)
      .order('end_date', { ascending: false })

    if (error) throw error

    return NextResponse.json({ deposits: bookings || [] })
  } catch (error) {
    console.error('Deposits API error:', error)
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
    const { bookingId, action, claimAmount, claimReason } = body

    let updates: Record<string, unknown> = {}
    
    if (action === 'release') {
      updates = { deposit_status: 'released' }
    } else if (action === 'claim') {
      updates = { 
        deposit_status: 'claimed',
        deposit_claimed_amount: claimAmount,
        deposit_claim_reason: claimReason
      }
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', bookingId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ booking: data })
  } catch (error) {
    console.error('Update deposit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
