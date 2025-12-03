import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin Newsletter API Route
 * 
 * Returns all newsletter subscribers for admin dashboard.
 */
export async function GET() {
  try {
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

    // Load all subscribers
    const { data: subscribers, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false });

    // Check if table doesn't exist (PGRST116 = relation does not exist)
    if (error && (error.code === "PGRST116" || error.message?.includes("relation") || error.message?.includes("does not exist"))) {
      console.error("❌ Newsletter table does not exist:", error);
      return NextResponse.json(
        {
          error: "Die Newsletter-Tabelle existiert noch nicht. Bitte führen Sie die Migration aus.",
          migrationRequired: true,
          migrationFile: "supabase/migrations/supabase_migration_create_newsletter_subscribers.sql",
        },
        { status: 500 }
      );
    }

    if (error) throw error;

    return NextResponse.json({
      subscribers: subscribers || [],
    });
  } catch (error) {
    console.error("Error fetching newsletter subscribers:", error);
    
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
        error: "Failed to fetch subscribers",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

