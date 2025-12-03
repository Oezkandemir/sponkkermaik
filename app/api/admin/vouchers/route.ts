import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * Admin Vouchers API Route
 * 
 * Returns all vouchers with optimized queries including:
 * - User emails and names (via service client)
 * - Message flags
 * - Payment method info
 */
export async function GET() {
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

    // Load vouchers and messages in parallel
    const [
      { data: vouchersData, error: vouchersError },
      { data: messagesData, error: messagesError },
    ] = await Promise.all([
      supabase
        .from("vouchers")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("voucher_messages")
        .select("voucher_id"),
    ]);

    if (vouchersError) throw vouchersError;
    if (messagesError) throw messagesError;

    // Create messages set for quick lookup
    const vouchersWithMessages = new Set(
      (messagesData || []).map((m: any) => m.voucher_id)
    );

    // Get unique user IDs
    const userIds = [...new Set((vouchersData || []).map((v: any) => v.user_id).filter(Boolean))];
    
    // Fetch user data using service client (if available)
    const userDataMap: Record<string, { email: string; name: string | null }> = {};
    
    if (userIds.length > 0) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (supabaseUrl && supabaseServiceKey) {
        try {
          const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey, {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          });

          // Fetch users in parallel batches for better performance
          const batchSize = 10;
          const batches: Promise<void>[] = [];
          
          for (let i = 0; i < userIds.length; i += batchSize) {
            const batch = userIds.slice(i, i + batchSize);
            batches.push(
              Promise.all(
                batch.map(async (userId) => {
                  try {
                    const { data: authUser, error: authError } = await serviceClient.auth.admin.getUserById(userId);
                    
                    if (!authError && authUser?.user?.email) {
                      const email = authUser.user.email.trim();
                      if (email && email.includes("@")) {
                        userDataMap[userId] = {
                          email: email,
                          name: authUser.user.user_metadata?.name || authUser.user.user_metadata?.full_name || null,
                        };
                      }
                    }
                  } catch (err) {
                    // Silently continue - will use fallback
                  }
                })
              ).then(() => {})
            );
          }
          
          await Promise.all(batches);
          
          // Also get names from profiles table
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", userIds);
          
          if (profilesData) {
            profilesData.forEach((profile: any) => {
              if (userDataMap[profile.id] && !userDataMap[profile.id].name && profile.full_name) {
                userDataMap[profile.id].name = profile.full_name;
              }
            });
          }
        } catch (serviceError) {
          console.error("Error fetching user data:", serviceError);
          // Continue without user data - will use fallbacks
        }
      }
    }

    // Map vouchers with all details
    const vouchersWithDetails = (vouchersData || []).map((voucher: any) => {
      const userData = userDataMap[voucher.user_id];
      
      // Extract email prefix as name if no name is available
      let customerName: string;
      let userEmail: string;
      
      if (userData && userData.email) {
        userEmail = userData.email;
        customerName = userData.name || userData.email.split("@")[0];
      } else {
        userEmail = `User ${voucher.user_id?.substring(0, 8)}...`;
        customerName = userEmail;
      }
      
      // Determine payment method
      const paymentMethod = voucher.paypal_order_id ? "paypal" : "bank_transfer";
      
      return {
        ...voucher,
        user_email: userEmail,
        customer_name: customerName,
        payment_method: paymentMethod,
        hasMessages: vouchersWithMessages.has(voucher.id),
      };
    });

    return NextResponse.json({ vouchers: vouchersWithDetails });
  } catch (error) {
    console.error("Error fetching admin vouchers:", error);
    return NextResponse.json(
      { error: "Failed to fetch vouchers" },
      { status: 500 }
    );
  }
}

