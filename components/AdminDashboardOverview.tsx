"use client";

import { useState, useEffect, memo } from "react";
import { useTranslations } from "next-intl";
import AdminOnlineUsers from "./AdminOnlineUsers";

interface DashboardStats {
  todayBookings: number;
  pendingConfirmations: number;
  activeVouchers: number;
  monthlyRevenue: number;
  monthlyBookingRevenue: number;
  monthlyVoucherRevenue: number;
  weeklyBookingRevenue: number;
  todayBookingRevenue: number;
  totalRevenue: number;
  weeklyBookings: number;
  monthlyBookings: number;
}

/**
 * Admin Dashboard Overview Component
 * 
 * Displays key statistics, charts, and quick access to important information.
 */
function AdminDashboardOverview() {
  const t = useTranslations("admin.dashboard");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Simple cache with 30 second TTL
  const cacheKey = "admin-dashboard-stats";
  const cacheTTL = 30000; // 30 seconds

  useEffect(() => {
    // Only load stats when component is mounted (tab is active)
    loadStats();
  }, []);

  /**
   * Loads dashboard statistics from API with caching
   */
  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check cache first
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        if (age < cacheTTL) {
          setStats(data);
          setLoading(false);
          return;
        }
      }
      
      const response = await fetch("/api/admin/stats");
      
      if (!response.ok) {
        throw new Error("Failed to load statistics");
      }

      const data = await response.json();
      setStats(data);
      
      // Cache the result
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-amber-600 border-t-transparent rounded-full mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p>{t("errorLoadingStats")}: {error}</p>
        <button
          onClick={loadStats}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t("todayBookings")}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayBookings}</p>
              {stats.todayBookingRevenue > 0 && (
                <p className="text-xs text-gray-500 mt-1">{stats.todayBookingRevenue.toFixed(2)}€ Umsatz</p>
              )}
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t("pendingConfirmations")}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingConfirmations}</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t("activeVouchers")}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeVouchers}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t("monthlyRevenue")}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.monthlyRevenue.toFixed(2)}€</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.monthlyBookingRevenue.toFixed(2)}€ Buchungen + {stats.monthlyVoucherRevenue.toFixed(2)}€ Gutscheine
              </p>
            </div>
            <div className="bg-amber-100 rounded-full p-3">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("weeklyBookings")}</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.weeklyBookings}</p>
          {stats.weeklyBookingRevenue > 0 && (
            <p className="text-sm text-gray-600 mt-1">{stats.weeklyBookingRevenue.toFixed(2)}€ Umsatz</p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("monthlyBookings")}</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.monthlyBookings}</p>
          {stats.monthlyBookingRevenue > 0 && (
            <p className="text-sm text-gray-600 mt-1">{stats.monthlyBookingRevenue.toFixed(2)}€ Umsatz</p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Gesamtumsatz</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toFixed(2)}€</p>
          <p className="text-sm text-gray-600 mt-1">Alle bestätigten Buchungen</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Monatliche Gutscheine</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.monthlyVoucherRevenue.toFixed(2)}€</p>
          <p className="text-sm text-gray-600 mt-1">Aktive Gutscheine</p>
        </div>
      </div>

      {/* Online Users Section */}
      <div className="mt-6">
        <AdminOnlineUsers />
      </div>
    </div>
  );
}

export default memo(AdminDashboardOverview);

