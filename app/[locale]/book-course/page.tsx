"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { workshops } from "@/lib/data";

interface TimeSlot {
  id: string;
  course_id?: string;
  start_time: string;
  end_time: string;
  day_of_week: number;
}

interface AvailableSlot {
  date: Date;
  timeSlot: TimeSlot;
  formattedDate: string;
  formattedTime: string;
  duration: number; // Duration in minutes
  availablePlaces: number; // Available places for this slot
  totalCapacity: number; // Total capacity for this slot
}

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  capacity?: number; // Course capacity
}

/**
 * Book Course Page Component
 * 
 * 3-column layout: Course Info (left) | Calendar (center) | Time Slots (right)
 */
export default function BookCoursePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("bookCourse");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [notes, setNotes] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const supabase = createClient();
  const courseId = searchParams.get("course");

  useEffect(() => {
    checkAuth();
    loadCourse();
    if (courseId) {
      loadTimeSlots();
    }
  }, [courseId]);

  /**
   * Checks authentication (non-blocking)
   */
  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };

  /**
   * Loads course information
   */
  const loadCourse = async () => {
    if (!courseId) return;

    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (error) throw error;

      if (data) {
        // Determine capacity: pottery wheel = 4, others = 12
        const isPotteryWheel = courseId?.includes("topferscheibe") || courseId === "einsteiger-kurse-topferscheibe";
        const defaultCapacity = isPotteryWheel ? 4 : 12;
        setCourse({
          ...data,
          capacity: data.capacity || defaultCapacity, // Use database capacity or default based on course type
        });
        console.log(`Course loaded: ${data.title}, Capacity: ${data.capacity || defaultCapacity} (Pottery Wheel: ${isPotteryWheel})`);
      } else {
        const staticCourse = workshops.find((w) => w.id === courseId);
        if (staticCourse) {
          // Determine capacity based on course type
          const isPotteryWheel = courseId?.includes("topferscheibe") || courseId === "einsteiger-kurse-topferscheibe";
          setCourse({
            id: staticCourse.id,
            title: staticCourse.title,
            description: staticCourse.description,
            duration: staticCourse.duration,
            price: staticCourse.price,
            capacity: isPotteryWheel ? 4 : 12,
          });
        }
      }
    } catch (err) {
      console.error("Error loading course:", err);
      const staticCourse = workshops.find((w) => w.id === courseId);
      if (staticCourse) {
        const isPotteryWheel = courseId?.includes("topferscheibe") || courseId === "einsteiger-kurse-topferscheibe";
        setCourse({
          id: staticCourse.id,
          title: staticCourse.title,
          description: staticCourse.description,
          duration: staticCourse.duration,
          price: staticCourse.price,
          capacity: isPotteryWheel ? 4 : 12,
        });
      }
    }
  };

  /**
   * Loads available time slots from database
   */
  const loadTimeSlots = async () => {
    if (!courseId) {
      setTimeSlots([]);
      return;
    }

    try {
      // Load course-specific slots and global slots (course_id = null) separately
      // This ensures we get all relevant slots for the course
      const [courseSpecificResult, globalResult] = await Promise.all([
        // Load course-specific slots
        supabase
          .from("course_schedule")
          .select("*")
          .eq("course_id", courseId)
          .eq("is_active", true)
          .order("day_of_week")
          .order("start_time"),
        // Load global slots (course_id = null) that apply to all courses
        supabase
          .from("course_schedule")
          .select("*")
          .is("course_id", null)
          .eq("is_active", true)
          .order("day_of_week")
          .order("start_time"),
      ]);

      if (courseSpecificResult.error) {
        console.error("Error loading course-specific time slots:", courseSpecificResult.error);
        setMessage({ type: "error", text: t("errors.loadFailed") });
      }
      if (globalResult.error) {
        console.error("Error loading global time slots:", globalResult.error);
        // Don't show error for global slots, as they're optional
      }

      // Combine both results and sort by day_of_week and start_time
      const courseSpecificSlots = courseSpecificResult.data || [];
      let globalSlots = globalResult.data || [];
      
      // Special handling for "keramik-bemalen-sonntag": only load Sunday slots (day_of_week = 0)
      const isSundayWorkshop = courseId === "keramik-bemalen-sonntag";
      if (isSundayWorkshop) {
        // Filter global slots to only include Sundays
        globalSlots = globalSlots.filter((slot) => slot.day_of_week === 0);
        console.log(`[loadTimeSlots] Sonntags-Workshop erkannt: Filtere globale Slots auf Sonntage (day_of_week=0)`);
      }
      
      const allSlots = [...courseSpecificSlots, ...globalSlots].sort((a, b) => {
        // First sort by day_of_week
        if (a.day_of_week !== b.day_of_week) {
          return a.day_of_week - b.day_of_week;
        }
        // Then sort by start_time
        return a.start_time.localeCompare(b.start_time);
      });

      // Debug: Log slots by day with day names
      const dayNames: Record<number, string> = {
        0: "Sonntag",
        1: "Montag",
        2: "Dienstag",
        3: "Mittwoch",
        4: "Donnerstag",
        5: "Freitag",
        6: "Samstag",
      };
      
      const slotsByDay = allSlots.reduce((acc: Record<number, any[]>, slot) => {
        if (!acc[slot.day_of_week]) acc[slot.day_of_week] = [];
        acc[slot.day_of_week].push(slot);
        return acc;
      }, {});
      
      console.log(`\n=== Zeitslots für Kurs: ${courseId} ===`);
      console.log(`Gesamt: ${allSlots.length} Zeitslots`);
      console.log(`  - Kurs-spezifisch: ${courseSpecificSlots.length}`);
      console.log(`  - Global: ${globalSlots.length}`);
      
      if (courseSpecificSlots.length === 0 && globalSlots.length === 0) {
        console.warn(`⚠️ WARNUNG: Keine Zeitslots gefunden für Kurs ${courseId}!`);
        console.warn(`Bitte überprüfen Sie im Admin-Bereich, ob Zeitslots für diesen Kurs eingegeben wurden.`);
      }
      
      console.log(`\nZeitslots nach Wochentag:`);
      Object.keys(slotsByDay).forEach((day) => {
        const dayNum = parseInt(day);
        const dayName = dayNames[dayNum] || `Tag ${dayNum}`;
        console.log(`  ${dayName} (${dayNum}): ${slotsByDay[dayNum].length} Slots`, slotsByDay[dayNum]);
      });
      console.log(`=== Ende Zeitslots ===\n`);
      
      setTimeSlots(allSlots);
    } catch (err) {
      console.error("Error loading time slots:", err);
      setMessage({ type: "error", text: t("errors.loadFailed") });
    }
  };

  /**
   * Calculates duration in minutes from time slot
   */
  const calculateDuration = (startTime: string, endTime: string): number => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const start = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;
    return end - start;
  };

  /**
   * Formats duration as hours and minutes
   */
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} Min`;
    if (mins === 0) return `${hours} Std`;
    return `${hours} Std ${mins} Min`;
  };

  /**
   * Checks if a date is the first Sunday of the month
   */
  const isFirstSundayOfMonth = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();
    return dayOfWeek === 0 && dayOfMonth <= 7; // Sunday (0) and within first 7 days
  };
  
  /**
   * Checks if a date is in December
   */
  const isDecember = (date: Date): boolean => {
    return date.getMonth() === 11; // JavaScript months are 0-indexed, so December is 11
  };
  
  /**
   * Checks if Sunday workshop is available for a given date
   * In December: all Sundays are available
   * In other months: only the first Sunday
   */
  const isSundayWorkshopAvailable = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    // Must be a Sunday
    if (dayOfWeek !== 0) return false;
    // In December, all Sundays are available
    if (isDecember(date)) return true;
    // In other months, only the first Sunday
    return isFirstSundayOfMonth(date);
  };

  /**
   * Gets available slots for a specific date with capacity information
   */
  const getSlotsForDate = async (date: Date): Promise<AvailableSlot[]> => {
    const dayOfWeek = date.getDay();
    
    // CRITICAL: Format date string consistently (YYYY-MM-DD) using local date components
    // This avoids timezone issues that can occur with toISOString()
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    // Check for date override first
    if (courseId) {
      const { data: override, error: overrideError } = await supabase
        .from("date_overrides")
        .select("*")
        .eq("course_id", courseId)
        .eq("override_date", dateString)
        .single();

      if (!overrideError && override) {
        // Date override exists
        if (!override.is_available) {
          // Date is explicitly unavailable
          console.log(`[getSlotsForDate] Datumsüberschreibung: ${dateString} ist nicht verfügbar`);
          return [];
        }

        // Date has custom time slots - use those instead of regular schedule
        const { data: overrideSlots, error: overrideSlotsError } = await supabase
          .from("date_override_time_slots")
          .select("*")
          .eq("date_override_id", override.id)
          .eq("is_active", true)
          .order("start_time");

        if (overrideSlotsError) {
          console.error("Error loading override time slots:", overrideSlotsError);
          return [];
        }

        // Use override slots instead of regular slots
        const overrideSlotsWithCapacity = await Promise.all(
          (overrideSlots || []).map(async (slot) => {
            const isPotteryWheel = course?.id?.includes("topferscheibe") || course?.id === "einsteiger-kurse-topferscheibe";
            const defaultCapacity = isPotteryWheel ? 4 : 12;
            const totalCapacity = course?.capacity || defaultCapacity;

            const { data: bookings, error } = await supabase
              .from("bookings")
              .select("participants")
              .eq("course_schedule_id", slot.id)
              .eq("booking_date", dateString)
              .in("status", ["pending", "confirmed"]);

            if (error) {
              console.error(`Error loading bookings for override slot ${slot.id} on ${dateString}:`, error);
            }

            const bookedPlaces = bookings?.reduce((sum, b) => sum + (b.participants || 1), 0) || 0;
            const availablePlaces = Math.max(0, totalCapacity - bookedPlaces);

            const formattedDate = date.toLocaleDateString("de-DE", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            const [startHour, startMin] = slot.start_time.split(":");
            const formattedTime = `${startHour}:${startMin} - ${slot.end_time}`;
            const duration = calculateDuration(slot.start_time, slot.end_time);

            return {
              date: new Date(date),
              timeSlot: {
                id: slot.id,
                course_id: courseId,
                start_time: slot.start_time,
                end_time: slot.end_time,
                day_of_week: dayOfWeek,
              },
              formattedDate,
              formattedTime,
              duration,
              availablePlaces,
              totalCapacity,
            };
          })
        );

        console.log(`[getSlotsForDate] Verwende ${overrideSlotsWithCapacity.length} Überschreibungs-Slots für ${dateString}`);
        return overrideSlotsWithCapacity;
      }
    }
    
    // Special handling for "keramik-bemalen-sonntag" course
    const isSundayWorkshop = courseId === "keramik-bemalen-sonntag";
    if (isSundayWorkshop) {
      // Check if this Sunday is available (all Sundays in December, first Sunday in other months)
      if (!isSundayWorkshopAvailable(date)) {
        if (dayOfWeek !== 0) {
          console.log(`[getSlotsForDate] Sonntags-Workshop: ${date.toLocaleDateString("de-DE")} ist kein Sonntag - keine Slots zurückgeben`);
        } else if (!isDecember(date) && !isFirstSundayOfMonth(date)) {
          console.log(`[getSlotsForDate] Sonntag ${date.toLocaleDateString("de-DE")} ist nicht der erste Sonntag im Monat (außer Dezember) - keine Slots zurückgeben`);
        }
        return [];
      }
    }
    
    // Filter slots for this day - timeSlots is already filtered in loadTimeSlots
    const daySlots = timeSlots.filter((slot) => slot.day_of_week === dayOfWeek);
    
    // Debug: Log if no slots found for this day
    if (daySlots.length === 0 && timeSlots.length > 0) {
      const dayNames: Record<number, string> = {
        0: "Sonntag", 1: "Montag", 2: "Dienstag", 3: "Mittwoch",
        4: "Donnerstag", 5: "Freitag", 6: "Samstag"
      };
      console.warn(`⚠️ [getSlotsForDate] Keine Slots für ${dayNames[dayOfWeek]} ${dateString} gefunden! timeSlots.length=${timeSlots.length}, dayOfWeek=${dayOfWeek}`);
      console.warn(`Verfügbare day_of_week Werte:`, [...new Set(timeSlots.map(s => s.day_of_week))].sort());
    }
    
    const slotsWithCapacity = await Promise.all(
      daySlots.map(async (slot) => {
        // Get total capacity (from course or slot, default 12)
        // Check if this is a pottery wheel course
        const isPotteryWheel = course?.id?.includes("topferscheibe") || course?.id === "einsteiger-kurse-topferscheibe";
        const defaultCapacity = isPotteryWheel ? 4 : 12;
        const totalCapacity = course?.capacity || defaultCapacity;
        
        // Get booked capacity for this slot and date
        const { data: bookings, error } = await supabase
          .from("bookings")
          .select("participants")
          .eq("course_schedule_id", slot.id)
          .eq("booking_date", dateString)
          .in("status", ["pending", "confirmed"]);
        
        if (error) {
          console.error(`Error loading bookings for slot ${slot.id} on ${dateString}:`, error);
        }
        
        const bookedPlaces = bookings?.reduce((sum, b) => sum + (b.participants || 1), 0) || 0;
        const availablePlaces = Math.max(0, totalCapacity - bookedPlaces);
        
        // Debug logging for capacity
        if (bookedPlaces > 0 || availablePlaces < totalCapacity) {
          console.log(`Slot ${slot.start_time}-${slot.end_time} on ${dateString}: ${bookedPlaces}/${totalCapacity} booked, ${availablePlaces} available`);
        }
        
        const formattedDate = date.toLocaleDateString("de-DE", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const [startHour, startMin] = slot.start_time.split(":");
        const formattedTime = `${startHour}:${startMin} - ${slot.end_time}`;
        const duration = calculateDuration(slot.start_time, slot.end_time);

        return {
          date: new Date(date),
          timeSlot: slot,
          formattedDate,
          formattedTime,
          duration,
          availablePlaces,
          totalCapacity,
        };
      })
    );
    
    return slotsWithCapacity;
  };

  /**
   * Checks if a date has available slots
   */
  const hasAvailableSlots = async (date: Date): Promise<boolean> => {
    const dayOfWeek = date.getDay(); // JavaScript: 0=Sunday, 1=Monday, ..., 6=Saturday
    // Database day_of_week: 0=Sunday, 1=Monday, ..., 6=Saturday (same mapping)
    
    // Format date string consistently
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    // Check for date override first
    if (courseId) {
      const { data: override, error: overrideError } = await supabase
        .from("date_overrides")
        .select("*")
        .eq("course_id", courseId)
        .eq("override_date", dateString)
        .single();

      if (!overrideError && override) {
        // Date override exists
        if (!override.is_available) {
          // Date is explicitly unavailable
          return false;
        }
        // Date has custom time slots - check if any exist
        const { data: overrideSlots, error: overrideSlotsError } = await supabase
          .from("date_override_time_slots")
          .select("id")
          .eq("date_override_id", override.id)
          .eq("is_active", true)
          .limit(1);

        if (!overrideSlotsError && overrideSlots && overrideSlots.length > 0) {
          return true;
        }
        return false;
      }
    }
    
    // Special handling for "keramik-bemalen-sonntag" course
    const isSundayWorkshop = courseId === "keramik-bemalen-sonntag";
    if (isSundayWorkshop) {
      // Check if this Sunday is available (all Sundays in December, first Sunday in other months)
      if (!isSundayWorkshopAvailable(date)) {
        if (dayOfWeek !== 0) {
          console.log(`[hasAvailableSlots] Sonntags-Workshop: ${date.toLocaleDateString("de-DE")} ist kein Sonntag - überspringe`);
        } else if (!isDecember(date) && !isFirstSundayOfMonth(date)) {
          console.log(`[hasAvailableSlots] Sonntag ${date.toLocaleDateString("de-DE")} ist nicht der erste Sonntag im Monat (außer Dezember) - überspringe`);
        }
        return false;
      }
      // If we get here, it's an available Sunday - check if there are slots
      const matchingSlots = timeSlots.filter((slot) => slot.day_of_week === dayOfWeek);
      return matchingSlots.length > 0;
    }
    
    // For other courses, use normal logic
    const matchingSlots = timeSlots.filter((slot) => slot.day_of_week === dayOfWeek);
    const hasSlots = matchingSlots.length > 0;
    
    // Enhanced debug logging
    const dayNames: Record<number, string> = {
      0: "Sonntag", 1: "Montag", 2: "Dienstag", 3: "Mittwoch",
      4: "Donnerstag", 5: "Freitag", 6: "Samstag"
    };
    
    if (timeSlots.length > 0) {
      if (matchingSlots.length > 0) {
        console.log(
          `[hasAvailableSlots] ${dayNames[dayOfWeek]} (${dayOfWeek}): ✅ ${matchingSlots.length} Slots gefunden`,
          matchingSlots.map(s => `${s.start_time}-${s.end_time}`)
        );
      }
    } else {
      console.warn(`[hasAvailableSlots] Keine Zeitslots geladen! timeSlots.length = ${timeSlots.length}`);
    }
    
    return hasSlots;
  };

  /**
   * Calendar helpers
   */
  const daysOfWeek = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    
    const days: (Date | null)[] = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const calendarDays = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);

  /**
   * Gets total available places for a date (sum of all slots)
   */
  const [dateCapacities, setDateCapacities] = useState<Record<string, number>>({});
  const [dateAvailability, setDateAvailability] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load capacities for all dates in current month
    const loadDateCapacities = async () => {
      if (!course || calendarDays.length === 0 || timeSlots.length === 0) {
        console.log(`[loadDateCapacities] Skipping: course=${!!course}, calendarDays=${calendarDays.length}, timeSlots=${timeSlots.length}`);
        return;
      }
      
      console.log(`[loadDateCapacities] Starting for ${calendarDays.length} days, ${timeSlots.length} slots`);
      
      const capacities: Record<string, number> = {};
      const dateStrings: string[] = [];
      
      // Collect all date strings first - use consistent formatting
      for (const day of calendarDays) {
        if (day) {
          // Format as YYYY-MM-DD using local date components to avoid timezone issues
          const year = day.getFullYear();
          const month = String(day.getMonth() + 1).padStart(2, '0');
          const dayNum = String(day.getDate()).padStart(2, '0');
          dateStrings.push(`${year}-${month}-${dayNum}`);
        }
      }
      
      const availability: Record<string, boolean> = {};
      
      // Load capacities and availability for all dates in parallel
      const capacityPromises = dateStrings.map(async (dateString) => {
        // CRITICAL: Parse date string correctly to avoid timezone issues
        // dateString is in YYYY-MM-DD format, parse it as local date
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day); // month is 0-indexed
        
        try {
          // Check availability first
          const hasSlots = await hasAvailableSlots(date);
          availability[dateString] = hasSlots;
          
          const slots = await getSlotsForDate(date);
          const totalAvailable = slots.reduce((sum, slot) => sum + slot.availablePlaces, 0);
          
          // Debug: Log capacity calculation for ALL days with slots
          const dayOfWeek = date.getDay();
          const dayNames: Record<number, string> = {
            0: "Sonntag", 1: "Montag", 2: "Dienstag", 3: "Mittwoch",
            4: "Donnerstag", 5: "Freitag", 6: "Samstag"
          };
          
          // ALWAYS log if slots exist, even if totalAvailable is 0
          if (slots.length > 0) {
            console.log(`📊 [Kapazität] ${dayNames[dayOfWeek]} ${dateString}: ${slots.length} Slots, ${totalAvailable} verfügbare Plätze`);
            // Log individual slot capacities for debugging
            slots.forEach((slot, idx) => {
              console.log(`  Slot ${idx + 1}: ${slot.timeSlot.start_time}-${slot.timeSlot.end_time}, availablePlaces=${slot.availablePlaces}, totalCapacity=${slot.totalCapacity}`);
            });
          } else {
            // Log when no slots found for debugging
            console.log(`📊 [Kapazität] ${dayNames[dayOfWeek]} ${dateString}: 0 Slots gefunden`);
          }
          
          return { dateString, totalAvailable, hasSlots };
        } catch (err) {
          console.error(`Error loading capacity for ${dateString}:`, err);
          availability[dateString] = false;
          return { dateString, totalAvailable: 0, hasSlots: false };
        }
      });
      
      const results = await Promise.all(capacityPromises);
      results.forEach(({ dateString, totalAvailable, hasSlots }) => {
        capacities[dateString] = totalAvailable;
        availability[dateString] = hasSlots;
        // Debug: Log final capacity - parse date correctly
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();
        const dayNames: Record<number, string> = {
          0: "Sonntag", 1: "Montag", 2: "Dienstag", 3: "Mittwoch",
          4: "Donnerstag", 5: "Freitag", 6: "Samstag"
        };
        const prevValue = dateCapacities[dateString];
        console.log(`✅ [Kapazität gesetzt] ${dayNames[dayOfWeek]} ${dateString}: ${totalAvailable} Plätze (vorher: ${prevValue ?? 'undefined'}, type: ${typeof prevValue})`);
        
        // CRITICAL: Warn if we're setting 0 for a day that should have slots
        if (totalAvailable === 0) {
          const matchingSlots = timeSlots.filter((slot) => slot.day_of_week === dayOfWeek);
          if (matchingSlots.length > 0) {
            console.warn(`⚠️ [WARNUNG] ${dayNames[dayOfWeek]} ${dateString} hat ${matchingSlots.length} Slots in timeSlots, aber totalAvailable=0!`);
          }
        }
      });
      
      console.log(`[loadDateCapacities] Setting capacities:`, capacities);
      console.log(`[loadDateCapacities] Setting availability:`, availability);
      console.log(`[loadDateCapacities] Keys in capacities:`, Object.keys(capacities).sort());
      console.log(`[loadDateCapacities] Current dateCapacities before update:`, dateCapacities);
      setDateCapacities(capacities);
      setDateAvailability(availability);
    };

    loadDateCapacities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, timeSlots, course]);
  const [selectedDateSlots, setSelectedDateSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Load slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      setLoadingSlots(true);
      getSlotsForDate(selectedDate).then((slots) => {
        setSelectedDateSlots(slots);
        setLoadingSlots(false);
      });
    } else {
      setSelectedDateSlots([]);
    }
  }, [selectedDate, timeSlots, course]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  /**
   * Handles booking submission
   */
  const handleBooking = async () => {
    if (!selectedSlot) return;

    if (!user) {
      router.push(`/auth/signin?redirect=/book-course${courseId ? `?course=${courseId}` : ''}`);
      return;
    }

    // Validate required fields
    if (!customerName.trim()) {
      setMessage({ type: "error", text: t("errors.nameRequired") });
      return;
    }

    if (!customerEmail.trim() || !customerEmail.includes("@")) {
      setMessage({ type: "error", text: t("errors.emailRequired") });
      return;
    }

    setBooking(true);
    setMessage(null);

    try {
      // Check capacity before booking
      if (selectedSlot.availablePlaces < 1) {
        setMessage({ type: "error", text: t("errors.noCapacity") });
        setBooking(false);
        return;
      }

      // Format booking date consistently
      const bookingDate = selectedSlot.date;
      const year = bookingDate.getFullYear();
      const month = String(bookingDate.getMonth() + 1).padStart(2, '0');
      const day = String(bookingDate.getDate()).padStart(2, '0');
      const bookingDateString = `${year}-${month}-${day}`;

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          course_schedule_id: selectedSlot.timeSlot.id,
          booking_date: bookingDateString,
          start_time: selectedSlot.timeSlot.start_time,
          end_time: selectedSlot.timeSlot.end_time,
          status: "confirmed", // Automatically confirmed when booking is created
          notes: notes || null,
          participants: 1, // Default to 1 participant
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Send confirmation email
      try {
        const response = await fetch("/api/bookings/send-confirmation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId: data.id,
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim(),
            courseTitle: course?.title || "",
            bookingDate: selectedSlot.formattedDate,
            bookingTime: selectedSlot.formattedTime,
          }),
        });

        if (!response.ok) {
          console.error("Failed to send confirmation email");
        }
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Don't fail the booking if email fails
      }

      setMessage({ type: "success", text: t("success.booked") });
      
      // Reload slots to update availability
      if (selectedDate) {
        const updatedSlots = await getSlotsForDate(selectedDate);
        setSelectedDateSlots(updatedSlots);
        
        // Update date capacities - use consistent date formatting
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        const totalAvailable = updatedSlots.reduce((sum, slot) => sum + slot.availablePlaces, 0);
        setDateCapacities((prev) => ({
          ...prev,
          [dateString]: totalAvailable,
        }));
      }
      
      setTimeout(() => {
        router.push(`/booking-success?id=${data.id}`);
      }, 2000);
    } catch (err) {
      console.error("Error creating booking:", err);
      setMessage({ type: "error", text: t("errors.bookingFailed") });
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Laden...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Kurs nicht gefunden</p>
          <Link href="/kurse-preise-sponk-keramik" className="text-amber-600 hover:text-amber-700">
            {t("backToWorkshops")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/kurse-preise-sponk-keramik" className="text-gray-600 hover:text-gray-900">
              ← {t("backToWorkshops")}
            </Link>
            <button className="text-gray-600 hover:text-gray-900 text-sm">
              {t("needHelp")}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Course Info */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              {/* Provider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                  SK
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Sponk Keramik</p>
                </div>
              </div>

              {/* Course Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>

              {/* Course Description */}
              <div className="mb-6">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {course.description}
                </p>
              </div>

              {/* Duration */}
              {selectedDateSlots.length > 0 && (
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatDuration(selectedDateSlots[0]?.duration || 0)}</span>
                </div>
              )}

              {/* Location */}
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Fürstenplatz 15, 40215 Düsseldorf</span>
              </div>

              {/* Timezone */}
              <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Europe/Berlin</span>
              </div>

              {/* Price */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600 mb-1">Preis</p>
                <p className="text-xl font-bold text-gray-900">{course.price}</p>
              </div>
            </div>
          </div>

          {/* Middle Column - Calendar */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => navigateMonth("prev")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  {currentMonth.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}
                </h2>
                <button
                  onClick={() => navigateMonth("next")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const isToday = date.toDateString() === new Date().toDateString();
                  const isPast = date < new Date() && !isToday;
                  const isSelected = selectedDate?.toDateString() === date.toISOString();
                  
                  // CRITICAL: Format date string consistently (YYYY-MM-DD)
                  // Use local date components to avoid timezone issues
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const dateString = `${year}-${month}-${day}`;
                  
                  const hasSlots = dateAvailability[dateString] ?? false; // Use cached availability
                  
                  const availablePlaces = dateCapacities[dateString];
                  
                  // CRITICAL: Ensure we're reading the value correctly
                  // Convert to number explicitly to avoid any type issues
                  const availablePlacesNum = availablePlaces !== undefined ? Number(availablePlaces) : undefined;
                  
                  // SIMPLIFIED LOGIC: Always show days with slots, regardless of capacity status
                  // Only mark as fully booked if explicitly 0
                  const isFullyBooked = availablePlacesNum !== undefined && availablePlacesNum === 0;
                  
                  // Clickable if: not past, has slots, and either capacity not loaded yet OR has available places
                  const isClickable = !isPast && hasSlots && (availablePlacesNum === undefined || availablePlacesNum > 0);
                  // Disabled if: past, no slots, OR explicitly fully booked
                  const isDisabled = isPast || !hasSlots || isFullyBooked;
                  
                  // CRITICAL DEBUG: Log EVERYTHING for days with slots
                  if (hasSlots) {
                    const dayNames: Record<number, string> = {
                      0: "Sonntag", 1: "Montag", 2: "Dienstag", 3: "Mittwoch",
                      4: "Donnerstag", 5: "Freitag", 6: "Samstag"
                    };
                    const dayName = dayNames[date.getDay()];
                    const matchingSlots = timeSlots.filter((slot) => slot.day_of_week === date.getDay());
                    console.log(
                      `🔍 [Kalender-Render] ${dayName} ${dateString}: ` +
                      `hasSlots=${hasSlots}, matchingSlots=${matchingSlots.length}, ` +
                      `availablePlaces=${availablePlaces} (raw), availablePlacesNum=${availablePlacesNum} (num), ` +
                      `type: ${typeof availablePlaces}, ` +
                      `isFullyBooked=${isFullyBooked}, isClickable=${isClickable}, isDisabled=${isDisabled}, ` +
                      `willShowDot=${hasSlots && !isPast && (availablePlacesNum === undefined || availablePlacesNum > 0)}, ` +
                      `dateCapacities keys: [${Object.keys(dateCapacities).join(', ')}]`
                    );
                    if (matchingSlots.length > 0) {
                      console.log(`  Slots:`, matchingSlots.map(s => `${s.start_time}-${s.end_time} (day_of_week=${s.day_of_week})`));
                    }
                  }

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => isClickable && setSelectedDate(date)}
                      disabled={isDisabled}
                      className={`
                        aspect-square rounded-lg text-sm font-medium transition-all relative
                        ${isSelected
                          ? "bg-amber-600 text-white shadow-lg scale-105"
                          : isPast
                          ? "text-gray-300 cursor-not-allowed"
                          : !hasSlots
                          ? "text-gray-300 cursor-not-allowed"
                          : isFullyBooked
                          ? "text-gray-600 cursor-not-allowed bg-gray-50 border border-gray-300"
                          : hasSlots
                          ? "text-gray-700 hover:bg-gray-100 border-2 border-gray-300 bg-white"
                          : "text-gray-700 hover:bg-gray-100"
                        }
                        ${isToday && !isSelected && hasSlots ? "ring-2 ring-amber-500" : ""}
                      `}
                      title={!hasSlots ? "Keine Zeitslots verfügbar" : isFullyBooked ? "Vollständig gebucht" : availablePlacesNum !== undefined ? `${availablePlacesNum} Plätze verfügbar` : "Verfügbarkeit wird geladen..."}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className={hasSlots ? "font-semibold" : ""}>{date.getDate()}</span>
                        {/* ALWAYS show indicator if slots exist, regardless of past/availablePlaces */}
                        {hasSlots && (
                          <>
                            {isPast ? (
                              <span className="text-xs text-gray-400 mt-0.5" title="Vergangener Tag mit Slots">•</span>
                            ) : availablePlacesNum !== undefined && availablePlacesNum === 0 ? (
                              <span className="text-xs text-red-500 mt-0.5 font-bold" title="Vollständig gebucht">✕</span>
                            ) : availablePlacesNum !== undefined && availablePlacesNum > 0 ? (
                              <span className="text-xs mt-0.5">
                                <span className={`inline-block w-2 h-2 rounded-full ${
                                  availablePlacesNum <= 2 ? "bg-yellow-500" : "bg-green-500"
                                }`} title={`${availablePlacesNum} Plätze verfügbar`}></span>
                              </span>
                            ) : (
                              // Show blue dot while loading - MAKE IT VISIBLE
                              <span className="text-xs mt-0.5">
                                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse border border-blue-700" title="Verfügbarkeit wird geladen"></span>
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Time Slots */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              {selectedDate ? (
                <>
                  {/* Selected Date Header */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {selectedDate.toLocaleDateString("de-DE", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedDate.toLocaleDateString("de-DE", { year: "numeric" })}
                    </p>
                  </div>

                  {/* Time Format Toggle */}
                  <div className="flex gap-2 mb-4">
                    <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded font-medium">
                      12 Std
                    </button>
                    <button className="px-3 py-1 text-xs text-gray-500 rounded">
                      24 Std
                    </button>
                  </div>

                  {/* Available Time Slots */}
                  {loadingSlots ? (
                    <div className="text-center py-8">
                      <div className="animate-spin h-6 w-6 border-2 border-amber-600 border-t-transparent rounded-full mx-auto"></div>
                    </div>
                  ) : selectedDateSlots.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDateSlots.map((slot, index) => {
                        const isSelected = selectedSlot?.timeSlot.id === slot.timeSlot.id;
                        const isFullyBooked = slot.availablePlaces === 0;
                        
                        return (
                          <button
                            key={index}
                            onClick={() => !isFullyBooked && setSelectedSlot(slot)}
                            disabled={isFullyBooked}
                            className={`
                              w-full p-4 rounded-lg border-2 text-left transition-all
                              ${isFullyBooked
                                ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                                : isSelected
                                ? "border-amber-600 bg-amber-50"
                                : "border-gray-200 hover:border-amber-400 hover:bg-amber-50/50"
                              }
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-900">
                                {slot.timeSlot.start_time} - {slot.timeSlot.end_time}
                              </span>
                              {isSelected && (
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <div className="flex items-center gap-2">
                                <span className={`inline-block w-2 h-2 rounded-full ${
                                  isFullyBooked ? "bg-red-500" : slot.availablePlaces <= 2 ? "bg-yellow-500" : "bg-green-500"
                                }`}></span>
                                <span className="text-xs text-gray-600">
                                  {formatDuration(slot.duration)}
                                </span>
                              </div>
                              <span className={`text-xs font-medium ${
                                isFullyBooked 
                                  ? "text-red-600" 
                                  : slot.availablePlaces <= 2 
                                  ? "text-yellow-600" 
                                  : "text-green-600"
                              }`}>
                                {isFullyBooked 
                                  ? t("fullyBooked") 
                                  : `${slot.availablePlaces} / ${slot.totalCapacity} ${t("placesAvailable")}`
                                }
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">Keine verfügbaren Zeitslots</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Wählen Sie ein Datum aus</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Form Modal */}
        {selectedSlot && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t("confirmBooking")}
              </h3>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("date")}
                      </label>
                      <p className="text-gray-900 font-semibold">{selectedSlot.formattedDate}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("time")}
                      </label>
                      <p className="text-gray-900 font-semibold">{selectedSlot.formattedTime}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("customerName")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder={t("customerNamePlaceholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("customerEmail")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder={t("customerEmailPlaceholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("notes")} <span className="text-gray-500">({t("optional")})</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder={t("notesPlaceholder")}
                  />
                </div>
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

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedSlot(null);
                    setNotes("");
                    setCustomerName("");
                    setCustomerEmail("");
                    setMessage(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleBooking}
                  disabled={booking || !customerName.trim() || !customerEmail.trim()}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {booking ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t("booking")}
                    </>
                  ) : (
                    t("confirm")
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
