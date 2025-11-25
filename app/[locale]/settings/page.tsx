"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * Settings Page Component
 * 
 * Allows users to manage account settings, security, and notifications.
 * Requires authentication to access.
 */
export default function SettingsPage() {
  const router = useRouter();
  const t = useTranslations("settings");
  const tAuth = useTranslations("auth");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"account" | "security" | "notifications">("account");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  
  // Notification settings
  const [bookingConfirmations, setBookingConfirmations] = useState(true);
  const [workshopReminders, setWorkshopReminders] = useState(true);
  const [newsletter, setNewsletter] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    // Reason: Check authentication
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/signin");
        return;
      }
      
      setUser(user);
      // TODO: Load notification settings from database
      setLoading(false);
    }

    getUser();
  }, [router, supabase.auth]);

  /**
   * Handles password change
   */
  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    // Validation
    if (newPassword.length < 6) {
      setError(tAuth("errors.passwordTooShort"));
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError(tAuth("errors.passwordsDontMatch"));
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setSuccess(t("success.passwordUpdated"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update password. Please try again.");
    }
  };

  /**
   * Handles notification settings save
   */
  const handleSaveNotifications = async () => {
    // TODO: Save notification settings to database
    setSuccess(t("success.settingsSaved"));
    setTimeout(() => setSuccess(""), 3000);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600">{t("subtitle")}</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("account")}
            className={`px-6 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === "account"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {t("account")}
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-6 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === "security"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {t("security")}
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-6 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === "notifications"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {t("notifications")}
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {activeTab === "account" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t("account")}
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {tAuth("email")}
                </label>
                <p className="text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Your email address cannot be changed
                </p>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-red-600 mb-2">
                  {t("deleteAccount")}
                </h3>
                <p className="text-gray-600 mb-4">{t("deleteAccountWarning")}</p>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  {t("confirmDelete")}
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t("changePassword")}
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("currentPassword")}
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("newPassword")}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {tAuth("errors.passwordTooShort")}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("confirmNewPassword")}
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <button
                onClick={handleChangePassword}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                {t("updatePassword")}
              </button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t("emailNotifications")}
              </h2>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">
                      {t("bookingConfirmations")}
                    </p>
                    <p className="text-sm text-gray-600">
                      Receive emails when your bookings are confirmed
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={bookingConfirmations}
                    onChange={(e) => setBookingConfirmations(e.target.checked)}
                    className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">
                      {t("workshopReminders")}
                    </p>
                    <p className="text-sm text-gray-600">
                      Get reminded about upcoming workshops
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={workshopReminders}
                    onChange={(e) => setWorkshopReminders(e.target.checked)}
                    className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">
                      {t("newsletter")}
                    </p>
                    <p className="text-sm text-gray-600">
                      Receive news and updates about workshops
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={newsletter}
                    onChange={(e) => setNewsletter(e.target.checked)}
                    className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
                  />
                </label>
              </div>

              <button
                onClick={handleSaveNotifications}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                {t("success.settingsSaved").replace("!", "")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}







