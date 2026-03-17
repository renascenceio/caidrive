-- User saved details and booking drafts
-- This allows users to save their info for faster bookings and resume abandoned bookings

-- User saved documents (driving license, passport details for quick rebooking)
CREATE TABLE IF NOT EXISTS public.user_saved_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    -- Driving License
    license_first_name TEXT,
    license_surname TEXT,
    license_number TEXT,
    license_address TEXT,
    license_expiry DATE,
    license_country TEXT,
    license_image_url TEXT,
    is_international_license BOOLEAN DEFAULT FALSE,
    -- Passport
    passport_first_name TEXT,
    passport_surname TEXT,
    passport_number TEXT,
    passport_country TEXT,
    passport_expiry DATE,
    passport_image_url TEXT,
    -- Preferred payment method
    preferred_payment_method TEXT,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Booking drafts (for abandoned/incomplete bookings)
CREATE TABLE IF NOT EXISTS public.booking_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    -- Store all booking form data as JSONB
    form_data JSONB NOT NULL DEFAULT '{}',
    -- Which step was the user on
    current_step INTEGER DEFAULT 0,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Expire drafts after 7 days
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    -- One draft per user per vehicle
    UNIQUE(user_id, vehicle_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_saved_details_user ON public.user_saved_details(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_drafts_user ON public.booking_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_drafts_vehicle ON public.booking_drafts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_booking_drafts_expires ON public.booking_drafts(expires_at);

-- RLS Policies
ALTER TABLE public.user_saved_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_drafts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own saved details
CREATE POLICY "Users can view own saved details" ON public.user_saved_details
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved details" ON public.user_saved_details
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved details" ON public.user_saved_details
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved details" ON public.user_saved_details
    FOR DELETE USING (auth.uid() = user_id);

-- Users can only access their own booking drafts
CREATE POLICY "Users can view own booking drafts" ON public.booking_drafts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own booking drafts" ON public.booking_drafts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own booking drafts" ON public.booking_drafts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own booking drafts" ON public.booking_drafts
    FOR DELETE USING (auth.uid() = user_id);

-- Function to clean up expired drafts (can be called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_booking_drafts()
RETURNS void AS $$
BEGIN
    DELETE FROM public.booking_drafts WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
