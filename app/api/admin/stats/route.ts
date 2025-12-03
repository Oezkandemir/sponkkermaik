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
    const now = new Date().toTimeString().split(" ")[0].substring(0, 5);
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfWeekStr = startOfWeek.toISOString().split("T")[0];

    // Get today's bookings
    const { data: todayBookings, error: todayError } = await supabase
      .from("bookings")
      .select("id, status, booking_date, start_time")
      .eq("booking_date", today)
      .gte("start_time", now)
      .neq("status", "cancelled");

    if (todayError) throw todayError;

    // Get pending confirmations
    const { data: pendingBookings, error: pendingError } = await supabase
      .from("bookings")
      .select("id")
      .eq("status", "pending");

    if (pendingError) throw pendingError;

    // Get active vouchers
    const { data: activeVouchers, error: vouchersError } = await supabase
      .from("vouchers")
      .select("id, value, status")
      .eq("status", "active");

    if (vouchersError) throw vouchersError;

    // Calculate monthly revenue from vouchers
    const { data: monthlyVouchers, error: monthlyVouchersError } = await supabase
      .from("vouchers")
      .select("value, created_at")
      .gte("created_at", startOfMonth)
      .eq("status", "active");

    if (monthlyVouchersError) throw monthlyVouchersError;

    const monthlyVoucherRevenue = monthlyVouchers?.reduce((sum, v) => sum + Number(v.value || 0), 0) || 0;

    // Calculate revenue from bookings
    // Get all confirmed/completed bookings with course and participant info
    const { data: bookingsForRevenue, error: bookingsRevenueError } = await supabase
      .from("bookings")
      .select(`
        id,
        participants,
        booking_date,
        status,
        course_schedule:course_schedule_id (
          course_id
        )
      `)
      .in("status", ["confirmed", "completed"])
      .neq("status", "cancelled");

    if (bookingsRevenueError) throw bookingsRevenueError;

    // Get all courses with prices
    const { data: allCourses, error: coursesPriceError } = await supabase
      .from("courses")
      .select("id, price");

    if (coursesPriceError) throw coursesPriceError;

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

    // Get booking trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

    const { data: recentBookings, error: recentError } = await supabase
      .from("bookings")
      .select("booking_date, status, created_at")
      .gte("booking_date", sevenDaysAgoStr)
      .neq("status", "cancelled");

    if (recentError) throw recentError;

    // Group bookings by date for trend
    const bookingsByDate: Record<string, number> = {};
    recentBookings?.forEach((booking) => {
      const date = booking.booking_date;
      bookingsByDate[date] = (bookingsByDate[date] || 0) + 1;
    });

    // Get popular courses
    const { data: allBookings, error: allBookingsError } = await supabase
      .from("bookings")
      .select(`
        course_schedule_id,
        course_schedule:course_schedule_id (
          course_id
        )
      `)
      .neq("status", "cancelled");

    if (allBookingsError) throw allBookingsError;

    const courseCounts: Record<string, number> = {};
    allBookings?.forEach((booking: any) => {
      const courseId = booking.course_schedule?.course_id;
      if (courseId) {
        courseCounts[courseId] = (courseCounts[courseId] || 0) + 1;
      }
    });

    // Get course titles
    const courseIds = Object.keys(courseCounts);
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("id, title")
      .in("id", courseIds);

    if (coursesError) throw coursesError;

    const popularCourses = courses?.map((course) => ({
      id: course.id,
      title: course.title,
      bookings: courseCounts[course.id] || 0,
    })).sort((a, b) => b.bookings - a.bookings).slice(0, 5) || [];

    // Get weekly bookings
    const { data: weeklyBookings, error: weeklyError } = await supabase
      .from("bookings")
      .select("booking_date")
      .gte("booking_date", startOfWeekStr)
      .neq("status", "cancelled");

    if (weeklyError) throw weeklyError;

    // Get monthly bookings
    const { data: monthlyBookings, error: monthlyBookingsError } = await supabase
      .from("bookings")
      .select("booking_date")
      .gte("booking_date", startOfMonth)
      .neq("status", "cancelled");

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
      weeklyBookings: weeklyBookings?.length || 0,
      monthlyBookings: monthlyBookings?.length || 0,
      bookingsTrend: bookingsByDate,
      popularCourses: popularCourses,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}

