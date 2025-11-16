import { directions, contactInfo } from "@/lib/data";
import Link from "next/link";

/**
 * Anfahrt Seite
 * Wegbeschreibung und Informationen zur Anreise
 */
export default function AnfahrtPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
            Anfahrt
          </h1>
          <p className="text-xl text-gray-600 mb-12 text-center">
            So finden Sie uns im Herzen von Düsseldorf
          </p>

          {/* Adresse */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Adresse
            </h2>
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
                <p className="text-lg font-medium text-gray-800">
                  {contactInfo.address}
                </p>
                <p className="text-gray-700">
                  {contactInfo.postalCode} {contactInfo.city}
                </p>
              </div>
            </div>
          </div>

          {/* Parkmöglichkeiten */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Parkmöglichkeiten
            </h2>
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {directions.parking.name}
              </h3>
              <p className="text-gray-700 mb-2">{directions.parking.address}</p>
              <p className="text-gray-600 text-sm">
                {directions.parking.description}
              </p>
            </div>
            <p className="text-gray-700 text-sm">
              Weitere Parkmöglichkeiten finden Sie in der Umgebung. Bitte beachten
              Sie die Parkgebühren und Beschränkungen.
            </p>
          </div>

          {/* Öffentliche Verkehrsmittel */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Öffentliche Verkehrsmittel
            </h2>
            <p className="text-gray-700 mb-4">
              {directions.publicTransport.description}
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 text-sm">
                Die nächsten Haltestellen befinden sich in unmittelbarer Nähe zum
                Atelier. Planen Sie Ihre Anreise mit den Verkehrsbetrieben
                Düsseldorf (Rheinbahn).
              </p>
            </div>
          </div>

          {/* Google Maps Karte */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Karte
            </h2>
            <div className="relative w-full h-0 pb-[75%] rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2499.3157210917734!2d6.7822438124428714!3d51.213259332030624!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b8cb412a104e99%3A0x456f12336b16a022!2sSponk%20Keramik%20bemalen!5e0!3m2!1sde!2sde!4v1763286187185!5m2!1sde!2sde"
                className="absolute top-0 left-0 w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps - Sponk Keramik"
              />
            </div>
          </div>

          {/* CTA */}
          <div className="bg-amber-50 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Fragen zur Anfahrt?
            </h3>
            <p className="text-gray-700 mb-4">
              Bei Fragen zur Anfahrt oder wenn Sie Hilfe benötigen, kontaktieren
              Sie uns gerne.
            </p>
            <Link
              href="/kontakt"
              className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
            >
              Kontakt aufnehmen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

