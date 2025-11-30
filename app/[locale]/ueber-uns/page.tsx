"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

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
 * Über uns Seite
 * Komplette Informationen über Sponk Keramik & Kurse Düsseldorf
 */
export default function UeberUnsPage() {
  const [randomHeaderImage, setRandomHeaderImage] = useState<string>("");
  const t = useTranslations("about");

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
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-gray-900/15 to-black/20"></div>
          </div>
        )}
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Info Icon */}
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
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        <div className="max-w-4xl mx-auto">

          {/* Im Dezember: jeden Sonntag Keramik bemalen */}
          <div className="bg-amber-50 rounded-xl p-5 sm:p-6 md:p-8 mb-8">
            <p className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {t("decemberSunday")}
            </p>
            <p className="text-base sm:text-lg font-semibold text-gray-900">
              {t("workshopNotice")}
            </p>
          </div>

          {/* Top Angebot Banner */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 sm:p-8 mb-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              {t("topOfferBannerTitle")}
            </h2>
            <Link
              href="/workshops"
              className="inline-block bg-white text-amber-600 px-6 py-3 rounded-lg font-bold text-sm sm:text-base hover:bg-gray-100 transition-colors mt-4"
            >
              {t("topOfferBannerButton")}
            </Link>
            <p className="text-white font-semibold mt-4 text-lg">
              {t("topOfferBannerText")}
            </p>
            <p className="text-white text-xl sm:text-2xl font-bold mt-2">
              {t("topOfferBannerPrice")}
            </p>
          </div>

          {/* Hauptinhalt */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {t("welcomeTitle")}
            </h2>
            <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
              {t("welcomeText")}
            </p>

            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 mt-8">
              {t("paintingSundayTitle")}
            </h3>
            <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
              {t("paintingSundayText")}
            </p>
          </div>

          {/* Google Bewertungen */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold text-gray-900">{t("excellentRating")}</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              {t("googleRating")}
            </p>
            <p className="text-gray-700 mb-6">
              {t("basedOnReviews")}
            </p>

            {/* Bewertungen */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Lina Tiessen</p>
                    <p className="text-sm text-gray-600">2025-08-20</p>
                  </div>
                  <div className="flex gap-1 ml-auto">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{t("review1")}</p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Anna Schmidt</p>
                    <p className="text-sm text-gray-600">2025-08-16</p>
                  </div>
                  <div className="flex gap-1 ml-auto">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{t("review2")}</p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Tina</p>
                    <p className="text-sm text-gray-600">2025-08-13</p>
                  </div>
                  <div className="flex gap-1 ml-auto">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{t("review3")}</p>
                <p className="text-gray-600 text-sm mt-2">{t("readMore")}</p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Sarah Paßberger</p>
                    <p className="text-sm text-gray-600">2025-08-09</p>
                  </div>
                  <div className="flex gap-1 ml-auto">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{t("review4")}</p>
                <p className="text-gray-600 text-sm mt-2">{t("readMore")}</p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Tessa B</p>
                    <p className="text-sm text-gray-600">2025-07-23</p>
                  </div>
                  <div className="flex gap-1 ml-auto">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{t("review5")}</p>
                <p className="text-gray-600 text-sm mt-2">{t("readMore")}</p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Viktoria W.</p>
                    <p className="text-sm text-gray-600">2025-07-19</p>
                  </div>
                  <div className="flex gap-1 ml-auto">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{t("review6")}</p>
                <p className="text-gray-600 text-sm mt-2">{t("readMore")}</p>
              </div>

              <div className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Maira Rogalla</p>
                    <p className="text-sm text-gray-600">2025-07-19</p>
                  </div>
                  <div className="flex gap-1 ml-auto">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{t("review7")}</p>
                <p className="text-gray-600 text-sm mt-2">{t("readMore")}</p>
              </div>
            </div>
          </div>

          {/* Bernd Schwarzer Sektion */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t("berndTitle")}
            </h3>
            
            {/* Bild von Bernd Schwarzer */}
            <div className="relative w-full h-64 sm:h-96 mb-6 rounded-lg overflow-hidden">
              <Image
                src="/images/bernd.webp"
                alt={t("berndImageAlt")}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            <p className="text-base sm:text-lg text-gray-700 mb-4 leading-relaxed">
              {t("berndText")}
            </p>
          </div>

          {/* Handgemachte Keramikkunst kaufen */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t("handmadeTitle")}
            </h3>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              {t("handmadeText")}
            </p>
          </div>

          {/* Standort */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t("locationTitle")}
            </h3>
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              {t("whyUs")}
            </h4>
            <ul className="list-disc list-inside text-base sm:text-lg text-gray-700 space-y-2 mb-6">
              <li>{t("whyUsItems.creative")}</li>
              <li>{t("whyUsItems.materials")}</li>
              <li>{t("whyUsItems.diverse")}</li>
              <li>{t("whyUsItems.exclusive")}</li>
            </ul>
            <p className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              {t("registerNow")}
            </p>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              {t("descriptionText")}
            </p>
            <p className="text-base sm:text-lg text-gray-700 mt-4 leading-relaxed">
              {t("giftIdeas")}
            </p>
            <p className="text-base sm:text-lg text-gray-700 mt-4 leading-relaxed italic">
              {t("quote")}
            </p>
            <p className="text-base sm:text-lg text-gray-700 mt-2 text-right">
              {t("quoteAuthor")}
            </p>
          </div>

          {/* Ablauf-Fertigung */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t("processTitle")}
            </h3>
            <div className="text-base sm:text-lg text-gray-700 space-y-4 leading-relaxed">
              <p>
                {t("processText1")}
              </p>
              <p>
                {t("processText2")}
              </p>
              <p className="font-semibold">
                {t("processConclusion")}
              </p>
            </div>
          </div>

          {/* Mach mit */}
          <div className="bg-amber-50 rounded-xl p-5 sm:p-6 md:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t("creativeTitle")}
            </h3>
            <p className="text-base sm:text-lg text-gray-700 mb-4 leading-relaxed">
              {t("creativeText1")}
            </p>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              {t("creativeText2")}
            </p>
          </div>

          {/* Angebote im Detail */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              {t("offersTitle")}
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  {t("adultsTitle")}
                </h4>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  {t("adultsText")}
                </p>
              </div>

              <div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  {t("familyTitle")}
                </h4>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  {t("familyText")}
                </p>
              </div>

              <div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  {t("eventsTitle")}
                </h4>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  {t("eventsText")}
                </p>
              </div>
            </div>
          </div>

          {/* Standort */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t("locationSubTitle")}
            </h3>
            <p className="text-base sm:text-lg text-gray-700 mb-4 leading-relaxed">
              {t("locationText1")}
            </p>
            <p className="text-base sm:text-lg font-semibold text-gray-900">
              {t("locationText2")}
            </p>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              {t("faqTitle")}
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("faq1Question")}
                </h4>
                <p className="text-base text-gray-700 leading-relaxed">
                  {t("faq1Answer")}
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("faq2Question")}
                </h4>
                <p className="text-base text-gray-700 leading-relaxed">
                  {t("faq2Answer")}
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("faq3Question")}
                </h4>
                <p className="text-base text-gray-700 leading-relaxed">
                  {t("faq3Answer")}
                </p>
              </div>
            </div>
          </div>

          {/* Bereit kreativ zu werden */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-5 sm:p-6 md:p-8 mb-8 text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
              {t("readyTitle")}
            </h3>
            <p className="text-base sm:text-lg text-white mb-6">
              {t("readyText1")}
            </p>
            <p className="text-base sm:text-lg text-white mb-4">
              {t("readyText2")}
            </p>
            <Link
              href="/workshops"
              className="inline-block bg-white text-amber-600 px-6 py-3 rounded-lg font-bold text-sm sm:text-base hover:bg-gray-100 transition-colors"
            >
              {t("bookNow")}
            </Link>
          </div>

          {/* Gruppen Events */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t("groupEventsTitle")}
            </h3>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              {t("groupEventsText")}
            </p>
          </div>

          {/* Kindergeburtstage */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t("birthdaysTitle")}
            </h3>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              {t("birthdaysText")}
            </p>
          </div>

          {/* Willkommen */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t("welcomeSection")}
            </h3>
            <p className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              {t("discoverTitle")}
            </p>
            <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
              {t("discoverText")}
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("paintingTitle")}
                </h4>
                <p className="text-base text-gray-700 leading-relaxed">
                  {t("paintingText")}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("potteryTitle")}
                </h4>
                <p className="text-base text-gray-700 leading-relaxed">
                  {t("potteryText")}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("buyTitle")}
                </h4>
                <p className="text-base text-gray-700 leading-relaxed">
                  {t("buyText")}
                </p>
              </div>
            </div>

            <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-4">
              {t("whySponk")}
            </h4>
            <ul className="list-disc list-inside text-base text-gray-700 space-y-2 mb-6">
              <li>{t("whySponkItems.creative")}</li>
              <li>{t("whySponkItems.materials")}</li>
              <li>{t("whySponkItems.support")}</li>
              <li>{t("whySponkItems.selection")}</li>
            </ul>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              {t("visitOnline")}
            </p>
            <p className="text-base font-semibold text-gray-900">
              {t("registerToday")}
            </p>
          </div>

          {/* Abholung */}
          <div className="bg-amber-50 rounded-xl p-5 sm:p-6 md:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t("pickupTitle")}
            </h3>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              {t("pickupText")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

