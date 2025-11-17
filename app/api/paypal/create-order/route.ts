/**
 * PayPal Create Order API Route
 * 
 * Creates a PayPal order for voucher purchase
 */

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Create PayPal order
    const accessToken = await getPayPalAccessToken();
    
    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "EUR",
            value: amount.toString(),
          },
          description: `Sponk Keramik Gutschein ${amount}€`,
        },
      ],
      application_context: {
        brand_name: "Sponk Keramik",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/paypal/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/paypal/cancel`,
      },
    };

    const response = await fetch(
      `${process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com"}/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(orderData),
      }
    );

    const order = await response.json();

    if (!response.ok) {
      console.error("PayPal order creation failed:", order);
      return NextResponse.json(
        { error: "Failed to create PayPal order", details: order },
        { status: 500 }
      );
    }

    console.log("✅ PayPal order created:", order.id);

    // Return order ID and links
    return NextResponse.json({ 
      orderID: order.id,
      links: order.links 
    });
  } catch (error) {
    console.error("PayPal create order error:", error);
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
    console.error("❌ PayPal credentials missing!");
    console.error("PAYPAL_CLIENT_ID:", clientId ? "SET" : "MISSING");
    console.error("PAYPAL_CLIENT_SECRET:", clientSecret ? "SET" : "MISSING");
    throw new Error("PayPal credentials not configured");
  }

  console.log("🔐 Attempting PayPal authentication...");
  console.log("Client ID (first 20 chars):", clientId.substring(0, 20) + "...");
  
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
  
  if (!response.ok || !data.access_token) {
    console.error("❌ PayPal authentication FAILED:");
    console.error("Status:", response.status);
    console.error("Response:", JSON.stringify(data, null, 2));
    throw new Error(`PayPal auth failed: ${data.error || "Unknown error"}`);
  }
  
  console.log("✅ PayPal authentication successful!");
  return data.access_token;
}
