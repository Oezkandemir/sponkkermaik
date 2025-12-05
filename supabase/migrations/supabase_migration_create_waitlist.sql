-- Migration: Create waitlist table for course waitlist functionality
-- This allows customers to join a waitlist when courses are fully booked

-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  participants INTEGER NOT NULL DEFAULT 1,
  participant_names TEXT,
  auto_book BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'converted', 'cancelled')),
  converted_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notified_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_waitlist_course_id ON waitlist(course_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at);
CREATE INDEX IF NOT EXISTS idx_waitlist_user_id ON waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_customer_email ON waitlist(customer_email);

-- Create unique constraint to prevent duplicate entries (same email + course + pending status)
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_unique_pending 
ON waitlist(course_id, customer_email) 
WHERE status = 'pending';

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own waitlist entries
CREATE POLICY "Users can view own waitlist entries"
  ON waitlist
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR customer_email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Policy: Users can insert their own waitlist entries
CREATE POLICY "Users can insert own waitlist entries"
  ON waitlist
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR customer_email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Policy: Users can update their own waitlist entries (e.g., cancel)
CREATE POLICY "Users can update own waitlist entries"
  ON waitlist
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR customer_email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Policy: Admins can view all waitlist entries
CREATE POLICY "Admins can view all waitlist entries"
  ON waitlist
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Policy: Admins can update all waitlist entries
CREATE POLICY "Admins can update all waitlist entries"
  ON waitlist
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Policy: Service role can insert/update (for automatic conversions)
CREATE POLICY "Service role can manage waitlist"
  ON waitlist
  FOR ALL
  WITH CHECK (true);

-- Add comment to table
COMMENT ON TABLE waitlist IS 'Waitlist entries for fully booked courses. Customers can choose to auto-book or just be notified when spots become available.';



