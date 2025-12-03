-- Migration: Fix admin policies for vouchers table
-- This ensures admins can view, update, and delete ALL vouchers
-- Run this SQL in your Supabase SQL Editor

-- Drop existing admin policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can view all vouchers" ON vouchers;
DROP POLICY IF EXISTS "Admins can update all vouchers" ON vouchers;
DROP POLICY IF EXISTS "Admins can delete all vouchers" ON vouchers;

-- Create policy: Admins can view ALL vouchers (no restrictions)
CREATE POLICY "Admins can view all vouchers"
  ON vouchers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
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
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
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
  );

-- Verify policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'vouchers'
ORDER BY policyname;

