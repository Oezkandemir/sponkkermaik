import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * Admin Online Users API Route
 * 
 * Returns list of currently active users on the site.
 * Users are considered active if they have sent a heartbeat within the last 5 minutes.
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

    // Get all active users (last seen within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data: activeUsers, error: activityError } = await supabase
      .from("user_activity")
      .select(`
        id,
        user_id,
        last_seen,
        session_id,
        user_agent
      `)
      .gte("last_seen", fiveMinutesAgo)
      .order("last_seen", { ascending: false });

    if (activityError) {
      console.error("Error fetching active users:", activityError);
      throw activityError;
    }

    // Get user details for authenticated users using service role client
    const userIds = (activeUsers || [])
      .map((a: any) => a.user_id)
      .filter((id: string | null) => id !== null) as string[];

    let userDetailsMap: Record<string, { email: string; name: string | null }> = {};

    if (userIds.length > 0) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        try {
          const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey, {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          });

          // Fetch user details in batches (limit to 50 at a time to avoid timeouts)
          const batchSize = 50;
          for (let i = 0; i < userIds.length; i += batchSize) {
            const batch = userIds.slice(i, i + batchSize);
            await Promise.all(
              batch.map(async (userId) => {
                try {
                  const { data: authUser, error: userError } = await serviceClient.auth.admin.getUserById(userId);
                  if (!userError && authUser?.user) {
                    userDetailsMap[userId] = {
                      email: authUser.user.email || "",
                      name: authUser.user.user_metadata?.full_name || 
                            authUser.user.user_metadata?.name || 
                            null,
                    };
                  }
                } catch (err) {
                  console.error(`Error fetching user ${userId}:`, err);
                }
              })
            );
          }
        } catch (err) {
          console.error("Error initializing service client:", err);
          // Continue without user details - users will show as "User"
        }
      } else {
        console.warn("Service role key not configured - user details will not be available");
      }
    }

    // Transform the data to include user information
    const onlineUsers = (activeUsers || []).map((activity: any) => {
      const userDetails = activity.user_id ? userDetailsMap[activity.user_id] : null;
      return {
        sessionId: activity.session_id,
        userId: activity.user_id,
        lastSeen: activity.last_seen,
        userAgent: activity.user_agent,
        email: userDetails?.email || null,
        name: userDetails?.name || null,
        displayName: userDetails?.name || 
                     userDetails?.email || 
                     "User",
      };
    });

    // Count unique users (by user_id, not session_id)
    const uniqueUserIds = new Set(
      onlineUsers
        .filter((u) => u.userId !== null)
        .map((u) => u.userId)
    );
    const uniqueUserCount = uniqueUserIds.size;

    // Count anonymous users (no user_id)
    const anonymousCount = onlineUsers.filter((u) => u.userId === null).length;

    return NextResponse.json({
      totalActive: onlineUsers.length,
      uniqueUsers: uniqueUserCount,
      anonymousUsers: anonymousCount,
      users: onlineUsers,
    });
  } catch (error) {
    console.error("Error fetching online users:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch online users",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

