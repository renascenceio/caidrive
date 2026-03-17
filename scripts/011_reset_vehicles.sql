-- Reset all vehicles and create fresh start for business dashboard
-- This script clears all vehicles from the database

-- First, delete all related bookings (they reference vehicles)
DELETE FROM public.bookings;

-- Delete all vehicle reviews
DELETE FROM public.reviews;

-- Delete all wishlists
DELETE FROM public.wishlists;

-- Now delete all vehicles
DELETE FROM public.vehicles;

-- Clear any notifications related to vehicles
DELETE FROM public.notifications WHERE type = 'booking';
