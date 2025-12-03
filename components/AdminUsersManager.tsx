"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  banned_until?: string | null;
}

/**
 * Admin Users Manager Component
 * 
 * Allows admins to view and manage users with improved UI/UX.
 * Features: Block, Delete, Add users, and better visualization.
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterBy, setFilterBy] = useState<"all" | "with_account" | "without_account" | "admin" | "blocked">("all");

  // Form state for creating user
  const [newUserForm, setNewUserForm] = useState({
    email: "",
    password: "",
    name: "",
    is_admin: false,
  });

  /**
   * Loads all users from API
   */
  const loadUsers = useCallback(async () => {
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
  }, [searchQuery]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /**
   * Handles search with debouncing
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, loadUsers]);

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
   * Creates a new user
   */
  const createUser = async () => {
    if (!newUserForm.email || !newUserForm.password) {
      setMessage({ type: "error", text: "E-Mail und Passwort sind erforderlich" });
      return;
    }

    try {
      setActionLoading(true);
      setMessage(null);

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create user");
      }

      setMessage({ type: "success", text: "Benutzer erfolgreich erstellt" });
      setShowCreateModal(false);
      setNewUserForm({ email: "", password: "", name: "", is_admin: false });
      await loadUsers();
    } catch (err) {
      console.error("Error creating user:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Fehler beim Erstellen des Benutzers",
      });
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Blocks a user
   */
  const blockUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      setMessage(null);

      const response = await fetch("/api/admin/users/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to block user");
      }

      setMessage({ type: "success", text: "Benutzer erfolgreich gesperrt" });
      setShowBlockModal(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (err) {
      console.error("Error blocking user:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Fehler beim Sperren des Benutzers",
      });
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Unblocks a user
   */
  const unblockUser = async (userId: string) => {
    try {
      setActionLoading(true);
      setMessage(null);

      const response = await fetch("/api/admin/users/unblock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to unblock user");
      }

      setMessage({ type: "success", text: "Benutzer erfolgreich entsperrt" });
      await loadUsers();
    } catch (err) {
      console.error("Error unblocking user:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Fehler beim Entsperren des Benutzers",
      });
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Deletes a user
   */
  const deleteUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      setMessage(null);

      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete user");
      }

      setMessage({ type: "success", text: "Benutzer erfolgreich gelöscht" });
      setShowDeleteModal(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Fehler beim Löschen des Benutzers",
      });
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Toggles admin status
   */
  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setActionLoading(true);
      setMessage(null);

      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, is_admin: !currentStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update admin status");
      }

      setMessage({
        type: "success",
        text: currentStatus ? "Admin-Rechte entfernt" : "Admin-Rechte hinzugefügt",
      });
      await loadUsers();
    } catch (err) {
      console.error("Error updating admin status:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Fehler beim Aktualisieren der Admin-Rechte",
      });
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Filtered and sorted users
   */
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...users];

    // Apply filter
    if (filterBy === "with_account") {
      filtered = filtered.filter(u => u.has_account);
    } else if (filterBy === "without_account") {
      filtered = filtered.filter(u => !u.has_account);
    } else if (filterBy === "admin") {
      filtered = filtered.filter(u => u.is_admin);
    } else if (filterBy === "blocked") {
      filtered = filtered.filter(u => u.banned_until && new Date(u.banned_until) > new Date());
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "admin") {
        if (a.is_admin && !b.is_admin) comparison = -1;
        else if (!a.is_admin && b.is_admin) comparison = 1;
        else if (a.has_account && !b.has_account) comparison = -1;
        else if (!a.has_account && b.has_account) comparison = 1;
        else {
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

    return filtered;
  }, [users, filterBy, sortBy, sortOrder]);

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
          <h2 className="text-2xl font-bold text-gray-900">{t("title")}</h2>
          <p className="text-gray-600 mt-1">{t("subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Benutzer hinzufügen
          </button>
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
              "Namen aktualisieren"
            )}
          </button>
        </div>
      </div>

      {/* Search, Filter and Sort */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Suche nach Name oder E-Mail..."
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
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
            >
              <option value="all">Alle</option>
              <option value="with_account">Mit Account</option>
              <option value="without_account">Ohne Account</option>
              <option value="admin">Admins</option>
              <option value="blocked">Gesperrt</option>
            </select>
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
      </div>

      {/* Users Count */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-gray-600">
          {filteredAndSortedUsers.length} von {users.length} Benutzern
        </div>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>{users.filter(u => u.has_account).length} mit Account</span>
          <span>{users.filter(u => !u.has_account).length} ohne Account</span>
          <span>{users.filter(u => u.is_admin).length} Admin{users.filter(u => u.is_admin).length !== 1 ? "s" : ""}</span>
          <span>{users.filter(u => u.banned_until && new Date(u.banned_until) > new Date()).length} gesperrt</span>
        </div>
      </div>

      {/* Users Grid */}
      {filteredAndSortedUsers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Keine Benutzer gefunden</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedUsers.map((user) => {
            const isBlocked = user.banned_until && new Date(user.banned_until) > new Date();
            
            return (
              <div
                key={user.id}
                className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all hover:shadow-lg ${
                  user.is_admin ? "border-purple-200 bg-purple-50/30" : 
                  isBlocked ? "border-red-200 bg-red-50/30" :
                  user.has_account ? "border-gray-200" : "border-amber-200 bg-amber-50/30"
                }`}
              >
                {/* User Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {user.name || user.email.split("@")[0]}
                    </h3>
                    <p className="text-sm text-gray-600 truncate" title={user.email}>
                      {user.email}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 ml-2">
                    {user.is_admin && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                        Admin
                      </span>
                    )}
                    {isBlocked && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                        Gesperrt
                      </span>
                    )}
                    {!user.has_account && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">
                        Kein Account
                      </span>
                    )}
                  </div>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Buchungen</div>
                    <div className={`text-lg font-bold ${user.bookings_count > 0 ? "text-gray-900" : "text-gray-400"}`}>
                      {user.bookings_count}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Gutscheine</div>
                    <div className={`text-lg font-bold ${user.vouchers_count > 0 ? "text-gray-900" : "text-gray-400"}`}>
                      {user.vouchers_count}
                    </div>
                  </div>
                </div>

                {/* Registration Date */}
                {user.created_at && (
                  <div className="text-xs text-gray-500 mb-4">
                    Registriert: {new Date(user.created_at).toLocaleDateString("de-DE", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  {user.has_account && (
                    <>
                      {isBlocked ? (
                        <button
                          onClick={() => unblockUser(user.id)}
                          disabled={actionLoading}
                          className="flex-1 px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          Entsperren
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowBlockModal(true);
                          }}
                          disabled={actionLoading || user.is_admin}
                          className="flex-1 px-3 py-2 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                          title={user.is_admin ? "Admins können nicht gesperrt werden" : ""}
                        >
                          Sperren
                        </button>
                      )}
                      <button
                        onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                        disabled={actionLoading}
                        className="flex-1 px-3 py-2 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        {user.is_admin ? "Admin entfernen" : "Admin hinzufügen"}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteModal(true);
                        }}
                        disabled={actionLoading || user.is_admin}
                        className="px-3 py-2 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
                        title={user.is_admin ? "Admins können nicht gelöscht werden" : ""}
                      >
                        Löschen
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => !actionLoading && setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Neuen Benutzer erstellen</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail *
                </label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="benutzer@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passwort *
                </label>
                <input
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Mindestens 6 Zeichen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (optional)
                </label>
                <input
                  type="text"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Vollständiger Name"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_admin"
                  checked={newUserForm.is_admin}
                  onChange={(e) => setNewUserForm({ ...newUserForm, is_admin: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <label htmlFor="is_admin" className="text-sm font-medium text-gray-700">
                  Als Admin erstellen
                </label>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewUserForm({ email: "", password: "", name: "", is_admin: false });
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={createUser}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Erstelle..." : "Erstellen"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => !actionLoading && setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Benutzer löschen</h3>
            <p className="text-gray-600 mb-6">
              Möchten Sie den Benutzer <strong>{selectedUser.email}</strong> wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={deleteUser}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? "Lösche..." : "Löschen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {showBlockModal && selectedUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => !actionLoading && setShowBlockModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Benutzer sperren</h3>
            <p className="text-gray-600 mb-6">
              Möchten Sie den Benutzer <strong>{selectedUser.email}</strong> wirklich sperren?
              Der Benutzer kann sich dann nicht mehr anmelden.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setSelectedUser(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={blockUser}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? "Sperre..." : "Sperren"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
