import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Newsletter Subscribe API Route
 * 
 * Handles newsletter subscription:
 * - Validates email format
 * - Checks if email already exists
 * - Stores subscription in database
 * - Sends confirmation email via Resend
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Ungültige E-Mail-Adresse" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if email already exists
    const { data: existingSubscriber, error: checkError } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, subscribed_at, unsubscribed_at")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    // Check if table doesn't exist (PGRST116 = relation does not exist)
    if (checkError && checkError.code === "PGRST116") {
      console.error("❌ Newsletter table does not exist:", checkError);
      return NextResponse.json(
        {
          error: "Die Newsletter-Tabelle existiert noch nicht. Bitte führen Sie die Migration aus.",
          migrationRequired: true,
          migrationFile: "supabase/migrations/supabase_migration_create_newsletter_subscribers.sql",
        },
        { status: 500 }
      );
    }

    if (checkError && checkError.code !== "PGRST116") {
      console.error("❌ Error checking existing subscriber:", checkError);
      throw checkError;
    }

    // If already subscribed and not unsubscribed, return success
    if (existingSubscriber && !existingSubscriber.unsubscribed_at) {
      return NextResponse.json({
        success: true,
        message: "Sie sind bereits für den Newsletter angemeldet.",
      });
    }

    // If unsubscribed before, reactivate subscription
    if (existingSubscriber && existingSubscriber.unsubscribed_at) {
      const { error: updateError } = await supabase
        .from("newsletter_subscribers")
        .update({
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
        })
        .eq("id", existingSubscriber.id);

      if (updateError) throw updateError;
    } else {
      // Create new subscription
      const { error: insertError } = await supabase
        .from("newsletter_subscribers")
        .insert({
          email: email.toLowerCase().trim(),
          subscribed_at: new Date().toISOString(),
        });

      if (insertError) {
        // Check if table doesn't exist
        if (insertError.code === "PGRST116" || insertError.message?.includes("relation") || insertError.message?.includes("does not exist")) {
          console.error("❌ Newsletter table does not exist:", insertError);
          return NextResponse.json(
            {
              error: "Die Newsletter-Tabelle existiert noch nicht. Bitte führen Sie die Migration aus.",
              migrationRequired: true,
              migrationFile: "supabase/migrations/supabase_migration_create_newsletter_subscribers.sql",
            },
            { status: 500 }
          );
        }
        throw insertError;
      }
    }

    // Send confirmation email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Newsletter Anmeldung</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #d97706; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <img src="https://www.sponkkeramik.de/images/emaillogo.webp" alt="Sponk Keramik Logo" style="width: 100%; max-width: 400px; height: auto; display: block; margin: 0 auto;" />
  </div>
  <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #d97706; margin-top: 0;">Vielen Dank für Ihre Newsletter-Anmeldung!</h2>
    <p>Hallo,</p>
    <p>vielen Dank, dass Sie sich für unseren Newsletter angemeldet haben. Sie erhalten ab sofort regelmäßig aktuelle Informationen über:</p>
    <ul style="padding-left: 20px;">
      <li>Neue Kurse und Workshops</li>
      <li>Spezielle Angebote und Aktionen</li>
      <li>Kreative Tipps und Inspirationen</li>
      <li>Termine und Veranstaltungen</li>
    </ul>
    <p>Wir freuen uns, Sie auf dem Laufenden zu halten!</p>
    <p>Mit freundlichen Grüßen,<br>Ihr Team von Sponk Keramik</p>
  </div>
  <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; margin-top: 20px;">
    <p style="margin: 0; font-size: 12px; color: #666;">Fürstenplatz 15, 40215 Düsseldorf</p>
  </div>
</body>
</html>
        `.trim();

        const emailText = `
Vielen Dank für Ihre Newsletter-Anmeldung!

Hallo,

vielen Dank, dass Sie sich für unseren Newsletter angemeldet haben. Sie erhalten ab sofort regelmäßig aktuelle Informationen über:

- Neue Kurse und Workshops
- Spezielle Angebote und Aktionen
- Kreative Tipps und Inspirationen
- Termine und Veranstaltungen

Wir freuen uns, Sie auf dem Laufenden zu halten!

Mit freundlichen Grüßen,
Ihr Team von Sponk Keramik

Fürstenplatz 15, 40215 Düsseldorf
        `.trim();

        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Sponk Keramik <noreply@sponkkeramik.de>",
            to: [email.toLowerCase().trim()],
            subject: "Newsletter-Anmeldung bestätigt - Sponk Keramik",
            html: emailHtml,
            text: emailText,
          }),
        });

        if (!resendResponse.ok) {
          const errorData = await resendResponse.json();
          console.error("❌ Resend API error:", errorData);
          // Don't fail the subscription if email fails
        } else {
          console.log("✅ Newsletter confirmation email sent via Resend");
        }
      } catch (resendError) {
        console.error("❌ Error sending email via Resend:", resendError);
        // Don't fail the subscription if email fails
      }
    } else {
      console.log("⚠️ RESEND_API_KEY not configured - subscription saved but email not sent");
    }

    return NextResponse.json({
      success: true,
      message: "Newsletter-Anmeldung erfolgreich! Bitte prüfen Sie Ihre E-Mails zur Bestätigung.",
    });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    
    // Check if it's a database error
    if (error && typeof error === "object" && "code" in error) {
      const dbError = error as { code?: string; message?: string };
      if (dbError.code === "PGRST116" || dbError.message?.includes("relation") || dbError.message?.includes("does not exist")) {
        return NextResponse.json(
          {
            error: "Die Newsletter-Tabelle existiert noch nicht. Bitte führen Sie die Migration aus.",
            migrationRequired: true,
            migrationFile: "supabase/migrations/supabase_migration_create_newsletter_subscribers.sql",
          },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Fehler bei der Newsletter-Anmeldung",
      },
      { status: 500 }
    );
  }
}

