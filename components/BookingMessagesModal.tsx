"use client";

import { useState, useEffect } from "react";

interface BookingMessage {
  id: string;
  sender_type: "customer" | "admin";
  sender_id: string | null;
  message: string;
  created_at: string;
}

interface BookingMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  allowReply?: boolean; // Allow customers to reply
}

/**
 * Booking Messages Modal Component
 * 
 * Displays the message history for a booking.
 * 
 * Args:
 *   isOpen: Whether the modal is open
 *   onClose: Function to close the modal
 *   bookingId: ID of the booking
 */
export default function BookingMessagesModal({
  isOpen,
  onClose,
  bookingId,
  allowReply = false,
}: BookingMessagesModalProps) {
  const [messages, setMessages] = useState<BookingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && bookingId) {
      loadMessages();
    }
  }, [isOpen, bookingId]);

  /**
   * Loads messages for the booking
   */
  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bookings/messages?bookingId=${bookingId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Laden der Nachrichten");
      }

      setMessages(data.messages || []);
    } catch (err) {
      console.error("Error loading messages:", err);
      setError(err instanceof Error ? err.message : "Fehler beim Laden der Nachrichten");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles sending a customer reply
   */
  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      setReplyError("Bitte geben Sie eine Nachricht ein.");
      return;
    }

    setSendingReply(true);
    setReplyError(null);

    try {
      const response = await fetch("/api/bookings/send-customer-reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          message: replyMessage.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Senden der Antwort");
      }

      // Success - clear reply and reload messages
      setReplyMessage("");
      setReplyError(null);
      await loadMessages();
    } catch (err) {
      console.error("Error sending reply:", err);
      setReplyError(err instanceof Error ? err.message : "Fehler beim Senden der Antwort");
    } finally {
      setSendingReply(false);
    }
  };

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Nachrichtenverlauf</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-amber-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Nachrichten werden geladen...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">{error}</div>
              <button
                onClick={loadMessages}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Erneut versuchen
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Noch keine Nachrichten vorhanden.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-lg ${
                    msg.sender_type === "admin"
                      ? "bg-amber-50 border-l-4 border-amber-500 ml-8"
                      : "bg-gray-50 border-l-4 border-gray-400 mr-8"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          msg.sender_type === "admin"
                            ? "bg-amber-200 text-amber-800"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {msg.sender_type === "admin" ? "Admin" : "Kunde"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(msg.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply Section (for customers) */}
        {allowReply && !loading && !error && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="mb-3">
              <label htmlFor="reply-input" className="block text-sm font-medium text-gray-700 mb-2">
                Antwort schreiben
              </label>
              <textarea
                id="reply-input"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={3}
                disabled={sendingReply}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Schreiben Sie hier Ihre Antwort..."
              />
            </div>
            {replyError && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                {replyError}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleSendReply}
                disabled={sendingReply || !replyMessage.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sendingReply ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Wird gesendet...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Antwort senden
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                disabled={sendingReply}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Schließen
              </button>
            </div>
          </div>
        )}

        {/* Footer (when reply is not allowed) */}
        {!allowReply && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Schließen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

