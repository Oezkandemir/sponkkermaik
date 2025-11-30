import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API Route: Send Booking Confirmation Email
 * 
 * Sends a confirmation email to the customer after booking.
 * Uses Supabase's email functionality or direct SMTP.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, customerName, customerEmail, courseTitle, bookingDate, bookingTime } = body;

    if (!bookingId || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get booking details from database
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

    // Get site URL for logo
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sponkkeramik.de";
    const logoUrl = `${siteUrl}/images/emaillogo.webp`;

    // Create email content
    const emailSubject = `Buchungsbestätigung: ${courseTitle}`;
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #d97706; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .logo { max-width: 200px; height: auto; margin-bottom: 15px; }
    .content { padding: 20px; background-color: #f9fafb; }
    .details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d97706; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    h2 { color: #1f2937; margin-top: 0; }
    p { margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${logoUrl}" alt="Sponk Keramik Logo" class="logo" />
      <h1 style="margin: 0; font-size: 24px;">Sponk Keramik</h1>
    </div>
    <div class="content">
      <h2>Buchungsbestätigung</h2>
      <p>Hallo ${customerName},</p>
      <p>vielen Dank für Ihre Buchung bei Sponk Keramik!</p>
      
      <div class="details">
        <h3>Buchungsdetails:</h3>
        <p><strong>Kurs:</strong> ${courseTitle}</p>
        <p><strong>Datum:</strong> ${bookingDate}</p>
        <p><strong>Zeit:</strong> ${bookingTime}</p>
        <p><strong>Status:</strong> ${booking.status === "pending" ? "Ausstehend" : "Bestätigt"}</p>
      </div>
      
      <p>Wir werden Ihre Buchung schnellstmöglich bearbeiten und Ihnen eine Bestätigung senden.</p>
      <p>Bei Fragen können Sie uns jederzeit kontaktieren.</p>
      
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

vielen Dank für Ihre Buchung bei Sponk Keramik!

Buchungsdetails:
- Kurs: ${courseTitle}
- Datum: ${bookingDate}
- Zeit: ${bookingTime}
- Status: ${booking.status === "pending" ? "Ausstehend" : "Bestätigt"}

Wir werden Ihre Buchung schnellstmöglich bearbeiten und Ihnen eine Bestätigung senden.

Bei Fragen können Sie uns jederzeit kontaktieren.

Mit freundlichen Grüßen,
Ihr Team von Sponk Keramik

Fürstenplatz 15, 40215 Düsseldorf
    `.trim();

    // Try to send email using Supabase's email functionality
    // Option 1: Use Resend API (recommended - add RESEND_API_KEY to .env.local)
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
          console.log("✅ Email sent via Resend:", resendData);
          return NextResponse.json({ 
            success: true,
            message: "Confirmation email sent successfully",
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

    // Option 2: Use Supabase Edge Function (if configured with email service)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const { data: functionData, error: functionError } = await supabase.functions.invoke(
          "send-booking-confirmation",
          {
            body: {
              bookingId,
              customerName,
              customerEmail,
              courseTitle,
              bookingDate,
              bookingTime,
            },
          }
        );

        if (!functionError && functionData) {
          console.log("✅ Email sent via Edge Function");
          return NextResponse.json({ 
            success: true,
            message: "Confirmation email sent successfully",
            data: functionData
          });
        }
      } catch (edgeError) {
        console.error("❌ Error invoking Edge Function:", edgeError);
      }
    }

    // Fallback: Log email content (for development/testing)
    // This helps debug what email would be sent
    console.log("\n" + "=".repeat(70));
    console.log("📧 BOOKING CONFIRMATION EMAIL (NOT SENT - NO EMAIL SERVICE CONFIGURED)");
    console.log("=".repeat(70));
    console.log("To:", customerEmail);
    console.log("CC:", adminEmail);
    console.log("Subject:", emailSubject);
    console.log("\n--- Email Content ---");
    console.log(emailText);
    console.log("=".repeat(70) + "\n");

    // IMPORTANT: Return success so booking is not blocked
    // Email will be sent once email service is configured
    return NextResponse.json({ 
      success: true,
      message: "Booking created successfully. Email service not configured - email content logged to console.",
      emailLogged: true,
      note: "To enable email sending, add RESEND_API_KEY to .env.local or configure Supabase SMTP"
    });

  } catch (error) {
    console.error("Error sending confirmation email:", error);
    // Don't fail the booking if email fails
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to send confirmation email",
        message: "Booking was created but email could not be sent"
      },
      { status: 500 }
    );
  }
}

