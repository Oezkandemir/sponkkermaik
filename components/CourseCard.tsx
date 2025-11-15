"use client";

import { Workshop } from "@/lib/data";
import Image from "next/image";
import { useState, useEffect } from "react";

interface CourseCardProps {
  workshop: Workshop;
}

/**
 * CourseCard-Komponente
 * Zeigt eine Kurs-Karte mit allen relevanten Informationen an
 * Mobile-first Design mit Modal für Buchungslinks
 */
export default function CourseCard({ workshop }: CourseCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  const hasTopOffer = workshop.topOffer === true && !hasBadgeText;
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
      {/* Badge für "TOP ANGEBOT" */}
      {hasTopOffer && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-center py-3 px-6 font-bold text-base sm:text-lg shadow-md border-b-2 border-amber-700">
          ⭐ TOP ANGEBOT ⭐
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
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">
          {workshop.title}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 flex-grow leading-relaxed">
          {workshop.description}
        </p>
        
        {/* Info Icons - Mobile optimiert */}
        <div className="flex flex-col gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="flex items-center text-sm sm:text-base text-gray-700">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-amber-600 flex-shrink-0"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{workshop.duration}</span>
          </div>
          
          {workshop.day && (
            <div className="flex items-center text-sm sm:text-base text-gray-700">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-amber-600 flex-shrink-0"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">{workshop.day}</span>
            </div>
          )}
          
          <div className="flex items-center text-base sm:text-lg font-bold text-amber-700">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 flex-shrink-0"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{workshop.price}</span>
          </div>
        </div>

        {/* Buchungsbutton - Mobile optimiert mit großem Touch-Target */}
        {workshop.bookingLink ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="block w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg text-center text-sm sm:text-base transition-colors duration-200 shadow-md hover:shadow-lg active:bg-amber-800 touch-manipulation"
          >
            Jetzt buchen →
          </button>
        ) : (
          <a
            href="/kontakt"
            className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg text-center text-sm sm:text-base transition-colors duration-200 shadow-md hover:shadow-lg active:bg-gray-800 touch-manipulation"
          >
            Kontakt aufnehmen
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
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-slideUp">
            {/* Header mit X-Button */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                {workshop.title} - Termin buchen
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
                aria-label="Modal schließen"
              >
                <svg
                  className="w-6 h-6 text-gray-500 group-hover:text-gray-700"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* iframe Container */}
            <div className="flex-1 overflow-hidden relative">
              <iframe
                src={workshop.bookingLink}
                className="w-full h-full min-h-[500px] sm:min-h-[600px] border-0"
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

