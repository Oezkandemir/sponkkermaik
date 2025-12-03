"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import BookingReplyModal from "./BookingReplyModal";
import BookingMessagesModal from "./BookingMessagesModal";

interface Booking {
  id: string;
  user_id: string;
  course_schedule_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string | null;
  participants: number;
  created_at: string;
  course_title?: string;
  user_email?: string;
  customer_name?: string;
  customer_email?: string;
  hasMessages?: boolean;
}

type BookingFilter = "upcoming" | "unconfirmed" | "recurring" | "past" | "cancelled";

/**
 * Admin Bookings Manager Component
 * 
 * Allows admins to view and manage all bookings with filters.
 */
export default function AdminBookingsManager() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeFilter, setActiveFilter] = useState<BookingFilter>("upcoming");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [messagesModalOpen, setMessagesModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  /**
   * Loads all bookings from database
   */
  const loadBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          course_schedule:course_schedule_id (
            course_id
          )
        `)
        .order("booking_date", { ascending: false })
        .order("start_time", { ascending: false });

      // Load course titles separately
      const courseIds = [...new Set((data || []).map((b: any) => b.course_schedule?.course_id).filter(Boolean))];
      const courseTitlesMap: Record<string, string> = {};
      
      if (courseIds.length > 0) {
        const { data: coursesData } = await supabase
          .from("courses")
          .select("id, title")
          .in("id", courseIds);
        
        (coursesData || []).forEach((course: any) => {
          courseTitlesMap[course.id] = course.title;
        });
      }

      if (error) throw error;

      // Map bookings with course titles and customer info
      const bookingsWithDetails = (data || []).map((booking: any) => {
        const courseId = booking.course_schedule?.course_id;
        return {
          ...booking,
          course_title: courseId ? (courseTitlesMap[courseId] || "Unbekannter Kurs") : "Unbekannter Kurs",
          // Use customer_email and customer_name from booking, fallback to user_id if not available
          customer_email: booking.customer_email || (booking.user_id ? `User ${booking.user_id.substring(0, 8)}...` : "Unbekannt"),
          customer_name: booking.customer_name || "Unbekannt",
          hasMessages: false, // Will be updated below
        };
      });

      // Check which bookings have messages
      const bookingIds = bookingsWithDetails.map((b) => b.id);
      if (bookingIds.length > 0) {
        const { data: messagesData } = await supabase
          .from("booking_messages")
          .select("booking_id")
          .in("booking_id", bookingIds);

        const bookingsWithMessages = new Set(
          (messagesData || []).map((m: any) => m.booking_id)
        );

        bookingsWithDetails.forEach((booking) => {
          booking.hasMessages = bookingsWithMessages.has(booking.id);
        });
      }

      setBookings(bookingsWithDetails);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setMessage({ type: "error", text: "Fehler beim Laden der Buchungen" });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Updates booking status
   */
  const updateBookingStatus = async (bookingId: string, newStatus: Booking["status"]) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);

      if (error) throw error;

      setMessage({ type: "success", text: "Buchungsstatus erfolgreich aktualisiert" });
      loadBookings();
    } catch (err) {
      console.error("Error updating booking status:", err);
      setMessage({ type: "error", text: "Fehler beim Aktualisieren des Status" });
    }
  };

  /**
   * Deletes a booking
   */
  const deleteBooking = async (bookingId: string) => {
    if (!confirm("Möchten Sie diese Buchung wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId);

      if (error) {
        console.error("Supabase delete error:", error);
        throw error;
      }

      // Optimistically update the UI by removing the booking from state
      setBookings((prevBookings) => prevBookings.filter((b) => b.id !== bookingId));
      
      setMessage({ type: "success", text: "Buchung erfolgreich gelöscht" });
      
      // Reload bookings to ensure consistency
      await loadBookings();
    } catch (err) {
      console.error("Error deleting booking:", err);
      setMessage({ 
        type: "error", 
        text: `Fehler beim Löschen der Buchung: ${err instanceof Error ? err.message : "Unbekannter Fehler"}` 
      });
    }
  };

  /**
   * Filters bookings based on active filter
   */
  const getFilteredBookings = (): Booking[] => {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toTimeString().split(" ")[0].substring(0, 5);

    switch (activeFilter) {
      case "upcoming":
        return bookings.filter(
          (b) =>
            (b.booking_date > today || (b.booking_date === today && b.start_time >= now)) &&
            b.status !== "cancelled"
        );
      case "unconfirmed":
        return bookings.filter((b) => b.status === "pending");
      case "recurring":
        // For now, return empty - can be extended later
        return [];
      case "past":
        return bookings.filter(
          (b) =>
            (b.booking_date < today || (b.booking_date === today && b.start_time < now)) &&
            b.status !== "cancelled"
        );
      case "cancelled":
        return bookings.filter((b) => b.status === "cancelled");
      default:
        return bookings;
    }
  };

  const filteredBookings = getFilteredBookings();

  const filters: { id: BookingFilter; label: string; icon: string }[] = [
    { id: "upcoming", label: "Bevorstehende", icon: "📅" },
    { id: "unconfirmed", label: "Unbestätigt", icon: "⏳" },
    { id: "recurring", label: "Wiederkehrende", icon: "🔄" },
    { id: "past", label: "Vergangene", icon: "📜" },
    { id: "cancelled", label: "Abgesagt", icon: "❌" },
  ];

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-amber-600 border-t-transparent rounded-full mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1 min-w-max sm:min-w-0">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeFilter === filter.id
                  ? "border-amber-600 text-amber-600 bg-amber-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              <span className="mr-1 sm:mr-2">{filter.icon}</span>
              <span className="hidden sm:inline">{filter.label}</span>
              <span className="sm:hidden">{filter.label.split(' ')[0]}</span>
              {filter.id !== "recurring" && (
                <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs bg-gray-200 rounded-full">
                  {filter.id === "upcoming"
                    ? bookings.filter(
                        (b) =>
                          (b.booking_date > new Date().toISOString().split("T")[0] ||
                            (b.booking_date === new Date().toISOString().split("T")[0] &&
                              b.start_time >= new Date().toTimeString().split(" ")[0].substring(0, 5))) &&
                          b.status !== "cancelled"
                      ).length
                    : filter.id === "unconfirmed"
                    ? bookings.filter((b) => b.status === "pending").length
                    : filter.id === "past"
                    ? bookings.filter(
                        (b) =>
                          (b.booking_date < new Date().toISOString().split("T")[0] ||
                            (b.booking_date === new Date().toISOString().split("T")[0] &&
                              b.start_time < new Date().toTimeString().split(" ")[0].substring(0, 5))) &&
                          b.status !== "cancelled"
                      ).length
                    : bookings.filter((b) => b.status === "cancelled").length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Keine Buchungen in dieser Kategorie</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">{booking.course_title}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : booking.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {booking.status === "confirmed"
                        ? "Bestätigt"
                        : booking.status === "pending"
                        ? "Unbestätigt"
                        : booking.status === "cancelled"
                        ? "Abgesagt"
                        : "Abgeschlossen"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Datum:</span>{" "}
                      {new Date(booking.booking_date).toLocaleDateString("de-DE", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div>
                      <span className="font-medium">Zeit:</span> {booking.start_time} - {booking.end_time}
                    </div>
                    <div>
                      <span className="font-medium">Name:</span> {booking.customer_name || "Unbekannt"}
                    </div>
                    <div>
                      <span className="font-medium">E-Mail:</span> {booking.customer_email || booking.user_email || "Unbekannt"}
                    </div>
                    <div>
                      <span className="font-medium">Teilnehmer:</span> {booking.participants}
                    </div>
                  </div>
                  {booking.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-gray-600 break-words flex-1">
                          <span className="font-medium">Notizen:</span> {booking.notes}
                        </p>
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setReplyModalOpen(true);
                          }}
                          className="ml-2 px-3 py-1.5 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors whitespace-nowrap flex-shrink-0"
                          title="Auf Notiz antworten"
                        >
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          Antworten
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="sm:ml-4 flex flex-col gap-2 w-full sm:w-auto">
                  {booking.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateBookingStatus(booking.id, "confirmed")}
                        className="w-full sm:w-auto px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Bestätigen
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking.id, "cancelled")}
                        className="w-full sm:w-auto px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Ablehnen
                      </button>
                    </>
                  )}
                  {booking.status === "confirmed" && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, "cancelled")}
                      className="w-full sm:w-auto px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Stornieren
                    </button>
                  )}
                  {booking.hasMessages && (
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setMessagesModalOpen(true);
                      }}
                      className="w-full sm:w-auto px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                      title="Nachrichtenverlauf anzeigen"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Nachrichtenverlauf
                    </button>
                  )}
                  <button
                    onClick={() => deleteBooking(booking.id)}
                    className="w-full sm:w-auto px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors sm:mt-2"
                    title="Buchung löschen"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {selectedBooking && (
        <BookingReplyModal
          isOpen={replyModalOpen}
          onClose={() => {
            setReplyModalOpen(false);
            setSelectedBooking(null);
          }}
          bookingId={selectedBooking.id}
          customerEmail={selectedBooking.customer_email || selectedBooking.user_email || ""}
          customerName={selectedBooking.customer_name || "Kunde"}
          courseTitle={selectedBooking.course_title || "Kurs"}
          bookingDate={new Date(selectedBooking.booking_date).toLocaleDateString("de-DE", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          bookingTime={`${selectedBooking.start_time} - ${selectedBooking.end_time}`}
          originalNotes={selectedBooking.notes}
          onSuccess={() => {
            // Reload bookings to update hasMessages flag
            loadBookings();
          }}
        />
      )}

      {/* Messages Modal */}
      {selectedBooking && (
        <BookingMessagesModal
          isOpen={messagesModalOpen}
          onClose={() => {
            setMessagesModalOpen(false);
            setSelectedBooking(null);
          }}
          bookingId={selectedBooking.id}
        />
      )}
    </div>
  );
}

