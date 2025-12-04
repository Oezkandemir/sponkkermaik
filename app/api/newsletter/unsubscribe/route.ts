import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Newsletter Unsubscribe API Route
 * 
 * Handles newsletter unsubscription by setting unsubscribed_at timestamp.
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

    // Check if subscriber exists
    const { data: subscriber, error: checkError } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, unsubscribed_at")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    // Check if table doesn't exist
    if (checkError && checkError.code === "PGRST116") {
      console.error("❌ Newsletter table does not exist:", checkError);
      return NextResponse.json(
        {
          error: "Die Newsletter-Tabelle existiert noch nicht.",
          migrationRequired: true,
        },
        { status: 500 }
      );
    }

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    // If subscriber doesn't exist, return success anyway (don't reveal if email exists)
    if (!subscriber) {
      return NextResponse.json({
        success: true,
        message: "Sie wurden erfolgreich abgemeldet.",
      });
    }

    // If already unsubscribed, return success
    if (subscriber.unsubscribed_at) {
      return NextResponse.json({
        success: true,
        message: "Sie sind bereits abgemeldet.",
      });
    }

    // Mark as unsubscribed
    const { error: updateError } = await supabase
      .from("newsletter_subscribers")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("Error unsubscribing:", updateError);
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: "Sie wurden erfolgreich vom Newsletter abgemeldet.",
    });
  } catch (error) {
    console.error("Error unsubscribing from newsletter:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Fehler bei der Abmeldung vom Newsletter",
      },
      { status: 500 }
    );
  }
}






