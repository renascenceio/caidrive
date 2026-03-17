-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_select_public" ON public.profiles 
    FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON public.profiles 
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles 
    FOR UPDATE USING (auth.uid() = id);

-- Companies policies
CREATE POLICY "companies_select_all" ON public.companies 
    FOR SELECT USING (true);

CREATE POLICY "companies_insert_owner" ON public.companies 
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "companies_update_owner" ON public.companies 
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "companies_delete_owner" ON public.companies 
    FOR DELETE USING (auth.uid() = owner_id);

-- Vehicles policies (public read, company owner write)
CREATE POLICY "vehicles_select_all" ON public.vehicles 
    FOR SELECT USING (true);

CREATE POLICY "vehicles_insert_company_owner" ON public.vehicles 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE id = company_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "vehicles_update_company_owner" ON public.vehicles 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE id = company_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "vehicles_delete_company_owner" ON public.vehicles 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE id = company_id AND owner_id = auth.uid()
        )
    );

-- Bookings policies
CREATE POLICY "bookings_select_own" ON public.bookings 
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE id = company_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "bookings_insert_own" ON public.bookings 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookings_update_own_or_company" ON public.bookings 
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE id = company_id AND owner_id = auth.uid()
        )
    );

-- Documents policies
CREATE POLICY "documents_select_own" ON public.documents 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "documents_insert_own" ON public.documents 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents_update_own" ON public.documents 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "documents_delete_own" ON public.documents 
    FOR DELETE USING (auth.uid() = user_id);

-- Reviews policies (public read, own write)
CREATE POLICY "reviews_select_all" ON public.reviews 
    FOR SELECT USING (true);

CREATE POLICY "reviews_insert_own" ON public.reviews 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_own" ON public.reviews 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reviews_delete_own" ON public.reviews 
    FOR DELETE USING (auth.uid() = user_id);

-- Wishlists policies
CREATE POLICY "wishlists_select_own" ON public.wishlists 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wishlists_insert_own" ON public.wishlists 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wishlists_delete_own" ON public.wishlists 
    FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "notifications_select_own" ON public.notifications 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON public.notifications 
    FOR UPDATE USING (auth.uid() = user_id);

-- Payment methods policies
CREATE POLICY "payment_methods_select_own" ON public.payment_methods 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payment_methods_insert_own" ON public.payment_methods 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payment_methods_update_own" ON public.payment_methods 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "payment_methods_delete_own" ON public.payment_methods 
    FOR DELETE USING (auth.uid() = user_id);

-- Places policies (public read)
CREATE POLICY "places_select_all" ON public.places 
    FOR SELECT USING (true);

CREATE POLICY "places_insert_company_owner" ON public.places 
    FOR INSERT WITH CHECK (
        company_id IS NULL OR 
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE id = company_id AND owner_id = auth.uid()
        )
    );

-- Drivers policies
CREATE POLICY "drivers_select_company" ON public.drivers 
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE id = company_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "drivers_insert_company_owner" ON public.drivers 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE id = company_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "drivers_update_company_owner" ON public.drivers 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE id = company_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "drivers_delete_company_owner" ON public.drivers 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE id = company_id AND owner_id = auth.uid()
        )
    );

-- Support messages policies
CREATE POLICY "support_messages_select_own" ON public.support_messages 
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = agent_id);

CREATE POLICY "support_messages_insert_own" ON public.support_messages 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
