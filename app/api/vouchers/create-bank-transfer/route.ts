/**
 * Create Bank Transfer Voucher API Route
 * 
 * Creates a voucher with pending status for bank transfer payments
 * The voucher will be activated manually once payment is received
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { amount, userId } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Verify user exists
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Generate voucher code
    const voucherCode = generateVoucherCode();

    // Calculate expiry date (12 months from now)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    console.log('💳 Creating bank transfer voucher...');
    console.log('Amount:', amount, 'EUR');
    console.log('User:', userId);
    console.log('Voucher Code:', voucherCode);

    // Save voucher to database with pending status
    const { data, error } = await supabase
      .from("vouchers")
      .insert({
        user_id: userId,
        code: voucherCode,
        value: amount,
        status: "pending", // Pending until payment is confirmed
        paypal_order_id: null, // No PayPal order for bank transfer
        valid_until: expiryDate.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Failed to create voucher:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      
      // Check if it's a constraint violation (pending status not allowed)
      if (error.message?.includes('pending') || error.code === '23514') {
        return NextResponse.json(
          { 
            error: "Database schema needs update. Please run the migration to add 'pending' status support.",
            details: error.message,
            code: error.code,
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Voucher creation failed",
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    console.log('✅ Bank transfer voucher created successfully!');

    // Get user details for email
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (!authError && authUser) {
      // Get user profile for name (optional - may not exist)
      let customerName = authUser.email?.split("@")[0] || "Kunde";
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", userId)
          .maybeSingle();
        
        if (profile?.full_name) {
          customerName = profile.full_name;
        }
      } catch (profileError) {
        // Profiles table may not exist - use email fallback
        console.log("⚠️ Could not fetch profile, using email fallback");
      }
      
      const customerEmail = authUser.email || "";

      // Send confirmation email (non-blocking)
      if (customerEmail) {
        sendVoucherConfirmationEmail({
          voucherId: data.id,
          customerEmail,
          customerName,
          voucherCode,
          amount,
          paymentMethod: "bank_transfer",
          status: "pending",
          validUntil: expiryDate.toISOString(),
        }).catch((emailError) => {
          console.error("❌ Failed to send voucher confirmation email:", emailError);
          // Don't fail the voucher creation if email fails
        });
      }
    }

    return NextResponse.json({
      success: true,
      voucherCode,
      amount,
      validUntil: expiryDate.toISOString(),
      voucher: data,
      paymentMethod: "bank_transfer",
    });
  } catch (error) {
    console.error("Bank transfer voucher creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Generate unique voucher code
 * 
 * Returns:
 *   string: Voucher code in format SPONK-XXXXXXXX
 */
function generateVoucherCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar chars
  let code = "SPONK-";
  
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

/**
 * Send voucher confirmation email
 * 
 * Args:
 *   params: Email parameters
 */
async function sendVoucherConfirmationEmail(params: {
  voucherId: string;
  customerEmail: string;
  customerName: string;
  voucherCode: string;
  amount: number;
  paymentMethod: "paypal" | "bank_transfer";
  status: string;
  orderNumber?: string;
  validUntil: string;
}): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/vouchers/send-confirmation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to send email");
    }

    console.log("✅ Voucher confirmation email sent successfully");
  } catch (error) {
    console.error("Error sending voucher confirmation email:", error);
    throw error;
  }
}

