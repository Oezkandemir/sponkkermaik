"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  day: string | null;
  is_active: boolean;
  bookings_count?: number;
}

/**
 * Admin Courses Manager Component
 * 
 * Allows admins to create, read, update, and delete courses with improved UI/UX.
 */
export default function AdminCoursesManager() {
  const t = useTranslations("admin.courses");
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"title" | "price" | "bookings" | "created">("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    price: "",
    day: "",
    is_active: true,
  });

  /**
   * Loads all courses from database with booking counts
   */
  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/courses");
      
      if (!response.ok) {
        throw new Error("Failed to load courses");
      }

      const data = await response.json();
      const coursesData = data.courses || [];

      // Get booking counts for each course
      const courseIds = coursesData.map((c: Course) => c.id);
      if (courseIds.length > 0) {
        const { data: bookingsData } = await supabase
          .from("bookings")
          .select("course_schedule:course_schedule_id(course_id)")
          .neq("status", "cancelled");

        const bookingsByCourse: Record<string, number> = {};
        bookingsData?.forEach((b: any) => {
          const courseId = b.course_schedule?.course_id;
          if (courseId) {
            bookingsByCourse[courseId] = (bookingsByCourse[courseId] || 0) + 1;
          }
        });

        coursesData.forEach((course: Course) => {
          course.bookings_count = bookingsByCourse[course.id] || 0;
        });
      }

      setCourses(coursesData);
    } catch (err) {
      console.error("Error loading courses:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Fehler beim Laden der Kurse",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  /**
   * Handles search with debouncing
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Search is handled by filteredAndSortedCourses
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  /**
   * Resets form to default values
   */
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      duration: "",
      price: "",
      day: "",
      is_active: true,
    });
    setEditingCourse(null);
  };

  /**
   * Opens create modal
   */
  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  /**
   * Opens edit modal
   */
  const openEditModal = (course: Course) => {
    setFormData({
      title: course.title,
      description: course.description,
      duration: course.duration,
      price: course.price,
      day: course.day || "",
      is_active: course.is_active,
    });
    setEditingCourse(course);
    setShowCreateModal(true);
  };

  /**
   * Saves course (create or update)
   */
  const saveCourse = async () => {
    if (!formData.title || !formData.description || !formData.duration || !formData.price) {
      setMessage({ type: "error", text: "Bitte füllen Sie alle Pflichtfelder aus" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const url = editingCourse ? "/api/admin/courses" : "/api/admin/courses";
      const method = editingCourse ? "PUT" : "POST";

      const body: any = {
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        price: formData.price,
        day: formData.day || null,
        is_active: formData.is_active,
      };

      if (editingCourse) {
        body.id = editingCourse.id;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save course");
      }

      setMessage({
        type: "success",
        text: editingCourse ? "Kurs erfolgreich aktualisiert" : "Kurs erfolgreich erstellt",
      });
      setShowCreateModal(false);
      resetForm();
      await loadCourses();
    } catch (err) {
      console.error("Error saving course:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Fehler beim Speichern des Kurses",
      });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Opens delete confirmation modal
   */
  const openDeleteModal = (course: Course) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  /**
   * Deletes a course
   */
  const deleteCourse = async () => {
    if (!selectedCourse) return;

    try {
      const response = await fetch(`/api/admin/courses?id=${selectedCourse.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete course");
      }

      setMessage({ type: "success", text: "Kurs erfolgreich gelöscht" });
      setShowDeleteModal(false);
      setSelectedCourse(null);
      await loadCourses();
    } catch (err) {
      console.error("Error deleting course:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Fehler beim Löschen des Kurses",
      });
    }
  };

  /**
   * Toggles course active status
   */
  const toggleCourseStatus = async (course: Course) => {
    try {
      const response = await fetch("/api/admin/courses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: course.id,
          is_active: !course.is_active,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update course status");
      }

      setMessage({
        type: "success",
        text: course.is_active ? "Kurs deaktiviert" : "Kurs aktiviert",
      });
      await loadCourses();
    } catch (err) {
      console.error("Error toggling course status:", err);
      setMessage({
        type: "error",
        text: "Fehler beim Ändern des Kursstatus",
      });
    }
  };

  /**
   * Filtered and sorted courses
   */
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = [...courses];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.price.toLowerCase().includes(query) ||
          c.duration.toLowerCase().includes(query) ||
          (c.day && c.day.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (filterBy === "active") {
      filtered = filtered.filter((c) => c.is_active);
    } else if (filterBy === "inactive") {
      filtered = filtered.filter((c) => !c.is_active);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === "price") {
        // Extract numeric price for comparison
        const priceA = parseFloat(a.price.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
        const priceB = parseFloat(b.price.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
        comparison = priceA - priceB;
      } else if (sortBy === "bookings") {
        comparison = (a.bookings_count || 0) - (b.bookings_count || 0);
      } else if (sortBy === "created") {
        // Since we don't have created_at, use title as fallback
        comparison = a.title.localeCompare(b.title);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [courses, searchQuery, filterBy, sortBy, sortOrder]);

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
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t("createCourse")}
        </button>
      </div>

      {/* Search, Filter and Sort */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Suche nach Titel, Beschreibung, Preis..."
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
              <option value="active">Aktiv</option>
              <option value="inactive">Inaktiv</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
            >
              <option value="title">Titel</option>
              <option value="price">Preis</option>
              <option value="bookings">Buchungen</option>
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

      {/* Courses Count */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-gray-600">
          {filteredAndSortedCourses.length} von {courses.length} Kursen
        </div>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>{courses.filter(c => c.is_active).length} aktiv</span>
          <span>{courses.filter(c => !c.is_active).length} inaktiv</span>
          <span>{courses.reduce((sum, c) => sum + (c.bookings_count || 0), 0)} Buchungen gesamt</span>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredAndSortedCourses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">{t("noCourses")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedCourses.map((course) => (
            <div
              key={course.id}
              className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all hover:shadow-lg ${
                course.is_active
                  ? "border-green-200 hover:border-green-300"
                  : "border-gray-300 bg-gray-50"
              }`}
            >
              {/* Course Header */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
                  {course.title}
                </h3>
                <div className="flex flex-col gap-1 items-end">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap ${
                      course.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {course.is_active ? t("active") : t("inactive")}
                  </span>
                  {course.bookings_count !== undefined && course.bookings_count > 0 && (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700">
                      {course.bookings_count} Buchung{course.bookings_count !== 1 ? "en" : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-3 min-h-[60px]">
                {course.description}
              </p>

              {/* Course Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                  <span className="text-xs font-medium text-gray-700">{t("duration")}:</span>
                  <span className="text-sm text-gray-900 font-semibold">{course.duration}</span>
                </div>
                <div className="flex items-center justify-between bg-amber-50 rounded-lg p-2">
                  <span className="text-xs font-medium text-gray-700">{t("price")}:</span>
                  <span className="text-sm text-amber-700 font-bold">{course.price}</span>
                </div>
                {course.day && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                    <span className="text-xs font-medium text-gray-700">{t("day")}:</span>
                    <span className="text-sm text-gray-900">{course.day}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => openEditModal(course)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {t("edit")}
                </button>
                <button
                  onClick={() => toggleCourseStatus(course)}
                  className={`px-3 py-2 text-sm rounded transition-colors flex items-center justify-center ${
                    course.is_active
                      ? "bg-yellow-600 text-white hover:bg-yellow-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                  title={course.is_active ? "Deaktivieren" : "Aktivieren"}
                >
                  {course.is_active ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => openDeleteModal(course)}
                  className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center"
                  title="Löschen"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            if (!saving) {
              setShowCreateModal(false);
              resetForm();
            }
          }}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingCourse ? t("editCourse") : t("createCourse")}
            </h3>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("title")} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder={t("titlePlaceholder")}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("description")} *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder={t("descriptionPlaceholder")}
                />
              </div>

              {/* Duration and Price Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("duration")} *
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder={t("durationPlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("price")} *
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder={t("pricePlaceholder")}
                  />
                </div>
              </div>

              {/* Day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("day")} ({t("optional")})
                </label>
                <input
                  type="text"
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder={t("dayPlaceholder")}
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  {t("active")} - Kurs ist für Buchungen verfügbar
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  disabled={saving}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={saveCourse}
                  disabled={saving}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {saving ? t("saving") : editingCourse ? t("update") : t("create")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCourse && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Kurs löschen</h3>
            <p className="text-gray-600 mb-6">
              Möchten Sie den Kurs <strong>{selectedCourse.title}</strong> wirklich löschen?
              {selectedCourse.bookings_count && selectedCourse.bookings_count > 0 && (
                <span className="block mt-2 text-red-600">
                  ⚠️ Dieser Kurs hat {selectedCourse.bookings_count} Buchung{selectedCourse.bookings_count !== 1 ? "en" : ""}. 
                  Das Löschen kann Auswirkungen auf bestehende Buchungen haben.
                </span>
              )}
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCourse(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={deleteCourse}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
