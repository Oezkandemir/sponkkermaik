-- Migration: Fix waitlist RLS policy to allow anonymous entries
-- This allows non-authenticated users to join the waitlist

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert own waitlist entries" ON waitlist;

-- Create a new policy that allows anonymous entries
CREATE POLICY "Users can insert own waitlist entries"
  ON waitlist
  FOR INSERT
  WITH CHECK (
    -- Allow if user is authenticated and matches user_id or email
    (auth.uid() IS NOT NULL AND (
      auth.uid() = user_id
      OR customer_email IN (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    ))
    -- OR allow anonymous entries (user_id can be NULL)
    OR (auth.uid() IS NULL)
  );

