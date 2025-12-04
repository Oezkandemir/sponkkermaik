-- Migration: Add booking_messages table for admin-customer communication
-- This allows admins to reply to customer notes in bookings

-- Create booking_messages table
CREATE TABLE IF NOT EXISTS booking_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'admin')),
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on booking_id for faster queries
CREATE INDEX IF NOT EXISTS idx_booking_messages_booking_id ON booking_messages(booking_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_booking_messages_created_at ON booking_messages(created_at);

-- Enable Row Level Security
ALTER TABLE booking_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all messages
CREATE POLICY "Admins can view all booking messages"
  ON booking_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_messages.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- Policy: Admins can insert messages
CREATE POLICY "Admins can insert booking messages"
  ON booking_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Policy: Users can view their own booking messages
CREATE POLICY "Users can view own booking messages"
  ON booking_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_messages.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- Policy: Users can insert messages for their own bookings
CREATE POLICY "Users can insert own booking messages"
  ON booking_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_messages.booking_id
      AND bookings.user_id = auth.uid()
    )
    AND sender_type = 'customer'
  );






