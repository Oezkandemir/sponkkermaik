"use client";

import { Workshop } from "@/lib/data";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface CourseCardProps {
  workshop: Workshop;
}


const atelierImages = [
  "IMG_5264-1152x1536.webp",
  "IMG_5345-1152x1536.webp",
  "IMG_6970-1536x2048.webp",
  "IMG_6971-1536x2048.webp",
  "IMG_6986-1024x939.webp",
  "IMG_6987-1536x2048.webp",
  "IMG_6988-1012x1024.webp",
  "IMG_6989-1152x1536.webp",
  "IMG_6990-1152x1536.webp",
  "IMG_6991-1152x1536.webp",
  "IMG_6992-1152x1536.webp",
  "MG_0176-1-1024x683.webp",
];

/**
 * CourseCard-Komponente
 * Zeigt eine Kurs-Karte mit allen relevanten Informationen an
 * Mobile-first Design mit Modal für Buchungslinks
 */
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
  duration: number;
  availablePlaces: number;
  totalCapacity: number;
}

export default function CourseCard({ workshop }: CourseCardProps) {
  const t = useTranslations("courseCard");
  const tBookCourse = useTranslations("bookCourse");
  const router = useRouter();
  const supabase = createClient();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [dateSlots, setDateSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [dateAvailability, setDateAvailability] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [participants, setParticipants] = useState(1);
  const [participantNames, setParticipantNames] = useState<string[]>([]);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Use data directly from workshop prop (which already contains merged database + static data)
  const workshopTitle = workshop.title;
  const workshopDescription = workshop.description;
  const workshopDuration = workshop.duration;
  const workshopPrice = workshop.price;
  const workshopDay = workshop.day;
  const workshopBadgeText = workshop.badgeText;
  const hasBadgeText = workshopBadgeText !== undefined && workshopBadgeText !== "";
  const isFirstWorkshop = workshop.id === "workshop-nur-keramik-bemalen-glasieren";
  const useObjectContain = workshop.id === "workshop-nur-keramik-bemalen-glasieren" || workshop.id === "aufbau-workshop-2" || workshop.id === "einsteiger-kurse-topferscheibe" || workshop.id === "gruppen-events-workshops";
  
  // Load user and time slots when modal opens
  useEffect(() => {
    if (isModalOpen) {
      checkAuth();
      loadTimeSlots();
    }
  }, [isModalOpen, workshop.id]);
  
  // Load availability for all dates in current month
  useEffect(() => {
    if (isModalOpen && timeSlots.length > 0 && calendarDays.length > 0) {
      const loadAvailability = async () => {
        const availability: Record<string, boolean> = {};
        const promises = calendarDays
          .filter((day): day is Date => day !== null)
          .map(async (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;
            const hasSlots = await hasAvailableSlots(date);
            availability[dateString] = hasSlots;
          });
        await Promise.all(promises);
        setDateAvailability(availability);
      };
      loadAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, timeSlots, currentMonth]);
  
  // Load slots when date is selected
  useEffect(() => {
    if (isModalOpen && selectedDate) {
      setLoadingSlots(true);
      getSlotsForDate(selectedDate).then((slots) => {
        setDateSlots(slots);
        setLoadingSlots(false);
      });
    } else {
      setDateSlots([]);
    }
  }, [selectedDate, timeSlots, isModalOpen]);
  
  // ESC-Taste zum Schließen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isModalOpen]);
  
  // Body scroll lock wenn Modal offen
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);
  
  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };
  
  const loadTimeSlots = async () => {
    try {
      const [courseSpecificResult, globalResult] = await Promise.all([
        supabase
          .from("course_schedule")
          .select("*")
          .eq("course_id", workshop.id)
          .eq("is_active", true)
          .order("day_of_week")
          .order("start_time"),
        supabase
          .from("course_schedule")
          .select("*")
          .is("course_id", null)
          .eq("is_active", true)
          .order("day_of_week")
          .order("start_time"),
      ]);
      
      const courseSpecificSlots = courseSpecificResult.data || [];
      let globalSlots = globalResult.data || [];
      
      // IMPORTANT: If a course has its own specific slots, use ONLY those and ignore global slots
      // Global slots should only be used as fallback for courses without specific slots
      // This ensures courses like "topferscheibe-testen" show their custom 2.5h slots, not the global 3h slots
      const hasCourseSpecificSlots = courseSpecificSlots.length > 0;
      
      const isSundayWorkshop = workshop.id === "keramik-bemalen-sonntag";
      if (isSundayWorkshop) {
        globalSlots = globalSlots.filter((slot) => slot.day_of_week === 0);
      }
      
      // Use course-specific slots if available, otherwise fall back to global slots
      const allSlots = (hasCourseSpecificSlots ? courseSpecificSlots : globalSlots).sort((a, b) => {
        if (a.day_of_week !== b.day_of_week) {
          return a.day_of_week - b.day_of_week;
        }
        return a.start_time.localeCompare(b.start_time);
      });
      
      if (hasCourseSpecificSlots && globalSlots.length > 0) {
        console.log(`[CourseCard.loadTimeSlots] ✅ Kurs "${workshop.id}" hat eigene Slots (${courseSpecificSlots.length}), ignoriere globale Slots (${globalSlots.length})`);
      }
      
      setTimeSlots(allSlots);
    } catch (err) {
      console.error("Error loading time slots:", err);
    }
  };
  
  const calculateDuration = (startTime: string, endTime: string): number => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const start = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;
    return end - start;
  };
  
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} Min`;
    if (mins === 0) return `${hours} Std`;
    return `${hours} Std ${mins} Min`;
  };
  
  const isFirstSundayOfMonth = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();
    return dayOfWeek === 0 && dayOfMonth <= 7;
  };
  
  const isDecember = (date: Date): boolean => {
    return date.getMonth() === 11; // JavaScript months are 0-indexed, so December is 11
  };
  
  const isSundayWorkshopAvailable = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    // Must be a Sunday
    if (dayOfWeek !== 0) return false;
    // In December, all Sundays are available
    if (isDecember(date)) return true;
    // In other months, only the first Sunday
    return isFirstSundayOfMonth(date);
  };
  
  const getSlotsForDate = async (date: Date): Promise<AvailableSlot[]> => {
    const dayOfWeek = date.getDay();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    // Check for date override
    const { data: override, error: overrideError } = await supabase
      .from("date_overrides")
      .select("*")
      .eq("course_id", workshop.id)
      .eq("override_date", dateString)
      .maybeSingle();
    
    // Ignore errors - if no override exists, use regular schedule
    if (overrideError && overrideError.code !== "PGRST116") {
      console.warn("Error checking date override:", overrideError);
    }
    
    if (override) {
      if (!override.is_available) return [];
      
      const { data: overrideSlots } = await supabase
        .from("date_override_time_slots")
        .select("*")
        .eq("date_override_id", override.id)
        .eq("is_active", true)
        .order("start_time");
      
      if (overrideSlots) {
        const isPotteryWheel = workshop.id?.includes("topferscheibe") || workshop.id === "einsteiger-kurse-topferscheibe";
        const defaultCapacity = isPotteryWheel ? 4 : 12;
        
        return await Promise.all(
          overrideSlots.map(async (slot) => {
            const { data: bookings } = await supabase
              .from("bookings")
              .select("participants")
              .eq("course_schedule_id", slot.id)
              .eq("booking_date", dateString)
              .in("status", ["pending", "confirmed"]);
            
            const bookedPlaces = bookings?.reduce((sum, b) => sum + (b.participants || 1), 0) || 0;
            const availablePlaces = Math.max(0, defaultCapacity - bookedPlaces);
            
            return {
              date: new Date(date),
              timeSlot: {
                id: slot.id,
                course_id: workshop.id,
                start_time: slot.start_time,
                end_time: slot.end_time,
                day_of_week: dayOfWeek,
              },
              formattedDate: date.toLocaleDateString("de-DE", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              formattedTime: `${slot.start_time} - ${slot.end_time}`,
              duration: calculateDuration(slot.start_time, slot.end_time),
              availablePlaces,
              totalCapacity: defaultCapacity,
            };
          })
        );
      }
    }
    
    // Special handling for Sunday workshop
    const isSundayWorkshop = workshop.id === "keramik-bemalen-sonntag";
    if (isSundayWorkshop) {
      if (!isSundayWorkshopAvailable(date)) {
        return [];
      }
    }
    
    const daySlots = timeSlots.filter((slot) => slot.day_of_week === dayOfWeek);
    const isPotteryWheel = workshop.id?.includes("topferscheibe") || workshop.id === "einsteiger-kurse-topferscheibe";
    const defaultCapacity = isPotteryWheel ? 4 : 12;
    
    return await Promise.all(
      daySlots.map(async (slot) => {
        const { data: bookings } = await supabase
          .from("bookings")
          .select("participants")
          .eq("course_schedule_id", slot.id)
          .eq("booking_date", dateString)
          .in("status", ["pending", "confirmed"]);
        
        const bookedPlaces = bookings?.reduce((sum, b) => sum + (b.participants || 1), 0) || 0;
        const availablePlaces = Math.max(0, defaultCapacity - bookedPlaces);
        
        return {
          date: new Date(date),
          timeSlot: slot,
          formattedDate: date.toLocaleDateString("de-DE", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          formattedTime: `${slot.start_time} - ${slot.end_time}`,
          duration: calculateDuration(slot.start_time, slot.end_time),
          availablePlaces,
          totalCapacity: defaultCapacity,
        };
      })
    );
  };
  
  const hasAvailableSlots = async (date: Date): Promise<boolean> => {
    const dayOfWeek = date.getDay();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const { data: override, error: overrideError } = await supabase
      .from("date_overrides")
      .select("*")
      .eq("course_id", workshop.id)
      .eq("override_date", dateString)
      .maybeSingle();
    
    // Ignore errors - if no override exists, use regular schedule
    if (overrideError && overrideError.code !== "PGRST116") {
      console.warn("Error checking date override:", overrideError);
    }
    
    if (override) {
      if (!override.is_available) return false;
      const { data: overrideSlots } = await supabase
        .from("date_override_time_slots")
        .select("id")
        .eq("date_override_id", override.id)
        .eq("is_active", true)
        .limit(1);
      return (overrideSlots?.length || 0) > 0;
    }
    
    const isSundayWorkshop = workshop.id === "keramik-bemalen-sonntag";
    if (isSundayWorkshop) {
      if (!isSundayWorkshopAvailable(date)) return false;
    }
    
    const matchingSlots = timeSlots.filter((slot) => slot.day_of_week === dayOfWeek);
    return matchingSlots.length > 0;
  };
  
  const daysOfWeek = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;
    
    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };
  
  const calendarDays = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);
  
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
  
  const handleBooking = async () => {
    if (!selectedSlot) return;
    
    if (!customerName.trim()) {
      setMessage({ type: "error", text: tBookCourse("errors.nameRequired") });
      return;
    }
    
    if (!customerEmail.trim() || !customerEmail.includes("@")) {
      setMessage({ type: "error", text: tBookCourse("errors.emailRequired") });
      return;
    }
    
    // Validate password if creating account
    if (createAccount && !user) {
      if (!password.trim()) {
        setMessage({ type: "error", text: tBookCourse("passwordRequired") });
        return;
      }
      if (password.length < 6) {
        setMessage({ type: "error", text: tBookCourse("passwordTooShort") });
        return;
      }
    }
    
    setBooking(true);
    setMessage(null);
    
    try {
      // Validate participants count
      if (participants < 1) {
        setMessage({ type: "error", text: "Bitte wählen Sie mindestens 1 Teilnehmer" });
        setBooking(false);
        return;
      }
      
      if (selectedSlot.availablePlaces < participants) {
        setMessage({ 
          type: "error", 
          text: tBookCourse("errors.noCapacity") + ` (${selectedSlot.availablePlaces} Plätze verfügbar, ${participants} gewählt)` 
        });
        setBooking(false);
        return;
      }
      
      if (participants > selectedSlot.availablePlaces) {
        setMessage({ 
          type: "error", 
          text: `Nur ${selectedSlot.availablePlaces} Plätze verfügbar. Bitte reduzieren Sie die Anzahl der Teilnehmer.` 
        });
        setBooking(false);
        return;
      }
      
      // Validate participant names if there are additional participants
      if (participants > 1) {
        const missingNames = participantNames
          .slice(0, participants - 1)
          .map((name, index) => ({ name: name.trim(), index: index + 2 }))
          .filter((item) => !item.name);
        
        if (missingNames.length > 0) {
          setMessage({ 
            type: "error", 
            text: `Bitte geben Sie die Namen aller Teilnehmer ein. Fehlend: Teilnehmer ${missingNames.map(m => m.index).join(", ")}` 
          });
          setBooking(false);
          return;
        }
      }
      
      let userId = user?.id || null;
      
      // Create account if requested and user is not logged in
      if (createAccount && !user) {
        try {
          // Reason: Use email prefix as fallback name if customerName is empty
          const nameToUse = customerName.trim() || customerEmail.split("@")[0] || customerEmail;
          
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: customerEmail.trim(),
            password: password.trim(),
            options: {
              data: {
                full_name: nameToUse,
              },
            },
          });
          
          if (signUpError) {
            // If email already exists, try to sign in
            if (signUpError.message.includes("already registered")) {
              const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: customerEmail.trim(),
                password: password.trim(),
              });
              
              if (signInError) {
                throw new Error("Account existiert bereits, aber Passwort ist falsch");
              }
              
              userId = signInData.user?.id || null;
            } else {
              throw signUpError;
            }
          } else {
            userId = signUpData.user?.id || null;
            if (userId) {
              setMessage({ type: "success", text: tBookCourse("accountCreated") });
            }
          }
        } catch (accountError: unknown) {
          console.error("Error creating account:", accountError);
          // Continue with booking even if account creation fails
          setMessage({ 
            type: "error", 
            text: tBookCourse("errors.accountCreationFailed") 
          });
        }
      }
      
      const bookingDate = selectedSlot.date;
      const year = bookingDate.getFullYear();
      const month = String(bookingDate.getMonth() + 1).padStart(2, '0');
      const day = String(bookingDate.getDate()).padStart(2, '0');
      const bookingDateString = `${year}-${month}-${day}`;
      
      // Build notes with participant names if there are additional participants
      let finalNotes = notes || "";
      if (participants > 1 && participantNames.length > 0) {
        const participantNamesList = participantNames
          .slice(0, participants - 1)
          .map((name, index) => `Teilnehmer ${index + 2}: ${name.trim()}`)
          .join("\n");
        if (finalNotes) {
          finalNotes = `${finalNotes}\n\nTeilnehmer:\n${participantNamesList}`;
        } else {
          finalNotes = `Teilnehmer:\n${participantNamesList}`;
        }
      }
      
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          user_id: userId,
          course_schedule_id: selectedSlot.timeSlot.id,
          booking_date: bookingDateString,
          start_time: selectedSlot.timeSlot.start_time,
          end_time: selectedSlot.timeSlot.end_time,
          status: "confirmed",
          notes: finalNotes || null,
          participants: participants, // Use selected number of participants
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim(),
        })
        .select()
        .single();
      
      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }
      
      // Send confirmation email
      try {
        await fetch("/api/bookings/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: data.id,
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim(),
            courseTitle: workshopTitle,
            bookingDate: selectedSlot.formattedDate,
            bookingTime: selectedSlot.formattedTime,
          }),
        });
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
      }
      
      if (!message || message.type !== "error") {
        setMessage({ type: "success", text: tBookCourse("success.booked") });
      }
      
      setTimeout(() => {
        router.push(`/booking-success?id=${data.id}`);
      }, 1500);
    } catch (err: unknown) {
      console.error("Error creating booking:", err);
      const errorObj = err as { message?: string; details?: string; hint?: string; code?: string; stack?: string };
      console.error("Error details:", {
        message: errorObj?.message,
        details: errorObj?.details,
        hint: errorObj?.hint,
        code: errorObj?.code,
        stack: errorObj?.stack,
      });
      
      // Show more detailed error message
      let errorMessage = tBookCourse("errors.bookingFailed");
      if (errorObj?.message) {
        errorMessage = `${errorMessage}: ${errorObj.message}`;
      } else if (errorObj?.code) {
        errorMessage = `${errorMessage} (Code: ${errorObj.code})`;
      }
      
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setBooking(false);
    }
  };


  /**
   * Checks if course is fully booked (all slots have 0 available places)
   */
  const isCourseFullyBooked = (): boolean => {
    if (!selectedDate || dateSlots.length === 0) {
      return false;
    }
    return dateSlots.every(slot => slot.availablePlaces === 0);
  };
  
  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border flex flex-col h-full ${
      isFirstWorkshop 
        ? "border-amber-500 border-2 shadow-xl ring-2 ring-amber-300" 
        : "border-gray-100"
    }`}>
      {/* Badge für "Best preis garantie" */}
      {hasBadgeText && workshopBadgeText && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white text-center py-4 px-6 font-bold text-lg sm:text-xl md:text-2xl shadow-lg border-b-4 border-amber-700">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl">⭐</span>
            <span className="uppercase tracking-wide">{workshopBadgeText}</span>
            <span className="text-2xl sm:text-3xl">⭐</span>
          </div>
        </div>
      )}
      
      {/* Bilder Galerie - Alle Bilder nebeneinander */}
      {workshop.images && workshop.images.length > 0 && (
        <div className="flex gap-1 p-2 bg-gray-50">
          {workshop.images.map((image, index) => (
            <div key={index} className={`relative flex-1 rounded overflow-hidden ${
              useObjectContain 
                ? "h-[300px] sm:h-[400px] bg-gray-100" 
                : "h-[270px] sm:h-[336px]"
            }`}>
              <Image
                src={image}
                alt={`${workshopTitle} - Bild ${index + 1}`}
                fill
                className={useObjectContain ? "object-contain" : "object-cover"}
                sizes="(max-width: 640px) 33vw, 16vw"
              />
            </div>
          ))}
        </div>
      )}
      
      <div className="p-4 sm:p-6 flex-grow flex flex-col">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
          {workshopTitle}
        </h3>
        
        {/* Beschreibung mit besserer Formatierung */}
        <div className="mb-4 sm:mb-6 flex-grow">
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-amber-500">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                {workshopDescription}
              </p>
            </div>
          </div>
        </div>
        
        {/* Info Icons - Mobile optimiert */}
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-amber-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{t("duration")}</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900">{workshopDuration}</p>
            </div>
          </div>
          
          {workshopDay && (
            <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{t("day")}</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{workshopDay}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border-2 border-amber-300">
            <div className="flex-shrink-0 w-10 h-10 bg-amber-200 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-amber-700"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">{t("price")}</p>
              <p className="text-sm sm:text-base font-bold text-amber-700">{workshopPrice}</p>
            </div>
          </div>
        </div>

        {/* Buchungsbutton */}
        <div className="space-y-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="block w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg text-center text-sm sm:text-base transition-colors duration-200 shadow-md hover:shadow-lg active:bg-amber-900 touch-manipulation flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t("bookNow")}
          </button>
        </div>
      </div>
      
      {/* Booking Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-0 md:p-2 md:sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            // Only close on backdrop click on desktop
            if (e.target === e.currentTarget && window.innerWidth >= 768) {
              setIsModalOpen(false);
              setSelectedDate(null);
              setSelectedSlot(null);
              setNotes("");
              setCustomerName("");
              setCustomerEmail("");
              setParticipants(1);
              setParticipantNames([]);
              setMessage(null);
            }
          }}
        >
          <div className="bg-white rounded-none md:rounded-2xl shadow-2xl max-w-full md:max-w-6xl w-full h-full md:h-auto md:my-4 md:sm:my-8 md:max-h-[95vh] flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-200 px-4 sm:px-6 py-5 relative">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedDate(null);
                  setSelectedSlot(null);
                  setNotes("");
                  setCustomerName("");
                  setCustomerEmail("");
                  setCreateAccount(false);
                  setPassword("");
                  setParticipants(1);
                  setParticipantNames([]);
                  setMessage(null);
                }}
                className="absolute top-5 right-4 sm:right-6 text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all duration-200 flex-shrink-0 p-2 rounded-lg"
                aria-label="Schließen"
              >
                <svg className="w-6 h-6 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{workshopTitle}</h2>
                <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border-2 border-amber-300 shadow-sm">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-bold text-amber-700">{workshopPrice}</p>
                </div>
              </div>
            </div>
            
            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {!selectedSlot ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Calendar - Left Side */}
                  <div className="order-2 lg:order-1">
                    <div className="sticky top-0 bg-white pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => navigateMonth("prev")}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                          {currentMonth.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}
                        </h3>
                        <button
                          onClick={() => navigateMonth("next")}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {daysOfWeek.map((day) => (
                          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1 sm:py-2">
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((date, index) => {
                          if (!date) {
                            return <div key={`empty-${index}`} className="aspect-square" />;
                          }
                          
                          const isToday = date.toDateString() === new Date().toDateString();
                          const isPast = date < new Date() && !isToday;
                          const isSelected = selectedDate?.toDateString() === date.toDateString();
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          const dateString = `${year}-${month}-${day}`;
                          const hasSlots = dateAvailability[dateString] ?? false;
                          
                          return (
                            <button
                              key={date.toISOString()}
                              onClick={() => {
                                if (!isPast && hasSlots) {
                                  setSelectedDate(date);
                                }
                              }}
                              disabled={isPast || !hasSlots}
                              className={`
                                aspect-square rounded-lg text-xs sm:text-sm font-medium transition-all relative
                                ${isSelected
                                  ? "bg-amber-600 text-white shadow-lg"
                                  : isPast || !hasSlots
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-gray-700 hover:bg-gray-100 border border-gray-300"
                                }
                                ${isToday && !isSelected && hasSlots ? "ring-2 ring-amber-500" : ""}
                              `}
                              title={!hasSlots ? "Keine Zeitslots verfügbar" : isPast ? "Vergangenes Datum" : ""}
                            >
                              {date.getDate()}
                              {hasSlots && !isPast && (
                                <span className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full"></span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Time Slots - Right Side */}
                  <div className="order-1 lg:order-2">
                    {selectedDate ? (
                      <div className="lg:sticky lg:top-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                          {selectedDate.toLocaleDateString("de-DE", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </h3>
                        
                        {loadingSlots ? (
                          <div className="text-center py-12">
                            <div className="animate-spin h-8 w-8 border-3 border-amber-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                            <p className="text-sm text-gray-600">Lade verfügbare Zeitslots...</p>
                          </div>
                        ) : dateSlots.length > 0 ? (
                          <>
                            {/* Check if all slots are fully booked */}
                            {isCourseFullyBooked() ? (
                              <div className="text-center py-8">
                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                                  <svg className="w-12 h-12 text-red-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {tBookCourse("fullyBooked")}
                                  </h3>
                                  <p className="text-sm text-gray-700">
                                    Dieser Kurs ist leider vollständig ausgebucht.
                                  </p>
                                </div>
                                <div className="space-y-3 max-h-[60vh] lg:max-h-[calc(95vh-200px)] overflow-y-auto pr-2 mt-4">
                                  {dateSlots.map((slot, index) => (
                                    <div
                                      key={index}
                                      className="w-full p-4 rounded-xl border-2 border-gray-200 bg-gray-50 opacity-60"
                                    >
                                      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                          </div>
                                          <span className="font-bold text-gray-600 text-base">
                                            {slot.timeSlot.start_time} - {slot.timeSlot.end_time}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                          <span className="text-xs font-semibold text-red-600">
                                            {tBookCourse("fullyBooked")}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-500 ml-[52px]">
                                        {formatDuration(slot.duration)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3 max-h-[60vh] lg:max-h-[calc(95vh-200px)] overflow-y-auto pr-2">
                                {dateSlots.map((slot, index) => {
                                  const isFullyBooked = slot.availablePlaces === 0;
                                  return (
                                    <div
                                      key={index}
                                      className={`
                                        w-full p-4 rounded-xl border-2 text-left transition-all duration-200
                                        ${isFullyBooked
                                          ? "border-red-200 bg-red-50"
                                          : "border-gray-200 bg-white hover:border-amber-400 hover:bg-amber-50 hover:shadow-md"
                                        }
                                      `}
                                    >
                                      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                                        <div className="flex items-center gap-3">
                                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                            isFullyBooked ? "bg-red-100" : "bg-amber-100"
                                          }`}>
                                            <svg className={`w-5 h-5 ${isFullyBooked ? "text-red-600" : "text-amber-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                          </div>
                                          <span className={`font-bold text-base ${
                                            isFullyBooked ? "text-gray-700" : "text-gray-900"
                                          }`}>
                                            {slot.timeSlot.start_time} - {slot.timeSlot.end_time}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <div className={`w-2.5 h-2.5 rounded-full ${
                                            isFullyBooked ? "bg-red-500" : slot.availablePlaces <= 2 ? "bg-yellow-500" : "bg-green-500"
                                          }`}></div>
                                          <span className={`text-xs font-semibold ${
                                            isFullyBooked ? "text-red-600" : slot.availablePlaces <= 2 ? "text-yellow-600" : "text-green-600"
                                          }`}>
                                            {isFullyBooked 
                                              ? tBookCourse("fullyBooked") 
                                              : `${slot.availablePlaces} ${tBookCourse("placesAvailable")}`
                                            }
                                          </span>
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-600 ml-[52px] mb-2">
                                        {formatDuration(slot.duration)}
                                      </div>
                                      {isFullyBooked ? (
                                        <div className="w-full px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm font-semibold text-center">
                                          {tBookCourse("fullyBooked")}
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => setSelectedSlot(slot)}
                                          className="w-full px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-200 text-sm font-semibold"
                                        >
                                          {tBookCourse("confirm")}
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="bg-gray-50 rounded-xl p-10 text-center border-2 border-gray-200">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-600 text-sm sm:text-base font-medium mb-1">
                              {tBookCourse("noSlotsAvailable")}
                            </p>
                            <p className="text-gray-400 text-xs">
                              Bitte wählen Sie ein anderes Datum aus
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-8 text-center lg:sticky lg:top-0">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 text-sm sm:text-base font-medium mb-2">
                          Datum auswählen
                        </p>
                        <p className="text-gray-400 text-xs">
                          Wählen Sie ein Datum im Kalender aus, um verfügbare Zeitslots zu sehen
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Booking Form */
                <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="mb-6">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      {tBookCourse("confirmBooking")}
                    </h3>
                    <p className="text-sm text-gray-600">Bitte füllen Sie die folgenden Informationen aus</p>
                  </div>
                  
                  <div className="space-y-5 sm:space-y-6 mb-6">
                    {/* Booking Summary Card */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 sm:p-6 border-2 border-amber-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Buchungsdetails</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-3 border border-amber-100">
                          <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                            {tBookCourse("date")}
                          </label>
                          <p className="text-base font-bold text-gray-900">{selectedSlot.formattedDate}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-amber-100">
                          <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                            {tBookCourse("time")}
                          </label>
                          <p className="text-base font-bold text-gray-900">{selectedSlot.formattedTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700 bg-white rounded-lg p-3 border border-amber-100">
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{formatDuration(selectedSlot.duration)}</span>
                      </div>
                    </div>
                    
                    {/* Customer Name */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-900">
                        {tBookCourse("customerName")} <span className="text-red-500 font-normal">*</span>
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                        className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white hover:border-gray-300"
                        placeholder={tBookCourse("customerNamePlaceholder")}
                      />
                    </div>
                    
                    {/* Customer Email */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-900">
                        {tBookCourse("customerEmail")} <span className="text-red-500 font-normal">*</span>
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white hover:border-gray-300"
                        placeholder={tBookCourse("customerEmailPlaceholder")}
                      />
                    </div>

                    {/* Participants Selection */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-900">
                        Anzahl der Teilnehmer <span className="text-red-500 font-normal">*</span>
                      </label>
                      <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              if (participants > 1) {
                                setParticipants(participants - 1);
                                // Remove last participant name when reducing count
                                setParticipantNames((prev) => prev.slice(0, participants - 2));
                              }
                            }}
                            disabled={participants <= 1}
                            className="w-12 h-12 rounded-xl border-2 border-gray-300 bg-white flex items-center justify-center text-gray-700 hover:bg-amber-50 hover:border-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 shadow-sm"
                            aria-label="Teilnehmer reduzieren"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                            </svg>
                          </button>
                          <div className="flex-1 text-center">
                            <span className="text-4xl font-bold text-gray-900 block">{participants}</span>
                            <span className="text-sm text-gray-600 font-medium">
                              {participants === 1 ? "Teilnehmer" : "Teilnehmer"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const maxParticipants = selectedSlot?.availablePlaces || 1;
                              if (participants < maxParticipants) {
                                setParticipants(participants + 1);
                                // Add empty name field for new participant
                                setParticipantNames((prev) => [...prev, ""]);
                              }
                            }}
                            disabled={participants >= (selectedSlot?.availablePlaces || 1)}
                            className="w-12 h-12 rounded-xl border-2 border-gray-300 bg-white flex items-center justify-center text-gray-700 hover:bg-amber-50 hover:border-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 shadow-sm"
                            aria-label="Teilnehmer hinzufügen"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          {selectedSlot && (
                            <>
                              {selectedSlot.availablePlaces > 0 ? (
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${selectedSlot.availablePlaces <= 2 ? "bg-yellow-500" : "bg-green-500"}`}></div>
                                  <p className="text-sm text-gray-700">
                                    <span className="font-semibold">{selectedSlot.availablePlaces}</span> {selectedSlot.availablePlaces === 1 ? "Platz" : "Plätze"} verfügbar
                                  </p>
                                  {participants > selectedSlot.availablePlaces && (
                                    <span className="ml-auto text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">⚠️ Nicht genug Plätze</span>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-red-600 font-medium">Keine Plätze verfügbar</p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Participant Name Fields - Show for additional participants (2nd, 3rd, etc.) */}
                      {participants > 1 && (
                        <div className="mt-5 pt-5 border-t border-gray-200 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <p className="text-sm font-semibold text-gray-900 mb-3">
                            Namen der zusätzlichen Teilnehmer
                          </p>
                          {Array.from({ length: participants - 1 }).map((_, index) => (
                            <div key={index} className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-900">
                                Teilnehmer {index + 2} <span className="text-red-500 font-normal">*</span>
                              </label>
                              <input
                                type="text"
                                value={participantNames[index] || ""}
                                onChange={(e) => {
                                  const newNames = [...participantNames];
                                  newNames[index] = e.target.value;
                                  setParticipantNames(newNames);
                                }}
                                required
                                className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white hover:border-gray-300"
                                placeholder={`Name des ${index + 2}. Teilnehmers`}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Not logged in notice */}
                    {!user && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-900 mb-1">
                              {tBookCourse("notLoggedIn")}
                            </p>
                            <p className="text-xs text-blue-700 leading-relaxed">
                              {tBookCourse("notLoggedInInfo")}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Create Account Checkbox */}
                    {!user && (
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5">
                        <label className="flex items-start gap-4 cursor-pointer group">
                          <div className="relative flex-shrink-0 mt-0.5">
                            <input
                              type="checkbox"
                              checked={createAccount}
                              onChange={(e) => {
                                setCreateAccount(e.target.checked);
                                if (!e.target.checked) {
                                  setPassword("");
                                }
                              }}
                              className="w-6 h-6 text-amber-600 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 mb-1.5">
                              {tBookCourse("createAccount")}
                            </p>
                            <p className="text-xs text-gray-700 leading-relaxed">
                              {tBookCourse("createAccountInfo")}
                            </p>
                          </div>
                        </label>
                        
                        {createAccount && (
                          <div className="mt-5 pt-5 border-t border-amber-300 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                              {tBookCourse("password")} <span className="text-red-500 font-normal">*</span>
                            </label>
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required={createAccount}
                              className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white hover:border-gray-300"
                              placeholder={tBookCourse("passwordPlaceholder")}
                            />
                            <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Mindestens 6 Zeichen erforderlich
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Notes */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-900">
                        {tBookCourse("notes")} <span className="text-gray-500 text-xs font-normal">({tBookCourse("optional")})</span>
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white hover:border-gray-300 resize-none"
                        placeholder={tBookCourse("notesPlaceholder")}
                      />
                    </div>
                  </div>
                  
                  {message && (
                    <div
                      className={`mb-5 p-4 rounded-xl text-sm sm:text-base border-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                        message.type === "success"
                          ? "bg-green-50 border-green-300 text-green-800 shadow-sm"
                          : "bg-red-50 border-red-300 text-red-800 shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {message.type === "success" ? (
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        <p className="flex-1 font-medium">{message.text}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setSelectedSlot(null);
                        setNotes("");
                        setCustomerName("");
                        setCustomerEmail("");
                        setParticipants(1);
                        setParticipantNames([]);
                        setMessage(null);
                      }}
                      className="flex-1 px-6 py-4 text-base border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold active:scale-98 shadow-sm"
                    >
                      {tBookCourse("cancel")}
                    </button>
                    <button
                      onClick={handleBooking}
                      disabled={
                        booking || 
                        !customerName.trim() || 
                        !customerEmail.trim() || 
                        participants < 1 ||
                        (selectedSlot && participants > selectedSlot.availablePlaces) ||
                        (createAccount && !user && (!password.trim() || password.length < 6)) ||
                        (participants > 1 && participantNames.slice(0, participants - 1).some(name => !name.trim()))
                      }
                      className="flex-1 px-6 py-4 text-base bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl active:scale-98 disabled:active:scale-100"
                    >
                      {booking ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {tBookCourse("booking")}
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {tBookCourse("confirm")}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

