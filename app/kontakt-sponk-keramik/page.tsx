"use client";

import { contactInfo } from "@/lib/data";
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
 * Kontakt Seite
 * Kontaktinformationen und Kontaktformular
 */
export default function KontaktPage() {
  const [randomHeaderImage, setRandomHeaderImage] = useState<string | null>(null);

  useEffect(() => {
    // Zufälliges Bild für Header bei jedem Page Load
    const randomImage = atelierImages[Math.floor(Math.random() * atelierImages.length)];
    setRandomHeaderImage(randomImage);
  }, []);

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
            {/* Mail Icon */}
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
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">
              Kontakt
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/95 max-w-2xl mx-auto">
              Wir freuen uns auf Ihre Nachricht
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Kontaktinformationen */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Kontaktinformationen
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 text-amber-600 mr-3 mt-1"
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
                  <div>
                    <p className="font-medium text-gray-800">Adresse</p>
                    <p className="text-gray-700">
                      {contactInfo.address}
                      <br />
                      {contactInfo.postalCode} {contactInfo.city}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 text-amber-600 mr-3 mt-1"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-800">E-Mail</p>
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="text-amber-600 hover:text-amber-700"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Öffnungszeiten Quick Info */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Besuchen Sie uns
              </h2>
              <p className="text-gray-700 mb-4">
                Besuchen Sie uns während unserer Öffnungszeiten im Atelier. Wir
                freuen uns auf Ihren Besuch!
              </p>
              <Link
                href="/oeffnungszeiten"
                className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
              >
                Öffnungszeiten ansehen
              </Link>
            </div>
          </div>

          {/* Anfahrt Text und Karte/Bild */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              So findest du uns ganz einfach!
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Das Atelier von Sponk Keramik & Kurse Düsseldorf liegt zentral in Düsseldorf und ist sowohl mit dem Auto als auch mit den öffentlichen Verkehrsmitteln bequem zu erreichen. Unsere Lage bietet dir die Möglichkeit, stressfrei zu uns zu kommen und deine kreative Reise zu starten.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              <a
                href="https://www.google.com/maps?client=ms-android-samsung-ss&sca_esv=86c19ffd07ed6128&sxsrf=AE3TifMAH_qJaSVxwXQJaOeWGbbL5GlV9Q:1763249264872&gs_lp=Egxnd3Mtd2l6LXNlcnAiBXNwb25rKgIIADIOEC4YgAQYxwEYjgUYrwEyCxAuGIAEGMcBGK8BMgUQABiABDIFEAAYgAQyBxAAGIAEGAoyBRAAGIAEMgUQABiABDIHEAAYgAQYCjIHEAAYgAQYCjIHEAAYgAQYCjIdEC4YgAQYxwEYjgUYrwEYlwUY3AQY3gQY4ATYAQFIuBVQwgVYoQpwAngBkAEAmAFSoAGEA6oBATW4AQPIAQD4AQGYAgegAqYDwgIKEAAYsAMY1gQYR8ICCxAAGIAEGLEDGIMBwgILEC4YgAQY0QMYxwHCAhEQLhiABBixAxjRAxiDARjHAcICDhAuGIAEGLEDGNEDGMcBwgIQEAAYgAQYsQMYQxiDARiKBcICExAuGIAEGLEDGNEDGEMYxwEYigXCAhYQLhiABBixAxjRAxhDGIMBGMcBGIoFwgIKEAAYgAQYQxiKBcICCBAAGIAEGLEDwgIiEC4YgAQYsQMY0QMYQxjHARiKBRiXBRjcBBjeBBjgBNgBAcICCxAuGIAEGLEDGIMBwgINEAAYgAQYsQMYQxiKBZgDAIgGAZAGCLoGBggBEAEYFJIHATegB8I5sgcBNbgHmwPCBwUwLjIuNcgHGg&um=1&ie=UTF-8&fb=1&gl=de&sa=X&geocode=KZlOECpBy7hHMSKgFmszEm9F&daddr=F%C3%BCrstenpl.+15,+40215+D%C3%BCsseldorf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 hover:text-amber-700 transition-colors"
              >
                Anfahrt Sponk Keramik
              </a>
            </h3>
            <div className="overflow-hidden rounded-lg">
              <Image
                src="/images/maps-bild.webp"
                alt="Karte und Parkhaus Creativ Center"
                width={1200}
                height={800}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

