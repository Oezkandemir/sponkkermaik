import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

/**
 * User Page Visit Tracking API Route
 * 
 * Tracks page visits for user analytics.
 * Records when users visit pages and how long they stay.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const headersList = await headers();
    
    // Get user info (may be null for anonymous users)
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get request body
    const body = await request.json().catch(() => ({}));
    const { sessionId, pagePath, pageTitle, referrer, action, duration } = body;

    if (!sessionId || !pagePath) {
      return NextResponse.json({ 
        success: false,
        error: "Missing required fields" 
      }, { status: 400 });
    }

    // Use service role client to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      // Silently fail if service key not available
      return NextResponse.json({ success: false });
    }

    const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    if (action === "start") {
      // Create new page visit record
      const { error: insertError } = await serviceClient
        .from("page_visits")
        .insert({
          session_id: sessionId,
          user_id: user?.id || null,
          page_path: pagePath,
          page_title: pageTitle || null,
          referrer: referrer || null,
          visit_started_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error tracking page visit:", insertError);
      }
    } else if (action === "end") {
      // Update existing page visit with end time and duration
      const { error: updateError } = await serviceClient
        .from("page_visits")
        .update({
          visit_ended_at: new Date().toISOString(),
          visit_duration: duration || 0,
        })
        .eq("session_id", sessionId)
        .eq("page_path", pagePath)
        .is("visit_ended_at", null)
        .order("visit_started_at", { ascending: false })
        .limit(1);

      if (updateError) {
        console.error("Error updating page visit:", updateError);
      }
    }

    return NextResponse.json({ 
      success: true,
    });
  } catch (error) {
    console.error("Error in page visit tracking:", error);
    // Return success even on error to not break user experience
    return NextResponse.json({ 
      success: false,
      error: "Failed to track page visit" 
    }, { status: 500 });
  }
}

