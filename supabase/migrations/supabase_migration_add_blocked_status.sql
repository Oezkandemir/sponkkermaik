-- Migration: Add 'blocked' status to vouchers table
-- This allows admins to block vouchers that should not be used
-- Run this SQL in your Supabase SQL Editor

-- First, drop the existing check constraint
ALTER TABLE vouchers DROP CONSTRAINT IF EXISTS vouchers_status_check;

-- Add the new check constraint with 'blocked' status
ALTER TABLE vouchers ADD CONSTRAINT vouchers_status_check 
  CHECK (status IN ('active', 'used', 'expired', 'pending', 'blocked'));

-- Update the expire function to only expire 'active' vouchers (not 'pending' or 'blocked')
CREATE OR REPLACE FUNCTION expire_old_vouchers()
RETURNS void AS $$
BEGIN
  UPDATE vouchers
  SET status = 'expired'
  WHERE status = 'active'
    AND valid_until < NOW();
END;
$$ LANGUAGE plpgsql;


