import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API Route: Remove from Waitlist
 * 
 * Allows users to remove themselves from the waitlist.
 * Users can only remove their own entries, admins can remove any entry.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const waitlistId = searchParams.get("id");

    if (!waitlistId) {
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get waitlist entry
    const { data: waitlistEntry, error: fetchError } = await supabase
      .from("waitlist")
      .select("*")
      .eq("id", waitlistId)
      .single();

    if (fetchError || !waitlistEntry) {
      return NextResponse.json(
        { error: "Waitlist entry not found" },
        { status: 404 }
      );
    }

    // Check if user is admin
    const { data: adminData } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const isAdmin = !!adminData;
    const isOwner = waitlistEntry.user_id === user.id || 
                    waitlistEntry.customer_email === user.email;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Forbidden - You can only remove your own waitlist entries" },
        { status: 403 }
      );
    }

    // Update status to cancelled instead of deleting (for audit trail)
    const { error: updateError } = await supabase
      .from("waitlist")
      .update({ status: "cancelled" })
      .eq("id", waitlistId);

    if (updateError) {
      console.error("Error removing waitlist entry:", updateError);
      return NextResponse.json(
        { error: "Failed to remove waitlist entry", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully removed from waitlist",
    });

  } catch (error) {
    console.error("Error removing from waitlist:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to remove from waitlist",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}



