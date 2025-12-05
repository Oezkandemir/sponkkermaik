-- Migration: Create page_visits table for tracking user page visits and analytics
-- This allows admins to see what users are doing on the site

-- Create page_visits table
CREATE TABLE IF NOT EXISTS page_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  visit_duration INTEGER DEFAULT 0, -- Duration in seconds
  visit_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  visit_ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_page_visits_session_id ON page_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_user_id ON page_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_visit_started_at ON page_visits(visit_started_at);
CREATE INDEX IF NOT EXISTS idx_page_visits_page_path ON page_visits(page_path);

-- Enable Row Level Security
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert/update their own visits
CREATE POLICY "Users can manage own visits"
  ON page_visits
  FOR ALL
  USING (
    auth.uid() = user_id
    OR (user_id IS NULL AND session_id IN (
      SELECT session_id FROM user_activity WHERE user_id = auth.uid()
    ))
  );

-- Policy: Admins can view all visits
CREATE POLICY "Admins can view all visits"
  ON page_visits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Policy: Service role can manage all visits
CREATE POLICY "Service role can manage all visits"
  ON page_visits
  FOR ALL
  WITH CHECK (true);

-- Add comment to table
COMMENT ON TABLE page_visits IS 'Tracks individual page visits for user analytics. Allows admins to see what pages users visit and how long they stay.';

