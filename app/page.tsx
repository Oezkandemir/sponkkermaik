import Link from "next/link";
import Image from "next/image";
import { workshops } from "@/lib/data";
import CourseCard from "@/components/CourseCard";
import TrustIndexWidget from "@/components/TrustIndexWidget";

/**
 * Homepage
 * Zeigt eine Begrüßung, Hauptangebote und Call-to-Action Buttons
 */
export default function Home() {
  const featuredWorkshops = workshops.filter((w) => w.featured);

  return (
    <div className="bg-gray-50" style={{ marginTop: '0', paddingTop: '0' }}>
      {/* Hero Section - Mobile-first mit Hintergrundbild - 100vh */}
      <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden" style={{ marginTop: '0', paddingTop: '0' }}>
        {/* Hintergrundbild */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/sponkkeramik.webp"
            alt="Sponk Keramik Atelier - Handgefertigte Keramikkunst"
            fill
            priority
            className="object-cover"
            quality={90}
            sizes="100vw"
          />
          {/* Overlay für bessere Textlesbarkeit */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-700/40 via-amber-600/30 to-orange-700/40"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg">
              Sponk Keramik & Kurse Düsseldorf
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/95 mb-6 sm:mb-8 leading-relaxed px-2 drop-shadow-md">
              Entdecken Sie die Kunst des Keramik bemalens und Töpferns in unserem
              Atelier. Handgefertigte Keramikkunst und kreative Workshops für
              Anfänger und Fortgeschrittene.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link
                href="/workshops"
                className="bg-amber-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-amber-700 active:bg-amber-800 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation min-h-[48px] flex items-center justify-center backdrop-blur-sm"
              >
                Workshops entdecken
              </Link>
              <Link
                href="/kontakt"
                className="bg-white/95 text-amber-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg border-2 border-white/50 hover:bg-white active:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation min-h-[48px] flex items-center justify-center backdrop-blur-sm"
              >
                Jetzt buchen
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Angebote Section - Mobile-first */}
      <section className="py-12 sm:py-16 container mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
          Unsere Angebote
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🎨</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              Keramik bemalen
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Bemalen Sie vorgefertigte Keramikstücke nach Ihren Wünschen. Eine
              große Auswahl an Formen und Farben steht Ihnen zur Verfügung.
            </p>
          </div>
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">⚱️</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              Töpferkurse
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Lernen Sie die traditionelle Kunst des Töpferns an der Drehscheibe.
              Unter fachkundiger Anleitung erstellen Sie Ihr eigenes Kunstwerk.
            </p>
          </div>
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center sm:col-span-2 lg:col-span-1">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">✨</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              Handgefertigte Keramikkunst
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Entdecken Sie einzigartige Keramikkunstwerke von Bülent Tepe. Jedes
              Stück ist ein Unikat und mit Liebe zum Detail gefertigt.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Workshops - Mobile-first */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            Beliebte Workshops
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
            {featuredWorkshops.map((workshop) => (
              <CourseCard key={workshop.id} workshop={workshop} />
            ))}
          </div>
          <div className="text-center mt-6 sm:mt-8">
            <Link
              href="/workshops"
              className="inline-block text-amber-600 font-bold text-base sm:text-lg hover:text-amber-700 active:text-amber-800 transition-colors touch-manipulation py-2 px-4 rounded-lg hover:bg-amber-50"
            >
              Alle Workshops ansehen →
            </Link>
          </div>

          {/* TrustIndex Reviews */}
          <TrustIndexWidget />
        </div>
      </section>

      {/* CTA Section - Mobile-first */}
      <section className="py-12 sm:py-16 bg-amber-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">
            Bereit für Ihr kreatives Abenteuer?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-amber-100 px-2 leading-relaxed">
            Besuchen Sie uns im Atelier oder kontaktieren Sie uns für eine
            individuelle Beratung.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              href="/oeffnungszeiten"
              className="bg-white text-amber-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-amber-50 active:bg-amber-100 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation min-h-[48px] flex items-center justify-center"
            >
              Öffnungszeiten
            </Link>
            <Link
              href="/kontakt"
              className="bg-amber-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-amber-800 active:bg-amber-900 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation min-h-[48px] flex items-center justify-center"
            >
              Kontakt aufnehmen
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
