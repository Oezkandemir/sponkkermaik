"use client";

import { contactInfo } from "@/lib/data";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

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
 * Anfahrt Seite - Neu gestaltet
 * Modern, mit Icons und vollständig responsive
 */
export default function AnfahrtPage() {
  const [randomHeaderImage, setRandomHeaderImage] = useState<string>("");
  const params = useParams();
  const currentLocale = (params.locale as string) || "de";
  const t = useTranslations("directions");

  // Setze zufälliges Bild nach dem Mount (verhindert Hydration Mismatch)
  useEffect(() => {
    setRandomHeaderImage(
      atelierImages[Math.floor(Math.random() * atelierImages.length)]
    );
  }, []);

  return (
    <div key={currentLocale} className="bg-gradient-to-br from-gray-50 via-white to-amber-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 min-h-[20vh] sm:min-h-[25vh] md:min-h-[30vh] flex items-center justify-center overflow-hidden pt-4 pb-4">
        {randomHeaderImage && (
          <div className="absolute inset-0 z-0">
            <Image
              src={`/images/atelier/${randomHeaderImage}`}
              alt={t("atelierImageAlt")}
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
            {/* Map Icon */}
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
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <div className="max-w-5xl mx-auto">

          {/* Adresse Details */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 mb-6 sm:mb-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
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
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                  {t("ourAddress")}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {t("inDusseldorf")}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 sm:p-8 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
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
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                    {contactInfo.address}
                  </p>
                  <p className="text-base sm:text-lg text-gray-700">
                    {contactInfo.postalCode} {contactInfo.city}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Parkmöglichkeiten */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 mb-6 sm:mb-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                  {t("parking")}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {t("parkingNearby")}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 sm:p-8 border border-green-100 mb-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
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
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {t("parkingName")}
                  </h3>
                  <p className="text-base sm:text-lg text-gray-700 mb-2">
                    {t("parkingAddress")}
                  </p>
                  <p className="text-sm sm:text-base text-gray-600">
                    {t("parkingDescription")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
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
              <p className="text-sm sm:text-base text-gray-700">
                {t("parkingNote")}
              </p>
            </div>
          </div>

          {/* Öffentliche Verkehrsmittel */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 mb-6 sm:mb-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                  {t("publicTransport")}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {t("publicTransportSubtitle")}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 sm:p-8 border border-purple-100">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-base sm:text-lg text-gray-700 mb-4">
                    {t("publicTransportDescription")}
                  </p>
                  <p className="text-sm sm:text-base text-gray-600">
                    {t("publicTransportNote")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Google Maps Karte */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 mb-6 sm:mb-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                  {t("interactiveMap")}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {t("planRoute")}
                </p>
              </div>
            </div>

            <div className="relative w-full h-0 pb-[75%] rounded-xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2499.3157210917734!2d6.7822438124428714!3d51.213259332030624!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b8cb412a104e99%3A0x456f12336b16a022!2sSponk%20Keramik%20bemalen!5e0!3m2!1sde!2sde!4v1763286187185!5m2!1sde!2sde"
                className="absolute top-0 left-0 w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t("googleMapsTitle")}
              />
            </div>
          </div>

          {/* CTA Button */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 sm:p-8 border border-amber-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-amber-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {t("questionsTitle")}
                </h3>
                <p className="text-sm sm:text-base text-gray-700 mb-4">
                  {t("questionsText")}
                </p>
                <Link
                  href="/kontakt-sponk-keramik"
                  className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-4 rounded-xl font-bold text-sm sm:text-base hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {t("contactButton")}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

