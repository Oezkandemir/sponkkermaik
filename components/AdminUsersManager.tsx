"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

interface User {
  id: string;
  email: string;
  name: string | null;
  is_admin: boolean;
  has_account: boolean;
  bookings_count: number;
  vouchers_count: number;
  created_at?: string;
}

/**
 * Admin Users Manager Component
 * 
 * Allows admins to view and manage users.
 */
export default function AdminUsersManager() {
  const t = useTranslations("admin.users");
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "email" | "created" | "admin">("created");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [updatingNames, setUpdatingNames] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * Loads all users from API
   */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const url = searchQuery
        ? `/api/admin/users?search=${encodeURIComponent(searchQuery)}`
        : "/api/admin/users";
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to load users");
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error loading users:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Fehler beim Laden der Benutzer",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles search
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  /**
   * Updates all users without names to use email prefix
   */
  const updateUserNames = async () => {
    try {
      setUpdatingNames(true);
      setMessage(null);

      const response = await fetch("/api/admin/users/update-names", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to update user names");
      }

      const data = await response.json();
      
      setMessage({
        type: "success",
        text: `${data.updated} Benutzer aktualisiert. ${data.skipped} übersprungen (hatten bereits Namen).`,
      });
      setTimeout(() => setMessage(null), 5000);
      
      // Reload users to show updated names
      await loadUsers();
    } catch (err) {
      console.error("Error updating user names:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Fehler beim Aktualisieren der Namen",
      });
    } finally {
      setUpdatingNames(false);
    }
  };

  /**
   * Re-sort when sort options change
   */
  useEffect(() => {
    if (users.length > 0) {
      const sortedUsers = [...users].sort((a, b) => {
        let comparison = 0;
        
        if (sortBy === "admin") {
          // Admins first, then users with accounts, then users without accounts
          if (a.is_admin && !b.is_admin) comparison = -1;
          else if (!a.is_admin && b.is_admin) comparison = 1;
          else if (a.has_account && !b.has_account) comparison = -1;
          else if (!a.has_account && b.has_account) comparison = 1;
          else {
            // If same type, sort by created date
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            comparison = dateB - dateA;
          }
        } else if (sortBy === "name") {
          const nameA = (a.name || a.email || "").toLowerCase();
          const nameB = (b.name || b.email || "").toLowerCase();
          comparison = nameA.localeCompare(nameB);
        } else if (sortBy === "email") {
          comparison = (a.email || "").toLowerCase().localeCompare((b.email || "").toLowerCase());
        } else if (sortBy === "created") {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          comparison = dateB - dateA;
        }
        
        return sortOrder === "asc" ? comparison : -comparison;
      });
      
      setUsers(sortedUsers);
    }
  }, [sortBy, sortOrder]);


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

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("title")}</h2>
          <p className="text-gray-600 mt-1">{t("subtitle")}</p>
        </div>
        <button
          onClick={updateUserNames}
          disabled={updatingNames}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap"
        >
          {updatingNames ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Aktualisiere...
            </span>
          ) : (
            "Namen aus E-Mail aktualisieren"
          )}
        </button>
      </div>

      {/* Search and Sort */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
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
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
          >
            <option value="created">Registriert</option>
            <option value="name">Name</option>
            <option value="email">E-Mail</option>
            <option value="admin">Admin zuerst</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title={sortOrder === "asc" ? "Aufsteigend" : "Absteigend"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sortOrder === "asc" ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Users Count */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-gray-600">
          {users.length} {users.length === 1 ? "Benutzer" : "Benutzer"} gefunden
        </div>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>
            {users.filter(u => u.has_account).length} mit Account
          </span>
          <span>
            {users.filter(u => !u.has_account).length} ohne Account
          </span>
          <span>
            {users.filter(u => u.is_admin).length} Admin{users.filter(u => u.is_admin).length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">{t("noUsers")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    {t("name")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    {t("email")}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Registriert
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("bookings")}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("vouchers")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-50 divide-y divide-gray-200">
                {users.map((user) => (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      user.is_admin ? "bg-purple-50/50" : user.has_account ? "bg-white" : "bg-amber-50/30"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || t("noName")}
                        </div>
                        {user.is_admin && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                            Admin
                          </span>
                        )}
                        {!user.has_account && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                            Kein Account
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 break-words" title={user.email}>
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.has_account
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {user.has_account ? "✓ Vorhanden" : "✗ Kein Account"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="text-sm text-gray-500">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString("de-DE", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className={`text-sm font-medium ${
                        user.bookings_count > 0 ? "text-gray-900" : "text-gray-400"
                      }`}>
                        {user.bookings_count}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className={`text-sm font-medium ${
                        user.vouchers_count > 0 ? "text-gray-900" : "text-gray-400"
                      }`}>
                        {user.vouchers_count}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

