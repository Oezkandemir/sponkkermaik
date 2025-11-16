"use client";

import { artistInfo } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    // Zufälliges Bild für Header bei jedem Page Load
    const randomImage =
      atelierImages[Math.floor(Math.random() * atelierImages.length)];
    setRandomHeaderImage(randomImage);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header mit zufälligem Hintergrundbild */}
      <section className="relative h-[20vh] sm:h-[25vh] md:h-[30vh] flex items-center justify-center overflow-hidden">
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
              <div className="absolute inset-0 bg-gradient-to-r from-amber-700/40 via-amber-600/30 to-orange-700/40"></div>
            </div>
            <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight drop-shadow-lg">
                Galerie Atelier
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/95 leading-relaxed drop-shadow-md">
                Handgefertigte Keramikkunstwerke von {artistInfo.name}
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
              Über den Künstler
            </h2>
            <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed">
              {artistInfo.description}
            </p>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Jedes Stück wird mit höchster Sorgfalt und künstlerischem Anspruch
              gefertigt. Die Keramikwerke spiegeln die jahrelange Erfahrung und
              Leidenschaft für das Handwerk wider.
            </p>
          </div>

          {/* Galerie */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
              Galerie
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
              Besuchen Sie unser Atelier, um die Werke persönlich zu betrachten
            </p>
          </div>

          {/* Preise und Verfügbarkeit */}
          <div className="bg-amber-50 rounded-xl p-5 sm:p-6 md:p-8">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              Verfügbarkeit und Preise
            </h3>
            <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">
              Die Preise für unsere handgefertigten Keramikkunstwerke variieren je
              nach Größe, Komplexität und Material. Besuchen Sie uns im Atelier,
              um die aktuellen Werke zu sehen und individuelle Preise zu erfragen.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href="/oeffnungszeiten"
                className="bg-amber-600 text-white px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:bg-amber-700 active:bg-amber-800 transition-all duration-200 text-center shadow-md hover:shadow-lg touch-manipulation min-h-[48px] flex items-center justify-center"
              >
                Öffnungszeiten
              </Link>
              <Link
                href="/kontakt"
                className="bg-white text-amber-600 px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base border-2 border-amber-600 hover:bg-amber-50 active:bg-amber-100 transition-all duration-200 text-center shadow-md hover:shadow-lg touch-manipulation min-h-[48px] flex items-center justify-center"
              >
                Kontakt aufnehmen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
