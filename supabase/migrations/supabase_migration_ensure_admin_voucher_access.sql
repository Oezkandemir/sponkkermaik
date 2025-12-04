-- Migration: Ensure admins can view ALL vouchers
-- This fixes the issue where admins only see their own vouchers
-- Run this SQL in your Supabase SQL Editor

-- First, let's check existing policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'vouchers'
ORDER BY policyname;

-- Drop existing admin policies if they exist (to recreate them correctly)
DROP POLICY IF EXISTS "Admins can view all vouchers" ON vouchers;
DROP POLICY IF EXISTS "Admins can update all vouchers" ON vouchers;
DROP POLICY IF EXISTS "Admins can delete all vouchers" ON vouchers;

-- IMPORTANT: Create admin policies that allow viewing ALL vouchers
-- The USING clause checks if the user is an admin, and if so, allows access to ALL rows
CREATE POLICY "Admins can view all vouchers"
  ON vouchers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
    OR auth.uid() = user_id  -- Also allow users to see their own vouchers
  );

-- Create policy: Admins can update ALL vouchers
CREATE POLICY "Admins can update all vouchers"
  ON vouchers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
    OR auth.uid() = user_id  -- Also allow users to update their own vouchers
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
    OR auth.uid() = user_id  -- Also allow users to update their own vouchers
  );

-- Create policy: Admins can delete ALL vouchers
CREATE POLICY "Admins can delete all vouchers"
  ON vouchers
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
    OR auth.uid() = user_id  -- Also allow users to delete their own vouchers (if needed)
  );

-- Verify the policies are created correctly
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as has_using,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as has_with_check
FROM pg_policies
WHERE tablename = 'vouchers'
ORDER BY policyname;

-- Test query to verify admin can see all vouchers
-- This should return all vouchers if you're logged in as admin
-- SELECT COUNT(*) as total_vouchers FROM vouchers;









