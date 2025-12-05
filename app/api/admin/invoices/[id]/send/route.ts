import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { InvoiceDocument } from "@/lib/pdf/InvoicePDF";

// Force Node.js runtime for PDF generation
export const runtime = "nodejs";

/**
 * Send Invoice via Email
 * 
 * Generates PDF and sends it via Resend API
 */
export async function POST(
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
    // Type assertion needed because renderToBuffer expects DocumentProps but InvoiceDocument is a function component
    const pdfBuffer = await renderToBuffer(
      React.createElement(InvoiceDocument, { invoice }) as any
    );

    // Convert PDF to base64 for email attachment
    const pdfBase64 = pdfBuffer.toString("base64");

    // Send email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = "sponkkeramik@gmail.com";

    if (!resendApiKey) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const emailSubject = `Rechnung ${invoice.invoice_number} - Sponk Keramik`;
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .invoice-details { background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Sponk Keramik</h1>
          </div>
          <div class="content">
            <h2>Rechnung ${invoice.invoice_number}</h2>
            <p>Sehr geehrte/r ${invoice.customer_name},</p>
            <p>anbei erhalten Sie Ihre Rechnung für den gebuchten Kurs.</p>
            
            <div class="invoice-details">
              <p><strong>Rechnungsnummer:</strong> ${invoice.invoice_number}</p>
              <p><strong>Datum:</strong> ${new Date(invoice.created_at).toLocaleDateString("de-DE")}</p>
              <p><strong>Kurs:</strong> ${invoice.course_title}</p>
              <p><strong>Buchungsdatum:</strong> ${new Date(invoice.booking_date).toLocaleDateString("de-DE")}</p>
              <p><strong>Betrag:</strong> ${invoice.amount.toFixed(2)}€</p>
            </div>

            <p>Die Rechnung finden Sie als PDF-Anhang.</p>
            <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
            
            <p>Mit freundlichen Grüßen,<br>Ihr Team von Sponk Keramik</p>
          </div>
          <div class="footer">
            <p>Fürstenplatz 15, 40215 Düsseldorf</p>
          </div>
        </div>
      </body>
      </html>
    `.trim();

    const emailText = `
Rechnung ${invoice.invoice_number} - Sponk Keramik

Sehr geehrte/r ${invoice.customer_name},

anbei erhalten Sie Ihre Rechnung für den gebuchten Kurs.

Rechnungsnummer: ${invoice.invoice_number}
Datum: ${new Date(invoice.created_at).toLocaleDateString("de-DE")}
Kurs: ${invoice.course_title}
Buchungsdatum: ${new Date(invoice.booking_date).toLocaleDateString("de-DE")}
Betrag: ${invoice.amount.toFixed(2)}€

Die Rechnung finden Sie als PDF-Anhang.

Mit freundlichen Grüßen,
Ihr Team von Sponk Keramik

Fürstenplatz 15, 40215 Düsseldorf
    `.trim();

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Sponk Keramik <noreply@sponkkeramik.de>",
        to: [invoice.customer_email],
        cc: [adminEmail],
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
        attachments: [
          {
            filename: `invoice-${invoice.invoice_number}.pdf`,
            content: pdfBase64,
          },
        ],
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json().catch(() => ({}));
      console.error("Resend API error:", errorData);
      return NextResponse.json(
        { error: errorData.message || "Failed to send email" },
        { status: 500 }
      );
    }

    // Update invoice status
    await supabase
      .from("invoices")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({ success: true, message: "Invoice sent successfully" });
  } catch (error) {
    console.error("Error sending invoice:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", { errorMessage, errorStack, error });
    
    // Return detailed error in development
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        { 
          error: "Failed to send invoice", 
          details: errorMessage,
          stack: errorStack 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to send invoice", details: errorMessage },
      { status: 500 }
    );
  }
}
