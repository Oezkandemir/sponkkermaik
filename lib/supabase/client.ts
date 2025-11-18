/**
 * Supabase Client Utility for Client Components
 * 
 * This module provides the Supabase client for use in client-side React components.
 * It uses browser storage to persist the session.
 */

import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates and returns a Supabase client for browser use
 * 
 * Returns:
 *   ReturnType<typeof createBrowserClient>: Configured Supabase client
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}






