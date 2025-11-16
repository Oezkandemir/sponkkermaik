"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

/**
 * Galerie Kurswerke Seite
 * Zeigt Bilder und Videos von Kurswerken
 * Header mit zufälligem Hintergrundbild
 */
const kurswerkeImages = [
  "image00001.jpeg",
  "image00002.jpeg",
  "image00003.jpeg",
  "image00004.jpeg",
  "image00005.jpeg",
  "image00006.jpeg",
  "image00007.jpeg",
  "image00008.jpeg",
  "image00009.jpeg",
  "image00010.jpeg",
  "image00011.png",
  "image00012.jpeg",
  "image00013.jpeg",
  "image00014.jpeg",
  "image00015.jpeg",
  "image00016.jpeg",
  "image00017.jpeg",
  "image00018.jpeg",
  "image00019.jpeg",
  "image00020.jpeg",
  "image00021.jpeg",
  "image00022.jpeg",
  "image00023.jpeg",
  "image00024.jpeg",
  "image00025.jpeg",
  "image00026.jpeg",
  "image00027.jpeg",
  "image00028.jpeg",
  "image00029.jpeg",
  "image00030.jpeg",
  "image00031.jpeg",
  "image00032.jpeg",
  "image00033.jpeg",
  "image00034.jpeg",
  "image00035.jpeg",
  "image00036.jpeg",
  "image00037.jpeg",
  "image00038.jpeg",
  "image00039.jpeg",
  "image00040.jpeg",
];

// Nur Bilder für die Galerie verwenden (Videos werden nicht mehr geladen)
const galleryImages = kurswerkeImages.map((img) => ({ type: "image" as const, src: img }));

// Kombinierte Liste für Header (nur Bilder, da Videos nicht funktionieren)
const headerMedia = kurswerkeImages.map((img) => ({ type: "image" as const, src: img }));

export default function GalerieKurswerkePage() {
  const [randomHeaderMedia, setRandomHeaderMedia] = useState<{
    type: "image" | "video";
    src: string;
  } | null>(null);

  useEffect(() => {
    // Zufälliges Bild oder Video für Header bei jedem Page Load
    const randomMedia =
      headerMedia[Math.floor(Math.random() * headerMedia.length)];
    setRandomHeaderMedia(randomMedia);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header mit zufälligem Hintergrundbild */}
      <section className="relative h-[20vh] sm:h-[25vh] md:h-[30vh] flex items-center justify-center overflow-hidden">
        {randomHeaderMedia && (
          <>
            <div className="absolute inset-0 z-0">
              <Image
                src={`/images/kurswerke/${randomHeaderMedia.src}`}
                alt="Galerie Kurswerke"
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
                Galerie Kurswerke
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/95 leading-relaxed drop-shadow-md">
                Entdecken Sie die kreativen Werke unserer Kursteilnehmende
              </p>
            </div>
          </>
        )}
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Einführung */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Kurswerke Galerie
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Hier sehen Sie eine Auswahl der wunderschönen Werke, die unsere
              Kursteilnehmende in unseren Workshops und Kursen geschaffen haben. Jedes
              Stück ist einzigartig und zeigt die Kreativität und das Talent unserer
              Teilnehmende.
            </p>
          </div>

          {/* Bilder Galerie */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
              Werke unserer Kursteilnehmende
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {galleryImages.map((item, index) => (
                <div
                  key={`${item.src}-${index}`}
                  className="relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group"
                >
                  <Image
                    src={`/images/kurswerke/${item.src}`}
                    alt={`Kurswerk Bild ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
            <p className="text-sm sm:text-base text-gray-600 mt-4 sm:mt-6 text-center">
              Möchten Sie auch Ihr eigenes Kunstwerk schaffen? Besuchen Sie einen
              unserer Workshops!
            </p>
          </div>

          {/* CTA */}
          <div className="bg-amber-50 rounded-xl p-5 sm:p-6 md:p-8">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              Werden Sie kreativ!
            </h3>
            <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">
              Lassen Sie sich von diesen wunderbaren Werken inspirieren und melden
              Sie sich für einen unserer Workshops an. Wir freuen uns darauf, Ihnen
              zu helfen, Ihr eigenes Kunstwerk zu schaffen.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href="/workshops"
                className="bg-amber-600 text-white px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:bg-amber-700 active:bg-amber-800 transition-all duration-200 text-center shadow-md hover:shadow-lg touch-manipulation min-h-[48px] flex items-center justify-center"
              >
                Workshops ansehen
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

