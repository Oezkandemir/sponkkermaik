"use client";

import { useState, useEffect } from "react";
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
}

/**
 * Admin Courses Manager Component
 * 
 * Allows admins to create, read, update, and delete courses.
 */
export default function AdminCoursesManager() {
  const t = useTranslations("admin.courses");
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    price: "",
    day: "",
    is_active: true,
  });

  useEffect(() => {
    loadCourses();
  }, []);

  /**
   * Loads all courses from database
   */
  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/courses");
      
      if (!response.ok) {
        throw new Error("Failed to load courses");
      }

      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      console.error("Error loading courses:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Fehler beim Laden der Kurse",
      });
    } finally {
      setLoading(false);
    }
  };

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
   * Deletes a course
   */
  const deleteCourse = async (courseId: string) => {
    if (!confirm("Möchten Sie diesen Kurs wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/courses?id=${courseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete course");
      }

      setMessage({ type: "success", text: "Kurs erfolgreich gelöscht" });
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

      {/* Header with Create Button */}
      <div className="mb-6 flex items-center justify-between">
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

      {/* Courses List */}
      {courses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">{t("noCourses")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`bg-white border rounded-lg p-6 hover:shadow-md transition-shadow ${
                course.is_active ? "border-gray-200" : "border-gray-300 bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">{course.title}</h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    course.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {course.is_active ? t("active") : t("inactive")}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{course.description}</p>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">{t("duration")}:</span>
                  <span className="text-gray-600">{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">{t("price")}:</span>
                  <span className="text-gray-600 font-semibold">{course.price}</span>
                </div>
                {course.day && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">{t("day")}:</span>
                    <span className="text-gray-600">{course.day}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(course)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {t("edit")}
                </button>
                <button
                  onClick={() => toggleCourseStatus(course)}
                  className={`px-3 py-2 text-sm rounded transition-colors ${
                    course.is_active
                      ? "bg-yellow-600 text-white hover:bg-yellow-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {course.is_active ? t("deactivate") : t("activate")}
                </button>
                <button
                  onClick={() => deleteCourse(course.id)}
                  className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  {t("delete")}
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
            setShowCreateModal(false);
            resetForm();
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

              {/* Duration */}
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

              {/* Price */}
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
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  {t("active")}
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={saveCourse}
                  disabled={saving}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? t("saving") : editingCourse ? t("update") : t("create")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

