import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API Route: Check Availability and Process Waitlist
 * 
 * Called when a booking is cancelled or modified to check if waitlist entries
 * can be converted to bookings or notified.
 * Processes waitlist entries in FIFO order (oldest first).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "Missing required field: courseId" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get course information
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title, capacity")
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Get all pending waitlist entries for this course, ordered by created_at (FIFO)
    const { data: waitlistEntries, error: waitlistError } = await supabase
      .from("waitlist")
      .select("*")
      .eq("course_id", courseId)
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (waitlistError) {
      console.error("Error fetching waitlist entries:", waitlistError);
      return NextResponse.json(
        { error: "Failed to fetch waitlist entries", details: waitlistError.message },
        { status: 500 }
      );
    }

    if (!waitlistEntries || waitlistEntries.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending waitlist entries",
        processed: 0,
      });
    }

    // Get all time slots for this course
    const { data: timeSlots, error: slotsError } = await supabase
      .from("course_schedule")
      .select("*")
      .eq("course_id", courseId)
      .eq("is_active", true);

    if (slotsError) {
      console.error("Error fetching time slots:", slotsError);
      return NextResponse.json(
        { error: "Failed to fetch time slots", details: slotsError.message },
        { status: 500 }
      );
    }

    if (!timeSlots || timeSlots.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active time slots for this course",
        processed: 0,
      });
    }

    const defaultCapacity = course.capacity || 12;
    const processedEntries: any[] = [];

    // Process each waitlist entry
    for (const entry of waitlistEntries) {
      // Find next available slot with enough capacity
      const availableSlot = await findAvailableSlot(
        supabase,
        timeSlots,
        entry.participants,
        defaultCapacity
      );

      if (!availableSlot) {
        // No available slot found, skip this entry
        continue;
      }

      if (entry.auto_book) {
        // Automatically create booking
        const bookingResult = await createBookingFromWaitlist(
          supabase,
          entry,
          availableSlot
        );

        if (bookingResult.success) {
          // Update waitlist entry status
          await supabase
            .from("waitlist")
            .update({
              status: "converted",
              converted_booking_id: bookingResult.bookingId,
              converted_at: new Date().toISOString(),
            })
            .eq("id", entry.id);

          processedEntries.push({
            entryId: entry.id,
            action: "converted",
            bookingId: bookingResult.bookingId,
          });
        }
      } else {
        // Send notification email
        const notificationResult = await sendWaitlistNotification(
          entry,
          course.title,
          availableSlot
        );

        if (notificationResult) {
          // Update waitlist entry status
          await supabase
            .from("waitlist")
            .update({
              status: "notified",
              notified_at: new Date().toISOString(),
            })
            .eq("id", entry.id);

          processedEntries.push({
            entryId: entry.id,
            action: "notified",
          });
        }
      }

      // Only process one entry at a time to avoid conflicts
      break;
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processedEntries.length} waitlist entry/entries`,
      processed: processedEntries.length,
      entries: processedEntries,
    });

  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to check availability",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * Finds the next available slot with enough capacity for the requested participants
 */
async function findAvailableSlot(
  supabase: any,
  timeSlots: any[],
  requestedParticipants: number,
  defaultCapacity: number
): Promise<{ slot: any; date: Date; availablePlaces: number } | null> {
  const today = new Date();
  const maxDaysAhead = 90; // Check up to 90 days ahead

  for (let dayOffset = 0; dayOffset < maxDaysAhead; dayOffset++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + dayOffset);
    const dayOfWeek = checkDate.getDay();

    // Format date as YYYY-MM-DD
    const year = checkDate.getFullYear();
    const month = String(checkDate.getMonth() + 1).padStart(2, "0");
    const day = String(checkDate.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    // Find slots for this day of week
    const daySlots = timeSlots.filter((slot) => slot.day_of_week === dayOfWeek);

    for (const slot of daySlots) {
      // Get total capacity for this slot
      const totalCapacity = slot.capacity || defaultCapacity;

      // Get booked capacity for this slot and date
      const { data: bookings } = await supabase
        .from("bookings")
        .select("participants")
        .eq("course_schedule_id", slot.id)
        .eq("booking_date", dateString)
        .in("status", ["pending", "confirmed"]);

      const bookedPlaces =
        bookings?.reduce((sum: number, b: any) => sum + (b.participants || 1), 0) || 0;
      const availablePlaces = Math.max(0, totalCapacity - bookedPlaces);

      if (availablePlaces >= requestedParticipants) {
        return {
          slot,
          date: checkDate,
          availablePlaces,
        };
      }
    }
  }

  return null;
}

/**
 * Creates a booking from a waitlist entry
 */
async function createBookingFromWaitlist(
  supabase: any,
  entry: any,
  availableSlot: { slot: any; date: Date; availablePlaces: number }
): Promise<{ success: boolean; bookingId?: string }> {
  try {
    const bookingDate = availableSlot.date;
    const year = bookingDate.getFullYear();
    const month = String(bookingDate.getMonth() + 1).padStart(2, "0");
    const day = String(bookingDate.getDate()).padStart(2, "0");
    const bookingDateString = `${year}-${month}-${day}`;

    // Prepare notes with waitlist indication
    let bookingNotes = "⚠️ WARTELISTEN-BUCHUNG: Automatisch gebucht von der Warteliste\n\n";
    if (entry.participant_names) {
      bookingNotes += entry.participant_names;
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: entry.user_id,
        course_schedule_id: availableSlot.slot.id,
        booking_date: bookingDateString,
        start_time: availableSlot.slot.start_time,
        end_time: availableSlot.slot.end_time,
        status: "confirmed",
        notes: bookingNotes.trim(),
        participants: entry.participants,
        customer_name: entry.customer_name,
        customer_email: entry.customer_email,
      })
      .select()
      .single();

    if (bookingError || !booking) {
      console.error("Error creating booking from waitlist:", bookingError);
      return { success: false };
    }

    // Send confirmation email
    try {
      const courseTitle = entry.course_id; // We'll get the actual title in the email function
      const formattedDate = bookingDate.toLocaleDateString("de-DE", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const formattedTime = `${availableSlot.slot.start_time} - ${availableSlot.slot.end_time}`;

      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/bookings/send-confirmation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking.id,
          customerName: entry.customer_name,
          customerEmail: entry.customer_email,
          courseTitle: courseTitle,
          bookingDate: formattedDate,
          bookingTime: formattedTime,
        }),
      });
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Don't fail the booking if email fails
    }

    return { success: true, bookingId: booking.id };
  } catch (error) {
    console.error("Error creating booking from waitlist:", error);
    return { success: false };
  }
}

/**
 * Sends notification email when a spot becomes available
 */
async function sendWaitlistNotification(
  entry: any,
  courseTitle: string,
  availableSlot: { slot: any; date: Date; availablePlaces: number }
): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/waitlist/send-notification`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          waitlistEntryId: entry.id,
          customerName: entry.customer_name,
          customerEmail: entry.customer_email,
          courseTitle: courseTitle,
          courseId: entry.course_id,
          availableSlot: {
            date: availableSlot.date.toISOString(),
            startTime: availableSlot.slot.start_time,
            endTime: availableSlot.slot.end_time,
            availablePlaces: availableSlot.availablePlaces,
          },
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Error sending waitlist notification:", error);
    return false;
  }
}


