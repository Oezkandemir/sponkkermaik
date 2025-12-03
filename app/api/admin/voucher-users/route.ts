/**
 * Admin API Route: Get user emails for vouchers
 * 
 * Returns user emails and names for given user IDs.
 * Only accessible to admins.
 * Uses service role to access auth.users table.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { userIds } = await request.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid user IDs" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Use maybeSingle() to properly check admin status
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    // Check if user is admin - PGRST116 means no rows found (not an admin)
    if (adminError && adminError.code !== "PGRST116") {
      console.error("Error checking admin status:", adminError);
      return NextResponse.json(
        { error: "Error checking admin access" },
        { status: 500 }
      );
    }

    if (!adminData) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Use service role client to access auth.users
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl) {
      console.error("⚠️ NEXT_PUBLIC_SUPABASE_URL not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    
    if (!supabaseServiceKey) {
      console.error("⚠️ SUPABASE_SERVICE_ROLE_KEY not configured - cannot access auth.users");
      console.error("💡 Please add SUPABASE_SERVICE_ROLE_KEY to your environment variables");
      console.error("   You can find it in Supabase Dashboard > Settings > API > service_role key");
      // Return error instead of fallback - profiles table doesn't have emails
      return NextResponse.json(
        { 
          error: "Service role key not configured",
          message: "SUPABASE_SERVICE_ROLE_KEY must be set to access user emails"
        },
        { status: 500 }
      );
    }

    const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const userDataMap: Record<string, { email: string; name: string | null }> = {};

    // Get user emails from auth.users using service role
    // Use batch fetching for better performance
    const batchSize = 10;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (userId) => {
          try {
            const { data: authUser, error: authError } = await serviceClient.auth.admin.getUserById(userId);
            
            if (authError) {
              console.error(`❌ Error fetching user ${userId}:`, authError.message || authError);
              return;
            }
            
            if (authUser?.user?.email) {
              // Ensure email is a valid string, not user_id
              const email = authUser.user.email.trim();
              if (email && email.includes("@") && email !== userId) {
                userDataMap[userId] = {
                  email: email,
                  name: null,
                };
                console.log(`✅ Loaded email for user ${userId.substring(0, 8)}...: ${email}`);
              } else {
                console.warn(`⚠️ Invalid email format for user ${userId}: ${email}`);
              }
            } else {
              console.warn(`⚠️ No email found for user ${userId}`);
            }
          } catch (err) {
            console.error(`❌ Exception fetching user ${userId}:`, err instanceof Error ? err.message : err);
          }
        })
      );
    }
    
    console.log(`📊 Loaded ${Object.keys(userDataMap).length} emails from auth.users`);

    // Also try to get names from profiles table (profiles table doesn't have email column)
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    if (profilesError) {
      console.error("⚠️ Error fetching profiles:", profilesError.message || profilesError);
    }

    if (profilesData) {
      console.log(`📋 Found ${profilesData.length} profiles for name lookup`);
      profilesData.forEach((profile: any) => {
        if (userDataMap[profile.id]) {
          // Update name if we have email but no name
          if (!userDataMap[profile.id].name && profile.full_name) {
            userDataMap[profile.id].name = profile.full_name;
            console.log(`✅ Added name for user ${profile.id.substring(0, 8)}...: ${profile.full_name}`);
          }
        }
        // Note: We don't create entries from profiles alone since they don't have emails
        // All entries must come from auth.users
      });
    }

    // Fill in missing users
    const missingUsers = userIds.filter((userId: string) => !userDataMap[userId]);
    if (missingUsers.length > 0) {
      console.warn(`⚠️ Missing data for ${missingUsers.length} users:`, missingUsers);
      missingUsers.forEach((userId: string) => {
        userDataMap[userId] = {
          email: `User ${userId.substring(0, 8)}...`,
          name: null,
        };
      });
    }

    console.log(`✅ Returning data for ${Object.keys(userDataMap).length} users`);
    return NextResponse.json({ users: userDataMap });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


