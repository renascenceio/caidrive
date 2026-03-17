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

    const { data: drivers, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ drivers: drivers || [] })
  } catch (error) {
    console.error('Drivers API error:', error)
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
    
    const { data: driver, error } = await supabase
      .from('drivers')
      .insert({
        ...body,
        company_id: company.id,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ driver })
  } catch (error) {
    console.error('Create driver error:', error)
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

    const { data: driver, error } = await supabase
      .from('drivers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ driver })
  } catch (error) {
    console.error('Update driver error:', error)
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
      return NextResponse.json({ error: 'Driver ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete driver error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
