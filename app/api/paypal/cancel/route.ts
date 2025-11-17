/**
 * PayPal Cancel Callback Route
 * 
 * Handles cancelled PayPal payments
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  console.log('⚠️ PayPal payment cancelled. Order ID:', token);

  // Redirect back to vouchers page with cancellation message
  return NextResponse.redirect(new URL('/vouchers?payment=cancelled', request.url));
}


