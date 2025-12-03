import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API Route: Send Customer Reply to Voucher Messages
 * 
 * Allows customers to reply to admin messages about vouchers.
 * Stores the message in voucher_messages table and sends email to both customer and admin.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { voucherId, message } = body;

    if (!voucherId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get voucher details and verify ownership
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

    // Verify that the user owns this voucher
    if (voucher.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - You can only reply to your own vouchers" },
        { status: 403 }
      );
    }

    // Store message in database
    const { data: insertedMessage, error: messageError } = await supabase
      .from("voucher_messages")
      .insert({
        voucher_id: voucherId,
        sender_type: "customer",
        sender_id: user.id,
        message: message.trim(),
      })
      .select()
      .single();

    if (messageError) {
      console.error("Error storing customer message:", messageError);
      return NextResponse.json(
        { 
          error: "Fehler beim Speichern der Nachricht",
          details: messageError.message,
          code: messageError.code
        },
        { status: 500 }
      );
    }

    // Get customer info
    const customerEmail = voucher.user_email || user.email || "";
    const customerName = voucher.customer_name || "Kunde";
    
    // Send email via Resend to both customer and admin
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = "sponkkeramik@gmail.com";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sponkkeramik.de";
    const logoUrl = `${siteUrl}/images/emaillogo.webp`;

    const emailSubject = `Antwort zu Ihrem Gutschein: ${voucher.code}`;
    
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
    .message-box { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d97706; }
    .voucher-details { background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0; font-size: 14px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    h2 { color: #1f2937; margin-top: 0; }
    p { margin: 10px 0; }
    .message-content { white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${logoUrl}" alt="Sponk Keramik Logo" class="logo" />
    </div>
    <div class="content">
      <h2>Neue Antwort zu Ihrem Gutschein</h2>
      <p>Hallo ${customerName},</p>
      <p>vielen Dank für Ihre Antwort!</p>
      
      <div class="voucher-details">
        <p><strong>Gutschein-Details:</strong></p>
        <p>Gutschein-Code: <strong>${voucher.code}</strong></p>
        <p>Wert: <strong>${voucher.value}€</strong></p>
        <p>Gültig bis: ${new Date(voucher.valid_until).toLocaleDateString("de-DE", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}</p>
      </div>
      
      <div class="message-box">
        <p><strong>Ihre Nachricht:</strong></p>
        <p class="message-content">${message.trim().replace(/\n/g, '<br>')}</p>
      </div>
      
      <p>Wir werden uns schnellstmöglich bei Ihnen melden.</p>
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

vielen Dank für Ihre Antwort!

Gutschein-Details:
- Gutschein-Code: ${voucher.code}
- Wert: ${voucher.value}€
- Gültig bis: ${new Date(voucher.valid_until).toLocaleDateString("de-DE", {
  year: "numeric",
  month: "long",
  day: "numeric",
})}

Ihre Nachricht:
${message.trim()}

Wir werden uns schnellstmöglich bei Ihnen melden.

Mit freundlichen Grüßen,
Ihr Team von Sponk Keramik

Fürstenplatz 15, 40215 Düsseldorf
    `.trim();

    // Email for admin (different subject and content)
    const adminEmailSubject = `Neue Kundenantwort zu Gutschein: ${voucher.code}`;
    const adminEmailHtml = `
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
    .message-box { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d97706; }
    .voucher-details { background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0; font-size: 14px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    h2 { color: #1f2937; margin-top: 0; }
    p { margin: 10px 0; }
    .message-content { white-space: pre-wrap; }
    .alert { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${logoUrl}" alt="Sponk Keramik Logo" class="logo" />
    </div>
    <div class="content">
      <div class="alert">
        <strong>⚠️ Neue Kundenantwort erhalten</strong>
      </div>
      
      <h2>Kundenantwort zu Gutschein</h2>
      
      <div class="voucher-details">
        <p><strong>Gutschein-Details:</strong></p>
        <p><strong>Kunde:</strong> ${customerName}</p>
        <p><strong>E-Mail:</strong> ${customerEmail}</p>
        <p><strong>Gutschein-Code:</strong> ${voucher.code}</p>
        <p><strong>Wert:</strong> ${voucher.value}€</p>
        <p><strong>Gültig bis:</strong> ${new Date(voucher.valid_until).toLocaleDateString("de-DE", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}</p>
        <p><strong>Gutschein-ID:</strong> ${voucherId}</p>
      </div>
      
      <div class="message-box">
        <p><strong>Nachricht vom Kunden:</strong></p>
        <p class="message-content">${message.trim().replace(/\n/g, '<br>')}</p>
      </div>
      
      <p>Bitte antworten Sie dem Kunden über das Admin-Panel.</p>
    </div>
    <div class="footer">
      <p>Fürstenplatz 15, 40215 Düsseldorf</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    const adminEmailText = `
⚠️ NEUE KUNDENANTWORT ERHALTEN

Gutschein-Details:
- Kunde: ${customerName}
- E-Mail: ${customerEmail}
- Gutschein-Code: ${voucher.code}
- Wert: ${voucher.value}€
- Gültig bis: ${new Date(voucher.valid_until).toLocaleDateString("de-DE", {
  year: "numeric",
  month: "long",
  day: "numeric",
})}
- Gutschein-ID: ${voucherId}

Nachricht vom Kunden:
${message.trim()}

Bitte antworten Sie dem Kunden über das Admin-Panel.

Fürstenplatz 15, 40215 Düsseldorf
    `.trim();

    if (resendApiKey) {
      try {
        // Send email to customer
        const customerEmailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Sponk Keramik <noreply@sponkkeramik.de>",
            to: [customerEmail],
            reply_to: adminEmail,
            subject: emailSubject,
            html: emailHtml,
            text: emailText,
          }),
        });

        // Send email to admin
        const adminEmailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Sponk Keramik <noreply@sponkkeramik.de>",
            to: [adminEmail],
            subject: adminEmailSubject,
            html: adminEmailHtml,
            text: adminEmailText,
          }),
        });

        if (customerEmailResponse.ok && adminEmailResponse.ok) {
          const customerData = await customerEmailResponse.json();
          const adminData = await adminEmailResponse.json();
          console.log("✅ Customer voucher reply emails sent via Resend:", { customerData, adminData });
          return NextResponse.json({ 
            success: true,
            message: "Antwort erfolgreich gesendet",
            messageId: insertedMessage.id
          });
        } else {
          const customerError = customerEmailResponse.ok ? null : await customerEmailResponse.json();
          const adminError = adminEmailResponse.ok ? null : await adminEmailResponse.json();
          console.error("❌ Resend API errors:", { customerError, adminError });
          // Still return success if message was stored
          return NextResponse.json({ 
            success: true,
            message: "Nachricht gespeichert, aber E-Mail-Versand teilweise fehlgeschlagen",
            messageId: insertedMessage.id,
            emailErrors: { customerError, adminError }
          });
        }
      } catch (resendError) {
        console.error("❌ Error sending emails via Resend:", resendError);
        // Still return success if message was stored
        return NextResponse.json({ 
          success: true,
          message: "Nachricht gespeichert, aber E-Mail-Versand fehlgeschlagen",
          messageId: insertedMessage.id,
          emailError: "Email service error"
        });
      }
    } else {
      // No email service configured, but message is stored
      console.log("⚠️ RESEND_API_KEY not configured - message stored but emails not sent");
      return NextResponse.json({ 
        success: true,
        message: "Nachricht gespeichert, aber E-Mail-Service nicht konfiguriert",
        messageId: insertedMessage.id,
        emailLogged: true
      });
    }

  } catch (error) {
    console.error("Error sending customer voucher reply:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Fehler beim Senden der Antwort",
        message: error instanceof Error ? error.message : "Unbekannter Fehler"
      },
      { status: 500 }
    );
  }
}


