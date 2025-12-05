import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * Admin User Analytics API Route
 * 
 * Returns detailed analytics for a specific user session including:
 * - Page visits
 * - Time spent on each page
 * - User bookings
 * - User vouchers
 * - Account information
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const supabase = await createClient();
    const { sessionId } = await params;

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

    // Get activity record for this session
    const { data: activity, error: activityError } = await supabase
      .from("user_activity")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (activityError || !activity) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Get user details if authenticated
    let userDetails: any = null;
    if (activity.user_id) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });

        const { data: authUser } = await serviceClient.auth.admin.getUserById(activity.user_id);
        if (authUser?.user) {
          userDetails = {
            id: authUser.user.id,
            email: authUser.user.email,
            name: authUser.user.user_metadata?.full_name || 
                  authUser.user.user_metadata?.name || 
                  null,
            createdAt: authUser.user.created_at,
            lastSignInAt: authUser.user.last_sign_in_at,
          };
        }
      }
    }

    // Get page visits for this session (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: pageVisits, error: visitsError } = await supabase
      .from("page_visits")
      .select("*")
      .eq("session_id", sessionId)
      .gte("visit_started_at", oneDayAgo)
      .order("visit_started_at", { ascending: false });

    if (visitsError) {
      console.error("Error fetching page visits:", visitsError);
    }

    // Get user bookings if authenticated
    let bookings: any[] = [];
    if (activity.user_id) {
      const { data: userBookings, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          id,
          booking_date,
          start_time,
          end_time,
          status,
          participants,
          created_at,
          course_schedule:course_schedule_id (
            course_id,
            courses:course_id (
              title
            )
          )
        `)
        .eq("user_id", activity.user_id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!bookingsError && userBookings) {
        bookings = userBookings.map((b: any) => ({
          id: b.id,
          date: b.booking_date,
          time: `${b.start_time} - ${b.end_time}`,
          status: b.status,
          participants: b.participants,
          courseTitle: b.course_schedule?.courses?.title || "Unbekannt",
          createdAt: b.created_at,
        }));
      }
    }

    // Get user vouchers if authenticated
    let vouchers: any[] = [];
    if (activity.user_id) {
      const { data: userVouchers, error: vouchersError } = await supabase
        .from("vouchers")
        .select("id, code, value, status, created_at, valid_until")
        .eq("user_id", activity.user_id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!vouchersError && userVouchers) {
        vouchers = userVouchers.map((v: any) => ({
          id: v.id,
          code: v.code,
          value: v.value,
          status: v.status,
          createdAt: v.created_at,
          validUntil: v.valid_until,
        }));
      }
    }

    // Calculate total time on site
    const totalTimeOnSite = (pageVisits || [])
      .reduce((total, visit) => total + (visit.visit_duration || 0), 0);

    // Get most visited pages
    const pageCounts: Record<string, number> = {};
    (pageVisits || []).forEach((visit: any) => {
      pageCounts[visit.page_path] = (pageCounts[visit.page_path] || 0) + 1;
    });
    const mostVisitedPages = Object.entries(pageCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      session: {
        sessionId: activity.session_id,
        userId: activity.user_id,
        lastSeen: activity.last_seen,
        userAgent: activity.user_agent,
        ipAddress: activity.ip_address,
        createdAt: activity.created_at,
      },
      user: userDetails,
      analytics: {
        totalPageVisits: pageVisits?.length || 0,
        totalTimeOnSite: totalTimeOnSite, // in seconds
        mostVisitedPages: mostVisitedPages,
        recentVisits: (pageVisits || []).slice(0, 20).map((visit: any) => ({
          path: visit.page_path,
          title: visit.page_title,
          duration: visit.visit_duration || 0,
          startedAt: visit.visit_started_at,
          endedAt: visit.visit_ended_at,
          referrer: visit.referrer,
        })),
      },
      bookings: bookings,
      vouchers: vouchers,
    });
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch user analytics",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

