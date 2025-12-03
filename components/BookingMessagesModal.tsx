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
}: BookingMessagesModalProps) {
  const [messages, setMessages] = useState<BookingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}

