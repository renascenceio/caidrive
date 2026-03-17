import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Retrieve booking draft for a specific vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  const { vehicleId } = await params
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get booking draft
  const { data: draft } = await supabase
    .from('booking_drafts')
    .select('*')
    .eq('user_id', user.id)
    .eq('vehicle_id', vehicleId)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (draft) {
    return NextResponse.json({
      hasDraft: true,
      draft: {
        formData: draft.form_data,
        currentStep: draft.current_step,
        updatedAt: draft.updated_at,
      }
    })
  }

  return NextResponse.json({
    hasDraft: false,
    draft: null
  })
}

// POST - Save or update booking draft
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  const { vehicleId } = await params
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { formData, currentStep } = body

    // Upsert booking draft
    const { error } = await supabase
      .from('booking_drafts')
      .upsert({
        user_id: user.id,
        vehicle_id: vehicleId,
        form_data: formData,
        current_step: currentStep,
        updated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      }, {
        onConflict: 'user_id,vehicle_id'
      })

    if (error) {
      console.error('Error saving booking draft:', error)
      return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/user/booking-drafts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove booking draft (after successful booking)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  const { vehicleId } = await params
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('booking_drafts')
    .delete()
    .eq('user_id', user.id)
    .eq('vehicle_id', vehicleId)

  if (error) {
    console.error('Error deleting booking draft:', error)
  }

  return NextResponse.json({ success: true })
}
