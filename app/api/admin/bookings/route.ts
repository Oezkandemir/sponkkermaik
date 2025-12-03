import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin Bookings API Route
 * 
 * Returns all bookings with optimized queries including:
 * - Course titles (via join)
 * - Customer info
 * - Message flags
 * - Participant lists
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

    // Load bookings with course schedule info in parallel with courses and messages
    const [
      { data: bookingsData, error: bookingsError },
      { data: coursesData, error: coursesError },
      { data: messagesData, error: messagesError },
    ] = await Promise.all([
      supabase
        .from("bookings")
        .select(`
          *,
          course_schedule:course_schedule_id (
            course_id
          )
        `)
        .order("booking_date", { ascending: false })
        .order("start_time", { ascending: false }),
      supabase
        .from("courses")
        .select("id, title"),
      supabase
        .from("booking_messages")
        .select("booking_id"),
    ]);

    if (bookingsError) throw bookingsError;
    if (coursesError) throw coursesError;
    if (messagesError) throw messagesError;

    // Create lookup maps
    const courseTitlesMap: Record<string, string> = {};
    (coursesData || []).forEach((course: any) => {
      courseTitlesMap[course.id] = course.title;
    });

    const bookingsWithMessages = new Set(
      (messagesData || []).map((m: any) => m.booking_id)
    );

    // Helper function to extract participant names from notes
    const extractParticipantsFromNotes = (notes: string): string[] => {
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
    };

    // Map bookings with all details
    const bookingsWithDetails = (bookingsData || []).map((booking: any) => {
      const courseId = booking.course_schedule?.course_id;
      const participantList = extractParticipantsFromNotes(booking.notes || "");
      
      return {
        ...booking,
        course_title: courseId ? (courseTitlesMap[courseId] || "Unbekannter Kurs") : "Unbekannter Kurs",
        customer_email: booking.customer_email || (booking.user_id ? `User ${booking.user_id.substring(0, 8)}...` : "Unbekannt"),
        customer_name: booking.customer_name || "Unbekannt",
        hasMessages: bookingsWithMessages.has(booking.id),
        participantList: participantList,
      };
    });

    return NextResponse.json({ bookings: bookingsWithDetails });
  } catch (error) {
    console.error("Error fetching admin bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

