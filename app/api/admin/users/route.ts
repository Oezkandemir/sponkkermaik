import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * Admin Users API Route
 * 
 * Handles user management operations:
 * - GET: List all authenticated platform users (from auth.users)
 * - PUT: Update user (admin rights)
 */
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    // Use service role client to access auth.users
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

    // Get all users from auth.users using service role (with pagination)
    let allAuthUsers: any[] = [];
    let page = 1;
    const perPage = 1000; // Supabase default max
    
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
      
      // If we got fewer users than perPage, we've reached the end
      if (authUsersPage.users.length < perPage) {
        break;
      }
      
      page++;
    }

    console.log(`Loaded ${allAuthUsers.length} users from auth.users`);

    // Get admin user IDs - use service client to bypass RLS if needed
    let adminList: any[] = [];
    
    try {
      const { data: admins, error: adminsError } = await serviceClient
        .from("admins")
        .select("user_id");

      if (adminsError) {
        console.error("Error loading admins with service client:", adminsError);
        // Fallback: try with regular client
        const { data: adminsFallback, error: fallbackError } = await supabase
          .from("admins")
          .select("user_id");
        
        if (fallbackError) {
          console.error("Error loading admins with fallback client:", fallbackError);
        } else if (adminsFallback) {
          console.log("Loaded admins with fallback client");
          adminList = adminsFallback;
        }
      } else {
        adminList = admins || [];
      }
    } catch (err) {
      console.error("Exception loading admins:", err);
      // Final fallback: try with regular client
      const { data: adminsFallback } = await supabase
        .from("admins")
        .select("user_id");
      if (adminsFallback) {
        adminList = adminsFallback;
      }
    }

    const adminIds = new Set(adminList.map((a) => a.user_id));
    console.log(`Found ${adminIds.size} admins:`, Array.from(adminIds).map(id => id.substring(0, 8) + "..."));
    
    // Debug: Log admin emails
    const adminEmails = allAuthUsers
      .filter(u => adminIds.has(u.id))
      .map(u => u.email);
    console.log(`Admin emails:`, adminEmails);
    
    // Debug: Check if sponkkeramik@gmail.com exists in auth.users
    const sponkUser = allAuthUsers.find(u => u.email === "sponkkeramik@gmail.com");
    if (sponkUser) {
      console.log(`🔍 sponkkeramik@gmail.com user ID:`, sponkUser.id);
      console.log(`🔍 Is in adminIds:`, adminIds.has(sponkUser.id));
    } else {
      console.log(`⚠️ sponkkeramik@gmail.com not found in auth.users`);
    }

    // Get bookings and vouchers counts for all users
    const { data: bookings } = await supabase
      .from("bookings")
      .select("user_id, customer_name, customer_email, created_at");

    const { data: vouchers } = await supabase
      .from("vouchers")
      .select("user_id");

    // Create maps for quick lookup (users with accounts)
    const bookingsByUserId: Record<string, { count: number; name: string | null; email: string | null }> = {};
    bookings?.forEach((b) => {
      if (b.user_id) {
        if (!bookingsByUserId[b.user_id]) {
          bookingsByUserId[b.user_id] = { count: 0, name: null, email: null };
        }
        bookingsByUserId[b.user_id].count++;
        if (b.customer_name && !bookingsByUserId[b.user_id].name) {
          bookingsByUserId[b.user_id].name = b.customer_name;
        }
        if (b.customer_email && !bookingsByUserId[b.user_id].email) {
          bookingsByUserId[b.user_id].email = b.customer_email;
        }
      }
    });

    // Create a map of all auth user emails (normalized for comparison)
    const authUserEmailsMap = new Map<string, string>(); // normalized email -> original email
    allAuthUsers.forEach((authUser) => {
      if (authUser.email) {
        const normalized = authUser.email.toLowerCase().trim();
        authUserEmailsMap.set(normalized, authUser.email);
      }
    });

    // Track bookings without accounts (by email)
    // Only include bookings where user_id is null AND the email doesn't exist in auth.users
    const bookingsWithoutAccount: Record<string, { 
      count: number; 
      name: string | null; 
      email: string; 
      first_booking: string | null;
    }> = {};
    
    bookings?.forEach((b) => {
      // Only process bookings without user_id
      if (!b.user_id && b.customer_email) {
        const email = b.customer_email.toLowerCase().trim();
        
        // Check if this email exists in auth.users
        // If it exists, skip it (user has account, will be shown in usersWithAccounts)
        if (authUserEmailsMap.has(email)) {
          return; // Skip - user has account
        }
        
        // User doesn't have account, add to list
        if (!bookingsWithoutAccount[email]) {
          bookingsWithoutAccount[email] = { 
            count: 0, 
            name: null, 
            email: b.customer_email, // Use original email (not normalized)
            first_booking: b.created_at || null,
          };
        }
        bookingsWithoutAccount[email].count++;
        if (b.customer_name && !bookingsWithoutAccount[email].name) {
          bookingsWithoutAccount[email].name = b.customer_name;
        }
        // Use earliest booking date
        if (b.created_at && (!bookingsWithoutAccount[email].first_booking || b.created_at < bookingsWithoutAccount[email].first_booking!)) {
          bookingsWithoutAccount[email].first_booking = b.created_at;
        }
      }
    });

    const vouchersByUserId: Record<string, number> = {};
    vouchers?.forEach((v) => {
      if (v.user_id) {
        vouchersByUserId[v.user_id] = (vouchersByUserId[v.user_id] || 0) + 1;
      }
    });

    // Build user list from auth.users (users with accounts)
    const usersWithAccounts = allAuthUsers.map((authUser) => {
      const userId = authUser.id;
      const bookingInfo = bookingsByUserId[userId];
      const isAdmin = adminIds.has(userId);
      
      // Debug logging for specific email
      if (authUser.email === "sponkkeramik@gmail.com") {
        console.log(`🔍 Found sponkkeramik@gmail.com:`, {
          userId,
          email: authUser.email,
          isAdmin,
          adminIds: Array.from(adminIds),
          isInAdminSet: adminIds.has(userId),
          has_account: true,
        });
      }
      
      return {
        id: userId,
        email: authUser.email || bookingInfo?.email || `User ${userId.substring(0, 8)}...`,
        name: authUser.user_metadata?.full_name || bookingInfo?.name || null,
        is_admin: isAdmin,
        has_account: true, // All users from auth.users have accounts
        bookings_count: bookingInfo?.count || 0,
        vouchers_count: vouchersByUserId[userId] || 0,
        created_at: authUser.created_at,
      };
    });

    console.log(`📊 Users with accounts: ${usersWithAccounts.length}`);
    console.log(`📊 Users without accounts: ${Object.keys(bookingsWithoutAccount).length}`);
    console.log(`📊 Total users: ${usersWithAccounts.length + Object.keys(bookingsWithoutAccount).length}`);

    // Build user list from bookings without accounts
    // These are already filtered to exclude emails that exist in auth.users
    const usersWithoutAccounts = Object.values(bookingsWithoutAccount).map((booking) => ({
      id: `no-account-${booking.email}`, // Unique ID for users without account
      email: booking.email,
      name: booking.name,
      is_admin: false,
      has_account: false,
      bookings_count: booking.count,
      vouchers_count: 0,
      created_at: booking.first_booking,
    }));

    // Combine both lists
    const users = [...usersWithAccounts, ...usersWithoutAccounts];

    // Apply search filter
    let filteredUsers = users;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = users.filter(
        (u) =>
          u.email.toLowerCase().includes(searchLower) ||
          u.name?.toLowerCase().includes(searchLower) ||
          u.id.toLowerCase().includes(searchLower)
      );
    }

    // Sort by created_at (newest first)
    filteredUsers.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ users: filteredUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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
      .single();

    if (!adminCheck) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, is_admin } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Update admin status
    if (is_admin !== undefined) {
      if (is_admin) {
        // Add to admins table
        const { error } = await supabase
          .from("admins")
          .insert({ user_id: userId })
          .select()
          .single();

        if (error && error.code !== "23505") {
          // 23505 = duplicate key, which is fine
          throw error;
        }
      } else {
        // Remove from admins table
        const { error } = await supabase
          .from("admins")
          .delete()
          .eq("user_id", userId);

        if (error) throw error;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

