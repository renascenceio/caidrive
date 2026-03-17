-- Seed sample data for Cai Drive
-- Note: This creates demo data for testing. Vehicle images use placeholder URLs.

-- Insert sample places (partner locations)
INSERT INTO public.places (name, category, description, discount_percent, address) VALUES
('The Grand Restaurant', 'restaurant', 'Fine dining experience with a view', 15, '123 Luxury Ave, Dubai'),
('Marina Hotel & Spa', 'hotel', 'Five-star hotel with premium amenities', 20, '456 Marina Walk, Dubai'),
('Desert Safari Tours', 'attraction', 'Experience the magic of desert adventures', 10, 'Desert Gate, Dubai'),
('Premium Fuel Station', 'gas_station', 'Premium fuel and car services', 5, '789 Highway Road, Dubai'),
('Skyline Lounge', 'restaurant', 'Rooftop dining with panoramic views', 12, '321 Tower Plaza, Dubai'),
('Oasis Resort', 'hotel', 'Peaceful retreat in the heart of the city', 18, '654 Palm Street, Dubai')
ON CONFLICT DO NOTHING;
