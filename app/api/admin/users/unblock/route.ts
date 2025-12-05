import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * Admin Unblock User API Route
 * 
 * Unblocks a user by removing ban
 */
export async function POST(request: Request) {
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

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Use service role client to update auth.users
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Unblock user by removing ban
    const { error: updateError } = await serviceClient.auth.admin.updateUserById(userId, {
      ban_duration: "0s", // Remove ban
    });

    if (updateError) {
      console.error("Error unblocking user:", updateError);
      return NextResponse.json(
        { error: "Failed to unblock user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unblocking user:", error);
    return NextResponse.json(
      { error: "Failed to unblock user" },
      { status: 500 }
    );
  }
}










