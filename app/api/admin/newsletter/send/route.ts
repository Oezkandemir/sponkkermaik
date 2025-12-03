import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin Newsletter Send API Route
 * 
 * Sends newsletter to subscribers via Resend API.
 */
export async function POST(request: NextRequest) {
  try {
    const { subject, htmlContent, recipientType } = await request.json();

    // Validate input
    if (!subject || !htmlContent) {
      return NextResponse.json(
        { error: "Betreff und Inhalt sind erforderlich" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: adminCheck } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!adminCheck) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get subscribers based on recipient type
    let subscribersQuery = supabase
      .from("newsletter_subscribers")
      .select("email");

    if (recipientType === "active") {
      subscribersQuery = subscribersQuery.is("unsubscribed_at", null);
    }

    const { data: subscribers, error: subscribersError } = await subscribersQuery;

    if (subscribersError) {
      console.error("Error fetching subscribers:", subscribersError);
      throw subscribersError;
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        { error: "Keine Empfänger gefunden" },
        { status: 400 }
      );
    }

    // Prepare email HTML with professional template
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); padding: 40px 20px; text-align: center;">
              <img src="https://www.sponkkeramik.de/images/emaillogo.webp" alt="Sponk Keramik Logo" style="max-width: 400px; width: 100%; height: auto; display: block; margin: 0 auto;" />
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${htmlContent}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                <strong style="color: #1f2937;">Sponk Keramik</strong><br>
                Fürstenplatz 15<br>
                40215 Düsseldorf
              </p>
              <p style="margin: 15px 0 0 0; font-size: 12px; color: #9ca3af;">
                <a href="https://www.sponkkeramik.de/newsletter/unsubscribe?email={{EMAIL}}" style="color: #6b7280; text-decoration: underline;">Vom Newsletter abmelden</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    // Generate plain text version from HTML
    const emailText = htmlContent
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n\n$1\n")
      .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
      .replace(/<div[^>]*style="[^"]*text-align:\s*center[^"]*"[^>]*>/gi, "")
      .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, "$2 ($1)")
      .replace(/<img[^>]*alt=["']([^"']*)["'][^>]*>/gi, "[$1]")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<strong>(.*?)<\/strong>/gi, "$1")
      .replace(/<em>(.*?)<\/em>/gi, "$1")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Send emails via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY nicht konfiguriert" },
        { status: 500 }
      );
    }

    // Send emails in batches to avoid rate limits
    const batchSize = 10;
    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      // Send emails in parallel for this batch
      const emailPromises = batch.map(async (subscriber: { email: string }) => {
        try {
          // Replace email placeholder in unsubscribe link
          const personalizedHtml = emailHtml.replace(/\{\{EMAIL\}\}/g, encodeURIComponent(subscriber.email));

          const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: "Sponk Keramik <noreply@sponkkeramik.de>",
              to: [subscriber.email],
              subject: subject.trim(),
              html: personalizedHtml,
              text: emailText,
            }),
          });

          if (!resendResponse.ok) {
            const errorData = await resendResponse.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to send email");
          }

          sentCount++;
          return { success: true, email: subscriber.email };
        } catch (error) {
          failedCount++;
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          errors.push(`${subscriber.email}: ${errorMessage}`);
          return { success: false, email: subscriber.email, error: errorMessage };
        }
      });

      await Promise.all(emailPromises);

      // Small delay between batches to avoid rate limits
      if (i + batchSize < subscribers.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`✅ Newsletter sent: ${sentCount} successful, ${failedCount} failed`);

    return NextResponse.json({
      success: true,
      sentCount,
      failedCount,
      totalRecipients: subscribers.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error sending newsletter:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Fehler beim Versenden des Newsletters",
      },
      { status: 500 }
    );
  }
}

