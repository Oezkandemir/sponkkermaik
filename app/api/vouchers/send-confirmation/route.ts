import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API Route: Send Voucher Confirmation Email
 * 
 * Sends a confirmation email to the customer after voucher purchase.
 * Supports both PayPal and bank transfer payment methods.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      voucherId, 
      customerEmail, 
      customerName, 
      voucherCode, 
      amount, 
      paymentMethod, 
      status,
      orderNumber,
      validUntil 
    } = body;

    if (!voucherId || !customerEmail || !customerName || !voucherCode || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get voucher details from database
    const { data: voucher, error: voucherError } = await supabase
      .from("vouchers")
      .select("*")
      .eq("id", voucherId)
      .single();

    if (voucherError || !voucher) {
      return NextResponse.json(
        { error: "Voucher not found" },
        { status: 404 }
      );
    }

    // Get site URL for logo
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sponkkeramik.de";
    const logoUrl = `${siteUrl}/images/emaillogo.webp`;

    // Format dates
    const validUntilDate = validUntil 
      ? new Date(validUntil).toLocaleDateString("de-DE", { 
          year: "numeric", 
          month: "long", 
          day: "numeric" 
        })
      : new Date(voucher.valid_until).toLocaleDateString("de-DE", { 
          year: "numeric", 
          month: "long", 
          day: "numeric" 
        });

    // Determine payment method display
    const paymentMethodDisplay = paymentMethod === "paypal" 
      ? "PayPal" 
      : paymentMethod === "bank_transfer" 
      ? "Banküberweisung" 
      : "Unbekannt";

    // Determine status display
    const statusDisplay = status === "active" 
      ? "Aktiv" 
      : status === "pending" 
      ? "Ausstehend (Wird nach Zahlungseingang aktiviert)" 
      : status || voucher.status === "active" 
      ? "Aktiv" 
      : "Ausstehend";

    // Bank details (for bank transfer)
    const bankDetails = paymentMethod === "bank_transfer" ? `
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
    ` : "";

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
            "Authorization": `Bearer ${resendApiKey}`,
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
          return NextResponse.json({ 
            success: true,
            message: "Voucher confirmation email sent successfully",
            data: resendData
          });
        } else {
          const errorData = await resendResponse.json();
          console.error("❌ Resend API error:", errorData);
        }
      } catch (resendError) {
        console.error("❌ Error sending email via Resend:", resendError);
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

    // IMPORTANT: Return success so voucher creation is not blocked
    // Email will be sent once email service is configured
    return NextResponse.json({ 
      success: true,
      message: "Voucher created successfully. Email service not configured - email content logged to console.",
      emailLogged: true,
      note: "To enable email sending, add RESEND_API_KEY to .env.local"
    });

  } catch (error) {
    console.error("Error sending voucher confirmation email:", error);
    // Don't fail the voucher creation if email fails
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to send confirmation email",
        message: "Voucher was created but email could not be sent"
      },
      { status: 500 }
    );
  }
}




