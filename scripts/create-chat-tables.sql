-- Chat rooms - one per booking, connects user, driver, support, admin
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  unread_count_user INT DEFAULT 0,
  unread_count_driver INT DEFAULT 0,
  unread_count_support INT DEFAULT 0
);

-- Chat participants - who can access each room
CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'driver', 'support', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  is_typing BOOLEAN DEFAULT FALSE,
  typing_updated_at TIMESTAMPTZ,
  UNIQUE(room_id, user_id)
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('user', 'driver', 'support', 'admin', 'ai', 'system')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'status_update', 'ai_response', 'system')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  is_ai_generated BOOLEAN DEFAULT FALSE
);

-- Booking status history for timeline in chat
CREATE TABLE IF NOT EXISTS booking_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  previous_status TEXT,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  changed_by_role TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_rooms_booking ON chat_rooms(booking_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_company ON chat_rooms(company_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_room ON chat_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_status_history_booking ON booking_status_history(booking_id);

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms
CREATE POLICY "Users can view their chat rooms" ON chat_rooms
  FOR SELECT USING (
    id IN (
      SELECT room_id FROM chat_participants 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for chat_participants
CREATE POLICY "Users can view participants in their rooms" ON chat_participants
  FOR SELECT USING (
    room_id IN (
      SELECT room_id FROM chat_participants 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their rooms" ON chat_messages
  FOR SELECT USING (
    room_id IN (
      SELECT room_id FROM chat_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their rooms" ON chat_messages
  FOR INSERT WITH CHECK (
    room_id IN (
      SELECT room_id FROM chat_participants 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for booking_status_history
CREATE POLICY "Users can view status history for their bookings" ON booking_status_history
  FOR SELECT USING (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'business')
    )
  );

-- Function to update chat room on new message
CREATE OR REPLACE FUNCTION update_chat_room_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_rooms 
  SET 
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    updated_at = NOW()
  WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating chat room
DROP TRIGGER IF EXISTS trigger_update_chat_room ON chat_messages;
CREATE TRIGGER trigger_update_chat_room
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_room_on_message();

-- Function to create chat room when booking is created
CREATE OR REPLACE FUNCTION create_chat_room_for_booking()
RETURNS TRIGGER AS $$
DECLARE
  new_room_id UUID;
  vehicle_company_id UUID;
BEGIN
  -- Get the company ID from the vehicle
  SELECT company_id INTO vehicle_company_id FROM vehicles WHERE id = NEW.vehicle_id;
  
  -- Create chat room
  INSERT INTO chat_rooms (booking_id, company_id)
  VALUES (NEW.id, vehicle_company_id)
  RETURNING id INTO new_room_id;
  
  -- Add user as participant
  INSERT INTO chat_participants (room_id, user_id, role)
  VALUES (new_room_id, NEW.user_id, 'user');
  
  -- Add initial system message
  INSERT INTO chat_messages (room_id, sender_role, content, message_type)
  VALUES (
    new_room_id, 
    'system', 
    'Booking created. Our AI assistant is here to help. A driver will be assigned shortly.',
    'system'
  );
  
  -- Record status history
  INSERT INTO booking_status_history (booking_id, status, changed_by_role, notes)
  VALUES (NEW.id, 'pending', 'system', 'Booking created');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for creating chat room on booking
DROP TRIGGER IF EXISTS trigger_create_chat_room ON bookings;
CREATE TRIGGER trigger_create_chat_room
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION create_chat_room_for_booking();
