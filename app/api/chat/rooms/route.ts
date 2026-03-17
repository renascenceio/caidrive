import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - List chat rooms for current user
export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role') // user, driver, support, admin

  let query = supabase
    .from('chat_rooms')
    .select(`
      *,
      participants:chat_participants(*),
      messages:chat_messages(
        id, content, sender_role, created_at, message_type
      )
    `)
    .order('last_message_at', { ascending: false })

  // Filter based on role
  if (role === 'admin' || role === 'support') {
    // Support and admin see all rooms for their company or all rooms
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (profile?.company_id && role !== 'admin') {
      query = query.eq('company_id', profile.company_id)
    }
  } else {
    // Regular users only see rooms they're participants in
    query = query.in('id', 
      supabase
        .from('chat_participants')
        .select('room_id')
        .eq('user_id', user.id)
    )
  }

  const { data: rooms, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(rooms)
}

// POST - Create a new chat room
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { bookingId, companyId, initialMessage } = await req.json()

  // Create chat room
  const { data: room, error: roomError } = await supabase
    .from('chat_rooms')
    .insert({
      booking_id: bookingId,
      company_id: companyId,
      last_message_at: new Date().toISOString(),
      last_message_preview: initialMessage || 'Chat started',
    })
    .select()
    .single()

  if (roomError) {
    return NextResponse.json({ error: roomError.message }, { status: 500 })
  }

  // Add user as participant
  await supabase
    .from('chat_participants')
    .insert({
      room_id: room.id,
      user_id: user.id,
      role: 'user',
    })

  // Add initial system message
  await supabase
    .from('chat_messages')
    .insert({
      room_id: room.id,
      sender_role: 'system',
      content: 'Welcome to CAI Drive support! Our AI assistant is here to help you. How can we assist you today?',
      message_type: 'system',
    })

  // Add AI welcome if there's an initial message
  if (initialMessage) {
    await supabase
      .from('chat_messages')
      .insert({
        room_id: room.id,
        sender_id: user.id,
        sender_role: 'user',
        content: initialMessage,
        message_type: 'text',
      })
  }

  return NextResponse.json(room)
}
