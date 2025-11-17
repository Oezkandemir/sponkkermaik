-- Migration: Add 'pending' status to vouchers table
-- This allows vouchers to be created with pending status for bank transfer payments
-- Run this SQL in your Supabase SQL Editor

-- First, drop the existing check constraint
ALTER TABLE vouchers DROP CONSTRAINT IF EXISTS vouchers_status_check;

-- Add the new check constraint with 'pending' status
ALTER TABLE vouchers ADD CONSTRAINT vouchers_status_check 
  CHECK (status IN ('active', 'used', 'expired', 'pending'));

-- Update the expire function to only expire 'active' vouchers (not 'pending')
-- This is already correct, but we'll verify it
CREATE OR REPLACE FUNCTION expire_old_vouchers()
RETURNS void AS $$
BEGIN
  UPDATE vouchers
  SET status = 'expired'
  WHERE status = 'active'
    AND valid_until < NOW();
END;
$$ LANGUAGE plpgsql;

