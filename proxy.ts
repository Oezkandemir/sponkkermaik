/**
 * Proxy for handling i18n and Supabase authentication
 * 
 * This proxy:
 * 1. Updates Supabase session cookies
 * 2. Handles internationalization with next-intl
 */

import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/navigation';
import { updateSession } from '@/lib/supabase/middleware';
import { NextRequest, NextResponse } from 'next/server';

// Create i18n middleware
const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  // Reason: Update Supabase session before handling i18n
  const response = await updateSession(request);
  
  // Reason: If updateSession returns a redirect, use it
  if (response.status === 307 || response.status === 308) {
    return response;
  }
  
  // Reason: Otherwise, apply i18n middleware
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};

