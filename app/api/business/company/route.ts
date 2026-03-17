import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('owner_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return NextResponse.json({ company })
  } catch (error) {
    console.error('Company API error:', error)
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

    const { data: company, error } = await supabase
      .from('companies')
      .update(body)
      .eq('owner_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ company })
  } catch (error) {
    console.error('Update company error:', error)
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

    const body = await request.json()

    // Check if company already exists
    const { data: existing } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Company already exists' }, { status: 400 })
    }

    const { data: company, error } = await supabase
      .from('companies')
      .insert({
        ...body,
        owner_id: user.id,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    // Update user role to business
    await supabase
      .from('profiles')
      .update({ role: 'business' })
      .eq('id', user.id)

    return NextResponse.json({ company })
  } catch (error) {
    console.error('Create company error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
