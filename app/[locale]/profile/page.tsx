"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";

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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      
      // Load profile data from database
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, phone, avatar_url")
        .eq("id", user.id)
        .single();
      
      if (profile && !error) {
        setFullName(profile.full_name || "");
        setPhone(profile.phone || "");
        // Reason: Use Robohash avatar if no custom avatar is set
        setAvatarUrl(profile.avatar_url || `https://robohash.org/${user.id}.png?set=set4`);
      } else if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned, which is fine for new users
        console.error("Error loading profile:", error);
        // Reason: Fallback to Robohash if profile doesn't exist yet
        setAvatarUrl(`https://robohash.org/${user.id}.png?set=set4`);
      } else {
        // Reason: New user without profile - use Robohash
        setAvatarUrl(`https://robohash.org/${user.id}.png?set=set4`);
      }
      
      setLoading(false);
    }

    getUser();
  }, [router, supabase]);

  /**
   * Handles avatar upload
   * 
   * Args:
   *   file (File): The image file to upload
   */
  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    
    setUploading(true);
    
    try {
      // Reason: Validate file type and size
      if (!file.type.startsWith("image/")) {
        setSuccess("");
        alert(t("errors.invalidFileType"));
        setUploading(false);
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setSuccess("");
        alert(t("errors.fileTooLarge"));
        setUploading(false);
        return;
      }
      
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);
      
      const publicUrl = data.publicUrl;
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);
      
      if (updateError) {
        throw updateError;
      }
      
      setAvatarUrl(publicUrl);
      setSuccess(t("success.avatarUpdated"));
      
      // Reason: Trigger a page refresh to update header avatar immediately
      router.refresh();
      
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert(t("errors.uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handles profile update
   */
  const handleSave = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: fullName,
          phone: phone,
        });
      
      if (error) {
        throw error;
      }
      
      setSuccess(t("success.profileUpdated"));
      setIsEditing(false);
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(t("errors.updateFailed"));
    }
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
            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("avatar")}
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={t("avatar")}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      unoptimized={avatarUrl.startsWith("https://robohash.org")}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                      {user?.email?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleAvatarUpload(file);
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {uploading ? t("uploading") : t("changeAvatar")}
                    </button>
                    <p className="text-xs text-gray-500">
                      {t("avatarHint")}
                    </p>
                  </div>
                )}
              </div>
            </div>

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







