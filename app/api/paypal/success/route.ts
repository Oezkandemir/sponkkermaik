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

    // Capture PayPal order directly (instead of internal fetch to avoid session issues)
    const captureResult = await capturePayPalOrder(token, user.id, supabase);

    if (!captureResult.success) {
      console.error('❌ Failed to capture payment:', captureResult.error);
      const errorMsg = encodeURIComponent(captureResult.error || 'capture_failed');
      const errorDetails = encodeURIComponent(captureResult.details || '');
      return NextResponse.redirect(
        new URL(`/vouchers?payment=error&error=${errorMsg}&details=${errorDetails}`, request.url)
      );
    }

    console.log('✅ Payment captured and voucher created:', captureResult);
    
    // Verify voucher was created
    if (!captureResult.voucher) {
      console.error('⚠️ Warning: Payment captured but voucher not created:', captureResult);
      return NextResponse.redirect(
        new URL('/vouchers?payment=warning&message=voucher_creation_pending', request.url)
      );
    }

    // Extract voucher details for success page
    const voucher = captureResult.voucher;
    const voucherCode = voucher.code;
    const amount = voucher.value;
    const orderNumber = voucher.paypal_order_id || token;

    // Redirect to success page with voucher details
    const successUrl = new URL('/voucher-success', request.url);
    successUrl.searchParams.set('code', voucherCode);
    successUrl.searchParams.set('amount', amount.toString());
    successUrl.searchParams.set('order', orderNumber);

    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error('PayPal success callback error:', error);
    return NextResponse.redirect(new URL('/?error=callback_failed', request.url));
  }
}

/**
 * Captures a PayPal order and creates voucher
 * 
 * Args:
 *   orderID (string): PayPal Order ID
 *   userId (string): User ID
 *   supabase: Supabase client instance
 * 
 * Returns:
 *   Promise<{success: boolean, voucher?: any, error?: string, details?: string}>
 */
async function capturePayPalOrder(
  orderID: string,
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{success: boolean, voucher?: any, error?: string, details?: string}> {
  try {
    // Capture PayPal order
    const accessToken = await getPayPalAccessToken();
    
    const response = await fetch(
      `${process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com"}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const captureData = await response.json();

    if (!response.ok) {
      console.error("PayPal capture failed:", captureData);
      return {
        success: false,
        error: "Failed to capture PayPal order",
        details: JSON.stringify(captureData)
      };
    }

    // Check if payment was successful
    if (captureData.status !== "COMPLETED") {
      return {
        success: false,
        error: "Payment not completed",
        details: `Status: ${captureData.status}`
      };
    }

    // Extract payment details
    const purchaseUnit = captureData.purchase_units[0];
    const amount = parseFloat(purchaseUnit.amount.value);
    const paypalOrderId = captureData.id;

    // Generate voucher code
    const voucherCode = generateVoucherCode();

    // Calculate expiry date (12 months from now)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    console.log('💳 Payment successful! Amount:', amount, 'EUR');
    console.log('🎫 Generating voucher code...');

    // Save voucher to database
    console.log('💾 Saving voucher to database for user:', userId);
    console.log('📝 Voucher details:', {
      code: voucherCode,
      value: amount,
      paypalOrderId,
      validUntil: expiryDate.toISOString()
    });
    
    const { data, error } = await supabase
      .from("vouchers")
      .insert({
        user_id: userId,
        code: voucherCode,
        value: amount,
        status: "active", // PayPal payments are immediately active
        paypal_order_id: paypalOrderId,
        valid_until: expiryDate.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Failed to save voucher to database:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", JSON.stringify(error, null, 2));
      
      return {
        success: false,
        error: "Voucher creation failed",
        details: error.message
      };
    }

    const voucher = data;
    console.log('✅ Voucher saved successfully!', voucher);

    return {
      success: true,
      voucher: {
        ...voucher,
        code: voucherCode,
        value: amount,
        paypal_order_id: paypalOrderId
      }
    };
  } catch (error) {
    console.error("PayPal capture order error:", error);
    return {
      success: false,
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Get PayPal Access Token
 * 
 * Returns:
 *   Promise<string>: PayPal access token
 */
async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  
  const response = await fetch(
    `${process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com"}/v1/oauth2/token`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    }
  );

  const data = await response.json();
  return data.access_token;
}

/**
 * Generate unique voucher code
 * 
 * Returns:
 *   string: Voucher code in format SPONK-XXXXXXXX
 */
function generateVoucherCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar chars
  let code = "SPONK-";
  
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}


