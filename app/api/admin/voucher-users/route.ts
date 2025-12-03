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

    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (adminError || !adminData) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Use service role client to access auth.users
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseServiceKey) {
      console.error("⚠️ SUPABASE_SERVICE_ROLE_KEY not configured - cannot access auth.users");
      console.error("💡 Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file");
      console.error("   You can find it in Supabase Dashboard > Settings > API > service_role key");
      // Fallback to profiles table only
      return await getUsersFromProfiles(userIds);
    }

    const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const userDataMap: Record<string, { email: string; name: string | null }> = {};

    // Get user emails from auth.users using service role
    for (const userId of userIds) {
      try {
        const { data: authUser, error: authError } = await serviceClient.auth.admin.getUserById(userId);
        
        if (authError) {
          console.error(`Error fetching user ${userId}:`, authError);
          continue;
        }
        
        if (authUser?.user?.email) {
          userDataMap[userId] = {
            email: authUser.user.email,
            name: null,
          };
          console.log(`✅ Loaded email for user ${userId}: ${authUser.user.email}`);
        } else {
          console.warn(`⚠️ No email found for user ${userId}`);
        }
      } catch (err) {
        console.error(`Exception fetching user ${userId}:`, err);
      }
    }
    
    console.log(`📊 Loaded ${Object.keys(userDataMap).length} emails from auth.users`);

    // Also try to get names and emails from profiles table (as fallback or supplement)
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    if (profilesData) {
      console.log(`📋 Found ${profilesData.length} profiles`);
      profilesData.forEach((profile: any) => {
        if (userDataMap[profile.id]) {
          // Update name if we have email but no name
          if (!userDataMap[profile.id].name && profile.full_name) {
            userDataMap[profile.id].name = profile.full_name;
          }
          // Update email from profile if we don't have it from auth
          if (!userDataMap[profile.id].email && profile.email) {
            userDataMap[profile.id].email = profile.email;
          }
        } else {
          // If we don't have email from auth, use profile email or fallback
          userDataMap[profile.id] = {
            email: profile.email || `User ${profile.id.substring(0, 8)}...`,
            name: profile.full_name || null,
          };
        }
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

/**
 * Fallback function to get users from profiles table only
 */
async function getUsersFromProfiles(userIds: string[]) {
  const supabase = await createClient();
  const userDataMap: Record<string, { email: string; name: string | null }> = {};

  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .in("id", userIds);

  if (profilesData) {
    profilesData.forEach((profile: any) => {
      userDataMap[profile.id] = {
        email: profile.email || `User ${profile.id.substring(0, 8)}...`,
        name: profile.full_name || null,
      };
    });
  }

  // Fill in missing users
  userIds.forEach((userId: string) => {
    if (!userDataMap[userId]) {
      userDataMap[userId] = {
        email: `User ${userId.substring(0, 8)}...`,
        name: null,
      };
    }
  });

  return NextResponse.json({ users: userDataMap });
}

