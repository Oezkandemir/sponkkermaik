"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Booking Success Page
 * 
 * Displays confirmation message after successful booking
 */
export default function BookingSuccessPage() {
  const t = useTranslations("bookingSuccess");
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (bookingId) {
      loadBookingDetails(bookingId);
    } else {
      setLoading(false);
    }
  }, [bookingId]);

  const loadBookingDetails = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setBooking({
        ...data,
        formattedDate: new Date(data.booking_date).toLocaleDateString("de-DE", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        formattedTime: `${data.start_time} - ${data.end_time}`,
      });
    } catch (err) {
      console.error("Error loading booking:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success Title */}
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-green-600">
              {t("confirmed")}
            </h2>
          </div>

          {/* Success Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t("title")}
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            {t("message")}
          </p>

          {/* Booking Details */}
          {booking && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("bookingDetails")}
              </h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span><strong>{t("date")}:</strong> {booking.formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>{t("time")}:</strong> {booking.formattedTime}</span>
                </div>
                {booking.notes && (
                  <div className="flex items-start gap-2 mt-2">
                    <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span><strong>{t("notes")}:</strong> {booking.notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-800 flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {t("emailInfo")}
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              {t("backToHome")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

