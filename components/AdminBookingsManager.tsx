"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
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
  participantList?: string[]; // Extracted participant names
  course_price?: number; // Price per person from course
  calculated_amount?: number; // participants * course_price
}

type BookingFilter = "upcoming" | "unconfirmed" | "recurring" | "past" | "cancelled";

/**
 * Admin Bookings Manager Component
 * 
 * Allows admins to view and manage all bookings with filters.
 */
function AdminBookingsManager() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeFilter, setActiveFilter] = useState<BookingFilter>("upcoming");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [messagesModalOpen, setMessagesModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [addingParticipant, setAddingParticipant] = useState<Set<string>>(new Set());
  const [newParticipantName, setNewParticipantName] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("all");
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");
  const [availableCourses, setAvailableCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [expandedBookings, setExpandedBookings] = useState<Set<string>>(new Set());
  const [creatingInvoice, setCreatingInvoice] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Record<string, string>>({}); // booking_id -> invoice_id

  /**
   * Loads all available courses for filtering
   * Memoized callback to prevent unnecessary re-renders
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
   * Loads all bookings from database with optimized queries
   * Memoized callback to prevent unnecessary re-renders
   */
  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use API route for better performance and server-side optimization
      const response = await fetch("/api/admin/bookings");
      
      if (!response.ok) {
        throw new Error("Failed to load bookings");
      }

      const result = await response.json();
      setBookings(result.bookings || []);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setMessage({ type: "error", text: "Fehler beim Laden der Buchungen" });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Loads existing invoices to check which bookings already have invoices
   */
  const loadInvoices = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/invoices");
      if (response.ok) {
        const data = await response.json();
        const invoiceMap: Record<string, string> = {};
        (data.invoices || []).forEach((inv: any) => {
          if (inv.booking_id) {
            invoiceMap[inv.booking_id] = inv.id;
          }
        });
        setInvoices(invoiceMap);
      }
    } catch (err) {
      console.error("Error loading invoices:", err);
    }
  }, []);

  useEffect(() => {
    loadBookings();
    loadCourses();
    loadInvoices();
  }, [loadBookings, loadCourses, loadInvoices]);

  /**
   * Updates booking status
   */
  const updateBookingStatus = async (bookingId: string, newStatus: Booking["status"]) => {
    try {
      // Get booking details before update to check course_id
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) {
        throw new Error("Booking not found");
      }

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
   * Extracts participant names from notes field
   */
  const extractParticipantsFromNotes = (notes: string): string[] => {
    const participants: string[] = [];
    const lines = notes.split("\n");
    let inParticipantsSection = false;

    for (const line of lines) {
      if (line.trim() === "Teilnehmer:") {
        inParticipantsSection = true;
        continue;
      }
      if (inParticipantsSection) {
        const match = line.match(/^Teilnehmer \d+: (.+)$/);
        if (match) {
          participants.push(match[1].trim());
        }
      }
    }

    return participants;
  };

  /**
   * Adds a new participant to a booking
   * Automatically saves and sends email notification
   */
  const addParticipant = async (bookingId: string, participantName: string) => {
    if (!participantName.trim()) {
      return;
    }

    try {
      // Show loading state
      setAddingParticipant((prev) => new Set(prev).add(bookingId));

      const response = await fetch("/api/bookings/add-participant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          participantName: participantName.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Fehler beim Hinzufügen des Teilnehmers");
      }

      // Clear input field
      setNewParticipantName((prev) => {
        const newState = { ...prev };
        delete newState[bookingId];
        return newState;
      });

      setMessage({
        type: "success",
        text: `Teilnehmer "${participantName.trim()}" erfolgreich hinzugefügt${result.emailSent ? " (E-Mail gesendet)" : ""}`,
      });

      // Reload bookings to ensure consistency
      await loadBookings();
    } catch (err) {
      console.error("Error adding participant:", err);
      setMessage({
        type: "error",
        text: `Fehler beim Hinzufügen des Teilnehmers: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
      });
    } finally {
      // Remove loading state
      setAddingParticipant((prev) => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  /**
   * Toggles accordion expansion for a booking
   */
  const toggleBookingExpansion = (bookingId: string) => {
    setExpandedBookings((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bookingId)) {
        newSet.delete(bookingId);
      } else {
        newSet.add(bookingId);
      }
      return newSet;
    });
  };


  /**
   * Creates an invoice for a booking
   */
  const createInvoiceForBooking = async (booking: Booking) => {
    if (!booking.customer_email || !booking.customer_name || !booking.course_title) {
      setMessage({ type: "error", text: "Buchung hat nicht alle erforderlichen Informationen für eine Rechnung" });
      return;
    }

    try {
      setCreatingInvoice(booking.id);
      setMessage(null);

      // Calculate default amount: participants * course_price
      let defaultAmount = "";
      if (booking.participants && booking.course_price) {
        const calculatedAmount = booking.participants * booking.course_price;
        defaultAmount = calculatedAmount.toFixed(2);
      }

      // Prompt for amount with calculated default
      const promptText = defaultAmount 
        ? `Bitte geben Sie den Rechnungsbetrag ein (€):\n\nBerechneter Betrag: ${defaultAmount}€\n(${booking.participants} Teilnehmer × ${booking.course_price?.toFixed(2)}€)`
        : "Bitte geben Sie den Rechnungsbetrag ein (€):";
      
      const amount = prompt(promptText, defaultAmount);
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        setMessage({ type: "error", text: "Ungültiger Betrag" });
        return;
      }

      // Extract participant names
      const participantNames: string[] = [booking.customer_name || ""];
      if (booking.participantList && Array.isArray(booking.participantList)) {
        participantNames.push(...booking.participantList);
      }

      const response = await fetch("/api/admin/invoices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: booking.id,
          customer_email: booking.customer_email,
          customer_name: booking.customer_name,
          course_title: booking.course_title,
          booking_date: booking.booking_date,
          amount: parseFloat(amount),
          participants: booking.participants || 1,
          participant_names: participantNames,
          course_price_per_person: booking.course_price || 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create invoice");
      }

      const data = await response.json();
      setInvoices((prev) => ({ ...prev, [booking.id]: data.invoice.id }));
      setMessage({ type: "success", text: "Rechnung erfolgreich erstellt. Wechseln Sie zum Rechnungen-Tab, um sie zu versenden." });
      await loadInvoices();
    } catch (err) {
      console.error("Error creating invoice:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Fehler beim Erstellen der Rechnung",
      });
    } finally {
      setCreatingInvoice(null);
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
   * Filters bookings based on active filter, search query, course, and date range
   * Memoized for performance
   */
  const filteredBookings = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toTimeString().split(" ")[0].substring(0, 5);

    let filtered = bookings;

    // Apply status filter
    switch (activeFilter) {
      case "upcoming":
        filtered = filtered.filter(
          (b) =>
            (b.booking_date > today || (b.booking_date === today && b.start_time >= now)) &&
            b.status !== "cancelled"
        );
        break;
      case "unconfirmed":
        filtered = filtered.filter((b) => b.status === "pending");
        break;
      case "recurring":
        // For now, return empty - can be extended later
        filtered = [];
        break;
      case "past":
        filtered = filtered.filter(
          (b) =>
            (b.booking_date < today || (b.booking_date === today && b.start_time < now)) &&
            b.status !== "cancelled"
        );
        break;
      case "cancelled":
        filtered = filtered.filter((b) => b.status === "cancelled");
        break;
      default:
        break;
    }

    // Apply course filter - we need to match by course_id stored in the booking
    if (selectedCourseFilter !== "all") {
      const selectedCourse = availableCourses.find((c) => c.id === selectedCourseFilter);
      if (selectedCourse) {
        filtered = filtered.filter((b) => b.course_title === selectedCourse.title);
      }
    }

    // Apply date range filter
    if (dateRangeStart) {
      filtered = filtered.filter((b) => b.booking_date >= dateRangeStart);
    }
    if (dateRangeEnd) {
      filtered = filtered.filter((b) => b.booking_date <= dateRangeEnd);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.customer_name?.toLowerCase().includes(query) ||
          b.customer_email?.toLowerCase().includes(query) ||
          b.course_title?.toLowerCase().includes(query) ||
          b.notes?.toLowerCase().includes(query) ||
          b.booking_date.includes(query)
      );
    }

    return filtered;
  }, [bookings, activeFilter, searchQuery, selectedCourseFilter, dateRangeStart, dateRangeEnd, availableCourses]);

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

      {/* Search and Advanced Filters */}
      <div className="mb-4 sm:mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Suche nach Name, E-Mail, Kurs oder Notizen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Course Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kurs filtern
            </label>
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">Alle Kurse</option>
              {availableCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Start */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Von Datum
            </label>
            <input
              type="date"
              value={dateRangeStart}
              onChange={(e) => setDateRangeStart(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Date Range End */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bis Datum
            </label>
            <input
              type="date"
              value={dateRangeEnd}
              onChange={(e) => setDateRangeEnd(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {(searchQuery || selectedCourseFilter !== "all" || dateRangeStart || dateRangeEnd) && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCourseFilter("all");
              setDateRangeStart("");
              setDateRangeEnd("");
            }}
            className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Filter zurücksetzen
          </button>
        )}
      </div>

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
          {filteredBookings.map((booking) => {
            const isExpanded = expandedBookings.has(booking.id);
            
            return (
              <div
                key={booking.id}
                className={`bg-white border-2 rounded-lg transition-all ${
                  booking.status === "pending"
                    ? "border-yellow-300 hover:border-yellow-400"
                    : booking.status === "confirmed"
                    ? "border-green-300 hover:border-green-400"
                    : booking.status === "cancelled"
                    ? "border-red-300 hover:border-red-400"
                    : "border-gray-200 hover:border-gray-300"
                } ${isExpanded ? "shadow-md" : "hover:shadow-sm"}`}
              >
                {/* Accordion Header - Always Visible */}
                <button
                  onClick={() => toggleBookingExpansion(booking.id)}
                  className="w-full p-4 sm:p-5 text-left focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left Side - Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                          {booking.course_title}
                        </h3>
                        
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
                        
                        {booking.hasMessages && (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-700 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Nachrichten
                          </span>
                        )}
                      </div>
                      
                      {/* Key Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-gray-600">
                            {new Date(booking.booking_date).toLocaleDateString("de-DE", {
                              weekday: "short",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-600">{booking.start_time} - {booking.end_time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-gray-600 truncate">{booking.customer_name || "Unbekannt"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-gray-600">{booking.participants} Teilnehmer</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Side - Expand Icon */}
                    <div className="flex-shrink-0">
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Accordion Content - Expandable */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-gray-200 pt-4 space-y-4">
                    {/* Detailed Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">E-Mail</div>
                        <div className="text-sm text-gray-900 break-words">
                          {booking.customer_email || booking.user_email || "Unbekannt"}
                        </div>
                      </div>
                      
                      {booking.participantList && booking.participantList.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-2">Teilnehmerliste</div>
                          <ul className="text-sm text-gray-900 space-y-1">
                            {booking.participantList.map((name, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <span className="text-gray-400">•</span>
                                <span>{name}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="text-xs font-medium text-amber-800 mb-1">Notizen</div>
                        <p className="text-sm text-amber-900 break-words whitespace-pre-wrap">
                          {booking.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Details
                      </Link>
                      
                      {booking.notes && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(booking);
                            setReplyModalOpen(true);
                          }}
                          className="px-3 py-2 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors flex items-center gap-1.5"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          Antworten
                        </button>
                      )}
                      
                      {booking.status === "pending" && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateBookingStatus(booking.id, "confirmed");
                            }}
                            className="px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Bestätigen
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateBookingStatus(booking.id, "cancelled");
                            }}
                            className="px-3 py-2 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Ablehnen
                          </button>
                        </>
                      )}
                      
                      {booking.status === "confirmed" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateBookingStatus(booking.id, "cancelled");
                          }}
                          className="px-3 py-2 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1.5"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Stornieren
                        </button>
                      )}
                      
                      {booking.hasMessages && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(booking);
                            setMessagesModalOpen(true);
                          }}
                          className="px-3 py-2 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-1.5"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Nachrichten
                        </button>
                      )}
                      
                      {/* Create Invoice Button */}
                      {invoices[booking.id] ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Navigate to invoices tab - this would require parent component coordination
                            // For now, just show a message
                            setMessage({ type: "success", text: "Rechnung bereits vorhanden. Wechseln Sie zum Rechnungen-Tab." });
                          }}
                          className="px-3 py-2 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center gap-1.5"
                          title="Rechnung bereits erstellt"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Rechnung vorhanden
                        </button>
                      ) : (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await createInvoiceForBooking(booking);
                          }}
                          disabled={creatingInvoice === booking.id}
                          className="px-3 py-2 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {creatingInvoice === booking.id ? (
                            <>
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Erstelle...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Rechnung erstellen
                            </>
                          )}
                        </button>
                      )}
                      
                      {/* Add Participant */}
                      <div className="flex-1 min-w-[200px]">
                        {addingParticipant.has(booking.id) ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newParticipantName[booking.id] || ""}
                              onChange={(e) => {
                                setNewParticipantName((prev) => ({
                                  ...prev,
                                  [booking.id]: e.target.value,
                                }));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && newParticipantName[booking.id]?.trim()) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  addParticipant(booking.id, newParticipantName[booking.id]);
                                }
                                if (e.key === "Escape") {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setNewParticipantName((prev) => {
                                    const newState = { ...prev };
                                    delete newState[booking.id];
                                    return newState;
                                  });
                                  setAddingParticipant((prev) => {
                                    const newSet = new Set(prev);
                                    newSet.delete(booking.id);
                                    return newSet;
                                  });
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              onBlur={() => {
                                setTimeout(() => {
                                  if (newParticipantName[booking.id]?.trim()) {
                                    addParticipant(booking.id, newParticipantName[booking.id]);
                                  } else {
                                    setAddingParticipant((prev) => {
                                      const newSet = new Set(prev);
                                      newSet.delete(booking.id);
                                      return newSet;
                                    });
                                    setNewParticipantName((prev) => {
                                      const newState = { ...prev };
                                      delete newState[booking.id];
                                      return newState;
                                    });
                                  }
                                }, 200);
                              }}
                              autoFocus
                              placeholder="Name eingeben..."
                              className="flex-1 px-3 py-2 text-xs border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                            <div className="animate-spin h-4 w-4 border-2 border-amber-600 border-t-transparent rounded-full"></div>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAddingParticipant((prev) => new Set(prev).add(booking.id));
                              setNewParticipantName((prev) => ({ ...prev, [booking.id]: "" }));
                            }}
                            className="w-full px-3 py-2 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Teilnehmer hinzufügen
                          </button>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBooking(booking.id);
                        }}
                        className="px-3 py-2 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Löschen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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

export default memo(AdminBookingsManager);

