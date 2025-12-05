import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin Waitlist API Route
 * 
 * Returns all waitlist entries with course information for admin management.
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
      .single();

    if (!adminCheck) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Load waitlist entries with course information and time slot
    const { data: waitlistEntries, error: waitlistError } = await supabase
      .from("waitlist")
      .select(`
        *,
        course:course_id (
          id,
          title
        ),
        preferred_time_slot:preferred_time_slot_id (
          id,
          start_time,
          end_time,
          day_of_week
        )
      `)
      .order("created_at", { ascending: false });

    if (waitlistError) {
      throw waitlistError;
    }

    // Format the response
    const formattedEntries = (waitlistEntries || []).map((entry: any) => ({
      id: entry.id,
      courseId: entry.course_id,
      courseTitle: entry.course?.title || entry.course_id,
      userId: entry.user_id,
      customerName: entry.customer_name,
      customerEmail: entry.customer_email,
      participants: entry.participants,
      participantNames: entry.participant_names,
      autoBook: entry.auto_book,
      status: entry.status,
      convertedBookingId: entry.converted_booking_id,
      createdAt: entry.created_at,
      notifiedAt: entry.notified_at,
      convertedAt: entry.converted_at,
      preferredDate: entry.preferred_date,
      preferredTimeSlot: entry.preferred_time_slot ? {
        id: entry.preferred_time_slot.id,
        startTime: entry.preferred_time_slot.start_time,
        endTime: entry.preferred_time_slot.end_time,
        dayOfWeek: entry.preferred_time_slot.day_of_week,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      waitlistEntries: formattedEntries,
      total: formattedEntries.length,
    });
  } catch (error) {
    console.error("Error fetching waitlist entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch waitlist entries" },
      { status: 500 }
    );
  }
}



