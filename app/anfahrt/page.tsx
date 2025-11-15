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

          {/* Karte Platzhalter */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Karte
            </h2>
            <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
              <div className="text-gray-400 text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p>Karte wird geladen...</p>
                <p className="text-xs mt-2">
                  (Für eine interaktive Karte kann Google Maps integriert werden)
                </p>
              </div>
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

