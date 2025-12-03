"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Calendar, momentLocalizer, View, SlotInfo } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { createClient } from "@/lib/supabase/client";
import BookingReplyModal from "./BookingReplyModal";
import BookingMessagesModal from "./BookingMessagesModal";

// Import moment locale for German (English is the default)
import "moment/locale/de";

// Set up moment localizer
const localizer = momentLocalizer(moment);

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
  participantList?: string[];
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Booking;
}

type CalendarView = "month" | "week" | "day" | "agenda";

/**
 * Admin Calendar View Component
 * 
 * Displays all bookings in a calendar view with month/week/day/agenda views.
 * Allows filtering by course and status, and clicking events to view details.
 */
function AdminCalendarView() {
  const t = useTranslations("admin.calendar");
  const params = useParams();
  const currentLocale = (params.locale as string) || "de";
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  // Set moment locale based on current locale
  useEffect(() => {
    moment.locale(currentLocale === "en" ? "en" : "de");
  }, [currentLocale]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  
  // Handler to convert react-big-calendar View type to CalendarView
  const handleViewChange = useCallback((newView: View) => {
    // Only allow the views we support
    if (newView === "month" || newView === "week" || newView === "day" || newView === "agenda") {
      setView(newView as CalendarView);
    }
  }, []);
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [messagesModalOpen, setMessagesModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [availableCourses, setAvailableCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  /**
   * Loads all available courses for filtering
   */
  const loadCourses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .order("title");

      if (error) throw error;
      setAvailableCourses(data || []);
    } catch (err) {
      console.error("Error loading courses:", err);
    }
  }, [supabase]);

  /**
   * Loads all bookings from database
   */
  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch("/api/admin/bookings");
      
      if (!response.ok) {
        throw new Error("Failed to load bookings");
      }

      const result = await response.json();
      setBookings(result.bookings || []);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setMessage({ type: "error", text: t("errorLoadingBookings") });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadBookings();
    loadCourses();
  }, [loadBookings, loadCourses]);

  /**
   * Converts bookings to calendar events
   */
  const events: CalendarEvent[] = useMemo(() => {
    return bookings
      .filter((booking) => {
        // Filter by course
        if (selectedCourseFilter !== "all") {
          const course = availableCourses.find((c) => c.id === selectedCourseFilter);
          if (course && booking.course_title !== course.title) {
            return false;
          }
        }
        
        // Filter by status
        if (selectedStatusFilter !== "all" && booking.status !== selectedStatusFilter) {
          return false;
        }

        return true;
      })
      .map((booking) => {
        // Combine booking_date with start_time and end_time
        const startDateTime = moment(`${booking.booking_date} ${booking.start_time}`).toDate();
        const endDateTime = moment(`${booking.booking_date} ${booking.end_time}`).toDate();

        return {
          id: booking.id,
          title: `${booking.course_title || "Unbekannter Kurs"} - ${booking.participants} ${booking.participants === 1 ? t("participant") : t("participants")}`,
          start: startDateTime,
          end: endDateTime,
          resource: booking,
        };
      });
  }, [bookings, selectedCourseFilter, selectedStatusFilter, availableCourses, t]);

  /**
   * Gets event style based on booking status
   */
  const eventStyleGetter = (event: CalendarEvent) => {
    const status = event.resource.status;
    let backgroundColor = "#3174ad"; // default blue
    
    switch (status) {
      case "pending":
        backgroundColor = "#f59e0b"; // amber
        break;
      case "confirmed":
        backgroundColor = "#10b981"; // green
        break;
      case "completed":
        backgroundColor = "#6b7280"; // gray
        break;
      case "cancelled":
        backgroundColor = "#ef4444"; // red
        break;
    }

    return {
      style: {
        backgroundColor,
        color: "white",
        borderRadius: "4px",
        border: "none",
        padding: "2px 4px",
      },
    };
  };

  /**
   * Handles event click - opens booking details
   */
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedBooking(event.resource);
    setSelectedEvent(event);
    // Open a modal or navigate to booking details
    // For now, we'll open the messages modal
  };

  /**
   * Handles slot selection - could be used to create new bookings
   */
  const handleSelectSlot = (slotInfo: SlotInfo) => {
    // Could open a modal to create a new booking for this time slot
    console.log("Selected slot:", slotInfo);
  };

  /**
   * Navigates to today
   */
  const navigateToToday = () => {
    setCurrentDate(new Date());
  };

  /**
   * Navigates to previous period
   */
  const navigateToPrevious = () => {
    const newDate = moment(currentDate);
    if (view === "month") {
      newDate.subtract(1, "month");
    } else if (view === "week") {
      newDate.subtract(1, "week");
    } else {
      newDate.subtract(1, "day");
    }
    setCurrentDate(newDate.toDate());
  };

  /**
   * Navigates to next period
   */
  const navigateToNext = () => {
    const newDate = moment(currentDate);
    if (view === "month") {
      newDate.add(1, "month");
    } else if (view === "week") {
      newDate.add(1, "week");
    } else {
      newDate.add(1, "day");
    }
    setCurrentDate(newDate.toDate());
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-amber-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Course Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("filterByCourse")}
            </label>
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{t("allCourses")}</option>
              {availableCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("filterByStatus")}
            </label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{t("allStatuses")}</option>
              <option value="pending">{t("statusPending")}</option>
              <option value="confirmed">{t("statusConfirmed")}</option>
              <option value="completed">{t("statusCompleted")}</option>
              <option value="cancelled">{t("statusCancelled")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={navigateToPrevious}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              aria-label={t("previous")}
            >
              ←
            </button>
            <button
              onClick={navigateToToday}
              className="px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-md transition-colors"
            >
              {t("today")}
            </button>
            <button
              onClick={navigateToNext}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              aria-label={t("next")}
            >
              →
            </button>
          </div>

          <div className="text-lg font-semibold text-gray-900">
            {moment(currentDate).format(view === "month" ? "MMMM YYYY" : view === "week" ? "MMMM YYYY" : "DD. MMMM YYYY")}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("month")}
              className={`px-4 py-2 rounded-md transition-colors ${
                view === "month"
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {t("month")}
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-4 py-2 rounded-md transition-colors ${
                view === "week"
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {t("week")}
            </button>
            <button
              onClick={() => setView("day")}
              className={`px-4 py-2 rounded-md transition-colors ${
                view === "day"
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {t("day")}
            </button>
            <button
              onClick={() => setView("agenda")}
              className={`px-4 py-2 rounded-md transition-colors ${
                view === "agenda"
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {t("agenda")}
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Legend */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="font-medium">{t("legend")}:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded"></div>
            <span>{t("statusPending")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>{t("statusConfirmed")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span>{t("statusCompleted")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>{t("statusCancelled")}</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200" style={{ height: "600px" }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={handleViewChange}
          date={currentDate}
          onNavigate={setCurrentDate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          messages={{
            next: t("next"),
            previous: t("previous"),
            today: t("today"),
            month: t("month"),
            week: t("week"),
            day: t("day"),
            agenda: t("agenda"),
            date: t("date"),
            time: t("time"),
            event: t("event"),
            noEventsInRange: t("noEventsInRange"),
          }}
        />
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {t("bookingDetails")}
                </h2>
                <button
                  onClick={() => {
                    setSelectedBooking(null);
                    setSelectedEvent(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700">{t("course")}</h3>
                  <p className="text-gray-900">{selectedBooking.course_title || "Unbekannter Kurs"}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700">{t("date")}</h3>
                  <p className="text-gray-900">
                    {moment(selectedBooking.booking_date).format("DD.MM.YYYY")}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700">{t("time")}</h3>
                  <p className="text-gray-900">
                    {selectedBooking.start_time} - {selectedBooking.end_time}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700">{t("status")}</h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm ${
                      selectedBooking.status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : selectedBooking.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : selectedBooking.status === "completed"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedBooking.status === "pending"
                      ? t("statusPending")
                      : selectedBooking.status === "confirmed"
                      ? t("statusConfirmed")
                      : selectedBooking.status === "completed"
                      ? t("statusCompleted")
                      : t("statusCancelled")}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700">{t("participants")}</h3>
                  <p className="text-gray-900">{selectedBooking.participants}</p>
                  {selectedBooking.participantList && selectedBooking.participantList.length > 0 && (
                    <ul className="mt-2 list-disc list-inside">
                      {selectedBooking.participantList.map((name, idx) => (
                        <li key={idx} className="text-gray-700">{name}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700">{t("customer")}</h3>
                  <p className="text-gray-900">
                    {selectedBooking.customer_name || "Unbekannt"}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {selectedBooking.customer_email || "Unbekannt"}
                  </p>
                </div>

                {selectedBooking.notes && (
                  <div>
                    <h3 className="font-semibold text-gray-700">{t("notes")}</h3>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedBooking.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  {selectedBooking.hasMessages && (
                    <button
                      onClick={() => {
                        setMessagesModalOpen(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {t("viewMessages")}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setReplyModalOpen(true);
                    }}
                    className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                  >
                    {t("reply")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedBooking && (
        <>
          {selectedBooking && (
            <BookingReplyModal
              isOpen={replyModalOpen}
              onClose={() => {
                setReplyModalOpen(false);
                loadBookings();
              }}
              bookingId={selectedBooking.id}
              customerEmail={selectedBooking.customer_email || selectedBooking.user_email || ""}
              customerName={selectedBooking.customer_name || "Unbekannt"}
              courseTitle={selectedBooking.course_title || "Unbekannter Kurs"}
              bookingDate={moment(selectedBooking.booking_date).format("DD.MM.YYYY")}
              bookingTime={`${selectedBooking.start_time} - ${selectedBooking.end_time}`}
              originalNotes={selectedBooking.notes}
              onSuccess={loadBookings}
            />
          )}
          {selectedBooking && (
            <BookingMessagesModal
              isOpen={messagesModalOpen}
              onClose={() => setMessagesModalOpen(false)}
              bookingId={selectedBooking.id}
            />
          )}
        </>
      )}
    </div>
  );
}

export default memo(AdminCalendarView);

