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
  const supabase = createClient();

  // TODO: Replace with actual bookings from database
  const upcomingBookings: any[] = [];
  const pastBookings: any[] = [];

  useEffect(() => {
    // Reason: Check authentication
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/signin");
        return;
      }
      
      setUser(user);
      // TODO: Load bookings from database
      setLoading(false);
    }

    getUser();
  }, [router, supabase.auth]);

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
                <BookingCard key={booking.id} booking={booking} t={t} />
              ))
            ) : (
              <EmptyState
                message={t("noUpcoming")}
                action={
                  <Link
                    href="/kurse-preise-sponk-keramik"
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
function BookingCard({ booking, t, isPast = false }: {
  booking: any;
  t: any;
  isPast?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {booking.workshop_name}
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
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                booking.status === "confirmed"
                  ? "bg-green-100 text-green-800"
                  : booking.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}>
                {t(booking.status)}
              </span>
            </div>
          </div>
        </div>
        {!isPast && (
          <div className="flex gap-2">
            <button className="px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
              {t("viewDetails")}
            </button>
            <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              {t("cancel")}
            </button>
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






