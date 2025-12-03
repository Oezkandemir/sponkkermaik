"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import NewsletterComposer from "./NewsletterComposer";

interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
  created_at: string;
}

/**
 * Admin Newsletter Manager Component
 * 
 * Allows admins to view and manage newsletter subscribers.
 */
function AdminNewsletterManager() {
  const t = useTranslations("admin.newsletter");
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "unsubscribed">("all");
  const [activeTab, setActiveTab] = useState<"subscribers" | "compose">("subscribers");

  /**
   * Loads all newsletter subscribers from database
   */
  const loadSubscribers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/newsletter");
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to load subscribers" }));
        
        // Show migration message if table doesn't exist
        if (errorData.migrationRequired) {
          throw new Error(
            errorData.error + " Migration: " + errorData.migrationFile
          );
        }
        
        throw new Error(errorData.error || "Failed to load subscribers");
      }

      const data = await response.json();
      setSubscribers(data.subscribers || []);
    } catch (err) {
      console.error("Error loading subscribers:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Fehler beim Laden der Abonnenten",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscribers();
  }, [loadSubscribers]);

  /**
   * Unsubscribes a user from the newsletter
   */
  const unsubscribeUser = async (subscriberId: string, email: string) => {
    if (!confirm(`Möchten Sie ${email} wirklich vom Newsletter abmelden?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ unsubscribed_at: new Date().toISOString() })
        .eq("id", subscriberId);

      if (error) throw error;

      setMessage({ type: "success", text: "Abonnent erfolgreich abgemeldet" });
      loadSubscribers();
    } catch (err) {
      console.error("Error unsubscribing user:", err);
      setMessage({
        type: "error",
        text: "Fehler beim Abmelden des Abonnenten",
      });
    }
  };

  /**
   * Resubscribes a user to the newsletter
   */
  const resubscribeUser = async (subscriberId: string, email: string) => {
    if (!confirm(`Möchten Sie ${email} wirklich wieder für den Newsletter anmelden?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
        })
        .eq("id", subscriberId);

      if (error) throw error;

      setMessage({ type: "success", text: "Abonnent erfolgreich wieder angemeldet" });
      loadSubscribers();
    } catch (err) {
      console.error("Error resubscribing user:", err);
      setMessage({
        type: "error",
        text: "Fehler beim Wiederanmelden des Abonnenten",
      });
    }
  };

  /**
   * Deletes a subscriber
   */
  const deleteSubscriber = async (subscriberId: string, email: string) => {
    if (!confirm(`Möchten Sie ${email} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .delete()
        .eq("id", subscriberId);

      if (error) throw error;

      setMessage({ type: "success", text: "Abonnent erfolgreich gelöscht" });
      loadSubscribers();
    } catch (err) {
      console.error("Error deleting subscriber:", err);
      setMessage({
        type: "error",
        text: "Fehler beim Löschen des Abonnenten",
      });
    }
  };

  /**
   * Filters subscribers based on active filter and search query
   */
  const filteredSubscribers = useMemo(() => {
    let filtered = subscribers;

    // Apply status filter
    if (filter === "active") {
      filtered = filtered.filter((s) => !s.unsubscribed_at);
    } else if (filter === "unsubscribed") {
      filtered = filtered.filter((s) => s.unsubscribed_at);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((s) => s.email.toLowerCase().includes(query));
    }

    return filtered.sort((a, b) => {
      // Sort by subscribed_at descending (newest first)
      return new Date(b.subscribed_at).getTime() - new Date(a.subscribed_at).getTime();
    });
  }, [subscribers, filter, searchQuery]);

  const activeCount = subscribers.filter((s) => !s.unsubscribed_at).length;
  const unsubscribedCount = subscribers.filter((s) => s.unsubscribed_at).length;

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-amber-600 border-t-transparent rounded-full mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("subscribers")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "subscribers"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Abonnenten verwalten
          </button>
          <button
            onClick={() => setActiveTab("compose")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "compose"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Newsletter versenden
          </button>
        </div>
      </div>

      {/* Newsletter Composer Tab */}
      {activeTab === "compose" && (
        <NewsletterComposer
          activeSubscribersCount={activeCount}
          allSubscribersCount={subscribers.length}
        />
      )}

      {/* Subscribers Tab */}
      {activeTab === "subscribers" && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gesamt Abonnenten</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{subscribers.length}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktive Abonnenten</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{activeCount}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Abgemeldet</p>
              <p className="text-3xl font-bold text-red-900 mt-2">{unsubscribedCount}</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <p>{message.text}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-gray-200 sm:border-b-0 sm:border-r pr-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 sm:border-b-0 sm:border-r-2 ${
                filter === "all"
                  ? "border-amber-600 text-amber-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Alle ({subscribers.length})
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 sm:border-b-0 sm:border-r-2 ${
                filter === "active"
                  ? "border-amber-600 text-amber-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Aktiv ({activeCount})
            </button>
            <button
              onClick={() => setFilter("unsubscribed")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 sm:border-b-0 ${
                filter === "unsubscribed"
                  ? "border-amber-600 text-amber-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Abgemeldet ({unsubscribedCount})
            </button>
          </div>

          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="E-Mail-Adresse suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Subscribers List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {filteredSubscribers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Keine Abonnenten gefunden</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-Mail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Angemeldet am
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscribers.map((subscriber) => {
                  const isActive = !subscriber.unsubscribed_at;
                  return (
                    <tr key={subscriber.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{subscriber.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(subscriber.subscribed_at).toLocaleDateString("de-DE", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isActive ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Aktiv
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Abgemeldet
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {isActive ? (
                            <button
                              onClick={() => unsubscribeUser(subscriber.id, subscriber.email)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Abmelden
                            </button>
                          ) : (
                            <button
                              onClick={() => resubscribeUser(subscriber.id, subscriber.email)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Wieder anmelden
                            </button>
                          )}
                          <button
                            onClick={() => deleteSubscriber(subscriber.id, subscriber.email)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Löschen
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}

export default memo(AdminNewsletterManager);

