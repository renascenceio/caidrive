import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch user's wishlist
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        vehicle:vehicles(
          *,
          company:companies(id, name, logo_url)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ wishlist: data })
  } catch (error: any) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Add to wishlist
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { vehicle_id } = await request.json()

    if (!vehicle_id) {
      return NextResponse.json({ error: 'Vehicle ID required' }, { status: 400 })
    }

    // Check if already in wishlist
    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('vehicle_id', vehicle_id)
      .single()

    if (existing) {
      return NextResponse.json({ message: 'Already in wishlist' })
    }

    const { data, error } = await supabase
      .from('wishlists')
      .insert({ user_id: user.id, vehicle_id })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ wishlist: data }, { status: 201 })
  } catch (error: any) {
    console.error('Error adding to wishlist:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Remove from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const vehicle_id = searchParams.get('vehicle_id')

    if (!vehicle_id) {
      return NextResponse.json({ error: 'Vehicle ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('vehicle_id', vehicle_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error removing from wishlist:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
