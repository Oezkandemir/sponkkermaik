"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import CourseScheduleManager from "@/components/CourseScheduleManager";
import AdminBookingsManager from "@/components/AdminBookingsManager";
import AdminVouchersManager from "@/components/AdminVouchersManager";
import AdminDashboardOverview from "@/components/AdminDashboardOverview";
import AdminCoursesManager from "@/components/AdminCoursesManager";
import AdminUsersManager from "@/components/AdminUsersManager";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  day: string | null;
  is_active: boolean;
}

/**
 * Admin Dashboard Page
 * 
 * Allows admins to manage course schedules for all courses.
 * Each course can have its own individual time slots and availability.
 * Only accessible to users with admin privileges.
 */
export default function AdminPage() {
  const router = useRouter();
  const t = useTranslations("admin");
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [showApplyToAllModal, setShowApplyToAllModal] = useState(false);
  const [applyingToAll, setApplyingToAll] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "bookings" | "courses" | "vouchers" | "courseManagement" | "users">("dashboard");
  const supabase = createClient();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadCourses();
    }
  }, [isAdmin]);

  /**
   * Checks if user is admin
   */
  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/signin");
        return;
      }
      
      setUser(user);

      // Check if user is admin
      const { data: adminData, error } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned, which is fine
        throw error;
      }

      if (!adminData) {
        // User is not admin, redirect
        router.push("/");
        return;
      }

      setIsAdmin(true);
    } catch (err) {
      console.error("Error checking admin access:", err);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Loads all courses from database
   */
  const loadCourses = async () => {
    try {
      setCoursesLoading(true);
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("title");

      if (error) throw error;

      setCourses(data || []);
      if (data && data.length > 0 && !selectedCourseId) {
        setSelectedCourseId(data[0].id);
      }
    } catch (err) {
      console.error("Error loading courses:", err);
    } finally {
      setCoursesLoading(false);
    }
  };

  /**
   * Applies time slots from selected course to all other courses
   */
  const applyTimeSlotsToAllCourses = async () => {
    if (!selectedCourseId) return;

    setApplyingToAll(true);
    try {
      // Get all time slots from the source course
      const { data: sourceSlots, error: sourceError } = await supabase
        .from("course_schedule")
        .select("*")
        .eq("course_id", selectedCourseId)
        .eq("is_active", true);

      if (sourceError) throw sourceError;

      if (!sourceSlots || sourceSlots.length === 0) {
        alert(t("noTimeSlotsToCopy"));
        return;
      }

      // Get all other courses
      const otherCourses = courses.filter((c) => c.id !== selectedCourseId);

      // Apply time slots to each course
      for (const course of otherCourses) {
        // Delete existing time slots for this course
        const { error: deleteError } = await supabase
          .from("course_schedule")
          .delete()
          .eq("course_id", course.id);

        if (deleteError) {
          console.error(`Error deleting slots for course ${course.id}:`, deleteError);
          continue;
        }

        // Insert new time slots (only if not empty)
        if (sourceSlots.length > 0) {
          const slotsToInsert = sourceSlots.map((slot) => ({
            course_id: course.id,
            day_of_week: slot.day_of_week,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_active: true,
          }));

          const { error: insertError } = await supabase
            .from("course_schedule")
            .insert(slotsToInsert);

          if (insertError) {
            // Handle unique constraint violation gracefully
            if (insertError.code === "23505") {
              console.warn(`Some slots were skipped for course ${course.id} due to duplicates`);
            } else {
              console.error(`Error inserting slots for course ${course.id}:`, insertError);
            }
          }
        }
      }

      // Handle first Sunday schedule if source course has it
      if (selectedCourseId === "keramik-bemalen-sonntag") {
        const { data: firstSundayData, error: firstSundayError } = await supabase
          .from("first_sunday_schedule")
          .select("*")
          .eq("course_id", selectedCourseId)
          .eq("is_active", true);

        if (!firstSundayError && firstSundayData && firstSundayData.length > 0) {
          // Note: First Sunday is only for keramik-bemalen-sonntag, so we don't copy it to other courses
          // But we could if needed in the future
        }
      }

      setShowApplyToAllModal(false);
      alert(t("timeSlotsAppliedToAll"));
      
      // Reload courses to refresh the view
      await loadCourses();
    } catch (err) {
      console.error("Error applying time slots to all courses:", err);
      alert(t("errorApplyingToAll"));
    } finally {
      setApplyingToAll(false);
    }
  };

  if (loading || coursesLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Verwalten Sie Buchungen und Kurse</p>
          </div>

          {/* Tab Navigation */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-1 border-b border-gray-200 min-w-max sm:min-w-0">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                  activeTab === "dashboard"
                    ? "border-amber-600 text-amber-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash.</span>
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                  activeTab === "bookings"
                    ? "border-amber-600 text-amber-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">Buchungen</span>
                <span className="sm:hidden">Buch.</span>
              </button>
              <button
                onClick={() => setActiveTab("vouchers")}
                className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                  activeTab === "vouchers"
                    ? "border-amber-600 text-amber-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                <span className="hidden sm:inline">Gutscheine</span>
                <span className="sm:hidden">Gut.</span>
              </button>
              <button
                onClick={() => setActiveTab("courses")}
                className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                  activeTab === "courses"
                    ? "border-amber-600 text-amber-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="hidden sm:inline">Zeitpläne</span>
                <span className="sm:hidden">Zeit.</span>
              </button>
              <button
                onClick={() => setActiveTab("courseManagement")}
                className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                  activeTab === "courseManagement"
                    ? "border-amber-600 text-amber-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="hidden sm:inline">Kurs-Verwaltung</span>
                <span className="sm:hidden">Kurse</span>
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                  activeTab === "users"
                    ? "border-amber-600 text-amber-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="hidden sm:inline">Benutzer</span>
                <span className="sm:hidden">User</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
              <AdminDashboardOverview />
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Buchungen verwalten</h2>
              <AdminBookingsManager />
            </div>
          )}

          {/* Vouchers Tab */}
          {activeTab === "vouchers" && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Gutscheine verwalten</h2>
              <AdminVouchersManager />
            </div>
          )}

          {/* Course Management Tab */}
          {activeTab === "courseManagement" && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
              <AdminCoursesManager />
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
              <AdminUsersManager />
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <>
              {/* Course Selection */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  {t("selectCourse")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourseId(course.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedCourseId === course.id
                          ? "border-amber-600 bg-amber-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <h3 className="font-bold text-gray-900 mb-1">{course.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{course.duration}</span>
                        <span>•</span>
                        <span>{course.price}</span>
                        {course.day && (
                          <>
                            <span>•</span>
                            <span>{course.day}</span>
                          </>
                        )}
                      </div>
                      {course.id === "keramik-bemalen-sonntag" && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                          {t("firstSundayAvailable")}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Course Schedule Manager */}
              {selectedCourseId && (
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                  <div className="mb-4 sm:mb-6 pb-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                          {courses.find((c) => c.id === selectedCourseId)?.title}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 mt-1 break-words">
                          {courses.find((c) => c.id === selectedCourseId)?.description}
                        </p>
                      </div>
                      {courses.length > 1 && (
                        <button
                          onClick={() => setShowApplyToAllModal(true)}
                          disabled={applyingToAll}
                          className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap text-sm sm:text-base"
                          title={t("applyToAllCourses")}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            />
                          </svg>
                          {applyingToAll ? t("applying") : t("applyToAllCourses")}
                        </button>
                      )}
                    </div>
                  </div>
                  <CourseScheduleManager courseId={selectedCourseId} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal for applying to all courses */}
      {showApplyToAllModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowApplyToAllModal(false)}
        >
          <div 
            className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              {t("applyToAllCourses")}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              {t("applyToAllCoursesConfirm", {
                courseName: courses.find((c) => c.id === selectedCourseId)?.title || "",
                courseCount: courses.length - 1
              } as any)}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowApplyToAllModal(false)}
                disabled={applyingToAll}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                {t("cancel")}
              </button>
              <button
                onClick={applyTimeSlotsToAllCourses}
                disabled={applyingToAll}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applyingToAll ? t("applying") : t("apply")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

