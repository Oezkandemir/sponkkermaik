"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

interface TimeSlot {
  id?: string;
  start_time: string;
  end_time: string;
}

interface DaySchedule {
  dayOfWeek: number;
  dayName: string;
  isActive: boolean;
  timeSlots: TimeSlot[];
}

interface FirstSundaySchedule {
  isActive: boolean;
  timeSlots: TimeSlot[];
}

/**
 * Schedule Settings Component
 * 
 * Allows admins to configure course schedule times for each day of the week.
 * Allows admins to configure course schedule times for each day of the week.
 */
export default function ScheduleSettings() {
  const t = useTranslations("scheduleSettings");
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [sourceDayForApply, setSourceDayForApply] = useState<number | null>(null);
  const [firstSundaySchedule, setFirstSundaySchedule] = useState<FirstSundaySchedule>({
    isActive: false,
    timeSlots: [],
  });

  const daysOfWeek = [
    { number: 1, name: "Montag" },
    { number: 2, name: "Dienstag" },
    { number: 3, name: "Mittwoch" },
    { number: 4, name: "Donnerstag" },
    { number: 5, name: "Freitag" },
    { number: 6, name: "Samstag" },
    { number: 0, name: "Sonntag" },
  ];

  const [schedules, setSchedules] = useState<DaySchedule[]>(
    daysOfWeek.map((day) => ({
      dayOfWeek: day.number,
      dayName: day.name,
      isActive: false,
      timeSlots: [],
    }))
  );

  useEffect(() => {
    loadSchedules();
  }, []);

  /**
   * Loads existing schedules from database
   */
  const loadSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from("course_schedule")
        .select("*")
        .order("day_of_week")
        .order("start_time");

      if (error) throw error;

      // Group by day of week
      const grouped: { [key: number]: TimeSlot[] } = {};
      const activeDays = new Set<number>();

      data?.forEach((schedule) => {
        const day = schedule.day_of_week;
        if (!grouped[day]) {
          grouped[day] = [];
        }
        grouped[day].push({
          id: schedule.id,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
        });
        if (schedule.is_active) {
          activeDays.add(day);
        }
      });

      // Update schedules state
      setSchedules((prev) =>
        prev.map((schedule) => ({
          ...schedule,
          isActive: activeDays.has(schedule.dayOfWeek),
          timeSlots: grouped[schedule.dayOfWeek] || [],
        }))
      );

      // Load first Sunday schedule
      const { data: firstSundayData, error: firstSundayError } = await supabase
        .from("first_sunday_schedule")
        .select("*")
        .eq("is_active", true)
        .order("start_time");

      if (!firstSundayError && firstSundayData) {
        setFirstSundaySchedule({
          isActive: firstSundayData.length > 0,
          timeSlots: firstSundayData.map((slot) => ({
            id: slot.id,
            start_time: slot.start_time,
            end_time: slot.end_time,
          })),
        });
      }
    } catch (err) {
      console.error("Error loading schedules:", err);
      setMessage({ type: "error", text: t("errors.loadFailed") });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggles day active/inactive
   */
  const toggleDay = (dayOfWeek: number) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.dayOfWeek === dayOfWeek
          ? { ...schedule, isActive: !schedule.isActive }
          : schedule
      )
    );
  };

  /**
   * Adds a new time slot to a day
   */
  const addTimeSlot = (dayOfWeek: number) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.dayOfWeek === dayOfWeek
          ? {
              ...schedule,
              timeSlots: [
                ...schedule.timeSlots,
                { start_time: "09:00", end_time: "12:00" },
              ],
            }
          : schedule
      )
    );
  };

  /**
   * Updates a time slot
   */
  const updateTimeSlot = (
    dayOfWeek: number,
    index: number,
    field: "start_time" | "end_time",
    value: string
  ) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.dayOfWeek === dayOfWeek
          ? {
              ...schedule,
              timeSlots: schedule.timeSlots.map((slot, i) =>
                i === index ? { ...slot, [field]: value } : slot
              ),
            }
          : schedule
      )
    );
  };

  /**
   * Removes a time slot
   */
  const removeTimeSlot = (dayOfWeek: number, index: number) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.dayOfWeek === dayOfWeek
          ? {
              ...schedule,
              timeSlots: schedule.timeSlots.filter((_, i) => i !== index),
            }
          : schedule
      )
    );
  };

  /**
   * Toggles first Sunday active/inactive
   */
  const toggleFirstSunday = () => {
    setFirstSundaySchedule((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

  /**
   * Adds a new time slot to first Sunday
   */
  const addFirstSundayTimeSlot = () => {
    setFirstSundaySchedule((prev) => ({
      ...prev,
      timeSlots: [
        ...prev.timeSlots,
        { start_time: "09:00", end_time: "12:00" },
      ],
    }));
  };

  /**
   * Updates a first Sunday time slot
   */
  const updateFirstSundayTimeSlot = (
    index: number,
    field: "start_time" | "end_time",
    value: string
  ) => {
    setFirstSundaySchedule((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      ),
    }));
  };

  /**
   * Removes a first Sunday time slot
   */
  const removeFirstSundayTimeSlot = (index: number) => {
    setFirstSundaySchedule((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index),
    }));
  };

  /**
   * Copies time slots from one day to another
   */
  const copyTimeSlots = (fromDay: number, toDay: number) => {
    const fromSchedule = schedules.find((s) => s.dayOfWeek === fromDay);
    if (!fromSchedule) return;

    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.dayOfWeek === toDay
          ? {
              ...schedule,
              timeSlots: fromSchedule.timeSlots.map((slot) => ({
                ...slot,
                id: undefined, // Remove ID so it creates new entry
              })),
            }
          : schedule
      )
    );
  };

  /**
   * Applies time slots from one day to multiple other days
   */
  const applyTimeSlotsToMultipleDays = (fromDay: number, toDays: number[]) => {
    const fromSchedule = schedules.find((s) => s.dayOfWeek === fromDay);
    if (!fromSchedule || fromSchedule.timeSlots.length === 0) return;

    setSchedules((prev) =>
      prev.map((schedule) =>
        toDays.includes(schedule.dayOfWeek)
          ? {
              ...schedule,
              isActive: true,
              timeSlots: fromSchedule.timeSlots.map((slot) => ({
                ...slot,
                id: undefined, // Remove ID so it creates new entry
              })),
            }
          : schedule
      )
    );
  };

  /**
   * Saves schedules to database
   */
  const saveSchedules = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Get all existing schedules to delete inactive ones and removed slots
      const { data: existing } = await supabase
        .from("course_schedule")
        .select("id, day_of_week");

      const toDelete: string[] = [];
      const toInsert: any[] = [];
      const toUpdate: any[] = [];

      schedules.forEach((schedule) => {
        if (!schedule.isActive) {
          // Mark all slots for this day as inactive
          existing
            ?.filter((e) => e.day_of_week === schedule.dayOfWeek)
            .forEach((e) => {
              toDelete.push(e.id);
            });
          return;
        }

        // Get all existing slot IDs for this day
        const existingSlotIds = existing
          ?.filter((e) => e.day_of_week === schedule.dayOfWeek)
          .map((e) => e.id) || [];

        // Get current slot IDs (only those with IDs)
        const currentSlotIds = schedule.timeSlots
          .filter((slot) => slot.id)
          .map((slot) => slot.id!);

        // Find slots that were removed (exist in DB but not in current state)
        const removedSlotIds = existingSlotIds.filter(
          (id) => !currentSlotIds.includes(id)
        );
        toDelete.push(...removedSlotIds);

        schedule.timeSlots.forEach((slot) => {
          if (slot.id) {
            // Update existing
            toUpdate.push({
              id: slot.id,
              day_of_week: schedule.dayOfWeek,
              start_time: slot.start_time,
              end_time: slot.end_time,
              is_active: true,
            });
          } else {
            // Insert new
            toInsert.push({
              day_of_week: schedule.dayOfWeek,
              start_time: slot.start_time,
              end_time: slot.end_time,
              is_active: true,
            });
          }
        });
      });

      // Delete inactive schedules
      if (toDelete.length > 0) {
        const { error } = await supabase
          .from("course_schedule")
          .delete()
          .in("id", toDelete);
        if (error) throw error;
      }

      // Insert new schedules
      if (toInsert.length > 0) {
        const { error } = await supabase
          .from("course_schedule")
          .insert(toInsert);
        if (error) throw error;
      }

      // Update existing schedules
      for (const update of toUpdate) {
        const { error } = await supabase
          .from("course_schedule")
          .update({
            day_of_week: update.day_of_week,
            start_time: update.start_time,
            end_time: update.end_time,
            is_active: update.is_active,
          })
          .eq("id", update.id);
        if (error) throw error;
      }

      // Save first Sunday schedule
      // First, get all existing first Sunday schedules and delete them
      const { data: existingFirstSunday, error: selectError } = await supabase
        .from("first_sunday_schedule")
        .select("id");
      
      if (selectError) {
        console.error("Error selecting first Sunday schedules:", selectError);
        throw selectError;
      }
      
      // Delete all existing first Sunday schedules
      if (existingFirstSunday && existingFirstSunday.length > 0) {
        const idsToDelete = existingFirstSunday.map((item) => item.id);
        const { error: deleteError } = await supabase
          .from("first_sunday_schedule")
          .delete()
          .in("id", idsToDelete);
        
        if (deleteError) {
          console.error("Error deleting first Sunday schedules:", deleteError);
          throw deleteError;
        }
      }

      // Insert new first Sunday schedules if active
      if (firstSundaySchedule.isActive && firstSundaySchedule.timeSlots.length > 0) {
        const firstSundayToInsert = firstSundaySchedule.timeSlots.map((slot) => ({
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_active: true,
        }));

        const { error: insertError } = await supabase
          .from("first_sunday_schedule")
          .insert(firstSundayToInsert);
        
        if (insertError) {
          console.error("Error inserting first Sunday schedules:", insertError);
          throw insertError;
        }
      }

      // Reload schedules after saving
      await loadSchedules();

      setMessage({ type: "success", text: t("success.saved") });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error("Error saving schedules:", err);
      let errorMessage = t("errors.saveFailed");
      
      if (err?.message) {
        errorMessage = `${errorMessage}: ${err.message}`;
      } else if (err?.code) {
        errorMessage = `${errorMessage} (Code: ${err.code})`;
      } else if (typeof err === 'string') {
        errorMessage = `${errorMessage}: ${err}`;
      } else if (err?.toString) {
        errorMessage = `${errorMessage}: ${err.toString()}`;
      }
      
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("title")}</h2>
          <p className="text-gray-600 mt-1">{t("subtitle")}</p>
        </div>
        <button
          onClick={saveSchedules}
          disabled={saving}
          className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? t("saving") : t("save")}
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {schedules.map((schedule) => (
          <div
            key={schedule.dayOfWeek}
            className="bg-gray-900 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-white font-medium min-w-[120px]">
                  {schedule.dayName}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={schedule.isActive}
                    onChange={() => toggleDay(schedule.dayOfWeek)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                </label>
                {schedule.isActive && schedule.timeSlots.length > 0 && (
                  <button
                    onClick={() => {
                      setSourceDayForApply(schedule.dayOfWeek);
                      setShowApplyModal(true);
                    }}
                    className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
                    title={t("applyToOtherDays")}
                  >
                    <svg
                      className="w-4 h-4"
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
                    {t("applyToOtherDays")}
                  </button>
                )}
              </div>
            </div>

            {schedule.isActive && (
              <div className="space-y-2 mt-4">
                {schedule.timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-800 rounded-lg p-3"
                  >
                    <input
                      type="time"
                      value={slot.start_time}
                      onChange={(e) =>
                        updateTimeSlot(
                          schedule.dayOfWeek,
                          index,
                          "start_time",
                          e.target.value
                        )
                      }
                      className="bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-white">-</span>
                    <input
                      type="time"
                      value={slot.end_time}
                      onChange={(e) =>
                        updateTimeSlot(
                          schedule.dayOfWeek,
                          index,
                          "end_time",
                          e.target.value
                        )
                      }
                      className="bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => addTimeSlot(schedule.dayOfWeek)}
                        className="text-white hover:text-amber-400 transition-colors"
                        title={t("addTimeSlot")}
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
                      </button>
                      {schedules.some(
                        (s) =>
                          s.dayOfWeek !== schedule.dayOfWeek &&
                          s.isActive &&
                          s.timeSlots.length > 0
                      ) && (
                        <button
                          onClick={() => {
                            const sourceDay = schedules.find(
                              (s) =>
                                s.dayOfWeek !== schedule.dayOfWeek &&
                                s.isActive &&
                                s.timeSlots.length > 0
                            )?.dayOfWeek;
                            if (sourceDay !== undefined) {
                              copyTimeSlots(sourceDay, schedule.dayOfWeek);
                            }
                          }}
                          className="text-white hover:text-amber-400 transition-colors"
                          title={t("copyTimeSlots")}
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
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => removeTimeSlot(schedule.dayOfWeek, index)}
                        className="text-white hover:text-red-400 transition-colors"
                        title={t("removeTimeSlot")}
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
                {schedule.timeSlots.length === 0 && (
                  <button
                    onClick={() => addTimeSlot(schedule.dayOfWeek)}
                    className="w-full bg-gray-800 text-white rounded-lg p-3 hover:bg-gray-700 transition-colors border border-dashed border-gray-600"
                  >
                    {t("addFirstTimeSlot")}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {/* First Sunday of Month Schedule */}
        <div className="bg-purple-900 rounded-lg p-4 border-2 border-purple-600 mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <span className="text-white font-medium min-w-[200px]">
                {t("firstSundayOfMonth")}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={firstSundaySchedule.isActive}
                  onChange={toggleFirstSunday}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
              </label>
            </div>
          </div>

          {firstSundaySchedule.isActive && (
            <div className="space-y-2 mt-4">
              {firstSundaySchedule.timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-purple-800 rounded-lg p-3"
                >
                  <input
                    type="time"
                    value={slot.start_time}
                    onChange={(e) =>
                      updateFirstSundayTimeSlot(index, "start_time", e.target.value)
                    }
                    className="bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-white">-</span>
                  <input
                    type="time"
                    value={slot.end_time}
                    onChange={(e) =>
                      updateFirstSundayTimeSlot(index, "end_time", e.target.value)
                    }
                    className="bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={addFirstSundayTimeSlot}
                      className="text-white hover:text-purple-300 transition-colors"
                      title={t("addTimeSlot")}
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
                    </button>
                    <button
                      onClick={() => removeFirstSundayTimeSlot(index)}
                      className="text-white hover:text-red-400 transition-colors"
                      title={t("removeTimeSlot")}
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
              {firstSundaySchedule.timeSlots.length === 0 && (
                <button
                  onClick={addFirstSundayTimeSlot}
                  className="w-full bg-purple-800 text-white rounded-lg p-3 hover:bg-purple-700 transition-colors border border-dashed border-purple-600"
                >
                  {t("addFirstTimeSlot")}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for applying time slots to multiple days */}
      {showApplyModal && sourceDayForApply !== null && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowApplyModal(false);
            setSourceDayForApply(null);
          }}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t("applyTimeSlotsFrom")} {schedules.find((s) => s.dayOfWeek === sourceDayForApply)?.dayName}
            </h3>
            <p className="text-gray-600 mb-4">{t("selectDaysToApply")}</p>
            <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
              {schedules
                .filter((s) => s.dayOfWeek !== sourceDayForApply)
                .map((schedule) => (
                  <label
                    key={schedule.dayOfWeek}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                      defaultChecked={false}
                      id={`day-${schedule.dayOfWeek}`}
                    />
                    <span className="text-gray-900 font-medium">
                      {schedule.dayName}
                    </span>
                  </label>
                ))}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowApplyModal(false);
                  setSourceDayForApply(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => {
                  const checkboxes = document.querySelectorAll<HTMLInputElement>(
                    'input[type="checkbox"][id^="day-"]:checked'
                  );
                  const selectedDays = Array.from(checkboxes).map((cb) => {
                    const dayId = parseInt(cb.id.replace("day-", ""));
                    return schedules.find((s) => s.dayOfWeek === dayId)?.dayOfWeek;
                  }).filter((day): day is number => day !== undefined);

                  if (selectedDays.length > 0 && sourceDayForApply !== null) {
                    applyTimeSlotsToMultipleDays(sourceDayForApply, selectedDays);
                  }
                  setShowApplyModal(false);
                  setSourceDayForApply(null);
                }}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                {t("apply")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

