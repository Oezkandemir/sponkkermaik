"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface BookingMessage {
  id: string;
  sender_type: "customer" | "admin";
  sender_id: string | null;
  message: string;
  created_at: string;
}

/**
 * Booking Details Page Component
 * 
 * Displays detailed information about a specific booking with improved UI/UX.
 * Allows customers and admins to communicate via messages.
 */
export default function BookingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  const t = useTranslations("bookings");
  const supabase = createClient();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [messages, setMessages] = useState<BookingMessage[]>([]);
  const [courseTitle, setCourseTitle] = useState<string>("Kurs");
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [participantList, setParticipantList] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/signin");
        return;
      }
      
      setUser(user);
      
      // Load booking first to verify ownership
      try {
        const { data: bookingData, error: bookingError } = await supabase
          .from("bookings")
          .select(`
            *,
            course_schedule:course_schedule_id (
              course_id
            )
          `)
          .eq("id", bookingId)
          .single();

        if (bookingError) throw bookingError;

        // Verify ownership or admin access
        const { data: adminData } = await supabase
          .from("admins")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

        const userIsAdmin = !!adminData;
        const isOwner = bookingData.user_id === user.id;

        if (!userIsAdmin && !isOwner) {
          router.push("/bookings");
          return;
        }

        setIsAdmin(userIsAdmin);

        setBooking(bookingData);

        // Extract participant names from notes
        if (bookingData.notes) {
          const participants: string[] = [];
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
                participants.push(match[1].trim());
              }
            }
          }
          setParticipantList(participants);
        }

        // Load course title
        if (bookingData.course_schedule?.course_id) {
          const { data: course } = await supabase
            .from("courses")
            .select("title")
            .eq("id", bookingData.course_schedule.course_id)
            .single();

          if (course?.title) {
            setCourseTitle(course.title);
          }
        }
      } catch (err) {
        console.error("Error loading booking:", err);
        router.push("/bookings");
        return;
      }
      
      await loadMessages();
      setLoading(false);
    }

    if (bookingId) {
      loadData();
    }
  }, [bookingId]);

  /**
   * Loads messages for the booking
   */
  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/bookings/messages?bookingId=${bookingId}`);
      const data = await response.json();

      if (response.ok) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  /**
   * Handles sending a reply (works for both admin and customer)
   */
  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      setReplyError("Bitte geben Sie eine Nachricht ein.");
      return;
    }

    setSendingReply(true);
    setReplyError(null);

    try {
      let response;
      
      if (isAdmin) {
        // Admin uses admin reply API
        response = await fetch("/api/bookings/send-reply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId,
            message: replyMessage.trim(),
            customerEmail: booking.customer_email || booking.user_email || "",
            customerName: booking.customer_name || "Kunde",
            courseTitle: courseTitle,
            bookingDate: bookingDate,
            bookingTime: `${booking.start_time} - ${booking.end_time}`,
          }),
        });
      } else {
        // Customer uses customer reply API
        response = await fetch("/api/bookings/send-customer-reply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId,
            message: replyMessage.trim(),
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Senden der Nachricht");
      }

      // Success - clear reply and reload messages
      setReplyMessage("");
      setReplyError(null);
      await loadMessages();
      
      // Scroll to bottom of messages
      setTimeout(() => {
        const messagesContainer = document.getElementById("messages-container");
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    } catch (err) {
      console.error("Error sending reply:", err);
      setReplyError(err instanceof Error ? err.message : "Fehler beim Senden der Nachricht");
    } finally {
      setSendingReply(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format booking date for display and API
  const bookingDate = useMemo(() => {
    if (!booking?.booking_date) return "";
    return new Date(booking.booking_date).toLocaleDateString("de-DE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [booking]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-64 bg-gray-200 rounded-xl"></div>
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <Link
            href={isAdmin ? "/admin" : "/bookings"}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-amber-600 mb-6 transition-colors group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">{isAdmin ? "Zurück zum Admin-Dashboard" : "Zurück zu Meine Buchungen"}</span>
          </Link>

          {/* Header Card */}
          <div className={`bg-gradient-to-r rounded-xl shadow-lg p-6 sm:p-8 mb-6 ${
            booking.status === "confirmed"
              ? "from-green-500 to-green-600"
              : booking.status === "pending"
              ? "from-yellow-500 to-yellow-600"
              : booking.status === "cancelled"
              ? "from-red-500 to-red-600"
              : "from-gray-500 to-gray-600"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{courseTitle}</h1>
                <p className="text-white/90 text-sm sm:text-base">
                  {bookingDate} • {booking.start_time} - {booking.end_time}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  booking.status === "confirmed"
                    ? "bg-white text-green-700"
                    : booking.status === "pending"
                    ? "bg-white text-yellow-700"
                    : booking.status === "cancelled"
                    ? "bg-white text-red-700"
                    : "bg-white text-gray-700"
                }`}>
                  {booking.status === "confirmed" ? "✓ Bestätigt" : 
                   booking.status === "pending" ? "⏳ Unbestätigt" : 
                   booking.status === "cancelled" ? "✗ Abgesagt" : "✓ Abgeschlossen"}
                </span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Booking Details Card */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Buchungsinformationen
              </h2>
              
              <div className="space-y-4">
                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-500 uppercase">Datum</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{bookingDate}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-500 uppercase">Zeit</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{booking.start_time} - {booking.end_time}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-500 uppercase">Teilnehmer</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{booking.participants} Person{booking.participants !== 1 ? "en" : ""}</p>
                  </div>

                  {booking.customer_name && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-xs font-medium text-gray-500 uppercase">Name</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{booking.customer_name}</p>
                    </div>
                  )}

                  {booking.customer_email && (
                    <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-medium text-gray-500 uppercase">E-Mail</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 break-words">{booking.customer_email}</p>
                    </div>
                  )}
                </div>

                {/* Participant List */}
                {participantList.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-sm font-semibold text-blue-900">Teilnehmerliste</span>
                    </div>
                    <ul className="space-y-2">
                      {participantList.map((name, index) => (
                        <li key={index} className="flex items-center gap-2 text-blue-900">
                          <span className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-xs font-semibold">
                            {index + 1}
                          </span>
                          <span>{name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Notes */}
                {booking.notes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="text-sm font-semibold text-amber-900">Ihre Notizen</span>
                    </div>
                    <p className="text-amber-900 whitespace-pre-wrap leading-relaxed">{booking.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Sidebar */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Schnellaktionen</h3>
              <div className="space-y-3">
                {isAdmin && booking.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        if (confirm("Möchten Sie diese Buchung wirklich bestätigen?")) {
                          // This would need to be implemented
                        }
                      }}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Bestätigen
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Möchten Sie diese Buchung wirklich ablehnen?")) {
                          // This would need to be implemented
                        }
                      }}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Ablehnen
                    </button>
                  </>
                )}
                <Link
                  href={isAdmin ? "/admin" : "/bookings"}
                  className="block w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
                >
                  Zurück zur Übersicht
                </Link>
              </div>
            </div>
          </div>

          {/* Messages Section - Chat Style */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Nachrichtenverlauf
            </h2>
            
            {messages.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-500 font-medium">Noch keine Nachrichten vorhanden</p>
                {booking.notes && !isAdmin && (
                  <p className="mt-2 text-sm text-gray-400">
                    Sie haben eine Notiz bei der Buchung hinterlassen. Der Admin wird sich bei Bedarf bei Ihnen melden.
                  </p>
                )}
              </div>
            ) : (
              <>
                {/* Chat Messages */}
                <div 
                  id="messages-container"
                  className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2 scroll-smooth"
                >
                  {messages.map((msg, index) => {
                    const isCurrentUser = (isAdmin && msg.sender_type === "admin") || (!isAdmin && msg.sender_type === "customer");
                    const isLastMessage = index === messages.length - 1;
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} ${isLastMessage ? "animate-fade-in" : ""}`}
                      >
                        <div className={`max-w-[85%] sm:max-w-[75%] ${isCurrentUser ? "order-2" : "order-1"}`}>
                          <div className={`p-4 rounded-2xl shadow-sm ${
                            isCurrentUser
                              ? isAdmin
                                ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-br-none"
                                : "bg-gradient-to-br from-gray-600 to-gray-700 text-white rounded-br-none"
                              : isAdmin
                              ? "bg-gray-100 text-gray-900 rounded-bl-none"
                              : "bg-amber-100 text-gray-900 rounded-bl-none"
                          }`}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs font-semibold ${
                                isCurrentUser ? "text-white/90" : "text-gray-600"
                              }`}>
                                {msg.sender_type === "admin" ? "👤 Admin" : isAdmin ? "👤 Kunde" : "Sie"}
                              </span>
                              <span className={`text-xs ${
                                isCurrentUser ? "text-white/70" : "text-gray-500"
                              }`}>
                                {formatDate(msg.created_at)}
                              </span>
                            </div>
                            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                              isCurrentUser ? "text-white" : "text-gray-700"
                            }`}>
                              {msg.message}
                            </p>
                          </div>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCurrentUser ? "order-1 ml-2" : "order-2 mr-2"
                        } ${
                          isCurrentUser
                            ? isAdmin
                              ? "bg-amber-500"
                              : "bg-gray-600"
                            : isAdmin
                            ? "bg-gray-300"
                            : "bg-amber-200"
                        }`}>
                          <span className={`text-xs font-semibold ${
                            isCurrentUser ? "text-white" : "text-gray-700"
                          }`}>
                            {msg.sender_type === "admin" ? "A" : "K"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Chat Input Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {isAdmin ? "Nachricht an Kunde senden" : "Antwort schreiben"}
              </h3>
              <div className="mb-4">
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  rows={4}
                  disabled={sendingReply}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none transition-colors"
                  placeholder={isAdmin ? "Schreiben Sie hier eine Nachricht an den Kunden..." : "Schreiben Sie hier Ihre Antwort... (Strg/Cmd + Enter zum Senden)"}
                />
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>{replyMessage.length} Zeichen</span>
                  <span>Strg/Cmd + Enter zum Senden</span>
                </div>
              </div>
              {replyError && (
                <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {replyError}
                </div>
              )}
              <button
                onClick={handleSendReply}
                disabled={sendingReply || !replyMessage.trim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {sendingReply ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Wird gesendet...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    {isAdmin ? "Nachricht senden" : "Antwort senden"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
