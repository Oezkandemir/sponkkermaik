"use client";

import { artistInfo } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

/**
 * Galerie Atelier Seite
 * Galerie mit handgefertigten Keramikkunstwerken
 * Header mit zufälligem Hintergrundbild
 */
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

export default function AtelierPage() {
  const [randomHeaderImage, setRandomHeaderImage] = useState<string>("");
  const t = useTranslations("atelier");

  useEffect(() => {
    // Zufälliges Bild für Header bei jedem Page Load
    const randomImage =
      atelierImages[Math.floor(Math.random() * atelierImages.length)];
    setRandomHeaderImage(randomImage);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header mit zufälligem Hintergrundbild */}
      <section className="relative min-h-[20vh] sm:min-h-[25vh] md:min-h-[30vh] flex items-center justify-center overflow-hidden pt-4 pb-4">
        {randomHeaderImage && (
          <>
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
            <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight drop-shadow-lg">
                {t("title")}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/95 leading-relaxed drop-shadow-md">
                {t("subtitle")}
              </p>
            </div>
          </>
        )}
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Künstler Info */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              {t("aboutArtist")}
            </h2>
            <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed">
              {t("artistDescriptionFull")}
            </p>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              {t("artistDescription")}
            </p>
          </div>

          {/* Galerie */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
              {t("gallery")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {atelierImages.map((image, index) => (
                <div
                  key={image}
                  className="relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group"
                >
                  <Image
                    src={`/images/atelier/${image}`}
                    alt={`Keramikkunstwerk ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
            <p className="text-sm sm:text-base text-gray-600 mt-4 sm:mt-6 text-center">
              {t("visitAtelier")}
            </p>
          </div>

          {/* Preise und Verfügbarkeit */}
          <div className="bg-amber-50 rounded-xl p-5 sm:p-6 md:p-8">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              {t("availabilityTitle")}
            </h3>
            <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">
              {t("availabilityDescription")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href="/oeffnungszeiten"
                className="bg-amber-700 text-white px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:bg-amber-800 active:bg-amber-900 transition-all duration-200 text-center shadow-md hover:shadow-lg touch-manipulation min-h-[48px] flex items-center justify-center"
              >
                {t("openingHours")}
              </Link>
              <Link
                href="/kontakt"
                className="bg-white text-amber-600 px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base border-2 border-amber-600 hover:bg-amber-50 active:bg-amber-100 transition-all duration-200 text-center shadow-md hover:shadow-lg touch-manipulation min-h-[48px] flex items-center justify-center"
              >
                {t("contact")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
