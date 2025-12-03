"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * Bookings Page Component
 * 
 * Displays user's workshop bookings (upcoming and past).
 * Requires authentication to access.
 */
export default function BookingsPage() {
  const router = useRouter();
  const t = useTranslations("bookings");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [pastBookings, setPastBookings] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Reason: Check authentication and load bookings
    async function getUserAndBookings() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/signin");
        return;
      }
      
      setUser(user);
      await loadBookings(user.id);
      setLoading(false);
    }

    getUserAndBookings();
  }, [router, supabase.auth]);

  /**
   * Loads bookings from database
   */
  const loadBookings = async (userId: string) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .order("booking_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;

      const upcoming: any[] = [];
      const past: any[] = [];
      const bookingIds = data?.map((b: any) => b.id) || [];

      // Check which bookings have messages
      let bookingsWithMessages = new Set<string>();
      if (bookingIds.length > 0) {
        const { data: messagesData } = await supabase
          .from("booking_messages")
          .select("booking_id")
          .in("booking_id", bookingIds);
        
        bookingsWithMessages = new Set(
          (messagesData || []).map((m: any) => m.booking_id)
        );
      }

      data?.forEach((booking) => {
        const bookingDate = booking.booking_date;
        const formattedBooking = {
          id: booking.id,
          date: new Date(bookingDate).toLocaleDateString("de-DE", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          time: `${booking.start_time} - ${booking.end_time}`,
          status: booking.status,
          notes: booking.notes,
          booking_date: bookingDate,
          hasMessages: bookingsWithMessages.has(booking.id),
        };

        if (bookingDate >= today) {
          upcoming.push(formattedBooking);
        } else {
          past.push(formattedBooking);
        }
      });

      setUpcomingBookings(upcoming);
      setPastBookings(past);
    } catch (err) {
      console.error("Error loading bookings:", err);
    }
  };

  /**
   * Cancels a booking
   */
  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;

      // Reload bookings
      if (user) {
        await loadBookings(user.id);
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600">{t("subtitle")}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "upcoming"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {t("upcoming")}
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "past"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {t("past")}
          </button>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {activeTab === "upcoming" ? (
            upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  t={t} 
                  onCancel={() => cancelBooking(booking.id)}
                />
              ))
            ) : (
              <EmptyState
                message={t("noUpcoming")}
                action={
                  <Link
                    href="/book-course"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all"
                  >
                    {t("browseWorkshops")}
                  </Link>
                }
              />
            )
          ) : pastBookings.length > 0 ? (
            pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} t={t} isPast />
            ))
          ) : (
            <EmptyState message={t("noPast")} />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Booking Card Component
 * 
 * Args:
 *   booking: Booking data object
 *   t: Translation function
 *   isPast: Whether this is a past booking
 */
function BookingCard({ booking, t, isPast = false, onCancel }: {
  booking: any;
  t: any;
  isPast?: boolean;
  onCancel?: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Kursbuchung
          </h3>
          <div className="space-y-2 text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{t("date")}: {booking.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t("time")}: {booking.time}</span>
            </div>
            {booking.notes && (
              <div className="flex items-start gap-2 mt-2">
                <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-sm">{booking.notes}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                booking.status === "confirmed"
                  ? "bg-green-100 text-green-800"
                  : booking.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : booking.status === "cancelled"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}>
                {t(booking.status)}
              </span>
            </div>
          </div>
        </div>
        {!isPast && booking.status !== "cancelled" && (
          <div className="flex flex-col gap-2">
            <Link
              href={`/bookings/${booking.id}`}
              className="px-4 py-2 text-sm bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Details anzeigen
              {booking.hasMessages && (
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {booking.hasMessages ? "Neu" : ""}
                </span>
              )}
            </Link>
            {onCancel && (
              <button 
                onClick={onCancel}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                {t("cancel")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Empty State Component
 * 
 * Args:
 *   message: Message to display
 *   action: Optional action button
 */
function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-gray-600 text-lg mb-6">{message}</p>
      {action}
    </div>
  );
}







