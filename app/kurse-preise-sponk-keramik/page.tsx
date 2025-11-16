import { workshops } from "@/lib/data";
import CourseCard from "@/components/CourseCard";
import Link from "next/link";

/**
 * Workshops & Preise Seite
 * Mobile-first Design mit allen Kursen und direkten Buchungslinks
 */
export default function WorkshopsPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">
            Workshops & Preise
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-12 text-center px-2">
            Entdecken Sie unsere vielfältigen Angebote für Keramik bemalen und
            Töpferkurse. Direkte Buchung über cal.com möglich!
          </p>

          {/* Alle Workshops Grid - Mobile-first */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 mb-8 sm:mb-12">
            {workshops.map((workshop) => (
              <CourseCard key={workshop.id} workshop={workshop} />
            ))}
          </div>

          {/* Buchungsinformationen - Mobile optimiert */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Buchungsinformationen
            </h2>
            <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">
              Die meisten Workshops können Sie direkt über die Buchungslinks oben
              buchen. Alternativ kontaktieren Sie uns per E-Mail oder besuchen Sie
              uns während unserer Öffnungszeiten im Atelier.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href="/kontakt"
                className="bg-amber-600 text-white px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:bg-amber-700 active:bg-amber-800 transition-all duration-200 text-center shadow-md hover:shadow-lg touch-manipulation min-h-[48px] flex items-center justify-center"
              >
                Kontakt aufnehmen
              </Link>
              <Link
                href="/oeffnungszeiten"
                className="bg-gray-100 text-gray-800 px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 text-center shadow-md hover:shadow-lg touch-manipulation min-h-[48px] flex items-center justify-center"
              >
                Öffnungszeiten ansehen
              </Link>
            </div>
          </div>

          {/* Zusätzliche Informationen - Mobile optimiert */}
          <div className="bg-amber-50 rounded-xl p-5 sm:p-6 md:p-8">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              Was Sie erwartet
            </h3>
            <ul className="list-disc list-inside text-sm sm:text-base text-gray-700 space-y-2 sm:space-y-3 leading-relaxed">
              <li>Fachkundige Anleitung durch erfahrene Keramiker</li>
              <li>Alle Materialien sind im Preis enthalten</li>
              <li>Ihre Werke können Sie nach dem Brennen abholen</li>
              <li>Perfekt für Anfänger und Fortgeschrittene</li>
              <li>Gruppenkurse und individuelle Betreuung möglich</li>
              <li>Direkte Online-Buchung über cal.com möglich</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

