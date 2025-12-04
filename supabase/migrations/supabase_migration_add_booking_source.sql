-- Migration: Add source field to bookings table to track booking origin
-- This allows distinguishing between bookings from our system and Cal.com

-- Add source column to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'internal' CHECK (source IN ('internal', 'cal.com'));

-- Add cal_com_booking_id column to store Cal.com booking ID for reference
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS cal_com_booking_id TEXT;

-- Create index on source for faster filtering
CREATE INDEX IF NOT EXISTS idx_bookings_source ON bookings(source);

-- Create index on cal_com_booking_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_cal_com_booking_id ON bookings(cal_com_booking_id);

-- Add comment to source column
COMMENT ON COLUMN bookings.source IS 'Source of the booking: internal (our system) or cal.com';
COMMENT ON COLUMN bookings.cal_com_booking_id IS 'Original booking ID from Cal.com for reference';



