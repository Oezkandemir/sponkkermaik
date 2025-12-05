import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

/**
 * User Activity Heartbeat API Route
 * 
 * Updates or creates a user activity record to indicate the user is currently active.
 * This endpoint should be called periodically (every 30-60 seconds) by the client.
 * 
 * Uses service role client to bypass RLS and ensure all users can track their activity.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const headersList = await headers();
    
    // Get user info (may be null for anonymous users)
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get session ID from request body
    // Handle both JSON and text/plain (for sendBeacon)
    let body: any = {};
    const contentType = headersList.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      body = await request.json().catch(() => ({}));
    } else if (contentType.includes("text/plain")) {
      // sendBeacon sends as text/plain
      const text = await request.text().catch(() => "");
      try {
        body = JSON.parse(text);
      } catch {
        body = {};
      }
    } else {
      // Try to parse as JSON anyway
      body = await request.json().catch(() => ({}));
    }
    
    const sessionId = body.sessionId || `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Get user agent and IP from headers
    const userAgent = headersList.get("user-agent") || null;
    const ipAddress = headersList.get("x-forwarded-for") || 
                     headersList.get("x-real-ip") || 
                     null;

    // Use service role client to bypass RLS and ensure all users can track activity
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn("Service role key not configured - falling back to regular client");
      // Fallback to regular client if service key not available
      const { error: upsertError } = await supabase
        .from("user_activity")
        .upsert(
          {
            session_id: sessionId,
            user_id: user?.id || null,
            last_seen: new Date().toISOString(),
            user_agent: userAgent,
            ip_address: ipAddress,
          },
          {
            onConflict: "session_id",
          }
        );

      if (upsertError) {
        console.error("Error updating user activity (fallback):", upsertError);
      }

      return NextResponse.json({ 
        success: !upsertError,
        sessionId,
        userId: user?.id || null,
      });
    }

    // Use service role client to bypass RLS
    const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: upsertData, error: upsertError } = await serviceClient
      .from("user_activity")
      .upsert(
        {
          session_id: sessionId,
          user_id: user?.id || null,
          last_seen: new Date().toISOString(),
          user_agent: userAgent,
          ip_address: ipAddress,
        },
        {
          onConflict: "session_id",
        }
      )
      .select();

    if (upsertError) {
      console.error("Error updating user activity:", {
        error: upsertError,
        code: upsertError.code,
        message: upsertError.message,
        details: upsertError.details,
        hint: upsertError.hint,
        sessionId,
        userId: user?.id,
        userEmail: user?.email,
      });
    } else {
      // Log successful heartbeat in development
      if (process.env.NODE_ENV === 'development') {
        console.log("Heartbeat saved:", {
          sessionId,
          userId: user?.id,
          userEmail: user?.email,
          recordsUpdated: upsertData?.length || 0,
        });
      }
    }

    return NextResponse.json({ 
      success: !upsertError,
      sessionId,
      userId: user?.id || null,
      userEmail: user?.email || null,
    });
  } catch (error) {
    console.error("Error in heartbeat:", error);
    // Return success even on error to not break user experience
    return NextResponse.json({ 
      success: false,
      error: "Failed to update activity" 
    }, { status: 500 });
  }
}

