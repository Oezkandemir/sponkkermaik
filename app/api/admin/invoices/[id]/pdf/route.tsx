import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { InvoiceDocument } from "@/lib/pdf/InvoicePDF";

// Force Node.js runtime for PDF generation
export const runtime = "nodejs";

/**
 * Generate PDF for Invoice
 * 
 * Returns a PDF file of the invoice
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

    // Get invoice
    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Generate PDF using @react-pdf/renderer
    const pdfBuffer = await renderToBuffer(
      <InvoiceDocument invoice={invoice} />
    );

    // Check if this is a preview request (from iframe) or download request
    const { searchParams } = new URL(request.url);
    const isPreview = searchParams.get("preview") === "true";

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": isPreview 
          ? `inline; filename="invoice-${invoice.invoice_number}.pdf"`
          : `attachment; filename="invoice-${invoice.invoice_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", { errorMessage, errorStack, error });
    
    // Return detailed error in development
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        { 
          error: "Failed to generate PDF", 
          details: errorMessage,
          stack: errorStack 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to generate PDF", details: errorMessage },
      { status: 500 }
    );
  }
}
