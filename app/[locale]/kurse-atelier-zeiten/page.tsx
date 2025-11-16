"use client";

import { openingHours } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

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
 * Öffnungszeiten Seite - Neu gestaltet
 * Modern, mit Icons und vollständig responsive
 */
export default function OeffnungszeitenPage() {
  const [randomHeaderImage, setRandomHeaderImage] = useState<string>("");

  // Setze zufälliges Bild nach dem Mount (verhindert Hydration Mismatch)
  useEffect(() => {
    setRandomHeaderImage(
      atelierImages[Math.floor(Math.random() * atelierImages.length)]
    );
  }, []);

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
            <div className="absolute inset-0 bg-gradient-to-r from-amber-700/60 via-amber-600/50 to-orange-700/60"></div>
          </div>
        )}
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Clock Icon */}
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
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">
              Öffnungszeiten
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/95 max-w-2xl mx-auto">
              Besuchen Sie uns zu den folgenden Zeiten oder vereinbaren Sie einen individuellen Termin
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <div className="max-w-5xl mx-auto">

          {/* Atelier Öffnungszeiten */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 mb-6 sm:mb-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                  Atelier Öffnungszeiten
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Freies Arbeiten & Besuch
                </p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {openingHours.atelier.map((item, index) => (
                <div
                  key={index}
                  className="group relative bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600"
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
                      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
                        {item.days}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <svg
                        className="w-5 h-5 text-amber-600 flex-shrink-0"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-base sm:text-lg md:text-xl font-bold text-amber-700">
                        {item.times}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kurszeiten */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 mb-6 sm:mb-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white"
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
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                  Kurszeiten
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Workshops & angeleitete Kurse
                </p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {openingHours.courses.map((item, index) => (
                <div
                  key={index}
                  className="group relative bg-gradient-to-r from-blue-50 to-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
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
                      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
                        {item.days}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <svg
                        className="w-5 h-5 text-blue-600 flex-shrink-0"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-base sm:text-lg md:text-xl font-bold text-blue-700">
                        {item.times}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Geschlossen Info */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-5 sm:p-6 md:p-8 mb-6 sm:mb-8 border border-red-200">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-red-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Geschlossen
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Montag, Donnerstag und Sonntag
                  <span className="block text-sm text-gray-600 mt-1">
                    (Ausnahme: Spezielle Workshops nach Vereinbarung)
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Wichtige Hinweise */}
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 md:p-8 mb-6 sm:mb-8 border border-gray-100">
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                Wichtige Hinweise
              </h3>
            </div>
            <div className="space-y-3 sm:space-y-4 ml-0 sm:ml-16">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-500 flex-shrink-0 mt-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  <span className="font-semibold">Anmeldung empfohlen:</span> Reservieren Sie Ihren Platz, um garantiert dabei zu sein
                </p>
              </div>
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-500 flex-shrink-0 mt-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  <span className="font-semibold">Freies Arbeiten:</span> Während der Kurszeiten eingeschränkt verfügbar
                </p>
              </div>
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-500 flex-shrink-0 mt-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  <span className="font-semibold">Gruppenbuchungen:</span> Für individuelle Termine oder Events bitte vorab kontaktieren
                </p>
              </div>
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-500 flex-shrink-0 mt-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  <span className="font-semibold">Feiertage:</span> Abweichende Öffnungszeiten möglich - bitte vorher anfragen
                </p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Link
              href="/kontakt-sponk-keramik"
              className="group relative bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-4 sm:py-5 rounded-xl font-bold text-sm sm:text-base hover:from-amber-700 hover:to-orange-700 transition-all duration-200 text-center shadow-lg hover:shadow-xl touch-manipulation min-h-[56px] flex items-center justify-center gap-3 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Termin vereinbaren
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </Link>
            
            <Link
              href="/kurse-preise-sponk-keramik"
              className="group relative bg-white text-amber-600 px-6 py-4 sm:py-5 rounded-xl font-bold text-sm sm:text-base border-2 border-amber-600 hover:bg-amber-50 transition-all duration-200 text-center shadow-lg hover:shadow-xl touch-manipulation min-h-[56px] flex items-center justify-center gap-3"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Workshops ansehen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
