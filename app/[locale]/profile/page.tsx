"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * Profile Page Component
 * 
 * Displays and allows editing of user profile information.
 * Requires authentication to access.
 */
export default function ProfilePage() {
  const router = useRouter();
  const t = useTranslations("profile");
  const tAuth = useTranslations("auth");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState("");
  const supabase = createClient();

  useEffect(() => {
    // Reason: Check authentication and get user data
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/signin");
        return;
      }
      
      setUser(user);
      // TODO: Load additional profile data from database
      setLoading(false);
    }

    getUser();
  }, [router, supabase.auth]);

  /**
   * Handles profile update
   */
  const handleSave = async () => {
    setSuccess(t("success.profileUpdated"));
    setIsEditing(false);
    
    setTimeout(() => setSuccess(""), 3000);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600">{t("subtitle")}</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {t("personalInfo")}
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                {t("editProfile")}
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("fullName")}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              ) : (
                <p className="text-gray-900">{fullName || "Not set"}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {tAuth("email")}
              </label>
              <p className="text-gray-900">{user?.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("phone")}
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="+49 123 456789"
                />
              ) : (
                <p className="text-gray-900">{phone || "Not set"}</p>
              )}
            </div>

            {/* Edit Buttons */}
            {isEditing && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  {t("save")}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {t("cancel")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Account Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {t("accountInfo")}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("memberSince")}
              </label>
              <p className="text-gray-900">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




