import { openingHours } from "@/lib/data";
import Link from "next/link";

/**
 * Öffnungszeiten Seite
 * Zeigt Atelier- und Kurszeiten in benutzerfreundlichem Design
 */
export default function OeffnungszeitenPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-600 to-orange-600 py-6 sm:py-8 md:py-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3">
              WELCOME
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/95">
              Öffnungszeiten
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Öffnungszeiten */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
              Öffnungszeiten
            </h2>
            <div className="space-y-6 sm:space-y-8">
              {openingHours.atelier.map((item, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 last:border-0 pb-6 sm:pb-8 last:pb-0"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-2">
                        {item.days}
                      </h3>
                    </div>
                    <div className="flex-1 sm:text-right">
                      <p className="text-base sm:text-lg md:text-xl font-medium text-amber-700">
                        {item.times}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kurszeiten */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
              Kurszeiten
            </h2>
            <div className="space-y-6 sm:space-y-8">
              {openingHours.courses.map((item, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 last:border-0 pb-6 sm:pb-8 last:pb-0"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-2">
                        {item.days}
                      </h3>
                    </div>
                    <div className="flex-1 sm:text-right">
                      <p className="text-base sm:text-lg md:text-xl font-medium text-amber-700">
                        {item.times}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Geschlossen Info */}
          <div className="bg-amber-50 rounded-xl p-5 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              Geschlossen
            </h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Montag, Donnerstag und Sonntag (außer bei speziellen Workshops)
            </p>
          </div>

          {/* Wichtige Hinweise */}
          <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              Wichtige Hinweise
            </h3>
            <ul className="list-disc list-inside text-sm sm:text-base text-gray-700 space-y-2 sm:space-y-3 leading-relaxed">
              <li>
                Wir empfehlen eine vorherige Anmeldung für Kurse, um einen Platz
                zu garantieren
              </li>
              <li>
                Während der Kurszeiten ist das Atelier für freies Arbeiten
                eingeschränkt verfügbar
              </li>
              <li>
                Für Gruppenbuchungen oder individuelle Termine kontaktieren Sie
                uns bitte
              </li>
              <li>
                An Feiertagen können die Öffnungszeiten abweichen - bitte
                kontaktieren Sie uns vorher
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/kontakt"
              className="bg-amber-600 text-white px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:bg-amber-700 active:bg-amber-800 transition-all duration-200 text-center shadow-md hover:shadow-lg touch-manipulation min-h-[48px] flex items-center justify-center"
            >
              Termin vereinbaren
            </Link>
            <Link
              href="/workshops"
              className="bg-white text-amber-600 px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base border-2 border-amber-600 hover:bg-amber-50 active:bg-amber-100 transition-all duration-200 text-center shadow-md hover:shadow-lg touch-manipulation min-h-[48px] flex items-center justify-center"
            >
              Workshops ansehen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
