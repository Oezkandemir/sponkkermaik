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
export default function AdminOnlineUsers() {
  const t = useTranslations("admin");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OnlineUsersData | null>(null);
  const [error, setError] = useState<string | null>(null);

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
            <div
              key={user.sessionId}
              className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
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
            </div>
          ))}
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

