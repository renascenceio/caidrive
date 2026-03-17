-- Cai Drive Test Accounts Seed Data
-- ===================================
-- 
-- This script creates test accounts for different user roles.
-- Use these accounts to test different parts of the portal.
-- 
-- IMPORTANT: These accounts are for testing purposes only.
-- In production, remove this seed data or use secure passwords.
--
-- TEST ACCOUNTS:
-- ==============
-- 
-- 1. SUPER ADMIN
--    Email: admin@caidrive.com
--    Password: Admin123!
--    Role: admin
--    Access: Full access to Super Admin Portal (/admin)
--
-- 2. BUSINESS USER (Car Rental Company Owner)
--    Email: business@caidrive.com  
--    Password: Business123!
--    Role: business
--    Access: Business Portal (/business) - Fleet management, bookings, analytics
--
-- 3. REGULAR USER (Customer)
--    Email: user@caidrive.com
--    Password: User123!
--    Role: user
--    Access: User Portal - Browse cars, make bookings, profile, wishlist
--
-- 4. DRIVER
--    Email: driver@caidrive.com
--    Password: Driver123!
--    Role: driver
--    Access: Driver-specific features (assigned to business)
--
-- HOW TO CREATE THESE ACCOUNTS:
-- =============================
-- Since Supabase auth users cannot be created via SQL directly,
-- you need to sign up through the app or use Supabase Dashboard.
--
-- Option 1: Use the Sign Up page
-- 1. Go to /auth/sign-up
-- 2. Create account with the emails above
-- 3. Run the SQL below to update their roles
--
-- Option 2: Use Supabase Dashboard
-- 1. Go to Authentication > Users
-- 2. Click "Add user" and create each account
-- 3. Run the SQL below to update their roles
--
-- After creating auth users, run this SQL to set up their profiles:

-- Update profile roles (run after users are created via auth)
-- Replace the UUIDs with actual user IDs from auth.users table

-- Example: Set admin role
-- UPDATE public.profiles 
-- SET role = 'admin', full_name = 'Super Admin'
-- WHERE email = 'admin@caidrive.com';

-- Example: Set business role
-- UPDATE public.profiles 
-- SET role = 'business', full_name = 'Business Owner'
-- WHERE email = 'business@caidrive.com';

-- Example: Set driver role
-- UPDATE public.profiles 
-- SET role = 'driver', full_name = 'Test Driver'
-- WHERE email = 'driver@caidrive.com';

-- Sample vehicle data for testing
INSERT INTO public.vehicles (id, company_id, brand, model, year, max_speed, acceleration, power, seats, price_per_day, deposit_amount, rating, review_count, status, features, color, fuel_type, transmission, images) 
SELECT 
  gen_random_uuid(),
  c.id,
  'Ferrari',
  '488 GTB',
  2023,
  330,
  3.0,
  670,
  2,
  1500.00,
  5000.00,
  4.9,
  127,
  'available',
  ARRAY['Leather Seats', 'Navigation', 'Bluetooth', 'Climate Control', 'Sport Mode'],
  'Rosso Corsa',
  'Petrol',
  'Automatic',
  ARRAY['https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800']
FROM public.companies c
WHERE c.is_verified = true
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.vehicles (id, company_id, brand, model, year, max_speed, acceleration, power, seats, price_per_day, deposit_amount, rating, review_count, status, features, color, fuel_type, transmission, images)
SELECT 
  gen_random_uuid(),
  c.id,
  'Lamborghini',
  'Huracán EVO',
  2024,
  325,
  2.9,
  640,
  2,
  1800.00,
  6000.00,
  4.8,
  89,
  'available',
  ARRAY['Leather Seats', 'Navigation', 'Premium Sound', 'Track Mode', 'Carbon Fiber Interior'],
  'Verde Mantis',
  'Petrol',
  'Automatic',
  ARRAY['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800']
