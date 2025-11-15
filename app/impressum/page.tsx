import { contactInfo } from "@/lib/data";

/**
 * Impressum Seite
 * Rechtliche Angaben gemäß § 5 TMG
 */
export default function ImpressumPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Impressum
          </h1>

          <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Angaben gemäß § 5 TMG
              </h2>
              <div className="text-gray-700 space-y-2">
                <p className="font-medium">Sponk Keramik</p>
                <p>
                  {contactInfo.address}
                  <br />
                  {contactInfo.postalCode} {contactInfo.city}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Kontakt
              </h2>
              <div className="text-gray-700 space-y-2">
                <p>
                  E-Mail:{" "}
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="text-amber-600 hover:text-amber-700"
                  >
                    {contactInfo.email}
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Umsatzsteuer-ID
              </h2>
              <p className="text-gray-700">
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a
                Umsatzsteuergesetz:
                <br />
                <strong>{contactInfo.vatId}</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
              </h2>
              <div className="text-gray-700 space-y-2">
                <p className="font-medium">Sponk Keramik</p>
                <p>
                  {contactInfo.address}
                  <br />
                  {contactInfo.postalCode} {contactInfo.city}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Haftungsausschluss
              </h2>
              <div className="text-gray-700 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Haftung für Inhalte</h3>
                  <p className="text-sm">
                    Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt.
                    Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte
                    können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter
                    sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen
                    Seiten nach den allgemeinen Gesetzen verantwortlich.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Haftung für Links</h3>
                  <p className="text-sm">
                    Unser Angebot enthält Links zu externen Webseiten Dritter, auf
                    deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
                    diese fremden Inhalte auch keine Gewähr übernehmen. Für die
                    Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
                    oder Betreiber der Seiten verantwortlich.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Urheberrecht</h3>
                  <p className="text-sm">
                    Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
                    diesen Seiten unterliegen dem deutschen Urheberrecht. Die
                    Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
                    Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
                    schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

