import { contactInfo } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";

/**
 * Kontakt Seite
 * Kontaktinformationen und Kontaktformular
 */
export default function KontaktPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
            Kontakt
          </h1>
          <p className="text-xl text-gray-600 mb-12 text-center">
            Wir freuen uns auf Ihre Nachricht
          </p>

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

