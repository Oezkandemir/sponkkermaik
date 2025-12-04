"use client";

import { workshops as staticWorkshops, sortWorkshops, type Workshop } from "@/lib/data";
import CourseCard from "@/components/CourseCard";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import enMessages from "@/messages/en.json";
import { createClient } from "@/lib/supabase/client";

// Atelier Bilder für Header
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
 * Workshops & Preise Seite
 * Mobile-first Design mit allen Kursen und direkten Buchungslinks
 */
export default function WorkshopsPage() {
  const [randomHeaderImage, setRandomHeaderImage] = useState<string>("");
  const [workshops, setWorkshops] = useState<Workshop[]>(staticWorkshops);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("workshops");
  const params = useParams();
  const currentLocale = (params.locale as string) || "de";
  const supabase = createClient();

  // Setze zufälliges Bild nach dem Mount (verhindert Hydration Mismatch)
  useEffect(() => {
    setRandomHeaderImage(
      atelierImages[Math.floor(Math.random() * atelierImages.length)]
    );
  }, []);

  // Load courses from database and merge with static data
  useEffect(() => {
    loadCoursesFromDatabase();
  }, []);

  /**
   * Loads courses from database and merges with static workshop data
   */
  const loadCoursesFromDatabase = async () => {
    try {
      setLoading(true);
      const { data: courses, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_active", true)
        .order("title");

      if (error) {
        console.error("Error loading courses:", error);
        // Fallback to static workshops if database fails
        setWorkshops(sortWorkshops(staticWorkshops));
        return;
      }

      // Merge database courses with static workshop data
      const mergedWorkshops: Workshop[] = (courses || []).map((course) => {
        // Find matching static workshop by ID
        const staticWorkshop = staticWorkshops.find((w) => w.id === course.id);
        
        // Use database data for title, description, duration, price, day
        // Use static data for images, badgeText, featured, etc.
        return {
          id: course.id,
          title: course.title,
          description: course.description,
          duration: course.duration,
          price: course.price,
          day: course.day || staticWorkshop?.day,
          images: staticWorkshop?.images,
          badgeText: staticWorkshop?.badgeText,
          featured: staticWorkshop?.featured,
          topOffer: staticWorkshop?.topOffer,
        };
      });

      // Add static workshops that don't exist in database (for backwards compatibility)
      staticWorkshops.forEach((staticWorkshop) => {
        if (!mergedWorkshops.find((w) => w.id === staticWorkshop.id)) {
          mergedWorkshops.push(staticWorkshop);
        }
      });

      // Sort workshops according to defined order
      setWorkshops(sortWorkshops(mergedWorkshops));
    } catch (err) {
      console.error("Error loading courses:", err);
      // Fallback to static workshops on error
      setWorkshops(sortWorkshops(staticWorkshops));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-amber-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 min-h-[20vh] sm:min-h-[25vh] md:min-h-[30vh] flex items-center justify-center overflow-hidden pt-4 pb-4">
        {randomHeaderImage && (
          <div className="absolute inset-0 z-0">
            <Image
              src={`/images/atelier/${randomHeaderImage}`}
              alt="Sponk Keramik Atelier"
              fill
              priority
              className="object-cover"
              quality={90}
              sizes="100vw"
            />
            {/* Overlay für bessere Textlesbarkeit */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-gray-900/15 to-black/20"></div>
          </div>
        )}
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Workshop Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">
              {t("title")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/95 max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">

          {/* English Courses Notice - Always show in English */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 sm:p-5 mb-6 sm:mb-8">
            <p className="text-base sm:text-lg md:text-xl text-gray-800 leading-relaxed">
              {enMessages.workshops.englishNotice && enMessages.workshops.englishNotice.trim() ? (
                <>
                  <strong>{enMessages.workshops.coursesAvailableInEnglish}</strong> - {enMessages.workshops.englishNotice}
                </>
              ) : (
                <strong>{enMessages.workshops.coursesAvailableInEnglish}</strong>
              )}
            </p>
          </div>

          {/* Info-Banner */}
          <div className="bg-amber-100 border-l-4 border-amber-600 rounded-lg p-4 sm:p-5 mb-6 sm:mb-8">
            <p className="text-base sm:text-lg md:text-xl text-gray-800 leading-relaxed">
              {t("bookingNote")}{" "}
              <a href="mailto:info@sponkkeramik.de" className="text-amber-700 hover:text-amber-800 font-semibold underline">
                info@sponkkeramik.de
              </a>
            </p>
          </div>

          {/* Alle Workshops Grid - Mobile-first */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 mb-8 sm:mb-12">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 mb-8 sm:mb-12">
              {workshops.map((workshop) => (
                <CourseCard key={workshop.id} workshop={workshop} />
              ))}
            </div>
          )}

          {/* Buchungsinformationen - Mobile optimiert */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              {t("bookingInfo")}
            </h2>
            <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">
              {t("bookingDescription")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href="/kontakt"
                className="bg-amber-700 text-white px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:bg-amber-800 active:bg-amber-900 transition-all duration-200 text-center shadow-md hover:shadow-lg touch-manipulation min-h-[48px] flex items-center justify-center"
              >
                {t("contactUs")}
              </Link>
              <Link
                href="/oeffnungszeiten"
                className="bg-gray-100 text-gray-800 px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 text-center shadow-md hover:shadow-lg touch-manipulation min-h-[48px] flex items-center justify-center"
              >
                {t("viewOpeningHours")}
              </Link>
            </div>
          </div>

          {/* Zusätzliche Informationen - Mobile optimiert */}
          <div className="bg-amber-50 rounded-xl p-5 sm:p-6 md:p-8">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              {t("whatToExpect")}
            </h3>
            <ul className="list-disc list-inside text-sm sm:text-base text-gray-700 space-y-2 sm:space-y-3 leading-relaxed">
              <li>{t("expectations.expertGuidance")}</li>
              <li>{t("expectations.materialsIncluded")}</li>
              <li>{t("expectations.pickupAfterFiring")}</li>
              <li>{t("expectations.allLevels")}</li>
              <li>{t("expectations.groupCourses")}</li>
              <li>{t("expectations.onlineBooking")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

