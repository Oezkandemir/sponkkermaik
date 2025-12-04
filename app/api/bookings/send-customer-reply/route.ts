import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API Route: Send Customer Reply to Booking Messages
 * 
 * Allows customers to reply to admin messages in bookings.
 * Stores the message in booking_messages table and sends email to both customer and admin.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, message } = body;

    if (!bookingId || !message) {
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

    // Get booking details and verify ownership
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify that the user owns this booking
    if (booking.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - You can only reply to your own bookings" },
        { status: 403 }
      );
    }

    // Store message in database
    const { data: insertedMessage, error: messageError } = await supabase
      .from("booking_messages")
      .insert({
        booking_id: bookingId,
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
    const customerEmail = booking.customer_email || user.email || "";
    const customerName = booking.customer_name || "Kunde";
    
    // Get course title
    let courseTitle = "Kurs";
    if (booking.course_schedule_id) {
      const { data: schedule } = await supabase
        .from("course_schedule")
        .select("course_id")
        .eq("id", booking.course_schedule_id)
        .single();
      
      if (schedule?.course_id) {
        const { data: course } = await supabase
          .from("courses")
          .select("title")
          .eq("id", schedule.course_id)
          .single();
        
        if (course?.title) {
          courseTitle = course.title;
        }
      }
    }

    // Format booking date and time
    const bookingDate = booking.booking_date 
      ? new Date(booking.booking_date).toLocaleDateString("de-DE", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";
    const bookingTime = booking.start_time && booking.end_time
      ? `${booking.start_time} - ${booking.end_time}`
      : "";

    // Send email via Resend to both customer and admin
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = "sponkkeramik@gmail.com";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sponkkeramik.de";
    const logoUrl = `${siteUrl}/images/emaillogo.webp`;

    const emailSubject = `Antwort zu Ihrer Buchung: ${courseTitle}`;
    
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
    .booking-details { background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0; font-size: 14px; }
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
      <h2>Neue Antwort zu Ihrer Buchung</h2>
      <p>Hallo ${customerName},</p>
      <p>vielen Dank für Ihre Antwort!</p>
      
      <div class="booking-details">
        <p><strong>Buchungsdetails:</strong></p>
        <p>Kurs: ${courseTitle}</p>
        <p>Datum: ${bookingDate}</p>
        <p>Zeit: ${bookingTime}</p>
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

Buchungsdetails:
- Kurs: ${courseTitle}
- Datum: ${bookingDate}
- Zeit: ${bookingTime}

Ihre Nachricht:
${message.trim()}

Wir werden uns schnellstmöglich bei Ihnen melden.

Mit freundlichen Grüßen,
Ihr Team von Sponk Keramik

Fürstenplatz 15, 40215 Düsseldorf
    `.trim();

    // Email for admin (different subject and content)
    const adminEmailSubject = `Neue Kundenantwort zu Buchung: ${courseTitle}`;
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
    .booking-details { background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0; font-size: 14px; }
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
      
      <h2>Kundenantwort zu Buchung</h2>
      
      <div class="booking-details">
        <p><strong>Buchungsdetails:</strong></p>
        <p><strong>Kunde:</strong> ${customerName}</p>
        <p><strong>E-Mail:</strong> ${customerEmail}</p>
        <p><strong>Kurs:</strong> ${courseTitle}</p>
        <p><strong>Datum:</strong> ${bookingDate}</p>
        <p><strong>Zeit:</strong> ${bookingTime}</p>
        <p><strong>Buchungs-ID:</strong> ${bookingId}</p>
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

Buchungsdetails:
- Kunde: ${customerName}
- E-Mail: ${customerEmail}
- Kurs: ${courseTitle}
- Datum: ${bookingDate}
- Zeit: ${bookingTime}
- Buchungs-ID: ${bookingId}

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
          console.log("✅ Customer reply emails sent via Resend:", { customerData, adminData });
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
    console.error("Error sending customer reply:", error);
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






