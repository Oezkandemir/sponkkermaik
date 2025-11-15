"use client";

import Link from "next/link";
import Image from "next/image";
import { contactInfo } from "@/lib/data";
import { useState, useEffect } from "react";

/**
 * Footer-Komponente
 * Mobile-first Design mit optimierter Touch-Navigation
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

export default function Footer() {
  const [randomBgImage, setRandomBgImage] = useState<string>("");

  useEffect(() => {
    // Zufälliges Atelier-Bild für Hintergrund
    const randomImage =
      atelierImages[Math.floor(Math.random() * atelierImages.length)];
    setRandomBgImage(randomImage);
  }, []);

  return (
    <footer className="relative bg-gray-800 text-white mt-auto overflow-hidden">
      {/* Hintergrundbild */}
      {randomBgImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={`/images/atelier/${randomBgImage}`}
            alt="Sponk Keramik Atelier Hintergrund"
            fill
            className="object-cover opacity-70"
            quality={75}
            sizes="100vw"
          />
          {/* Overlay für bessere Lesbarkeit */}
          <div className="absolute inset-0 bg-gray-900/50"></div>
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Kontakt */}
          <div>
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Kontakt</h3>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              {contactInfo.address}
              <br />
              {contactInfo.postalCode} {contactInfo.city}
              <br />
              <a
                href={`mailto:${contactInfo.email}`}
                className="text-amber-400 hover:text-amber-300 transition-colors touch-manipulation inline-block mt-1"
              >
                {contactInfo.email}
              </a>
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm sm:text-base text-gray-300">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors touch-manipulation block py-1">
                  Startseite
                </Link>
              </li>
              <li>
                <Link href="/workshops" className="hover:text-amber-400 transition-colors touch-manipulation block py-1">
                  Workshops & Preise
                </Link>
              </li>
              <li>
                <Link href="/atelier" className="hover:text-amber-400 transition-colors touch-manipulation block py-1">
                  Galerie Atelier
                </Link>
              </li>
              <li>
                <Link href="/galerie-kurswerke" className="hover:text-amber-400 transition-colors touch-manipulation block py-1">
                  Galerie Kurswerke
                </Link>
              </li>
              <li>
                <Link href="/oeffnungszeiten" className="hover:text-amber-400 transition-colors touch-manipulation block py-1">
                  Öffnungszeiten
                </Link>
              </li>
              <li>
                <Link href="/anfahrt" className="hover:text-amber-400 transition-colors touch-manipulation block py-1">
                  Anfahrt
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="hover:text-amber-400 transition-colors touch-manipulation block py-1">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Impressum */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Rechtliches</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Umsatzsteuer-ID: {contactInfo.vatId}
              <br />
              <br />
              <Link href="/impressum" className="text-amber-400 hover:text-amber-300 transition-colors touch-manipulation inline-block">
                Impressum
              </Link>
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-xs sm:text-sm">
          <p>&copy; {new Date().getFullYear()} Sponk Keramik. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
}

