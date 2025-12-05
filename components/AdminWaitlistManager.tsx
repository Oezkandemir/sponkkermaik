"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface WaitlistEntry {
  id: string;
  course_id: string;
  course_title: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  participants: number;
  participant_names: string | null;
  auto_book: boolean;
  status: "pending" | "notified" | "converted" | "cancelled";
  converted_booking_id: string | null;
  created_at: string;
  notified_at: string | null;
  converted_at: string | null;
  preferred_date: string | null;
  preferred_time_slot: {
    id: string;
    start_time: string;
    end_time: string;
    day_of_week: number;
  } | null;
}

/**
 * Admin Waitlist Manager Component
 * 
 * Allows admins to view and manage waitlist entries.
 */
export default function AdminWaitlistManager() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "notified" | "converted" | "cancelled">("all");
  const [searchQuery, setSearchQuery] = useState("");

  /**
   * Loads all waitlist entries
   */
  const loadWaitlist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/waitlist");
      
      if (!response.ok) {
        throw new Error("Failed to load waitlist entries");
      }

      const data = await response.json();
      setWaitlistEntries(data.waitlistEntries || []);
    } catch (err) {
      console.error("Error loading waitlist:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Fehler beim Laden der Warteliste",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWaitlist();
  }, [loadWaitlist]);

  /**
   * Removes a waitlist entry
   */
  const removeWaitlistEntry = async (entryId: string) => {
    if (!confirm("Möchten Sie diesen Wartelisten-Eintrag wirklich entfernen?")) {
      return;
    }

    try {
      const response = await fetch(`/api/waitlist/remove?id=${entryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove waitlist entry");
      }

      setMessage({ type: "success", text: "Wartelisten-Eintrag erfolgreich entfernt" });
      await loadWaitlist();
    } catch (err) {
      console.error("Error removing waitlist entry:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Fehler beim Entfernen des Eintrags",
      });
    }
  };

  /**
   * Filtered waitlist entries
   */
  const filteredEntries = waitlistEntries.filter((entry) => {
    // Status filter
    if (filterStatus !== "all" && entry.status !== filterStatus) {
      return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        entry.customer_name.toLowerCase().includes(query) ||
        entry.customer_email.toLowerCase().includes(query) ||
        entry.course_title.toLowerCase().includes(query)
      );
    }

    return true;
  });

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
          <button
            onClick={() => setMessage(null)}
            className="ml-4 text-sm underline"
          >
            Schließen
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Warteliste verwalten</h2>
          <p className="text-gray-600 mt-1">Verwalten Sie Wartelisten-Einträge für ausgebuchte Kurse</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Suche nach Name, E-Mail oder Kurs..."
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
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
          >
            <option value="all">Alle Status</option>
            <option value="pending">Ausstehend</option>
            <option value="notified">Benachrichtigt</option>
            <option value="converted">Konvertiert</option>
            <option value="cancelled">Storniert</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-gray-600">
          {filteredEntries.length} von {waitlistEntries.length} Einträgen
        </div>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>{waitlistEntries.filter(e => e.status === "pending").length} ausstehend</span>
          <span>{waitlistEntries.filter(e => e.status === "notified").length} benachrichtigt</span>
          <span>{waitlistEntries.filter(e => e.status === "converted").length} konvertiert</span>
        </div>
      </div>

      {/* Waitlist Entries */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Keine Wartelisten-Einträge gefunden</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className={`bg-white rounded-lg shadow-md p-6 border-2 ${
                entry.status === "pending"
                  ? "border-amber-200"
                  : entry.status === "converted"
                  ? "border-green-200"
                  : entry.status === "notified"
                  ? "border-blue-200"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {entry.course_title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        entry.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : entry.status === "converted"
                          ? "bg-green-100 text-green-700"
                          : entry.status === "notified"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {entry.status === "pending" && "Ausstehend"}
                      {entry.status === "converted" && "Konvertiert"}
                      {entry.status === "notified" && "Benachrichtigt"}
                      {entry.status === "cancelled" && "Storniert"}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Kunde:</strong> {entry.customer_name}</p>
                    <p><strong>E-Mail:</strong> {entry.customer_email}</p>
                    <p><strong>Teilnehmer:</strong> {entry.participants}</p>
                    {entry.preferred_date && (
                      <p><strong>Gewünschtes Datum:</strong> {new Date(entry.preferred_date).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        weekday: "long"
                      })}</p>
                    )}
                    {entry.preferred_time_slot && (
                      <p><strong>Gewünschte Zeit:</strong> {entry.preferred_time_slot.start_time} - {entry.preferred_time_slot.end_time}</p>
                    )}
                    {entry.auto_book && (
                      <p className="text-amber-600 font-medium">✓ Automatische Buchung aktiviert</p>
                    )}
                    {entry.converted_booking_id && (
                      <p className="text-green-600">
                        <strong>Buchung:</strong> {entry.converted_booking_id.substring(0, 8)}...
                      </p>
                    )}
                    <p><strong>Erstellt:</strong> {new Date(entry.created_at).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}</p>
                    {entry.notified_at && (
                      <p><strong>Benachrichtigt:</strong> {new Date(entry.notified_at).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}</p>
                    )}
                    {entry.converted_at && (
                      <p><strong>Konvertiert:</strong> {new Date(entry.converted_at).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}</p>
                    )}
                  </div>
                </div>
                {entry.status === "pending" && (
                  <button
                    onClick={() => removeWaitlistEntry(entry.id)}
                    className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Entfernen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


