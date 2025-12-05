import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Single Invoice API Route
 * 
 * GET: Get single invoice
 * PUT: Update invoice (status, etc.)
 * DELETE: Delete invoice
 * 
 * NOTE: The PUT endpoint ONLY updates the invoice status in the database.
 * It does NOT send any emails. Changing status to "sent" does NOT trigger email sending.
 * To send an invoice via email, use the /send endpoint instead.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const body = await request.json();
    const updateData: any = {};

    if (body.status) {
      updateData.status = body.status;
      // Update timestamps based on status
      // NOTE: Changing status to "sent" only updates the timestamp, it does NOT send emails
      if (body.status === "sent" && !body.sent_at) {
        updateData.sent_at = new Date().toISOString();
      }
      if (body.status === "paid" && !body.paid_at) {
        updateData.paid_at = new Date().toISOString();
      }
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    const { data: invoice, error } = await supabase
      .from("invoices")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating invoice:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update invoice" },
        { status: 500 }
      );
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Error in update invoice route:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting invoice:", error);
      return NextResponse.json(
        { error: error.message || "Failed to delete invoice" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in delete invoice route:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}

