"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";

interface ProfileStats {
  upcomingBookings: number;
  activeVouchers: number;
  pastBookings: number;
  voucherValue: number;
}

interface RecentBooking {
  id: string;
  date: string;
  status: string;
}

interface RecentVoucher {
  id: string;
  code: string;
  value: number;
  created_at: string;
}

/**
 * Profile Page Component
 * 
 * Displays and allows editing of user profile information with dashboard overview.
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
  const [stats, setStats] = useState<ProfileStats>({
    upcomingBookings: 0,
    activeVouchers: 0,
    pastBookings: 0,
    voucherValue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [recentVouchers, setRecentVouchers] = useState<RecentVoucher[]>([]);
  const [sendingVerification, setSendingVerification] = useState(false);
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
      
      // Load statistics and recent activity
      await loadStats(user.id, user.email || "");
      await loadRecentActivity(user.id, user.email || "");
      
      setLoading(false);
    }

    getUser();
  }, [router, supabase]);

  /**
   * Loads statistics from database
   * 
   * Args:
   *   userId (string): User ID to load stats for
   *   userEmail (string): User email address
   */
  const loadStats = async (userId: string, userEmail: string) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      
      // Load bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("id, booking_date, status")
        .or(`user_id.eq.${userId}${userEmail ? `,customer_email.eq.${userEmail}` : ""}`)
        .neq("status", "cancelled");

      if (bookingsError) {
        console.error("Error loading bookings:", bookingsError);
        return;
      }

      const upcoming = bookings?.filter(
        (b) => b.booking_date >= today && b.status !== "completed"
      ) || [];
      const past = bookings?.filter(
        (b) => b.booking_date < today || b.status === "completed"
      ) || [];

      // Load vouchers
      const { data: vouchers, error: vouchersError } = await supabase
        .from("vouchers")
        .select("id, value, status")
        .eq("user_id", userId)
        .in("status", ["active", "pending"]);

      if (vouchersError) {
        console.error("Error loading vouchers:", vouchersError);
        return;
      }

      const activeVouchers = vouchers || [];
      const voucherValue = activeVouchers.reduce(
        (sum, v) => sum + parseFloat(v.value.toString()),
        0
      );

      setStats({
        upcomingBookings: upcoming.length,
        activeVouchers: activeVouchers.length,
        pastBookings: past.length,
        voucherValue,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  /**
   * Loads recent activity from database
   * 
   * Args:
   *   userId (string): User ID to load activity for
   *   userEmail (string): User email address
   */
  const loadRecentActivity = async (userId: string, userEmail: string) => {
    try {
      // Load recent bookings (last 3)
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("id, booking_date, status")
        .or(`user_id.eq.${userId}${userEmail ? `,customer_email.eq.${userEmail}` : ""}`)
        .order("booking_date", { ascending: false })
        .limit(3);

      if (!bookingsError && bookings) {
        setRecentBookings(
          bookings.map((b) => ({
            id: b.id,
            date: new Date(b.booking_date).toLocaleDateString("de-DE"),
            status: b.status,
          }))
        );
      }

      // Load recent vouchers (last 3)
      const { data: vouchers, error: vouchersError } = await supabase
        .from("vouchers")
        .select("id, code, value, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3);

      if (!vouchersError && vouchers) {
        setRecentVouchers(
          vouchers.map((v) => ({
            id: v.id,
            code: v.code,
            value: parseFloat(v.value.toString()),
            created_at: new Date(v.created_at).toLocaleDateString("de-DE"),
          }))
        );
      }
    } catch (error) {
      console.error("Error loading recent activity:", error);
    }
  };

  /**
   * Calculates profile completion percentage
   * 
   * Returns:
   *   number: Completion percentage (0-100)
   */
  const getProfileCompletion = (): number => {
    let completed = 0;
    const total = 3; // fullName, phone, avatar

    if (fullName) completed++;
    if (phone) completed++;
    if (avatarUrl && !avatarUrl.includes("robohash.org")) completed++;

    return Math.round((completed / total) * 100);
  };

  /**
   * Handles resending verification email
   */
  const handleResendVerification = async () => {
    if (!user) return;
    
    setSendingVerification(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email!,
      });

      if (error) throw error;

      setSuccess(t("success.verificationEmailSent"));
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      console.error("Error sending verification email:", error);
      alert(t("emailVerification.error"));
    } finally {
      setSendingVerification(false);
    }
  };

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
      
      // Reload stats to update completion
      await loadStats(user.id, user.email || "");
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(t("errors.updateFailed"));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
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

  const completionPercentage = getProfileCompletion();
  const isEmailVerified = user?.email_confirmed_at !== null;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title={t("stats.upcomingBookings")}
            value={stats.upcomingBookings}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            color="blue"
          />
          <StatCard
            title={t("stats.activeVouchers")}
            value={stats.activeVouchers}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            }
            color="amber"
          />
          <StatCard
            title={t("stats.pastBookings")}
            value={stats.pastBookings}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
          />
          <StatCard
            title={t("stats.voucherValue")}
            value={`${stats.voucherValue.toFixed(2)}€`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="purple"
          />
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t("quickLinks.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/bookings"
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg hover:from-amber-100 hover:to-orange-100 transition-colors border border-amber-200"
            >
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium text-gray-900">{t("quickLinks.myBookings")}</span>
            </Link>
            <Link
              href="/vouchers"
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg hover:from-amber-100 hover:to-orange-100 transition-colors border border-amber-200"
            >
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <span className="font-medium text-gray-900">{t("quickLinks.myVouchers")}</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg hover:from-amber-100 hover:to-orange-100 transition-colors border border-amber-200"
            >
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium text-gray-900">{t("quickLinks.settings")}</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Profile Completion */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("profileCompletion.title")}
            </h2>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{completionPercentage}%</span>
                <span className={`text-sm font-medium ${
                  completionPercentage === 100 ? "text-green-600" : "text-amber-600"
                }`}>
                  {completionPercentage === 100 
                    ? t("profileCompletion.complete")
                    : t("profileCompletion.incomplete")
                  }
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    completionPercentage === 100
                      ? "bg-green-500"
                      : "bg-gradient-to-r from-amber-500 to-orange-500"
                  }`}
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
            {completionPercentage < 100 && (
              <p className="text-xs text-gray-500">
                {t("profileCompletion.missingFields")}: {!fullName && `${t("profileCompletion.name")}, `}
                {!phone && `${t("profileCompletion.phone")}, `}
                {(!avatarUrl || avatarUrl.includes("robohash.org")) && t("profileCompletion.avatar")}
              </p>
            )}
          </div>

          {/* Email Verification */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {tAuth("email")}
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isEmailVerified ? (
                  <>
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-green-600 font-medium">
                      {t("emailVerification.verified")}
                    </span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-sm text-amber-600 font-medium">
                      {t("emailVerification.notVerified")}
                    </span>
                  </>
                )}
              </div>
              {!isEmailVerified && (
                <button
                  onClick={handleResendVerification}
                  disabled={sendingVerification}
                  className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingVerification ? t("emailVerification.sending") : t("emailVerification.resend")}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">{user?.email}</p>
          </div>

          {/* Recent Activity Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("recentActivity.title")}
            </h2>
            {recentBookings.length === 0 && recentVouchers.length === 0 ? (
              <p className="text-sm text-gray-500">{t("recentActivity.noActivity")}</p>
            ) : (
              <div className="space-y-3">
                {recentBookings.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{t("recentActivity.recentBookings")}</p>
                    <p className="text-sm text-gray-900">
                      {recentBookings.length} {recentBookings.length === 1 
                        ? t("recentActivity.booking") 
                        : t("recentActivity.bookings")
                      }
                    </p>
                  </div>
                )}
                {recentVouchers.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{t("recentActivity.recentVouchers")}</p>
                    <p className="text-sm text-gray-900">
                      {recentVouchers.length} {recentVouchers.length === 1 
                        ? t("recentActivity.voucher") 
                        : t("recentActivity.vouchers")
                      }
                    </p>
                  </div>
                )}
                <Link
                  href="/bookings"
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                >
                  {t("recentActivity.viewAll")} →
                </Link>
              </div>
            )}
          </div>
        </div>

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
                <p className="text-gray-900">{fullName || t("profileCompletion.missingFields")}</p>
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
                <p className="text-gray-900">{phone || t("profileCompletion.missingFields")}</p>
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

/**
 * Stat Card Component
 * 
 * Args:
 *   title: Card title
 *   value: Value to display
 *   icon: SVG icon element
 *   color: Color theme (blue, amber, green, purple)
 */
function StatCard({
  title,
  value,
  icon,
  color = "blue",
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: "blue" | "amber" | "green" | "purple";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
