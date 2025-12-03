import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API Route: Send Reply to Booking Notes
 * 
 * Allows admins to send email replies to customer notes in bookings.
 * Stores the message in booking_messages table and sends email via Resend.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, message, customerEmail, customerName, courseTitle, bookingDate, bookingTime } = body;

    if (!bookingId || !message || !customerEmail) {
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
      console.error("User is not admin:", user.id);
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    console.log("✅ Admin verified:", user.id);

    // Get booking details
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

    // Verify auth.uid() works correctly by testing a simple query
    const { data: { user: authUser } } = await supabase.auth.getUser();
    console.log("Auth user ID:", authUser?.id);
    console.log("Session user ID:", user.id);
    
    // Test if we can query admins table (to verify RLS works)
    const { data: adminTest, error: adminTestError } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    
    console.log("Admin test query result:", { adminTest, error: adminTestError });
    
    // Store message in database
    let messageData = null;
    console.log("Attempting to insert message:", {
      booking_id: bookingId,
      sender_type: "admin",
      sender_id: user.id,
      message_length: message.trim().length,
    });
    
    const { data: insertedMessage, error: messageError } = await supabase
      .from("booking_messages")
      .insert({
        booking_id: bookingId,
        sender_type: "admin",
        sender_id: user.id,
        message: message.trim(),
      })
      .select()
      .single();

    if (messageError) {
      console.error("❌ Error storing message:", messageError);
      console.error("Error details:", {
        code: messageError.code,
        message: messageError.message,
        details: messageError.details,
        hint: messageError.hint,
      });
      
      // Check if table doesn't exist (PGRST116 = relation does not exist)
      if (messageError.code === "PGRST116" || messageError.message?.includes("relation") || messageError.message?.includes("does not exist")) {
        return NextResponse.json(
          { 
            error: "Die booking_messages Tabelle existiert noch nicht. Bitte führen Sie die Migration aus.",
            migrationRequired: true,
            migrationFile: "supabase/migrations/supabase_migration_add_booking_messages.sql"
          },
          { status: 500 }
        );
      }
      
      // Check if RLS policy is blocking (42501 = insufficient privilege)
      if (messageError.code === "42501" || messageError.message?.includes("permission denied") || messageError.message?.includes("policy") || messageError.message?.includes("new row violates")) {
        // Try to get more info about why RLS is blocking
        const { data: adminCheck } = await supabase
          .from("admins")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();
        
        console.error("RLS check - Admin data:", adminCheck);
        console.error("RLS check - User ID:", user.id);
        
        return NextResponse.json(
          { 
            error: "Keine Berechtigung zum Speichern der Nachricht. Bitte überprüfen Sie die RLS-Policies.",
            rlsIssue: true,
            details: messageError.message,
            code: messageError.code,
            userId: user.id,
            isAdmin: !!adminCheck
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Fehler beim Speichern der Nachricht",
          details: messageError.message,
          code: messageError.code,
          hint: messageError.hint
        },
        { status: 500 }
      );
    }

    console.log("✅ Message stored successfully:", insertedMessage?.id);
    messageData = insertedMessage;

    // Send email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = "sponkkeramik@gmail.com";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sponkkeramik.de";
    const logoUrl = `${siteUrl}/images/emaillogo.webp`;

    const emailSubject = `Antwort zu Ihrer Buchung: ${courseTitle || "Kurs"}`;
    
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
      <h2>Antwort zu Ihrer Buchung</h2>
      <p>Hallo ${customerName || "liebe/r Kunde/in"},</p>
      
      <div class="booking-details">
        <p><strong>Buchungsdetails:</strong></p>
        <p>Kurs: ${courseTitle || "Kurs"}</p>
        <p>Datum: ${bookingDate || booking.booking_date}</p>
        <p>Zeit: ${bookingTime || `${booking.start_time} - ${booking.end_time}`}</p>
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

Antwort zu Ihrer Buchung:

Buchungsdetails:
- Kurs: ${courseTitle || "Kurs"}
- Datum: ${bookingDate || booking.booking_date}
- Zeit: ${bookingTime || `${booking.start_time} - ${booking.end_time}`}

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
          console.log("✅ Reply email sent via Resend:", resendData);
          return NextResponse.json({ 
            success: true,
            message: "Reply sent successfully",
            messageId: messageData.id,
            data: resendData
          });
        } else {
          const errorData = await resendResponse.json();
          console.error("❌ Resend API error:", errorData);
          // Still return success if message was stored
          return NextResponse.json({ 
            success: true,
            message: "Reply stored but email failed to send",
            messageId: messageData.id,
            emailError: errorData
          });
        }
      } catch (resendError) {
        console.error("❌ Error sending email via Resend:", resendError);
        // Still return success if message was stored
        return NextResponse.json({ 
          success: true,
          message: "Reply stored but email failed to send",
          messageId: messageData.id,
          emailError: "Email service error"
        });
      }
    } else {
      // No email service configured, but message is stored
      console.log("⚠️ RESEND_API_KEY not configured - message stored but email not sent");
      return NextResponse.json({ 
        success: true,
        message: "Reply stored but email service not configured",
        messageId: messageData.id,
        emailLogged: true
      });
    }

  } catch (error) {
    console.error("Error sending reply:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to send reply",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

