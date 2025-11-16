"use client";

import { Workshop } from "@/lib/data";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

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
export default function CourseCard({ workshop }: CourseCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [randomHeaderImage, setRandomHeaderImage] = useState<string>("");
  const t = useTranslations("courseCard");

  // Zufälliges Atelier-Bild beim Öffnen des Modals
  useEffect(() => {
    if (isModalOpen) {
      const randomImage =
        atelierImages[Math.floor(Math.random() * atelierImages.length)];
      setRandomHeaderImage(randomImage);
    }
  }, [isModalOpen]);

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
  const hasBadgeText = workshop.badgeText !== undefined && workshop.badgeText !== "";
  const isFirstWorkshop = workshop.id === "workshop-nur-keramik-bemalen-glasieren";
  const useObjectContain = workshop.id === "workshop-nur-keramik-bemalen-glasieren" || workshop.id === "aufbau-workshop-2" || workshop.id === "einsteiger-kurse-topferscheibe" || workshop.id === "gruppen-events-workshops";
  
  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border flex flex-col h-full ${
      isFirstWorkshop 
        ? "border-amber-500 border-2 shadow-xl ring-2 ring-amber-300" 
        : "border-gray-100"
    }`}>
      {/* Badge für "Best preis garantie" */}
      {hasBadgeText && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white text-center py-4 px-6 font-bold text-lg sm:text-xl md:text-2xl shadow-lg border-b-4 border-amber-700">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl">⭐</span>
            <span className="uppercase tracking-wide">{workshop.badgeText}</span>
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
                alt={`${workshop.title} - Bild ${index + 1}`}
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
          {workshop.title}
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
                {workshop.description}
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
              <p className="text-sm sm:text-base font-semibold text-gray-900">{workshop.duration}</p>
            </div>
          </div>
          
          {workshop.day && (
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
                <p className="text-sm sm:text-base font-semibold text-gray-900">{workshop.day}</p>
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
              <p className="text-sm sm:text-base font-bold text-amber-700">{workshop.price}</p>
            </div>
          </div>
        </div>

        {/* Buchungsbutton - Mobile optimiert mit großem Touch-Target */}
        {workshop.bookingLink ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="block w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg text-center text-sm sm:text-base transition-colors duration-200 shadow-md hover:shadow-lg active:bg-amber-900 touch-manipulation"
          >
            {t("bookNow")}
          </button>
        ) : (
          <a
            href="/kontakt-sponk-keramik"
            className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg text-center text-sm sm:text-base transition-colors duration-200 shadow-md hover:shadow-lg active:bg-gray-800 touch-manipulation"
          >
            {t("contactUs")}
          </a>
        )}
      </div>

      {/* Modal für cal.com Buchung */}
      {isModalOpen && workshop.bookingLink && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            // Schließen beim Klick außerhalb des Modals
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[93vh] flex flex-col animate-slideUp overflow-hidden">
            {/* Header mit zufälligem Atelier-Bild als Hintergrund */}
            <div className="relative h-20 sm:h-28 overflow-hidden">
              {randomHeaderImage && (
                <>
                  <Image
                    src={`/images/atelier/${randomHeaderImage}`}
                    alt="Atelier Hintergrund"
                    fill
                    className="object-cover"
                    priority
                  />
                  {/* Overlay für bessere Lesbarkeit */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/70 to-black/75"></div>
                </>
              )}
              {/* Header Content */}
              <div className="relative z-10 flex items-center justify-between p-3 sm:p-4 h-full">
                <h3 className="text-base sm:text-lg font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight pr-2">
                  {workshop.title} - {t("bookingTitle")}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/30 rounded-full transition-colors duration-200 group flex-shrink-0"
                  aria-label={t("closeModal")}
                >
                  <svg
                    className="w-6 h-6 text-white group-hover:text-gray-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* iframe Container */}
            <div className="flex-1 overflow-hidden relative min-h-0">
              <iframe
                src={workshop.bookingLink}
                className="w-full h-full border-0"
                title={`Buchung für ${workshop.title}`}
                allow="camera; microphone; geolocation"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

