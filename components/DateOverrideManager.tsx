"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

interface TimeSlot {
  id?: string;
  start_time: string;
  end_time: string;
}

interface DateOverride {
  id: string;
  override_date: string;
  is_available: boolean;
  timeSlots: TimeSlot[];
  course_id: string;
  appliedToCourses: string[];
}

interface Course {
  id: string;
  title: string;
}

/**
 * Date Override Manager Component
 * 
 * Allows admins to add date-specific schedule overrides.
 * Dates can be marked as unavailable or have custom time slots.
 */
export default function DateOverrideManager({ courseId }: { courseId: string }) {
  const t = useTranslations("scheduleSettings");
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [overrides, setOverrides] = useState<DateOverride[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [newOverrideTimeSlots, setNewOverrideTimeSlots] = useState<TimeSlot[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [showCourseSelector, setShowCourseSelector] = useState<string | null>(null);

  useEffect(() => {
    loadOverrides();
    loadCourses();
  }, [courseId]);

  /**
   * Loads all courses from database
   */
  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .order("title");

      if (error) throw error;

      setCourses(data || []);
      // Pre-select current course
      if (courseId) {
        setSelectedCourseIds([courseId]);
      }
    } catch (err) {
      console.error("Error loading courses:", err);
    }
  };

  /**
   * Loads existing date overrides from database
   * Groups by date and shows all courses that have this override
   */
  const loadOverrides = async () => {
    try {
      // Load all overrides for the current course
      const { data: overrideData, error: overrideError } = await supabase
        .from("date_overrides")
        .select("*")
        .eq("course_id", courseId)
        .order("override_date", { ascending: false });

      if (overrideError) throw overrideError;

      // Load time slots and find all courses with the same date override
      const overridesWithSlots = await Promise.all(
        (overrideData || []).map(async (override) => {
          // Load time slots for this override
          const { data: slotsData, error: slotsError } = await supabase
            .from("date_override_time_slots")
            .select("*")
            .eq("date_override_id", override.id)
            .eq("is_active", true)
            .order("start_time");

          if (slotsError) {
            console.error("Error loading time slots for override:", slotsError);
          }

          // Find all courses with the same date override
          const { data: allOverridesForDate, error: dateError } = await supabase
            .from("date_overrides")
            .select("course_id")
            .eq("override_date", override.override_date)
            .eq("is_available", override.is_available);

          if (dateError) {
            console.error("Error loading courses for override:", dateError);
          }

          return {
            id: override.id,
            override_date: override.override_date,
            is_available: override.is_available,
            course_id: override.course_id,
            timeSlots: (slotsData || []).map((slot) => ({
              id: slot.id,
              start_time: slot.start_time,
              end_time: slot.end_time,
            })),
            appliedToCourses: (allOverridesForDate || []).map((o) => o.course_id),
          };
        })
      );

      setOverrides(overridesWithSlots);
    } catch (err) {
      console.error("Error loading date overrides:", err);
      setMessage({ type: "error", text: t("errors.loadFailed") });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Adds a new time slot to the new override
   */
  const addNewTimeSlot = () => {
    setNewOverrideTimeSlots([
      ...newOverrideTimeSlots,
      { start_time: "09:00", end_time: "10:00" },
    ]);
  };

  /**
   * Updates a time slot in the new override
   */
  const updateNewTimeSlot = (index: number, field: "start_time" | "end_time", value: string) => {
    const updated = [...newOverrideTimeSlots];
    updated[index] = { ...updated[index], [field]: value };
    setNewOverrideTimeSlots(updated);
  };

  /**
   * Removes a time slot from the new override
   */
  const removeNewTimeSlot = (index: number) => {
    setNewOverrideTimeSlots(newOverrideTimeSlots.filter((_, i) => i !== index));
  };

  /**
   * Toggles course selection
   */
  const toggleCourseSelection = (courseIdToToggle: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseIdToToggle)
        ? prev.filter((id) => id !== courseIdToToggle)
        : [...prev, courseIdToToggle]
    );
  };

  /**
   * Saves a new date override (initially only for current course)
   */
  const saveNewOverride = async () => {
    if (!selectedDate) {
      setMessage({ type: "error", text: "Bitte wählen Sie ein Datum aus" });
      return;
    }

    if (isAvailable && newOverrideTimeSlots.length === 0) {
      setMessage({ type: "error", text: "Bitte fügen Sie mindestens einen Zeitslot hinzu" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // Check if override already exists for this course and date
      const { data: existing } = await supabase
        .from("date_overrides")
        .select("id")
        .eq("course_id", courseId)
        .eq("override_date", selectedDate)
        .single();

      let overrideId: string;

      if (existing) {
        // Update existing override
        const { data: updated, error: updateError } = await supabase
          .from("date_overrides")
          .update({
            is_available: isAvailable,
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (updateError) throw updateError;
        overrideId = updated.id;

        // Delete existing time slots if updating
        if (isAvailable) {
          await supabase
            .from("date_override_time_slots")
            .delete()
            .eq("date_override_id", overrideId);
        }
      } else {
        // Create new override
        const { data: newOverride, error: insertError } = await supabase
          .from("date_overrides")
          .insert({
            course_id: courseId,
            override_date: selectedDate,
            is_available: isAvailable,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        overrideId = newOverride.id;
      }

      // If available, add time slots
      if (isAvailable && overrideId) {
        const slotsToInsert = newOverrideTimeSlots.map((slot) => ({
          date_override_id: overrideId,
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_active: true,
        }));

        const { error: slotsError } = await supabase
          .from("date_override_time_slots")
          .insert(slotsToInsert);

        if (slotsError) throw slotsError;
      }

      setMessage({ type: "success", text: "Datumsüberschreibung erfolgreich hinzugefügt" });
      setShowAddModal(false);
      setSelectedDate("");
      setIsAvailable(true);
      setNewOverrideTimeSlots([]);
      loadOverrides();
    } catch (err) {
      console.error("Error saving date override:", err);
      setMessage({ type: "error", text: "Fehler beim Speichern der Datumsüberschreibung" });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Applies override to selected courses
   */
  const applyOverrideToCourses = async (override: DateOverride, courseIdsToApply: string[]) => {
    setSaving(true);
    setMessage(null);

    try {
      // Get the time slots from the original override
      const { data: originalSlots, error: slotsError } = await supabase
        .from("date_override_time_slots")
        .select("*")
        .eq("date_override_id", override.id)
        .eq("is_active", true);

      if (slotsError) throw slotsError;

      // Create/update overrides for each selected course
      const overridePromises = courseIdsToApply.map(async (cid) => {
        // Check if override already exists
        const { data: existing } = await supabase
          .from("date_overrides")
          .select("id")
          .eq("course_id", cid)
          .eq("override_date", override.override_date)
          .single();

        let overrideId: string;

        if (existing) {
          overrideId = existing.id;
        } else {
          // Create new override
          const { data: newOverride, error: insertError } = await supabase
            .from("date_overrides")
            .insert({
              course_id: cid,
              override_date: override.override_date,
              is_available: override.is_available,
            })
            .select()
            .single();

          if (insertError) throw insertError;
          overrideId = newOverride.id;
        }

        // Copy time slots if available
        if (override.is_available && originalSlots && originalSlots.length > 0) {
          // Delete existing slots first
          await supabase
            .from("date_override_time_slots")
            .delete()
            .eq("date_override_id", overrideId);

          // Insert new slots
          const slotsToInsert = originalSlots.map((slot) => ({
            date_override_id: overrideId,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_active: true,
          }));

          const { error: insertSlotsError } = await supabase
            .from("date_override_time_slots")
            .insert(slotsToInsert);

          if (insertSlotsError) throw insertSlotsError;
        }
      });

      await Promise.all(overridePromises);

      setMessage({
        type: "success",
        text: `Überschreibung erfolgreich auf ${courseIdsToApply.length} ${courseIdsToApply.length === 1 ? "Kurs" : "Kurse"} angewendet`,
      });
      setShowCourseSelector(null);
      loadOverrides();
    } catch (err) {
      console.error("Error applying override to courses:", err);
      setMessage({ type: "error", text: "Fehler beim Anwenden der Überschreibung" });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Removes override from a course
   */
  const removeOverrideFromCourse = async (overrideDate: string, courseIdToRemove: string) => {
    if (!confirm("Möchten Sie diese Überschreibung von diesem Kurs entfernen?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("date_overrides")
        .delete()
        .eq("course_id", courseIdToRemove)
        .eq("override_date", overrideDate);

      if (error) throw error;

      setMessage({ type: "success", text: "Überschreibung erfolgreich entfernt" });
      loadOverrides();
    } catch (err) {
      console.error("Error removing override from course:", err);
      setMessage({ type: "error", text: "Fehler beim Entfernen der Überschreibung" });
    }
  };

  /**
   * Deletes a date override
   */
  const deleteOverride = async (overrideId: string) => {
    if (!confirm("Möchten Sie diese Datumsüberschreibung wirklich löschen?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("date_overrides")
        .delete()
        .eq("id", overrideId);

      if (error) throw error;

      setMessage({ type: "success", text: "Datumsüberschreibung erfolgreich gelöscht" });
      loadOverrides();
    } catch (err) {
      console.error("Error deleting date override:", err);
      setMessage({ type: "error", text: "Fehler beim Löschen der Datumsüberschreibung" });
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
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Datumsüberschreibungen
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Fügen Sie Termine hinzu, an denen Ihre Verfügbarkeit von Ihren üblichen Geschäftszeiten abweicht.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Eine Überschreibung hinzufügen
        </button>
      </div>

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

      {/* List of existing overrides */}
      {overrides.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <p>Keine Datumsüberschreibungen vorhanden</p>
        </div>
      ) : (
        <div className="space-y-3">
          {overrides.map((override) => (
            <div
              key={override.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-gray-900">
                    {new Date(override.override_date).toLocaleDateString("de-DE", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {override.is_available ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      Verfügbar
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                      Nicht verfügbar
                    </span>
                  )}
                </div>
                {override.is_available && override.timeSlots.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {override.timeSlots.map((slot, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {slot.start_time} - {slot.end_time}
                      </div>
                    ))}
                  </div>
                )}
                {/* Applied to courses */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-700">Angewendet auf:</span>
                    <button
                      onClick={() => {
                        setSelectedCourseIds([]);
                        setShowCourseSelector(override.id);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Kurse hinzufügen
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {override.appliedToCourses?.map((cid) => {
                      const course = courses.find((c) => c.id === cid);
                      return (
                        <span
                          key={cid}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                        >
                          {course?.title || cid}
                          {cid !== courseId && (
                            <button
                              onClick={() => removeOverrideFromCourse(override.override_date, cid)}
                              className="hover:text-red-600"
                              title="Entfernen"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <button
                  onClick={() => deleteOverride(override.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Löschen"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for adding new override */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowAddModal(false);
            setSelectedDate("");
            setIsAvailable(true);
            setNewOverrideTimeSlots([]);
          }}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Eine Überschreibung hinzufügen
            </h3>

            <div className="space-y-4">
              {/* Date selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Datum
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Availability toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verfügbarkeit
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="availability"
                      checked={isAvailable}
                      onChange={() => setIsAvailable(true)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Verfügbar (mit benutzerdefinierten Zeitslots)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="availability"
                      checked={!isAvailable}
                      onChange={() => setIsAvailable(false)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Nicht verfügbar</span>
                  </label>
                </div>
              </div>

              {/* Time slots (only if available) */}
              {isAvailable && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zeitslots
                  </label>
                  <div className="space-y-2">
                    {newOverrideTimeSlots.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-gray-50 rounded-lg p-3"
                      >
                        <input
                          type="time"
                          value={slot.start_time}
                          onChange={(e) =>
                            updateNewTimeSlot(index, "start_time", e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-600">-</span>
                        <input
                          type="time"
                          value={slot.end_time}
                          onChange={(e) =>
                            updateNewTimeSlot(index, "end_time", e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => removeNewTimeSlot(index)}
                          className="ml-auto text-red-600 hover:text-red-800"
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addNewTimeSlot}
                      className="w-full bg-gray-100 text-gray-700 rounded-lg p-3 hover:bg-gray-200 transition-colors border border-dashed border-gray-300"
                    >
                      + Zeitslot hinzufügen
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedDate("");
                    setIsAvailable(true);
                    setNewOverrideTimeSlots([]);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={saveNewOverride}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Speichern..." : "Speichern"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for selecting courses to apply override */}
      {showCourseSelector && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowCourseSelector(null);
            setSelectedCourseIds([]);
          }}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Kurse auswählen
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              Wählen Sie die Kurse aus, auf die diese Überschreibung angewendet werden soll.
            </p>
            <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50 mb-4">
              {courses.length === 0 ? (
                <p className="text-gray-500 text-sm">Keine Kurse gefunden</p>
              ) : (
                <div className="space-y-2">
                  {courses.map((course) => {
                    const override = overrides.find((o) => o.id === showCourseSelector);
                    const isAlreadyApplied = override?.appliedToCourses?.includes(course.id);
                    return (
                      <label
                        key={course.id}
                        className={`flex items-center gap-3 p-2 rounded cursor-pointer ${
                          isAlreadyApplied ? "bg-gray-200 opacity-60" : "hover:bg-gray-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCourseIds.includes(course.id)}
                          onChange={() => toggleCourseSelection(course.id)}
                          disabled={isAlreadyApplied}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                        />
                        <span className="text-gray-900 text-sm">
                          {course.title}
                          {isAlreadyApplied && (
                            <span className="ml-2 text-xs text-gray-500">(bereits angewendet)</span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCourseSelector(null);
                  setSelectedCourseIds([]);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={() => {
                  const override = overrides.find((o) => o.id === showCourseSelector);
                  if (override && selectedCourseIds.length > 0) {
                    // Filter out courses that already have this override
                    const coursesToApply = selectedCourseIds.filter(
                      (cid) => !override.appliedToCourses?.includes(cid)
                    );
                    if (coursesToApply.length > 0) {
                      applyOverrideToCourses(override, coursesToApply);
                    } else {
                      setMessage({ type: "error", text: "Alle ausgewählten Kurse haben bereits diese Überschreibung" });
                      setShowCourseSelector(null);
                      setSelectedCourseIds([]);
                    }
                  }
                }}
                disabled={selectedCourseIds.length === 0 || saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Anwenden..." : "Anwenden"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

