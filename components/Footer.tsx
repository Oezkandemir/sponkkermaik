"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { contactInfo } from "@/lib/data";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("footer");

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
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">{t("contact")}</h3>
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
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">{t("navigation")}</h3>
            <ul className="space-y-2 text-sm sm:text-base text-gray-300">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors touch-manipulation block py-1">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link href="/kurse-preise-sponk-keramik" className="hover:text-amber-400 transition-colors touch-manipulation block py-1">
                  {t("nav.workshops")}
                </Link>
              </li>
              <li>
                <Link href="/atelier-bilder-sponk-keramik-dusseldorf" className="hover:text-amber-400 transition-colors touch-manipulation block py-1">
                  {t("nav.galleryAtelier")}
                </Link>
              </li>
              <li>
                <Link href="/galerie-kurswerke" className="hover:text-amber-400 transition-colors touch-manipulation block py-1">
                  {t("nav.galleryCourseWorks")}
                </Link>
              </li>
              <li>
                <Link href="/kurse-atelier-zeiten" className="hover:text-amber-400 transition-colors touch-manipulation block py-1">
                  {t("nav.openingHours")}
                </Link>
              </li>
              <li>
                <Link href="/anfahrt-sponk-keramik-und-kurse-dusseldorf" className="hover:text-amber-400 transition-colors touch-manipulation block py-1">
                  {t("nav.directions")}
                </Link>
              </li>
              <li>
                <Link href="/kontakt-sponk-keramik" className="hover:text-amber-400 transition-colors touch-manipulation block py-1">
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Impressum */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">{t("legal")}</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {t("vatId")}: {contactInfo.vatId}
              <br />
              <br />
              <Link href="/impressum" className="text-amber-400 hover:text-amber-300 transition-colors touch-manipulation inline-block">
                {t("imprint")}
              </Link>
            </p>
            
            {/* Social Media */}
            <div className="mt-6">
              <h3 className="text-base sm:text-lg font-bold mb-3">{t("followUs")}</h3>
              <a
                href="https://www.instagram.com/sponkkeramik/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-300 hover:text-amber-400 transition-colors touch-manipulation"
                aria-label="Instagram"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="text-sm sm:text-base">{t("instagram")}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-xs sm:text-sm">
          <p>&copy; {new Date().getFullYear()} Sponk Keramik. {t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}

