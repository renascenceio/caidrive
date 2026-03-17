import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Get messages for a chat room
export async function GET(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '50')
  const before = searchParams.get('before') // For pagination

  let query = supabase
    .from('chat_messages')
    .select(`
      *,
      sender:profiles(id, full_name, avatar_url)
    `)
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (before) {
    query = query.lt('created_at', before)
  }

  const { data: messages, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update last read timestamp for this participant
  await supabase
    .from('chat_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .eq('user_id', user.id)

  return NextResponse.json(messages?.reverse() || [])
}

// POST - Send a message to a chat room
export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { content, messageType = 'text', metadata = {} } = await req.json()

  // Get user's role in this chat
  const { data: participant } = await supabase
    .from('chat_participants')
    .select('role')
    .eq('room_id', roomId)
    .eq('user_id', user.id)
    .single()

  if (!participant) {
    return NextResponse.json({ error: 'Not a participant in this chat' }, { status: 403 })
  }

  // Insert message
  const { data: message, error } = await supabase
    .from('chat_messages')
    .insert({
      room_id: roomId,
      sender_id: user.id,
      sender_role: participant.role,
      content,
      message_type: messageType,
      metadata,
    })
    .select(`
      *,
      sender:profiles(id, full_name, avatar_url)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update room's last message
  await supabase
    .from('chat_rooms')
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: content.substring(0, 100),
    })
    .eq('id', roomId)

  return NextResponse.json(message)
}
