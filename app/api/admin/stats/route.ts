import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Extracts price per person from price string
 * Examples:
 * - "39 € pro Person" -> 39
 * - "80 € pro Person" -> 80
 * - "87 € pro Person + 18 € pro Kg" -> 87
 * - "195 € pro Person + 18 € pro Kg" -> 195
 * - "Preis auf Anfrage" -> 0
 */
function extractPricePerPerson(priceString: string): number {
  if (!priceString) return 0;
  
  // Remove common text patterns
  const cleaned = priceString
    .replace(/pro Person/gi, "")
    .replace(/pro Kg/gi, "")
    .replace(/auf Anfrage/gi, "")
    .replace(/€/g, "")
    .replace(/,/g, ".")
    .trim();
  
  // Extract first number (price per person)
  const match = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    return parseFloat(match[1]);
  }
  
  return 0;
}

/**
 * Admin Stats API Route
 * 
 * Returns statistics for the admin dashboard including:
 * - Today's bookings
 * - Pending confirmations
 * - Active vouchers
 * - Monthly revenue (from bookings and vouchers)
 * - Booking trends
 * - Popular courses
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
      .single();

    if (!adminCheck) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const today = new Date().toISOString().split("T")[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfWeekStr = startOfWeek.toISOString().split("T")[0];

    // Execute multiple queries in parallel for better performance
    const [
      { data: todayBookings, error: todayError },
      { data: pendingBookings, error: pendingError },
      { data: activeVouchers, error: vouchersError },
    ] = await Promise.all([
      supabase
        .from("bookings")
        .select("id, status, booking_date")
        .eq("booking_date", today)
        .neq("status", "cancelled"),
      supabase
        .from("bookings")
        .select("id")
        .eq("status", "pending"),
      supabase
        .from("vouchers")
        .select("id, value, status")
        .eq("status", "active"),
    ]);

    if (todayError) throw todayError;
    if (pendingError) throw pendingError;
    if (vouchersError) throw vouchersError;

    // Execute revenue queries in parallel
    // Only fetch confirmed/completed bookings (not cancelled) for revenue calculation
    const [
      { data: monthlyVouchers, error: monthlyVouchersError },
      { data: bookingsForRevenue, error: bookingsRevenueError },
      { data: allCourses, error: coursesPriceError },
    ] = await Promise.all([
      supabase
        .from("vouchers")
        .select("value, created_at")
        .gte("created_at", startOfMonth)
        .eq("status", "active"),
      supabase
        .from("bookings")
        .select(`
          participants,
          booking_date,
          course_schedule:course_schedule_id (
            course_id
          )
        `)
        .in("status", ["confirmed", "completed"]),
      supabase
        .from("courses")
        .select("id, price"),
    ]);

    if (monthlyVouchersError) throw monthlyVouchersError;
    if (bookingsRevenueError) throw bookingsRevenueError;
    if (coursesPriceError) throw coursesPriceError;

    const monthlyVoucherRevenue = monthlyVouchers?.reduce((sum, v) => sum + Number(v.value || 0), 0) || 0;

    // Create price map
    const coursePriceMap: Record<string, number> = {};
    allCourses?.forEach((course) => {
      coursePriceMap[course.id] = extractPricePerPerson(course.price);
    });

    // Calculate revenue from bookings
    let totalRevenue = 0;
    let monthlyBookingRevenue = 0;
    let weeklyBookingRevenue = 0;
    let todayBookingRevenue = 0;

    bookingsForRevenue?.forEach((booking: any) => {
      const courseId = booking.course_schedule?.course_id;
      const pricePerPerson = courseId ? (coursePriceMap[courseId] || 0) : 0;
      const participants = booking.participants || 1;
      const bookingRevenue = pricePerPerson * participants;

      totalRevenue += bookingRevenue;

      // Monthly revenue
      if (booking.booking_date >= startOfMonth) {
        monthlyBookingRevenue += bookingRevenue;
      }

      // Weekly revenue
      if (booking.booking_date >= startOfWeekStr) {
        weeklyBookingRevenue += bookingRevenue;
      }

      // Today revenue
      if (booking.booking_date === today) {
        todayBookingRevenue += bookingRevenue;
      }
    });

    // Total monthly revenue = vouchers + bookings
    const monthlyRevenue = monthlyVoucherRevenue + monthlyBookingRevenue;

    // Get weekly and monthly booking counts (only count, not full data for better performance)
    const [
      { count: weeklyBookingsCount, error: weeklyError },
      { count: monthlyBookingsCount, error: monthlyBookingsError },
    ] = await Promise.all([
      supabase
        .from("bookings")
        .select("booking_date", { count: "exact", head: true })
        .gte("booking_date", startOfWeekStr)
        .neq("status", "cancelled"),
      supabase
        .from("bookings")
        .select("booking_date", { count: "exact", head: true })
        .gte("booking_date", startOfMonth)
        .neq("status", "cancelled"),
    ]);

    if (weeklyError) throw weeklyError;
    if (monthlyBookingsError) throw monthlyBookingsError;

    return NextResponse.json({
      todayBookings: todayBookings?.length || 0,
      pendingConfirmations: pendingBookings?.length || 0,
      activeVouchers: activeVouchers?.length || 0,
      monthlyRevenue: monthlyRevenue,
      monthlyBookingRevenue: monthlyBookingRevenue,
      monthlyVoucherRevenue: monthlyVoucherRevenue,
      weeklyBookingRevenue: weeklyBookingRevenue,
      todayBookingRevenue: todayBookingRevenue,
      totalRevenue: totalRevenue,
      weeklyBookings: weeklyBookingsCount || 0,
      monthlyBookings: monthlyBookingsCount || 0,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}

