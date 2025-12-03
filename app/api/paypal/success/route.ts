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

    // Get user details for email
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (!authError && authUser && authUser.email) {
      // Get user profile for name (optional - may not exist)
      let customerName = authUser.email.split("@")[0] || "Kunde";
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", userId)
          .maybeSingle();
        
        if (profile?.full_name) {
          customerName = profile.full_name;
        }
      } catch (profileError) {
        // Profiles table may not exist - use email fallback
        console.log("⚠️ Could not fetch profile, using email fallback");
      }
      
      const customerEmail = authUser.email;

      // Send confirmation email directly (non-blocking)
      sendVoucherConfirmationEmailDirect({
        voucherId: voucher.id,
        customerEmail,
        customerName,
        voucherCode,
        amount,
        paymentMethod: "paypal",
        status: "active",
        orderNumber: paypalOrderId,
        validUntil: expiryDate.toISOString(),
      }).catch((emailError) => {
        console.error("❌ Failed to send voucher confirmation email:", emailError);
        // Don't fail the payment if email fails
      });
    } else {
      console.warn("⚠️ Could not get user email for voucher confirmation");
    }

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

/**
 * Send voucher confirmation email directly (without HTTP request)
 * 
 * Args:
 *   params: Email parameters
 */
async function sendVoucherConfirmationEmailDirect(params: {
  voucherId: string;
  customerEmail: string;
  customerName: string;
  voucherCode: string;
  amount: number;
  paymentMethod: "paypal" | "bank_transfer";
  status: string;
  orderNumber?: string;
  validUntil: string;
}): Promise<void> {
  const {
    customerEmail,
    customerName,
    voucherCode,
    amount,
    paymentMethod,
    status,
    orderNumber,
    validUntil,
  } = params;

  // Get site URL for logo
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sponkkeramik.de";
  const logoUrl = `${siteUrl}/images/emaillogo.webp`;

  // Format dates
  const validUntilDate = new Date(validUntil).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Determine payment method display
  const paymentMethodDisplay =
    paymentMethod === "paypal"
      ? "PayPal"
      : paymentMethod === "bank_transfer"
      ? "Banküberweisung"
      : "Unbekannt";

  // Determine status display
  const statusDisplay =
    status === "active"
      ? "Aktiv"
      : status === "pending"
      ? "Ausstehend (Wird nach Zahlungseingang aktiviert)"
      : "Ausstehend";

  // Bank details (for bank transfer)
  const bankDetails =
    paymentMethod === "bank_transfer"
      ? `
      <div class="details" style="background-color: #fff7ed; border-left-color: #f59e0b; margin-top: 20px;">
        <h3 style="color: #92400e; margin-top: 0;">Bankverbindung für Überweisung:</h3>
        <p><strong>Bank:</strong> Commerzbank</p>
        <p><strong>Kontoinhaber:</strong> Sponk Keramik</p>
        <p><strong>IBAN:</strong> <span style="font-family: monospace;">DE89 3704 0044 0532 0130 00</span></p>
        <p><strong>BIC:</strong> <span style="font-family: monospace;">COBADEFFXXX</span></p>
        <p><strong>Verwendungszweck:</strong> <span style="font-family: monospace; font-weight: bold; color: #92400e;">${voucherCode}</span></p>
        <p style="background-color: #fef3c7; padding: 10px; border-radius: 5px; margin-top: 10px; color: #92400e;">
          <strong>Wichtig:</strong> Bitte geben Sie den Gutschein-Code als Verwendungszweck bei der Überweisung an. 
          Der Gutschein wird nach Zahlungseingang aktiviert.
        </p>
      </div>
    `
      : "";

  // Create email content
  const emailSubject = `Gutschein-Bestätigung: ${voucherCode}`;
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { padding: 0; text-align: center; border-radius: 8px 8px 0 0; overflow: hidden; }
    .logo { width: 100%; max-width: 600px; height: auto; display: block; }
    .content { padding: 20px; background-color: #f9fafb; }
    .details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d97706; }
    .voucher-code { background-color: #fff7ed; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center; border: 2px dashed #f59e0b; }
    .voucher-code-text { font-size: 24px; font-weight: bold; color: #92400e; font-family: monospace; letter-spacing: 2px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    h2 { color: #1f2937; margin-top: 0; }
    h3 { color: #374151; margin-top: 0; }
    p { margin: 10px 0; }
    .status-active { color: #059669; font-weight: bold; }
    .status-pending { color: #d97706; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${logoUrl}" alt="Sponk Keramik Logo" class="logo" />
    </div>
    <div class="content">
      <h2>Gutschein-Bestätigung</h2>
      <p>Hallo ${customerName},</p>
      <p>vielen Dank für deinen Gutschein-Kauf!</p>
      
      <div class="voucher-code">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #92400e;">Dein Gutschein-Code:</p>
        <div class="voucher-code-text">${voucherCode}</div>
      </div>

      <div class="details">
        <h3>Kaufdetails:</h3>
        <p><strong>Gutschein-Code:</strong> <span style="font-family: monospace; font-weight: bold;">${voucherCode}</span></p>
        <p><strong>Betrag:</strong> ${amount.toFixed(2)} €</p>
        <p><strong>Zahlungsmethode:</strong> ${paymentMethodDisplay}</p>
        <p><strong>Status:</strong> <span class="${status === "active" ? "status-active" : "status-pending"}">${statusDisplay}</span></p>
        ${orderNumber ? `<p><strong>Bestellnummer:</strong> ${orderNumber}</p>` : ""}
        <p><strong>Gültig bis:</strong> ${validUntilDate}</p>
      </div>
      
      ${bankDetails}

      <div class="details">
        <h3>So verwendest du deinen Gutschein:</h3>
        <p>Zeige diesen Code bei deinem nächsten Besuch im Atelier vor oder gib ihn bei der Online-Buchung an.</p>
        <p>Du findest deinen Gutschein jederzeit in deinem Account unter "Meine Gutscheine".</p>
      </div>
      
      <p>Mit freundlichen Grüßen,<br>Ihr Team von Sponk Keramik</p>
    </div>
    <div class="footer">
      <p>Fürstenplatz 15, 40215 Düsseldorf</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const emailText = `
Hallo ${customerName},

vielen Dank für deinen Gutschein-Kauf!

Dein Gutschein-Code: ${voucherCode}

Kaufdetails:
- Gutschein-Code: ${voucherCode}
- Betrag: ${amount.toFixed(2)} €
- Zahlungsmethode: ${paymentMethodDisplay}
- Status: ${statusDisplay}
${orderNumber ? `- Bestellnummer: ${orderNumber}` : ""}
- Gültig bis: ${validUntilDate}

${paymentMethod === "bank_transfer" ? `
Bankverbindung für Überweisung:
- Bank: Commerzbank
- Kontoinhaber: Sponk Keramik
- IBAN: DE89 3704 0044 0532 0130 00
- BIC: COBADEFFXXX
- Verwendungszweck: ${voucherCode}

Wichtig: Bitte geben Sie den Gutschein-Code als Verwendungszweck bei der Überweisung an. 
Der Gutschein wird nach Zahlungseingang aktiviert.
` : ""}

So verwendest du deinen Gutschein:
Zeige diesen Code bei deinem nächsten Besuch im Atelier vor oder gib ihn bei der Online-Buchung an.
Du findest deinen Gutschein jederzeit in deinem Account unter "Meine Gutscheine".

Mit freundlichen Grüßen,
Ihr Team von Sponk Keramik

Fürstenplatz 15, 40215 Düsseldorf
  `.trim();

  // Try to send email using Resend API
  const resendApiKey = process.env.RESEND_API_KEY;
  const adminEmail = "sponkkeramik@gmail.com";

  if (resendApiKey) {
    try {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Sponk Keramik <noreply@sponkkeramik.de>",
          to: [customerEmail, adminEmail], // Send to both customer and admin
          subject: emailSubject,
          html: emailHtml,
          text: emailText,
        }),
      });

      if (resendResponse.ok) {
        const resendData = await resendResponse.json();
        console.log("✅ Voucher confirmation email sent via Resend:", resendData);
        return;
      } else {
        const errorData = await resendResponse.json();
        console.error("❌ Resend API error:", errorData);
        throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
      }
    } catch (resendError) {
      console.error("❌ Error sending email via Resend:", resendError);
      throw resendError;
    }
  }

  // Fallback: Log email content (for development/testing)
  console.log("\n" + "=".repeat(70));
  console.log("📧 VOUCHER CONFIRMATION EMAIL (NOT SENT - NO EMAIL SERVICE CONFIGURED)");
  console.log("=".repeat(70));
  console.log("To:", customerEmail);
  console.log("CC:", adminEmail);
  console.log("Subject:", emailSubject);
  console.log("\n--- Email Content ---");
  console.log(emailText);
  console.log("=".repeat(70) + "\n");
}


