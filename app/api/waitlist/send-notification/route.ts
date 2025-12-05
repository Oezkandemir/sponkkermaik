import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API Route: Send Waitlist Notification Email
 * 
 * Sends an email notification to a customer when a spot becomes available
 * and they chose to be notified (not auto-book).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      waitlistEntryId,
      customerName,
      customerEmail,
      courseTitle,
      courseId,
      availableSlot,
    } = body;

    if (!customerEmail || !courseTitle || !availableSlot) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sponkkeramik.de";
    const logoUrl = `${siteUrl}/images/emaillogo.webp`;
    const bookingUrl = `${siteUrl}/book-course?course=${courseId}`;

    // Format date
    const slotDate = new Date(availableSlot.date);
    const formattedDate = slotDate.toLocaleDateString("de-DE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const emailSubject = `Platz verfügbar: ${courseTitle}`;
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
    .availability-box { background-color: white; padding: 20px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d97706; }
    .booking-details { background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0; font-size: 14px; }
    .cta-button { display: inline-block; padding: 12px 24px; background-color: #d97706; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; font-weight: bold; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    h2 { color: #1f2937; margin-top: 0; }
    p { margin: 10px 0; }
    .urgent { color: #dc2626; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${logoUrl}" alt="Sponk Keramik Logo" class="logo" />
    </div>
    <div class="content">
      <h2>Platz verfügbar!</h2>
      <p>Hallo ${customerName},</p>
      <p>gute Nachrichten! Ein Platz ist für den Kurs <strong>${courseTitle}</strong> verfügbar geworden.</p>
      
      <div class="availability-box">
        <p><strong>Verfügbarer Termin:</strong></p>
        <p>Datum: ${formattedDate}</p>
        <p>Zeit: ${availableSlot.startTime} - ${availableSlot.endTime}</p>
        <p>Verfügbare Plätze: ${availableSlot.availablePlaces}</p>
      </div>
      
      <p class="urgent">⚠️ Dieser Platz ist nur begrenzt verfügbar. Buchen Sie schnell, um sicherzustellen, dass Sie dabei sind!</p>
      
      <div style="text-align: center;">
        <a href="${bookingUrl}" class="cta-button">Jetzt buchen</a>
      </div>
      
      <div class="booking-details">
        <p><strong>Hinweis:</strong></p>
        <p>Sie wurden automatisch von der Warteliste entfernt. Falls Sie nicht mehr interessiert sind, müssen Sie nichts tun.</p>
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

gute Nachrichten! Ein Platz ist für den Kurs ${courseTitle} verfügbar geworden.

Verfügbarer Termin:
- Datum: ${formattedDate}
- Zeit: ${availableSlot.startTime} - ${availableSlot.endTime}
- Verfügbare Plätze: ${availableSlot.availablePlaces}

⚠️ Dieser Platz ist nur begrenzt verfügbar. Buchen Sie schnell!

Jetzt buchen: ${bookingUrl}

Sie wurden automatisch von der Warteliste entfernt. Falls Sie nicht mehr interessiert sind, müssen Sie nichts tun.

Mit freundlichen Grüßen,
Ihr Team von Sponk Keramik

Fürstenplatz 15, 40215 Düsseldorf
    `.trim();

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
            to: [customerEmail],
            reply_to: adminEmail,
            subject: emailSubject,
            html: emailHtml,
            text: emailText,
          }),
        });

        if (resendResponse.ok) {
          const resendData = await resendResponse.json();
          console.log("✅ Waitlist notification email sent via Resend:", resendData);
          return NextResponse.json({
            success: true,
            message: "Notification email sent successfully",
            emailSent: true,
          });
        } else {
          const errorData = await resendResponse.json();
          console.error("❌ Resend API error:", errorData);
          return NextResponse.json(
            { error: "Failed to send email", details: errorData },
            { status: 500 }
          );
        }
      } catch (resendError) {
        console.error("❌ Error sending email via Resend:", resendError);
        return NextResponse.json(
          { error: "Failed to send email", details: resendError },
          { status: 500 }
        );
      }
    } else {
      // Fallback: Log email content (for development/testing)
      console.log("\n" + "=".repeat(70));
      console.log("📧 WAITLIST NOTIFICATION EMAIL (NOT SENT - NO EMAIL SERVICE CONFIGURED)");
      console.log("=".repeat(70));
      console.log("To:", customerEmail);
      console.log("Subject:", emailSubject);
      console.log("\n--- Email Content ---");
      console.log(emailText);
      console.log("=".repeat(70) + "\n");

      return NextResponse.json({
        success: true,
        message: "Email content logged (email service not configured)",
        emailSent: false,
        emailLogged: true,
      });
    }
  } catch (error) {
    console.error("Error sending waitlist notification:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send notification",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}



