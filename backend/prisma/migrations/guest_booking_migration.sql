-- ==========================================
-- GUEST BOOKING MIGRATION
-- ==========================================
-- Run this in Supabase SQL Editor
-- Adds guest fields for non-registered users
-- ==========================================

-- Add guest fields to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(50);

-- Make client_id nullable (for guest bookings)
ALTER TABLE bookings 
ALTER COLUMN client_id DROP NOT NULL;

-- Create index for guest email lookups
CREATE INDEX IF NOT EXISTS idx_bookings_guest_email ON bookings(guest_email);

-- ==========================================
-- VERIFICATION
-- ==========================================
-- Run this to verify the changes:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'bookings';
