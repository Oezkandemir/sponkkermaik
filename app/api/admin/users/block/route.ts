import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * Admin Block User API Route
 * 
 * Blocks a user by setting banned_until date in auth.users
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

    // Prevent blocking admins
    const { data: targetAdminCheck } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (targetAdminCheck) {
      return NextResponse.json(
        { error: "Cannot block admin users" },
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

    // Block user by setting banned_until to 1 year from now
    const bannedUntil = new Date();
    bannedUntil.setFullYear(bannedUntil.getFullYear() + 1);

    const { error: updateError } = await serviceClient.auth.admin.updateUserById(userId, {
      ban_duration: "8760h", // 1 year in hours
    });

    if (updateError) {
      console.error("Error blocking user:", updateError);
      return NextResponse.json(
        { error: "Failed to block user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error blocking user:", error);
    return NextResponse.json(
      { error: "Failed to block user" },
      { status: 500 }
    );
  }
}





