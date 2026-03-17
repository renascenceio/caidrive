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

    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ vehicles: vehicles || [] })
  } catch (error) {
    console.error('Vehicles API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .insert({
        ...body,
        company_id: company.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ vehicle })
  } catch (error) {
    console.error('Create vehicle error:', error)
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
    const { id, ...updates } = body

    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ vehicle })
  } catch (error) {
    console.error('Update vehicle error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Vehicle ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete vehicle error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
