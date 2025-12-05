import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API Route: Add to Waitlist
 * 
 * Allows customers to join the waitlist for a fully booked course.
 * Validates that the course exists and prevents duplicate entries.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      courseId, 
      customerName, 
      customerEmail, 
      participants = 1,
      participantNames = [],
      autoBook = false,
      preferredDate = null,
      preferredTimeSlotId = null
    } = body;

    // Validate required fields
    if (!courseId || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: "Missing required fields: courseId, customerName, customerEmail" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate participants
    if (participants < 1) {
      return NextResponse.json(
        { error: "Participants must be at least 1" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if user is authenticated (optional)
    let userId = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    } catch (authError) {
      console.error("Error getting user:", authError);
      // Continue without user ID - anonymous waitlist entries are allowed
    }

    // Verify course exists
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title")
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if user already has a pending waitlist entry for this course
    const { data: existingEntry, error: checkError } = await supabase
      .from("waitlist")
      .select("id")
      .eq("course_id", courseId)
      .eq("customer_email", customerEmail)
      .eq("status", "pending")
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing waitlist entry:", checkError);
      return NextResponse.json(
        { error: "Error checking waitlist", details: checkError.message },
        { status: 500 }
      );
    }

    if (existingEntry) {
      return NextResponse.json(
        { error: "You are already on the waitlist for this course" },
        { status: 409 }
      );
    }

    // Prepare participant names string
    let participantNamesStr = null;
    if (participantNames && Array.isArray(participantNames) && participantNames.length > 0) {
      const namesList = participantNames
        .filter((name: string) => name && name.trim())
        .slice(0, participants - 1)
        .map((name: string, index: number) => `Teilnehmer ${index + 2}: ${name.trim()}`)
        .join("\n");
      participantNamesStr = namesList || null;
    }

    // Create waitlist entry
    const insertData: {
      course_id: string;
      user_id: string | null;
      customer_name: string;
      customer_email: string;
      participants: number;
      participant_names: string | null;
      auto_book: boolean;
      status: string;
      preferred_date: string | null;
      preferred_time_slot_id: string | null;
    } = {
      course_id: courseId,
      user_id: userId,
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim(),
      participants: participants,
      participant_names: participantNamesStr,
      auto_book: autoBook,
      status: "pending",
      preferred_date: preferredDate || null,
      preferred_time_slot_id: preferredTimeSlotId || null,
    };

    console.log("Inserting waitlist entry:", { ...insertData, customer_email: "[REDACTED]" });

    const { data: waitlistEntry, error: insertError } = await supabase
      .from("waitlist")
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error("Error creating waitlist entry:", insertError);
      console.error("Error code:", insertError.code);
      console.error("Error message:", insertError.message);
      console.error("Error details:", insertError.details);
      console.error("Error hint:", insertError.hint);
      
      // Check if it's a duplicate entry error
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "You are already on the waitlist for this course" },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Failed to add to waitlist", 
          details: insertError.message,
          code: insertError.code,
          hint: insertError.hint
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully added to waitlist",
      waitlistEntry,
    });

  } catch (error) {
    console.error("Error adding to waitlist:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof Error ? error.stack : String(error);
    console.error("Error details:", errorDetails);
    
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to add to waitlist",
        message: errorMessage,
        details: process.env.NODE_ENV === "development" ? errorDetails : undefined
      },
      { status: 500 }
    );
  }
}


