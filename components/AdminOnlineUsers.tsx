"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface OnlineUser {
  sessionId: string;
  userId: string | null;
  lastSeen: string;
  userAgent: string | null;
  email: string | null;
  name: string | null;
  displayName: string;
}

interface OnlineUsersData {
  totalActive: number;
  uniqueUsers: number;
  anonymousUsers: number;
  users: OnlineUser[];
}

/**
 * Admin Online Users Component
 * 
 * Displays a list of currently active users on the site.
 * Shows user information if available, otherwise displays as "User".
 */
interface UserAnalytics {
  session: {
    sessionId: string;
    userId: string | null;
    lastSeen: string;
    userAgent: string | null;
    ipAddress: string | null;
    createdAt: string;
  };
  user: {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
    lastSignInAt: string | null;
  } | null;
  analytics: {
    totalPageVisits: number;
    totalTimeOnSite: number;
    mostVisitedPages: Array<{ path: string; count: number }>;
    recentVisits: Array<{
      path: string;
      title: string | null;
      duration: number;
      startedAt: string;
      endedAt: string | null;
      referrer: string | null;
    }>;
  };
  bookings: Array<{
    id: string;
    date: string;
    time: string;
    status: string;
    participants: number;
    courseTitle: string;
    createdAt: string;
  }>;
  vouchers: Array<{
    id: string;
    code: string;
    value: number;
    status: string;
    createdAt: string;
    validUntil: string;
  }>;
}

