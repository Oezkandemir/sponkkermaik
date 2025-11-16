"use client";

import { contactInfo } from "@/lib/data";
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
 * Impressum Seite
 * Rechtliche Angaben gemäß § 5 TMG
 */
export default function ImpressumPage() {
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
            {/* Document Icon */}
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
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">
              Impressum
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/95 max-w-2xl mx-auto">
              Rechtliche Angaben gemäß § 5 TMG
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 space-y-6 sm:space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Angaben gemäß § 5 TMG
              </h2>
              <div className="text-gray-700 space-y-2">
                <p className="font-medium">Sponk Keramik</p>
                <p>
                  {contactInfo.address}
                  <br />
                  {contactInfo.postalCode} {contactInfo.city}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Kontakt
              </h2>
              <div className="text-gray-700 space-y-2">
                <p>
                  E-Mail:{" "}
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="text-amber-600 hover:text-amber-700"
                  >
                    {contactInfo.email}
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Umsatzsteuer-ID
              </h2>
              <p className="text-gray-700">
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a
                Umsatzsteuergesetz:
                <br />
                <strong>{contactInfo.vatId}</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
              </h2>
              <div className="text-gray-700 space-y-2">
                <p className="font-medium">Sponk Keramik</p>
                <p>
                  {contactInfo.address}
                  <br />
                  {contactInfo.postalCode} {contactInfo.city}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Haftungsausschluss
              </h2>
              <div className="text-gray-700 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Haftung für Inhalte</h3>
                  <p className="text-sm">
                    Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt.
                    Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte
                    können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter
                    sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen
                    Seiten nach den allgemeinen Gesetzen verantwortlich.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Haftung für Links</h3>
                  <p className="text-sm">
                    Unser Angebot enthält Links zu externen Webseiten Dritter, auf
                    deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
                    diese fremden Inhalte auch keine Gewähr übernehmen. Für die
                    Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
                    oder Betreiber der Seiten verantwortlich.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Urheberrecht</h3>
                  <p className="text-sm">
                    Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
                    diesen Seiten unterliegen dem deutschen Urheberrecht. Die
                    Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
                    Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
                    schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