FROM public.companies c
WHERE c.is_verified = true
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.vehicles (id, company_id, brand, model, year, max_speed, acceleration, power, seats, price_per_day, deposit_amount, rating, review_count, status, features, color, fuel_type, transmission, images)
SELECT 
  gen_random_uuid(),
  c.id,
  'Porsche',
  '911 Turbo S',
  2024,
  330,
  2.7,
  650,
  4,
  1200.00,
  4000.00,
  4.9,
  156,
  'available',
  ARRAY['AWD', 'Sport Chrono', 'PASM', 'Bose Sound', 'Heated Seats'],
  'GT Silver',
  'Petrol',
  'PDK',
  ARRAY['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800']
FROM public.companies c
WHERE c.is_verified = true
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.vehicles (id, company_id, brand, model, year, max_speed, acceleration, power, seats, price_per_day, deposit_amount, rating, review_count, status, features, color, fuel_type, transmission, images)
SELECT 
  gen_random_uuid(),
  c.id,
  'Bentley',
  'Continental GT',
  2023,
  333,
  3.6,
  659,
  4,
  1100.00,
  4500.00,
  4.7,
  78,
  'available',
  ARRAY['Massage Seats', 'Naim Audio', 'Night Vision', 'Air Suspension', 'Rotating Display'],
  'Midnight Emerald',
  'Petrol',
  'Automatic',
  ARRAY['https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800']
FROM public.companies c
WHERE c.is_verified = true
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.vehicles (id, company_id, brand, model, year, max_speed, acceleration, power, seats, price_per_day, deposit_amount, rating, review_count, status, features, color, fuel_type, transmission, images)
SELECT 
  gen_random_uuid(),
  c.id,
  'BMW',
  'M8 Competition',
  2024,
  305,
  3.0,
  625,
  4,
  800.00,
  3000.00,
  4.6,
  112,
  'available',
  ARRAY['M Sport Exhaust', 'Carbon Roof', 'Harman Kardon', 'Laser Lights', 'M Driver Package'],
  'Frozen Black',
  'Petrol',
  'Automatic',
  ARRAY['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800']
FROM public.companies c
WHERE c.is_verified = true
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.vehicles (id, company_id, brand, model, year, max_speed, acceleration, power, seats, price_per_day, deposit_amount, rating, review_count, status, features, color, fuel_type, transmission, images)
SELECT 
  gen_random_uuid(),
  c.id,
  'Mercedes-Benz',
  'AMG GT',
  2024,
  318,
  3.2,
  585,
  2,
  950.00,
  3500.00,
  4.8,
  94,
  'available',
  ARRAY['AMG Performance Seats', 'Burmester Sound', 'AMG Ride Control', 'Dynamic Plus', 'Carbon Ceramic Brakes'],
  'Selenite Grey',
  'Petrol',
  'AMG Speedshift',
  ARRAY['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800']
FROM public.companies c
WHERE c.is_verified = true
LIMIT 1
ON CONFLICT DO NOTHING;

-- Sample places for testing
INSERT INTO public.places (name, category, description, image_url, discount_percent, address, location)
VALUES 
  ('The Ritz-Carlton', 'hotel', 'Luxury 5-star hotel with premium amenities and world-class service', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 15, 'Downtown Financial District', '{"lat": 25.1972, "lng": 55.2744}'),
  ('Nobu Restaurant', 'restaurant', 'World-renowned Japanese-Peruvian fusion cuisine', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', 10, 'Marina Walk', '{"lat": 25.0805, "lng": 55.1403}'),
  ('Burj Khalifa Observation Deck', 'attraction', 'Visit the worlds tallest building observation deck', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', 20, 'Downtown Dubai', '{"lat": 25.1972, "lng": 55.2744}'),
  ('ENOC Premium Station', 'gas_station', 'Premium fuel station with luxury car services', 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800', 5, 'Sheikh Zayed Road', '{"lat": 25.1212, "lng": 55.2006}')
ON CONFLICT DO NOTHING;

-- Note: Run this script after setting up at least one verified company
