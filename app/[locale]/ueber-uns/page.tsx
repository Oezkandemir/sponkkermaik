"use client";

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
 * Über uns Seite
 * Komplette Informationen über Sponk Keramik & Kurse Düsseldorf
 */
export default function UeberUnsPage() {
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
              Info Ablauf
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/95 max-w-2xl mx-auto">
              Sponk Keramik & Kurse Düsseldorf
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
              Im Dezember: jeden Sonntag Keramik bemalen.
            </p>
            <p className="text-base sm:text-lg font-semibold text-gray-900">
              Keramik bemalen – W O R K S H O P S – jeden ersten Sonntag! (keine eigenen Werke)
            </p>
          </div>

          {/* Top Angebot Banner */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 sm:p-8 mb-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Sponk Keramik & Kurse Düsseldorf
            </h2>
            <Link
              href="/workshops"
              className="inline-block bg-white text-amber-600 px-6 py-3 rounded-lg font-bold text-sm sm:text-base hover:bg-gray-100 transition-colors mt-4"
            >
              HIER KLICKEN
            </Link>
            <p className="text-white font-semibold mt-4 text-lg">
              zum TOP Angebot
            </p>
            <p className="text-white text-xl sm:text-2xl font-bold mt-2">
              Keramik bemalen 39 €
            </p>
          </div>

          {/* Hauptinhalt */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Sponk Keramik & Kurse Düsseldorf – Herzlich willkommen, liebe Keramikfans!
            </h2>
            <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
              Entdecke die kreative Welt der Sponk Keramik & Kurse Düsseldorf! Ob Keramik bemalen, töpfern oder einzigartige handgefertigte Stücke kaufen – bei uns findest du alles, was das Herz eines Keramikliebhabers begehrt. Tauche ein in eine entspannte Atmosphäre und lass deiner Fantasie freien Lauf.
            </p>

            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 mt-8">
              Keramik bemalen in Düsseldorf – jeden ersten Sonntag!
            </h3>
            <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
              Gestalte deine eigenen Keramikkunstwerke! In unseren Workshops bei Sponk Keramik & Kurse Düsseldorf kannst du vorgefertigte Keramikrohlinge bemalen und so einzigartige Designs kreieren. Perfekt für Familien, Kindergeburtstage oder eine kreative Zeit mit Freunden.
            </p>
          </div>

          {/* Google Bewertungen */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold text-gray-900">AUSGEZEICHNET</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              GoogleGoogleGoogleGoogleGoogle
            </p>
            <p className="text-gray-700 mb-6">
              Basierend auf 72 Bewertungen
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
                <p className="text-gray-700">Toller Ort zum Kreativ Sein! Eine angenehme Atmosphäre!</p>
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
                <p className="text-gray-700">Sehr angenehme Atmosphäre. Total netter positiver Host. Es hat sehr viel Spaß gemacht!</p>
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
                <p className="text-gray-700">Ich war mit meiner Tochter (15) zum Keramik bemalen im Sponk. Es war richtig schön und hat uns beiden sehr viel Spaß gemacht! Die Mitarbeiter waren super freundlich und haben uns mit Rat und Tat zur Seite gestanden! Wir sind schon sehr gespannt auf das Ergebnis. Wir werden auf jeden Fall wiederkommen und in einer sehr schönen und entspannten Location einen weiteren Workshop besuchen! Danke für den schönen Nachmittag!! Tina</p>
                <p className="text-gray-600 text-sm mt-2">Weiterlesen</p>
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
                <p className="text-gray-700">Wir haben den JGA einer guten Freundin bei euch verbracht. Es war super schön, ihr habt alles sehr schön gestaltet und auch alles sehr gut erklärt. Wir haben uns sehr wohl gefühlt, wurden mit Getränken und Snacks versorgt. Wir kommen sicherlich sehr sehr gerne wieder mal vorbei. :)</p>
                <p className="text-gray-600 text-sm mt-2">Weiterlesen</p>
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
                <p className="text-gray-700">Sehr nettes und schönes Ambiente, mit freundlichen Mitarbeitern. Wir hatten das Angebot des glasieren (Keramik bemalen)an einem Rohling wahrgenommen und waren sehr zufrieden mit der Beratung und Hilfe während des Prozesses. Vielen Lieben Dank für diese wunderbare Erfahrung 🌻</p>
                <p className="text-gray-600 text-sm mt-2">Weiterlesen</p>
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
                <p className="text-gray-700">Zum Keramik bemalen da gewesen. Wundervolle Atmosphäre, super freundliche Mitarbeiter und einfach viel Platz richtig kreativ zu werden. Freue mich schon darauf, das Ergebnis bald abzuholen! Ganz klare Weiterempfehlung 👍🏼</p>
                <p className="text-gray-600 text-sm mt-2">Weiterlesen</p>
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
                <p className="text-gray-700">Haben Keramik bemalt, Preis Leistung super, die Farbauswahl war leider nicht so groß und die Farben an sich waren auch schwer zu verteilen im Vergleich zu anderen Workshops. Nette und hilfsbereite Mitarbeitende.</p>
                <p className="text-gray-600 text-sm mt-2">Weiterlesen</p>
              </div>
            </div>
          </div>

          {/* Bernd Schwarzer Sektion */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Bernd Schwarzer, Joseph Beuys Schüler
            </h3>
            
            {/* Bild von Bernd Schwarzer */}
            <div className="relative w-full h-64 sm:h-96 mb-6 rounded-lg overflow-hidden">
              <Image
                src="/images/bernd.webp"
                alt="Bernd Schwarzer und Bülent Tepe im Keramik Atelier"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            <p className="text-base sm:text-lg text-gray-700 mb-4 leading-relaxed">
              Joseph Beuys Schüler Bernd Schwarzer ehrt mich in meinem Atelier, um sein Keramik Projekt zu verwirklichen und ich freue mich sehr meinem Mentor zur assistieren.
            </p>
          </div>

          {/* Handgemachte Keramikkunst kaufen */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Handgemachte Keramikkunst kaufen
            </h3>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              In unserem Shop erwartet dich eine sorgfältig kuratierte Auswahl an handgemachten Keramiken. Jedes Stück ist ein Unikat, das mit Liebe zum Detail gefertigt wurde. Ob als Geschenk oder Dekoration – hier findest du Keramik, die begeistert.
            </p>
          </div>

          {/* Standort */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Sponk Keramik Workshops Fürstenplatz 15 40215 Düsseldorf
            </h3>
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              Warum Sponk Keramik & Kurse Düsseldorf?
            </h4>
            <ul className="list-disc list-inside text-base sm:text-lg text-gray-700 space-y-2 mb-6">
              <li>Kreative Auszeit in einer inspirierenden Umgebung</li>
              <li>Hochwertige Materialien und professionelles Equipment</li>
              <li>Vielseitige Angebote für Anfänger und Fortgeschrittene</li>
              <li>Exklusive handgefertigte Keramiken aus unserer Werkstatt</li>
            </ul>
            <p className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Melde dich jetzt an und erlebe die Magie von Sponk Keramik & Kurse Düsseldorf!
            </p>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              bei Sponk Keramik kannst du mit unterschiedlichen Aufbautechniken viele kreative Werke erstellen, an der Töpferscheibe arbeiten oder an einem fertigen Rohling deine Glasur-Fertigkeiten ausprobieren. Bist du Einsteiger oder auch schon erfahren, komm vorbei und genieße die nette Atmosphäre, wo du absolut entschleunigt wirst.
            </p>
            <p className="text-base sm:text-lg text-gray-700 mt-4 leading-relaxed">
              Viele Geschenkideen für Ihr Liebsten, ob für Geburtstag, Muttertag oder einfach so.
            </p>
            <p className="text-base sm:text-lg text-gray-700 mt-4 leading-relaxed italic">
              Der Ton ist ein wunderbares Naturprodukt, womit jeder ein einzigartiges Werk erstellen kann.
            </p>
            <p className="text-base sm:text-lg text-gray-700 mt-2 text-right">
              – Bülent Tepe
            </p>
          </div>

          {/* Ablauf-Fertigung */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Ablauf-Fertigung von Keramiken
            </h3>
            <div className="text-base sm:text-lg text-gray-700 space-y-4 leading-relaxed">
              <p>
                Der Ton wird am Anfang ordentlich homogenisiert indem es mindestens drei Minuten, wie ein Pizzateig geknetet wird. Hierbei achten wir drauf, dass keine Lufteinschlüsse im Ton sich befinden, denn diese explodieren während des Schrühbrandes (Erstbrannd) und zerstört vielleicht auch andere Werke.
              </p>
              <p>
                Der vorbereiteter Ton kann jetzt mit unterschiedlichen Techniken (Töpfern, Aufbau am Tisch) geformt werden. Hierbei kennt die Kreativität keine Grenzen und wunderbare Werke entstehen jedesmal, die dann in Raumtemperatur mindestens 5-7 Tage trocknen müssen, bevor die bei ca. 900 Grad Schrüh gebrannt werden. Dauert gesamt ca. 48 Stunden mit der Abkühlphase, bevor die Werke aus dem Ofen wieder herausgeholt werden können. Jetzt sind die Werke bereit zum glasieren (bemalen). Unterschiedliche Techniken können je nach Ergebniswunsch angewendet werden, um spannende Ziele zu erreichen. Die Glasur arbeitet im Ofen bei über 1000 Grad und deswegen hat es ein Eigenleben, was immer wieder uns Keramiker überrascht. Daher gibt es beim Glasieren auch wichtige Punkte, die sehr beachtet werden müssen.
              </p>
              <p className="font-semibold">
                Jeder Keramikfans soll Glücklich sein, wenn er sich mit Ton beschäftigt und dafür steht Sponk Keramik & Kurse.
              </p>
            </div>
          </div>

          {/* Mach mit */}
          <div className="bg-amber-50 rounded-xl p-5 sm:p-6 md:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Mach mit – Kreativität ohne Grenzen bei Sponk Keramik & Kurse Düsseldorf
            </h3>
            <p className="text-base sm:text-lg text-gray-700 mb-4 leading-relaxed">
              Sponk Keramik & Kurse Düsseldorf bietet dir nicht nur Kurse und Workshops, sondern auch eine Möglichkeit, dem stressigen Alltag zu entfliehen. Hier kannst du entspannen, kreativ werden und handgefertigte Kunstwerke erschaffen, die deine Persönlichkeit widerspiegeln.
            </p>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              Ob du dich für das bemalen von Keramik oder das Töpfern entscheidest – wir haben alles, was du brauchst, um deine Vision Wirklichkeit werden zu lassen. Unser erfahrenes Team steht dir bei jedem Schritt zur Seite und sorgt dafür, dass du eine unvergessliche Zeit bei uns hast.
            </p>
          </div>

          {/* Angebote im Detail */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              Unsere Angebote im Detail
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Workshops für Erwachsene
                </h4>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  In unseren speziellen Kursen für Erwachsene kannst du in einer entspannten Atmosphäre deiner Kreativität freien Lauf lassen. Ideal, um nach der Arbeit abzuschalten oder neue Menschen mit ähnlichen Interessen kennenzulernen.
                </p>
              </div>

              <div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Familienangebote
                </h4>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  Erlebe kreative Stunden mit deinen Kindern! Gemeinsam könnt ihr wunderschöne Keramik bemalen oder an einfachen Töpferprojekten arbeiten. Ein Erlebnis, das die ganze Familie zusammenschweißt.
                </p>
              </div>

              <div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Individuelle Events
                </h4>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  Planst du eine besondere Feier? Ob Geburtstage, Junggesellenabschiede oder Firmenveranstaltungen – bei Sponk Keramik & Kurse Düsseldorf kannst du deine Events kreativ gestalten. Wir bieten dir maßgeschneiderte Pakete für unvergessliche Erlebnisse.
                </p>
              </div>
            </div>
          </div>

          {/* Standort */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Unser Standort in Düsseldorf – leicht erreichbar
            </h3>
            <p className="text-base sm:text-lg text-gray-700 mb-4 leading-relaxed">
              Unser Studio befindet sich in einer zentralen Lage in Düsseldorf und ist einfach zu erreichen, ob mit dem Auto oder den öffentlichen Verkehrsmitteln. Wir laden dich ein, bei uns vorbeizukommen, die entspannte Atmosphäre zu genießen und dich inspirieren zu lassen.
            </p>
            <p className="text-base sm:text-lg font-semibold text-gray-900">
              Sponk Keramik Workshops Fürstenplatz 15 Düsseldorf
            </p>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              Häufige Fragen (FAQ)
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Wie kann ich einen Kurs bei Sponk Keramik & Kurse Düsseldorf buchen?
                </h4>
                <p className="text-base text-gray-700 leading-relaxed">
                  Ganz einfach! Besuche unsere Webseite und wähle deinen Wunschkurs aus. Du kannst direkt online buchen oder uns kontaktieren, falls du Fragen hast.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Brauche ich Vorkenntnisse?
                </h4>
                <p className="text-base text-gray-700 leading-relaxed">
                  Nein, unsere Kurse sind für alle Erfahrungsstufen geeignet – vom Anfänger bis zum Fortgeschrittenen.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Welche Materialien werden verwendet?
                </h4>
                <p className="text-base text-gray-700 leading-relaxed">
                  Wir stellen dir alle Materialien und Werkzeuge, die du brauchst, zur Verfügung. Du kannst dich voll und ganz auf dein kreatives Projekt konzentrieren.
                </p>
              </div>
            </div>
          </div>

          {/* Bereit kreativ zu werden */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-5 sm:p-6 md:p-8 mb-8 text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
              Bereit, kreativ zu werden?
            </h3>
            <p className="text-base sm:text-lg text-white mb-6">
              Jetzt ist der perfekte Moment, um bei Sponk Keramik & Kurse Düsseldorf vorbeizuschauen. Buche deinen Workshop noch heute und entdecke die Freude an handgemachter Kunst!
            </p>
            <p className="text-base sm:text-lg text-white mb-4">
              Hier findest du das optimale Geschenk für deine Liebsten, und mit 10 Tagen Vorlaufzeit kannst du sogar die Farben aussuchen.
            </p>
            <Link
              href="/workshops"
              className="inline-block bg-white text-amber-600 px-6 py-3 rounded-lg font-bold text-sm sm:text-base hover:bg-gray-100 transition-colors"
            >
              Jetzt Workshop buchen
            </Link>
          </div>

          {/* Gruppen Events */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Gruppen Events
            </h3>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              Hier können Personen eine schöne Zeit erleben, indem Sie ein Keramikrohling nur Glasieren(selber bemalen), oder selber Werke erstellen. Beim nur Glasieren von Rohlingen ein Besuch, beim Werke erstellen zwei Besuche im Atelier. In der Werkstatt produzierte Unikate, sowie Keramikrohlinge industriell Hergestellt stehen zur Auswahl. Die Dauer und die gastronomischen Punkte werden detailliert besprochen. Der Preis ist abhängig vom Umfang, daher bei Anfrage zu klären.
            </p>
          </div>

          {/* Kindergeburtstage */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Kindergeburtstage
            </h3>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              Bis zu 12 Kinder können einen unvergesslichen Mal-Event erleben, wo die sehr kreativ sein können. Die Kinder haben die Möglichkeit eine Milchtasse, ein Teller oder eine Müslischale zu glasieren (bemalen). Zudem werden die Kinder im Atelier rumgeführt und sehen den großen Keramik Brennofen, was immer zur Begeisterung führt. Die Kinder haben ein wunderbares Andenken von diesem besonderen Tag, was die mit nach Hause nehmen können. Pro Kind 33,-€.
            </p>
          </div>

          {/* Willkommen */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Willkommen bei Sponk Keramik– Kreativität trifft Handwerk
            </h3>
            <p className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Entdecke die Welt der Keramik: Bemalen, Töpfern und Kaufen!
            </p>
            <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
              Möchtest du deiner Kreativität freien Lauf lassen? Bei Sponkkeramik bieten wir dir die Möglichkeit, einzigartige Keramikkunstwerke selbst zu gestalten oder kunstvolle Stücke für dein Zuhause zu erwerben. Egal, ob Anfänger oder erfahrener Künstler – bei uns findest du Inspiration und die perfekte Umgebung für deine Keramikprojekte.
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Keramik bemalen
                </h4>
                <p className="text-base text-gray-700 leading-relaxed">
                  Verleihe deiner Fantasie Ausdruck! In unserer Werkstatt kannst du Keramikrohlinge nach Herzenslust bemalen. Wähle aus einer großen Auswahl an Formen und Farben und kreiere dein ganz persönliches Kunstwerk. Ideal für Familien, Kindergeburtstage oder entspannte Nachmittage mit Freunden.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Töpferkurse für alle Niveaus
                </h4>
                <p className="text-base text-gray-700 leading-relaxed">
                  Wolltest du schon immer dein eigenes Geschirr oder Dekorationen aus Ton formen? Unsere Töpferkurse bieten dir die Möglichkeit, die Grundlagen zu erlernen oder deine Fähigkeiten zu vertiefen. Mit professioneller Anleitung und hochwertigem Material wirst du schnell erstaunliche Ergebnisse erzielen.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Keramik Unikate kaufen
                </h4>
                <p className="text-base text-gray-700 leading-relaxed">
                  Suchst du nach handgefertigten Unikaten für dein Zuhause oder als Geschenk? In unserem Shop findest du liebevoll gestaltete Keramikwaren, die durch ihre Qualität und Einzigartigkeit begeistern. Jede Kreation ist ein Ausdruck von Handwerkskunst und Leidenschaft.
                </p>
              </div>
            </div>

            <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-4">
              Warum Sponk Keramik
            </h4>
            <ul className="list-disc list-inside text-base text-gray-700 space-y-2 mb-6">
              <li>Kreative Auszeit in entspannter Atmosphäre</li>
              <li>Qualitativ hochwertige Materialien und Werkzeuge</li>
              <li>Individuelle Betreuung und Inspiration für jedes Projekt</li>
              <li>Große Auswahl an handgefertigten Keramikprodukten</li>
            </ul>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              Besuche uns vor Ort oder online und lass dich inspirieren!
            </p>
            <p className="text-base font-semibold text-gray-900">
              Melde dich noch heute für einen Kurs an oder stöbere in unserem Shop. Gemeinsam schaffen wir Kunst, die begeistert.
            </p>
          </div>

          {/* Abholung */}
          <div className="bg-amber-50 rounded-xl p-5 sm:p-6 md:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Informationen zur Abholung
            </h3>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              Bitte hole deine angefertigten oder fertig gebrannten Keramikstücke innerhalb von 6 Monaten nach dem Kurs ab. Nach Ablauf dieser Frist können wir keine Aufbewahrung garantieren und behalten uns vor, die Arbeiten zu entsorgen oder anderweitig zu verwenden. Vielen Dank für dein Verständnis und deine Wertschätzung unserer Werkstattarbeit!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

