import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin Invoices API Route
 * 
 * GET: Returns all invoices (with optional status filter)
 * POST: Creates a new invoice (delegated to /create route)
 */
export async function GET(request: NextRequest) {
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

    // Get status filter from query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Build query
    let query = supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: invoices, error } = await query;

    if (error) throw error;

    return NextResponse.json({ invoices: invoices || [] });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}





