import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API Route: Get Voucher Messages
 * 
 * Returns all messages for a specific voucher.
 * Accessible to admins and the voucher owner.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const voucherId = searchParams.get("voucherId");

    if (!voucherId) {
      return NextResponse.json(
        { error: "Missing voucherId parameter" },
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

    // Get voucher to check access
    const { data: voucher, error: voucherError } = await supabase
      .from("vouchers")
      .select("user_id")
      .eq("id", voucherId)
      .single();

    if (voucherError || !voucher) {
      return NextResponse.json(
        { error: "Voucher not found" },
        { status: 404 }
      );
    }

    // Check if user is admin or voucher owner
    const { data: adminData } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const isAdmin = !!adminData;
    const isOwner = voucher.user_id === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from("voucher_messages")
      .select("*")
      .eq("voucher_id", voucherId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Error fetching voucher messages:", messagesError);
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      messages: messages || []
    });

  } catch (error) {
    console.error("Error fetching voucher messages:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch messages",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}