export default function AdminOnlineUsers() {
  const t = useTranslations("admin");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OnlineUsersData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<OnlineUser | null>(null);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    loadOnlineUsers();
    
    // Refresh every 10 seconds
    const interval = setInterval(() => {
      loadOnlineUsers();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Loads online users from API
   */
  const loadOnlineUsers = async () => {
    try {
      setError(null);
      const response = await fetch("/api/admin/online-users");
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Validate response structure
      if (!result || typeof result !== 'object') {
        throw new Error("Invalid response format");
      }
      
      setData({
        totalActive: result.totalActive || 0,
        uniqueUsers: result.uniqueUsers || 0,
        anonymousUsers: result.anonymousUsers || 0,
        users: Array.isArray(result.users) ? result.users : [],
      });
    } catch (err) {
      console.error("Error loading online users:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formats relative time (e.g., "vor 2 Minuten")
   */
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);

    if (diffSecs < 30) {
      return "gerade eben";
    } else if (diffMins < 1) {
      return "vor weniger als einer Minute";
    } else if (diffMins === 1) {
      return "vor 1 Minute";
    } else {
      return `vor ${diffMins} Minuten`;
    }
  };

  /**
   * Extracts browser name from user agent
   */
  const getBrowserName = (userAgent: string | null): string => {
    if (!userAgent) return "Unbekannt";
    
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    if (userAgent.includes("Opera")) return "Opera";
    
    return "Unbekannt";
  };

  /**
   * Loads analytics for a specific user
   */
  const loadUserAnalytics = async (user: OnlineUser) => {
    setSelectedUser(user);
    setLoadingAnalytics(true);
    setAnalytics(null);

    try {
      const response = await fetch(`/api/admin/user-analytics/${user.sessionId}`);
      
      if (!response.ok) {
        throw new Error("Failed to load user analytics");
      }

      const result = await response.json();
      setAnalytics(result);
    } catch (err) {
      console.error("Error loading user analytics:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingAnalytics(false);
    }
  };

  /**
   * Formats duration in seconds to human readable format
   */
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} Sekunden`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} Minute${minutes !== 1 ? "n" : ""}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours} Stunde${hours !== 1 ? "n" : ""} ${minutes} Minute${minutes !== 1 ? "n" : ""}`;
    }
  };

  /**
   * Formats page path to readable name
   */
  const formatPagePath = (path: string): string => {
    if (path === "/") return "Startseite";
    if (path.startsWith("/de/") || path.startsWith("/en/")) {
      path = path.substring(3);
    }
    if (path.startsWith("/")) {
      path = path.substring(1);
    }
    if (!path) return "Startseite";
    
    // Replace dashes and underscores with spaces, capitalize
    return path
      .split("/")
      .map(part => part.replace(/[-_]/g, " "))
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" / ");
  };

  if (loading && !data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Aktive Benutzer</h3>
          <div className="animate-spin h-5 w-5 border-2 border-amber-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Aktive Benutzer</h3>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="text-sm">Fehler beim Laden: {error}</p>
          <button
            onClick={loadOnlineUsers}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Aktive Benutzer</h3>
          <p className="text-sm text-gray-600 mt-1">
            {data.totalActive} {data.totalActive === 1 ? "aktive Session" : "aktive Sessions"}
            {data.uniqueUsers > 0 && (
              <span className="ml-2">
                ({data.uniqueUsers} {data.uniqueUsers === 1 ? "angemeldeter Benutzer" : "angemeldete Benutzer"})
              </span>
            )}
            {data.anonymousUsers > 0 && (
              <span className="ml-2">
                ({data.anonymousUsers} {data.anonymousUsers === 1 ? "anonymer Benutzer" : "anonyme Benutzer"})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>

      {data.users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="w-12 h-12 mx-auto mb-2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="text-sm">Keine aktiven Benutzer</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {data.users.map((user, index) => (
            <button
              key={user.sessionId}
              onClick={() => loadUserAnalytics(user)}
              className="w-full text-left flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors hover:border-amber-300"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900 truncate">
                    {user.displayName}
                  </span>
                  {user.userId && (
                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                      Angemeldet
                    </span>
                  )}
                  {!user.userId && (
                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                      Anonym
                    </span>
                  )}
                </div>
                {user.email && user.email !== user.displayName && (
                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                )}
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>{getBrowserName(user.userAgent)}</span>
                  <span>•</span>
                  <span>{formatRelativeTime(user.lastSeen)}</span>
                </div>
              </div>
              <div className="flex-shrink-0 ml-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* User Analytics Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setSelectedUser(null);
            setAnalytics(null);
          }}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Benutzer-Analytics: {selectedUser.displayName}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedUser.email || "Anonymer Benutzer"}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setAnalytics(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {loadingAnalytics ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-2 border-amber-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-600 mt-4">Lade Analytics...</p>
                </div>
              ) : analytics ? (
                <>
                  {/* User Information */}
                  {analytics.user && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Account-Informationen</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <span className="ml-2 font-medium text-gray-900">{analytics.user.name || "Nicht angegeben"}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">E-Mail:</span>
                          <span className="ml-2 font-medium text-gray-900">{analytics.user.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Account erstellt:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {new Date(analytics.user.createdAt).toLocaleDateString("de-DE")}
                          </span>
                        </div>
                        {analytics.user.lastSignInAt && (
                          <div>
                            <span className="text-gray-600">Letzter Login:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {new Date(analytics.user.lastSignInAt).toLocaleDateString("de-DE")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Session Information */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Session-Informationen</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Browser:</span>
                        <span className="ml-2 font-medium text-gray-900">{getBrowserName(analytics.session.userAgent)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Letzte Aktivität:</span>
                        <span className="ml-2 font-medium text-gray-900">{formatRelativeTime(analytics.session.lastSeen)}</span>
                      </div>
                      {analytics.session.ipAddress && (
                        <div>
                          <span className="text-gray-600">IP-Adresse:</span>
                          <span className="ml-2 font-medium text-gray-900">{analytics.session.ipAddress}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Session gestartet:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {new Date(analytics.session.createdAt).toLocaleString("de-DE")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Analytics Overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="text-sm text-gray-600">Seitenbesuche</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">{analytics.analytics.totalPageVisits}</div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="text-sm text-gray-600">Zeit auf der Seite</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">
                        {formatDuration(analytics.analytics.totalTimeOnSite)}
                      </div>
                    </div>
                    {analytics.user && (
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="text-sm text-gray-600">Buchungen</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{analytics.bookings.length}</div>
                      </div>
                    )}
                  </div>

                  {/* Most Visited Pages */}
                  {analytics.analytics.mostVisitedPages.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Meistbesuchte Seiten</h4>
                      <div className="space-y-2">
                        {analytics.analytics.mostVisitedPages.map((page, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{formatPagePath(page.path)}</span>
                            <span className="text-gray-500">{page.count}x</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Page Visits */}
                  {analytics.analytics.recentVisits.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Letzte Seitenbesuche</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {analytics.analytics.recentVisits.map((visit, index) => (
                          <div key={index} className="flex items-start justify-between p-2 bg-gray-50 rounded text-sm">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {visit.title || formatPagePath(visit.path)}
                              </div>
                              <div className="text-xs text-gray-500 truncate">{visit.path}</div>
                              {visit.referrer && (
                                <div className="text-xs text-gray-400 truncate">Von: {visit.referrer}</div>
                              )}
                            </div>
                            <div className="ml-4 text-right text-xs text-gray-500 whitespace-nowrap">
                              <div>{formatDuration(visit.duration)}</div>
                              <div className="mt-1">
                                {new Date(visit.startedAt).toLocaleTimeString("de-DE", { 
                                  hour: "2-digit", 
                                  minute: "2-digit" 
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* User Bookings */}
                  {analytics.user && analytics.bookings.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Buchungen</h4>
                      <div className="space-y-2">
                        {analytics.bookings.map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                            <div>
                              <div className="font-medium text-gray-900">{booking.courseTitle}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(booking.date).toLocaleDateString("de-DE")} • {booking.time} • {booking.participants} Teilnehmer
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded ${
                              booking.status === "confirmed" ? "bg-green-100 text-green-700" :
                              booking.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                              booking.status === "cancelled" ? "bg-red-100 text-red-700" :
                              "bg-gray-100 text-gray-700"
                            }`}>
                              {booking.status === "confirmed" ? "Bestätigt" :
                               booking.status === "pending" ? "Unbestätigt" :
                               booking.status === "cancelled" ? "Abgesagt" :
                               "Abgeschlossen"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* User Vouchers */}
                  {analytics.user && analytics.vouchers.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Gutscheine</h4>
                      <div className="space-y-2">
                        {analytics.vouchers.map((voucher) => (
                          <div key={voucher.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                            <div>
                              <div className="font-medium text-gray-900">{voucher.code}</div>
                              <div className="text-xs text-gray-500">
                                {voucher.value}€ • Gültig bis {new Date(voucher.validUntil).toLocaleDateString("de-DE")}
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded ${
                              voucher.status === "active" ? "bg-green-100 text-green-700" :
                              voucher.status === "used" ? "bg-gray-100 text-gray-700" :
                              "bg-red-100 text-red-700"
                            }`}>
                              {voucher.status === "active" ? "Aktiv" :
                               voucher.status === "used" ? "Verwendet" :
                               "Abgelaufen"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Keine Analytics-Daten verfügbar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Aktualisiert alle 10 Sekunden. Benutzer werden als aktiv angezeigt, wenn sie innerhalb der letzten 5 Minuten aktiv waren.
        </p>
      </div>
    </div>
  );
}

