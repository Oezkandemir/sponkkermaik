import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * Admin Users Update Names API Route
 * 
 * Updates all users without names to use their email prefix as name.
 * Only updates users that don't already have a name set.
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

    // Use service role client to access and update auth.users
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
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

    // Get all users from auth.users
    let allAuthUsers: any[] = [];
    let page = 1;
    const perPage = 1000;
    
    while (true) {
      const { data: authUsersPage, error: authError } = await serviceClient.auth.admin.listUsers({
        page,
        perPage,
      });

      if (authError) {
        console.error("Error fetching auth users:", authError);
        return NextResponse.json(
          { error: "Failed to fetch users" },
          { status: 500 }
        );
      }

      if (!authUsersPage?.users || authUsersPage.users.length === 0) {
        break;
      }

      allAuthUsers = [...allAuthUsers, ...authUsersPage.users];
      
      if (authUsersPage.users.length < perPage) {
        break;
      }
      
      page++;
    }

    console.log(`Found ${allAuthUsers.length} users to check`);

    // Update users without names
    const updatedUsers: string[] = [];
    const skippedUsers: string[] = [];
    const errors: Array<{ userId: string; error: string }> = [];

    for (const authUser of allAuthUsers) {
      // Check if user already has a name
      const currentName = authUser.user_metadata?.full_name;
      
      if (currentName && currentName.trim()) {
        // User already has a name, skip
        skippedUsers.push(authUser.email || authUser.id);
        continue;
      }

      // Extract email prefix as name
      if (!authUser.email) {
        skippedUsers.push(authUser.id);
        continue;
      }

      const emailPrefix = authUser.email.split("@")[0] || authUser.email;

      try {
        // Update user metadata
        const { data: updatedUser, error: updateError } = await serviceClient.auth.admin.updateUserById(
          authUser.id,
          {
            user_metadata: {
              ...authUser.user_metadata,
              full_name: emailPrefix,
            },
          }
        );

        if (updateError) {
          console.error(`Error updating user ${authUser.id}:`, updateError);
          errors.push({
            userId: authUser.id,
            error: updateError.message,
          });
        } else {
          updatedUsers.push(authUser.email);
          console.log(`Updated user ${authUser.email} with name: ${emailPrefix}`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Exception updating user ${authUser.id}:`, errorMessage);
        errors.push({
          userId: authUser.id,
          error: errorMessage,
        });
      }
    }

    // Also update profiles table if it exists
    let profilesUpdated = 0;
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name");

      if (!profilesError && profiles) {
        // Get updated user metadata
        const usersToUpdate = allAuthUsers
          .filter(u => {
            const hasName = u.user_metadata?.full_name;
            const profile = profiles.find(p => p.id === u.id);
            const profileNeedsUpdate = !profile || !profile.full_name;
            return hasName && profileNeedsUpdate;
          });

        for (const authUser of usersToUpdate) {
          const name = authUser.user_metadata?.full_name;
          if (name) {
            const { error: upsertError } = await supabase
              .from("profiles")
              .upsert({
                id: authUser.id,
                full_name: name,
              }, {
                onConflict: "id",
              });

            if (!upsertError) {
              profilesUpdated++;
            }
          }
        }
      }
    } catch (err) {
      console.error("Error updating profiles table:", err);
      // Don't fail the whole operation if profiles update fails
    }

    return NextResponse.json({
      success: true,
      updated: updatedUsers.length,
      skipped: skippedUsers.length,
      errors: errors.length,
      profilesUpdated,
      details: {
        updatedUsers: updatedUsers.slice(0, 10), // Show first 10
        errors: errors.slice(0, 10), // Show first 10 errors
      },
    });
  } catch (error) {
    console.error("Error updating user names:", error);
    return NextResponse.json(
      { error: "Failed to update user names", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}




