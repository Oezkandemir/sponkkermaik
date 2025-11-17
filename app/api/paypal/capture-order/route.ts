/**
 * PayPal Capture Order API Route
 * 
 * Captures a PayPal order and creates voucher in database
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { orderID, userId } = await request.json();

    if (!orderID) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: "Failed to capture PayPal order" },
        { status: 500 }
      );
    }

    // Check if payment was successful
    if (captureData.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
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

    // Save voucher to database if user is logged in
    let voucher = null;
    if (userId) {
      const supabase = await createClient();
      
      console.log('💾 Saving voucher to database for user:', userId);
      
      const { data, error } = await supabase
        .from("vouchers")
        .insert({
          user_id: userId,
          code: voucherCode,
          value: amount,
          status: "active",
          paypal_order_id: paypalOrderId,
          valid_until: expiryDate.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Failed to save voucher to database:", error);
        // Payment was successful but voucher creation failed
        return NextResponse.json(
          { 
            error: "Voucher creation failed",
            details: error.message,
            paypalOrderId,
            voucherCode // Return code so user can still use it
          },
          { status: 500 }
        );
      }

      voucher = data;
      console.log('✅ Voucher saved successfully!');
    } else {
      console.log('⚠️  No userId provided - voucher not saved to database');
    }

    return NextResponse.json({
      success: true,
      voucherCode,
      amount,
      orderNumber: paypalOrderId,
      validUntil: expiryDate.toISOString(),
      voucher,
    });
  } catch (error) {
    console.error("PayPal capture order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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
