-- Migration: Create user_activity table for tracking online users
-- This allows admins to see how many users are currently active on the site

-- Create user_activity table
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_last_seen ON user_activity(last_seen);
CREATE INDEX IF NOT EXISTS idx_user_activity_session_id ON user_activity(session_id);

-- Create unique constraint on session_id to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_activity_unique_session ON user_activity(session_id);

-- Enable Row Level Security
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert/update their own activity
CREATE POLICY "Users can manage own activity"
  ON user_activity
  FOR ALL
  USING (auth.uid() = user_id);

-- Policy: Admins can view all activity
CREATE POLICY "Admins can view all activity"
  ON user_activity
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Policy: Service role can manage all activity
CREATE POLICY "Service role can manage all activity"
  ON user_activity
  FOR ALL
  WITH CHECK (true);

-- Function to clean up old activity records (older than 5 minutes)
CREATE OR REPLACE FUNCTION cleanup_old_activity()
RETURNS void AS $$
BEGIN
  DELETE FROM user_activity
  WHERE last_seen < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- Add comment to table
COMMENT ON TABLE user_activity IS 'Tracks active user sessions for admin dashboard. Records are automatically cleaned up after 5 minutes of inactivity.';

