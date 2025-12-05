import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Create Invoice API Route
 * 
 * Creates a new invoice with auto-generated invoice number (SPONK-YYYY-NNNN format)
 * 
 * NOTE: This route ONLY creates the invoice with status "draft".
 * It does NOT send any emails. To send an invoice, use the /send endpoint.
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      booking_id,
      customer_email,
      customer_name,
      course_title,
      booking_date,
      amount,
      participants,
      participant_names,
      course_price_per_person,
      notes,
    } = body;

    // Validate required fields
    if (!customer_email || !customer_name || !course_title || !booking_date || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate invoice number (SPONK-YYYY-NNNN)
    const currentYear = new Date().getFullYear();
    
    // Get the highest invoice number for this year
    const { data: lastInvoice, error: lastInvoiceError } = await supabase
      .from("invoices")
      .select("invoice_number")
      .like("invoice_number", `SPONK-${currentYear}-%`)
      .order("invoice_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    let nextNumber = 1;
    if (lastInvoice && !lastInvoiceError) {
      const match = lastInvoice.invoice_number.match(/SPONK-\d{4}-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const invoiceNumber = `SPONK-${currentYear}-${String(nextNumber).padStart(4, "0")}`;

    // Get booking data if booking_id is provided to extract participant information
    let bookingParticipants = participants;
    let bookingParticipantNames = participant_names;
    let bookingCoursePrice = course_price_per_person;

    if (booking_id) {
      const { data: bookingData } = await supabase
        .from("bookings")
        .select(`
          participants,
          notes,
          course_schedule:course_schedule_id (
            course_id
          )
        `)
        .eq("id", booking_id)
        .single();

      if (bookingData) {
        // Use booking data if not provided in request
        if (!bookingParticipants) {
          bookingParticipants = bookingData.participants || 1;
        }

        // Extract participant names from booking notes
        if (!bookingParticipantNames && bookingData.notes) {
          const extractedNames: string[] = [];
          const lines = bookingData.notes.split("\n");
          let inParticipantsSection = false;

          for (const line of lines) {
            if (line.trim() === "Teilnehmer:") {
              inParticipantsSection = true;
              continue;
            }
            if (inParticipantsSection) {
              const match = line.match(/^Teilnehmer \d+: (.+)$/);
              if (match) {
                extractedNames.push(match[1].trim());
              }
            }
          }
          
          // First participant is customer_name, add extracted names
          if (extractedNames.length > 0) {
            bookingParticipantNames = [customer_name, ...extractedNames];
          } else {
            bookingParticipantNames = [customer_name];
          }
        } else if (!bookingParticipantNames) {
          bookingParticipantNames = [customer_name];
        }

        // Get course price if not provided
        const courseSchedule = Array.isArray(bookingData.course_schedule) 
          ? bookingData.course_schedule[0] 
          : bookingData.course_schedule;
        
        if (!bookingCoursePrice && courseSchedule?.course_id) {
          const { data: courseData } = await supabase
            .from("courses")
            .select("price")
            .eq("id", courseSchedule.course_id)
            .single();

          if (courseData?.price) {
            // Extract price per person from price string
            const priceString = courseData.price;
            const cleaned = priceString
              .replace(/pro Person/gi, "")
              .replace(/pro Kg/gi, "")
              .replace(/auf Anfrage/gi, "")
              .replace(/€/g, "")
              .replace(/,/g, ".")
              .trim();
            const match = cleaned.match(/(\d+(?:\.\d+)?)/);
            if (match) {
              bookingCoursePrice = parseFloat(match[1]);
            }
          }
        }
      }
    }

    // If still no participant names, use customer_name as first participant
    if (!bookingParticipantNames || bookingParticipantNames.length === 0) {
      bookingParticipantNames = [customer_name];
    }

    // Prepare notes with participant information if multiple participants
    let finalNotes = notes || "";
    if (bookingParticipants && bookingParticipants > 1 && bookingParticipantNames && Array.isArray(bookingParticipantNames)) {
      const participantInfo = `\n\nTeilnehmer:\n${bookingParticipantNames.map((name: string, index: number) => `Teilnehmer ${index + 1}: ${name}`).join("\n")}`;
      if (finalNotes) {
        finalNotes = `${finalNotes}${participantInfo}`;
      } else {
        finalNotes = participantInfo.trim();
      }
    }

    // Create invoice
    // Store participant data in notes field in a structured way for PDF generation
    const invoiceData: any = {
      invoice_number: invoiceNumber,
      booking_id: booking_id || null,
      customer_email,
      customer_name,
      course_title,
      booking_date,
      amount: parseFloat(amount),
      status: "draft",
      notes: finalNotes || null,
    };

    // Store participant data as JSON in notes (we'll parse it in PDF)
    // Format: JSON object with participants info
    if (bookingParticipants && bookingParticipants > 1) {
      const participantData = {
        participants: bookingParticipants,
        participant_names: bookingParticipantNames || [customer_name],
        course_price_per_person: bookingCoursePrice || 0,
      };
      // Append JSON data to notes (we'll extract it in PDF component)
      invoiceData.notes = finalNotes 
        ? `${finalNotes}\n\n__PARTICIPANT_DATA__:${JSON.stringify(participantData)}`
        : `__PARTICIPANT_DATA__:${JSON.stringify(participantData)}`;
    }

    const { data: invoice, error } = await supabase
      .from("invoices")
      .insert(invoiceData)
      .select()
      .single();

    if (error) {
      console.error("Error creating invoice:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create invoice" },
        { status: 500 }
      );
    }

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error("Error in create invoice route:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}





