"use client";

import { workshops } from "@/lib/data";
import CourseCard from "@/components/CourseCard";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

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
  // Lazy initializer - berechnet nur einmal beim Mount
  const [randomHeaderImage] = useState<string>(() => {
    return atelierImages[Math.floor(Math.random() * atelierImages.length)];
  });

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-amber-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 h-[20vh] sm:h-[25vh] md:h-[30vh] flex items-center justify-center overflow-hidden">
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
            <div className="absolute inset-0 bg-gradient-to-r from-amber-700/60 via-amber-600/50 to-orange-700/60"></div>
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
              Workshops & Preise
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/95 max-w-2xl mx-auto">
              Entdecken Sie unsere vielfältigen Angebote für Keramik bemalen und Töpferkurse
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">

          {/* Alle Workshops Grid - Mobile-first */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 mb-8 sm:mb-12">
            {workshops.map((workshop) => (
              <CourseCard key={workshop.id} workshop={workshop} />
            ))}
          </div>

          {/* Buchungsinformationen - Mobile optimiert */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Buchungsinformationen
            </h2>
            <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">
              Die meisten Workshops können Sie direkt über die Buchungslinks oben
              buchen. Alternativ kontaktieren Sie uns per E-Mail oder besuchen Sie
              uns während unserer Öffnungszeiten im Atelier.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href="/kontakt"
                className="bg-amber-600 text-white px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:bg-amber-700 active:bg-amber-800 transition-all duration-200 text-center shadow-md hover:shadow-lg touch-manipulation min-h-[48px] flex items-center justify-center"
              >
                Kontakt aufnehmen
              </Link>
              <Link
                href="/oeffnungszeiten"
                className="bg-gray-100 text-gray-800 px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 text-center shadow-md hover:shadow-lg touch-manipulation min-h-[48px] flex items-center justify-center"
              >
                Öffnungszeiten ansehen
              </Link>
            </div>
          </div>

          {/* Zusätzliche Informationen - Mobile optimiert */}
          <div className="bg-amber-50 rounded-xl p-5 sm:p-6 md:p-8">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              Was Sie erwartet
            </h3>
            <ul className="list-disc list-inside text-sm sm:text-base text-gray-700 space-y-2 sm:space-y-3 leading-relaxed">
              <li>Fachkundige Anleitung durch erfahrene Keramiker</li>
              <li>Alle Materialien sind im Preis enthalten</li>
              <li>Ihre Werke können Sie nach dem Brennen abholen</li>
              <li>Perfekt für Anfänger und Fortgeschrittene</li>
              <li>Gruppenkurse und individuelle Betreuung möglich</li>
              <li>Direkte Online-Buchung über cal.com möglich</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

