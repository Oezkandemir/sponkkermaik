import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API Route: Send Reply to Voucher
 * 
 * Allows admins to send email replies about vouchers.
 * Stores the message in voucher_messages table and sends email via Resend.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { voucherId, message, customerEmail, customerName, voucherCode, voucherValue } = body;

    if (!voucherId || !message || !customerEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check admin status
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError && adminError.code !== "PGRST116") {
      console.error("Error checking admin status:", adminError);
      return NextResponse.json(
        { error: "Error checking admin access", details: adminError.message },
        { status: 500 }
      );
    }

    if (!adminData) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get voucher details
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

    // Store message in database
    const { data: insertedMessage, error: messageError } = await supabase
      .from("voucher_messages")
      .insert({
        voucher_id: voucherId,
        sender_type: "admin",
        sender_id: user.id,
        message: message.trim(),
      })
      .select()
      .single();

    if (messageError) {
      console.error("Error storing voucher message:", messageError);
      return NextResponse.json(
        { 
          error: "Fehler beim Speichern der Nachricht",
          details: messageError.message,
          code: messageError.code
        },
        { status: 500 }
      );
    }

    // Send email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = "sponkkeramik@gmail.com";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sponkkeramik.de";
    const logoUrl = `${siteUrl}/images/emaillogo.webp`;

    const emailSubject = `Nachricht zu Ihrem Gutschein: ${voucherCode || voucher.code}`;
    
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
      <h2>Nachricht zu Ihrem Gutschein</h2>
      <p>Hallo ${customerName || "liebe/r Kunde/in"},</p>
      
      <div class="voucher-details">
        <p><strong>Gutschein-Details:</strong></p>
        <p>Gutschein-Code: <strong>${voucherCode || voucher.code}</strong></p>
        <p>Wert: <strong>${voucherValue || voucher.value}€</strong></p>
        <p>Gültig bis: ${new Date(voucher.valid_until).toLocaleDateString("de-DE", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}</p>
      </div>
      
      <div class="message-box">
        <p class="message-content">${message.trim().replace(/\n/g, '<br>')}</p>
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
Hallo ${customerName || "liebe/r Kunde/in"},

Nachricht zu Ihrem Gutschein:

Gutschein-Details:
- Gutschein-Code: ${voucherCode || voucher.code}
- Wert: ${voucherValue || voucher.value}€
- Gültig bis: ${new Date(voucher.valid_until).toLocaleDateString("de-DE", {
  year: "numeric",
  month: "long",
  day: "numeric",
})}

${message.trim()}

Mit freundlichen Grüßen,
Ihr Team von Sponk Keramik

Fürstenplatz 15, 40215 Düsseldorf
    `.trim();

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
            to: [customerEmail],
            reply_to: adminEmail,
            subject: emailSubject,
            html: emailHtml,
            text: emailText,
          }),
        });

        if (resendResponse.ok) {
          const resendData = await resendResponse.json();
          console.log("✅ Voucher reply email sent via Resend:", resendData);
          return NextResponse.json({ 
            success: true,
            message: "Antwort erfolgreich gesendet",
            messageId: insertedMessage.id,
            data: resendData
          });
        } else {
          const errorData = await resendResponse.json();
          console.error("❌ Resend API error:", errorData);
          // Still return success if message was stored
          return NextResponse.json({ 
            success: true,
            message: "Nachricht gespeichert, aber E-Mail-Versand fehlgeschlagen",
            messageId: insertedMessage.id,
            emailError: errorData
          });
        }
      } catch (resendError) {
        console.error("❌ Error sending email via Resend:", resendError);
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
      console.log("⚠️ RESEND_API_KEY not configured - message stored but email not sent");
      return NextResponse.json({ 
        success: true,
        message: "Nachricht gespeichert, aber E-Mail-Service nicht konfiguriert",
        messageId: insertedMessage.id,
        emailLogged: true
      });
    }

  } catch (error) {
    console.error("Error sending voucher reply:", error);
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



