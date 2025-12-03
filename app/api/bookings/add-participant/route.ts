import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API Route: Add Participant to Booking
 * 
 * Allows admins to add a participant name to a booking.
 * Automatically saves and sends an email notification to the customer.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, participantName } = body;

    if (!bookingId || !participantName || !participantName.trim()) {
      return NextResponse.json(
        { error: "Missing required fields: bookingId and participantName" },
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

    // Get booking details before update
    const { data: bookingBefore, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !bookingBefore) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Extract existing participants from notes
    const existingParticipants = extractParticipantsFromNotes(bookingBefore.notes || "");
    const currentParticipantCount = bookingBefore.participants || 1;
    
    // Add new participant
    const newParticipantNumber = currentParticipantCount + 1;
    const newParticipantLine = `Teilnehmer ${newParticipantNumber}: ${participantName.trim()}`;
    
    // Update notes
    let updatedNotes = bookingBefore.notes || "";
    if (updatedNotes.trim()) {
      // Check if there's already a "Teilnehmer:" section
      if (updatedNotes.includes("Teilnehmer:")) {
        updatedNotes = `${updatedNotes}\n${newParticipantLine}`;
      } else {
        updatedNotes = `${updatedNotes}\n\nTeilnehmer:\n${newParticipantLine}`;
      }
    } else {
      updatedNotes = `Teilnehmer:\n${newParticipantLine}`;
    }

    // Update booking: increment participants count and update notes
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({ 
        participants: currentParticipantCount + 1,
        notes: updatedNotes.trim()
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError || !updatedBooking) {
      console.error("Error updating booking:", updateError);
      return NextResponse.json(
        { error: "Failed to update booking", details: updateError?.message },
        { status: 500 }
      );
    }

    // Get course title for email
    let courseTitle = "Kurs";
    if (updatedBooking.course_schedule_id) {
      const { data: scheduleData } = await supabase
        .from("course_schedule")
        .select("course_id")
        .eq("id", updatedBooking.course_schedule_id)
        .single();
      
      if (scheduleData?.course_id) {
        const { data: courseData } = await supabase
          .from("courses")
          .select("title")
          .eq("id", scheduleData.course_id)
          .single();
        
        if (courseData?.title) {
          courseTitle = courseData.title;
        }
      }
    }

    // Prepare email data
    let customerEmail = updatedBooking.customer_email;
    let customerName = updatedBooking.customer_name || "liebe/r Kunde/in";

    // If no customer_email, try to get it from auth.users using service role
    if (!customerEmail || !customerEmail.includes("@")) {
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      if (supabaseServiceKey && supabaseUrl && updatedBooking.user_id) {
        try {
          const { createClient: createServiceClient } = await import("@supabase/supabase-js");
          const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey, {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          });

          const { data: authUser } = await serviceClient.auth.admin.getUserById(updatedBooking.user_id);
          if (authUser?.user?.email) {
            customerEmail = authUser.user.email;
            console.log(`✅ Fetched email from auth.users for user ${updatedBooking.user_id.substring(0, 8)}...`);
          }
        } catch (authError) {
          console.warn("⚠️ Could not fetch email from auth.users:", authError);
        }
      }
    }

    // Send email notification if we have a valid email
    let emailSent = false;
    if (customerEmail && customerEmail.includes("@")) {
      emailSent = await sendParticipantAddedEmail({
        customerEmail,
        customerName,
        courseTitle,
        bookingDate: new Date(updatedBooking.booking_date).toLocaleDateString("de-DE", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        bookingTime: `${updatedBooking.start_time} - ${updatedBooking.end_time}`,
        participantName: participantName.trim(),
        totalParticipants: currentParticipantCount + 1,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Participant added successfully",
      participantName: participantName.trim(),
      totalParticipants: currentParticipantCount + 1,
      emailSent: emailSent,
    });

  } catch (error) {
    console.error("Error adding participant:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to add participant",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * Extracts participant names from notes field
 */
function extractParticipantsFromNotes(notes: string): string[] {
  const participants: string[] = [];
  const lines = notes.split("\n");
  let inParticipantsSection = false;

  for (const line of lines) {
    if (line.trim() === "Teilnehmer:") {
      inParticipantsSection = true;
      continue;
    }
    if (inParticipantsSection) {
      const match = line.match(/^Teilnehmer \d+: (.+)$/);
      if (match) {
        participants.push(match[1].trim());
      }
    }
  }

  return participants;
}

/**
 * Sends email notification about new participant
 */
async function sendParticipantAddedEmail(params: {
  customerEmail: string;
  customerName: string;
  courseTitle: string;
  bookingDate: string;
  bookingTime: string;
  participantName: string;
  totalParticipants: number;
}): Promise<boolean> {
  const {
    customerEmail,
    customerName,
    courseTitle,
    bookingDate,
    bookingTime,
    participantName,
    totalParticipants,
  } = params;

  const resendApiKey = process.env.RESEND_API_KEY;
  const adminEmail = "sponkkeramik@gmail.com";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sponkkeramik.de";
  const logoUrl = `${siteUrl}/images/emaillogo.webp`;

  const emailSubject = `Teilnehmer hinzugefügt: ${courseTitle}`;
  
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
    .change-box { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d97706; }
    .booking-details { background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0; font-size: 14px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    h2 { color: #1f2937; margin-top: 0; }
    p { margin: 10px 0; }
    .participant-name { font-weight: bold; color: #d97706; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${logoUrl}" alt="Sponk Keramik Logo" class="logo" />
    </div>
    <div class="content">
      <h2>Teilnehmer hinzugefügt</h2>
      <p>Hallo ${customerName},</p>
      <p>wir haben einen neuen Teilnehmer zu Ihrer Buchung hinzugefügt:</p>
      
      <div class="change-box">
        <p><strong>Neuer Teilnehmer:</strong></p>
        <p class="participant-name">${participantName}</p>
        <p><strong>Gesamtteilnehmer:</strong> ${totalParticipants}</p>
      </div>
      
      <div class="booking-details">
        <p><strong>Buchungsdetails:</strong></p>
        <p>Kurs: ${courseTitle}</p>
        <p>Datum: ${bookingDate}</p>
        <p>Zeit: ${bookingTime}</p>
        <p>Teilnehmer: ${totalParticipants}</p>
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

wir haben einen neuen Teilnehmer zu Ihrer Buchung hinzugefügt:

Neuer Teilnehmer: ${participantName}
Gesamtteilnehmer: ${totalParticipants}

Buchungsdetails:
- Kurs: ${courseTitle}
- Datum: ${bookingDate}
- Zeit: ${bookingTime}
- Teilnehmer: ${totalParticipants}

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
        console.log("✅ Participant added email sent via Resend:", resendData);
        return true;
      } else {
        const errorData = await resendResponse.json();
        console.error("❌ Resend API error:", errorData);
        return false;
      }
    } catch (resendError) {
      console.error("❌ Error sending email via Resend:", resendError);
      return false;
    }
  } else {
    console.log("\n" + "=".repeat(70));
    console.log("📧 PARTICIPANT ADDED EMAIL (NOT SENT - NO EMAIL SERVICE CONFIGURED)");
    console.log("=".repeat(70));
    console.log("To:", customerEmail);
    console.log("Subject:", emailSubject);
    console.log("\n--- Email Content ---");
    console.log(emailText);
    console.log("=".repeat(70) + "\n");
    return false;
  }
}


