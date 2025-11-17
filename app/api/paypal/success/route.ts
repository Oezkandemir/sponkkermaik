/**
 * PayPal Success Callback Route
 * 
 * Handles successful PayPal payments and captures the order
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token'); // PayPal Order ID
    const payerId = searchParams.get('PayerID');

    if (!token) {
      return NextResponse.redirect(new URL('/?error=missing_token', request.url));
    }

    console.log('✅ PayPal payment approved! Order ID:', token);
    console.log('Payer ID:', payerId);

    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Failed to get user:', userError);
      return NextResponse.redirect(new URL('/?error=user_not_found', request.url));
    }

    console.log('👤 User found:', user.id);

    // Capture the order
    const captureResponse = await fetch(`${request.nextUrl.origin}/api/paypal/capture-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        orderID: token,
        userId: user.id 
      }),
    });

    if (!captureResponse.ok) {
      const errorData = await captureResponse.json();
      console.error('Failed to capture payment:', errorData);
      return NextResponse.redirect(new URL('/?error=capture_failed', request.url));
    }

    const captureData = await captureResponse.json();
    console.log('✅ Payment captured and voucher created:', captureData);

    // Redirect to vouchers page with success message
    return NextResponse.redirect(new URL('/vouchers?payment=success', request.url));
  } catch (error) {
    console.error('PayPal success callback error:', error);
    return NextResponse.redirect(new URL('/?error=callback_failed', request.url));
  }
}


