-- Migration: Add admin policies for vouchers table
-- This allows admins to view, update, and delete all vouchers
-- Run this SQL in your Supabase SQL Editor

-- Create policy: Admins can view all vouchers
CREATE POLICY "Admins can view all vouchers"
  ON vouchers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Create policy: Admins can update all vouchers
CREATE POLICY "Admins can update all vouchers"
  ON vouchers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Create policy: Admins can delete all vouchers
CREATE POLICY "Admins can delete all vouchers"
  ON vouchers
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );




