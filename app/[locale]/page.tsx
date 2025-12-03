import { Link } from "@/i18n/navigation";
import Image from "next/image";
import FeaturedWorkshops from "@/components/FeaturedWorkshops";
import TrustIndexWidget from "@/components/TrustIndexWidget";
import HeroSection from "@/components/HeroSection";
import NewsletterSignup from "@/components/NewsletterSignup";
import { Metadata } from "next";
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: "Sponk Keramik - Keramik bemalen & Töpferkurse in Düsseldorf",
  description:
    "Entdecken Sie die Kunst des Keramik bemalens und Töpferns in Düsseldorf. Handgefertigte Keramikkunst und kreative Workshops für Anfänger und Fortgeschrittene. Jetzt online buchen!",
  keywords: [
    "Keramik bemalen Düsseldorf",
    "Töpferkurs Düsseldorf",
    "Keramik Workshop",
    "Pottery Düsseldorf",
    "Kreativkurs",
    "Handgemachte Keramik",
    "Keramik Atelier Düsseldorf",
  ],
  openGraph: {
    title: "Sponk Keramik - Keramik bemalen & Töpferkurse in Düsseldorf",
    description:
      "Entdecken Sie die Kunst des Keramik bemalens und Töpferns in unserem Atelier. Handgefertigte Keramikkunst und kreative Workshops für Anfänger und Fortgeschrittene.",
    url: "https://www.sponkkeramik.de",
    siteName: "Sponk Keramik",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "/images/sponkkeramik.webp",
        width: 1200,
        height: 630,
        alt: "Sponk Keramik Atelier - Handgefertigte Keramikkunst",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sponk Keramik - Keramik bemalen & Töpferkurse in Düsseldorf",
    description: "Entdecken Sie die Kunst des Keramik bemalens und Töpferns in unserem Atelier.",
    images: ["/images/sponkkeramik.webp"],
  },
  alternates: {
    canonical: "https://www.sponkkeramik.de",
  },
};

/**
 * Homepage
 * Zeigt eine Begrüßung, Hauptangebote und Call-to-Action Buttons
 */
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <div className="bg-gray-50" style={{ marginTop: '0', paddingTop: '0' }}>
      {/* Hero Section mit Gutschein-Modal */}
      <HeroSection />

      {/* Weihnachtsgruß Section */}
      <section className="py-6 sm:py-8 bg-gradient-to-br from-red-50/30 via-white to-green-50/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 sm:p-5 md:p-6 border border-red-100">
            <div className="mb-2 sm:mb-3">
              <span className="text-2xl sm:text-3xl">🎄</span>
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
              {t("home.christmasGreeting.title")}
            </h2>
            <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed">
              {t("home.christmasGreeting.message")}
            </p>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-xl">🎉</span>
              <p className="text-sm sm:text-base font-semibold text-amber-700">
                {t("home.christmasGreeting.newYear")}
              </p>
              <span className="text-lg sm:text-xl">🎉</span>
            </div>
          </div>
        </div>
      </section>

      {/* Spezielle Öffnungszeiten Hinweis */}
      <section className="py-6 sm:py-8 container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-amber-200 rounded-full flex items-center justify-center">
                <span className="text-xl sm:text-2xl">⏰</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  {t("home.specialOpeningHours.title")}
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {t("home.specialOpeningHours.message")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Angebote Section - Mobile-first */}
      <section className="py-12 sm:py-16 container mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
          {t("home.ourOffers")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🎨</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              {t("home.ceramicPainting.title")}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {t("home.ceramicPainting.description")}
            </p>
          </div>
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">⚱️</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              {t("home.potteryCourses.title")}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {t("home.potteryCourses.description")}
            </p>
          </div>
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center sm:col-span-2 lg:col-span-1">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">✨</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              {t("home.handcraftedCeramics.title")}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {t("home.handcraftedCeramics.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Workshops - Mobile-first */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            {t("home.popularWorkshops")}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
            <FeaturedWorkshops />
            
            {/* Wichtige Termine Card */}
            <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50 rounded-xl shadow-md overflow-hidden border-2 border-amber-200 flex flex-col h-full">
              <div className="p-6 sm:p-8 flex-grow flex flex-col">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 rounded-full mb-4">
                    <span className="text-3xl sm:text-4xl">📅</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                    {t("home.ceramicPaintingWorkshop.title")}
                  </h3>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">🎨</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-base mb-1">
                        {t("home.ceramicPaintingWorkshop.firstSunday")}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {t("home.ceramicPaintingWorkshop.title")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-amber-50 rounded-lg p-4 shadow-sm border border-amber-200">
                    <div className="flex-shrink-0 w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">
                      <span className="text-xl">🎄</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-amber-900 text-base mb-1">
                        {t("home.ceramicPaintingWorkshop.decemberOpen")}
                      </h4>
                      <p className="text-sm text-amber-800">
                        {t("home.ceramicPaintingWorkshop.decemberOffer")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bild "toll selbst hergestellt" */}
                <div className="relative w-full h-64 sm:h-80 mb-6 rounded-lg overflow-hidden bg-white">
                  <Image
                    src="/images/kurswerke/IMG_4081.jpeg"
                    alt="Toll selbst hergestellt - Keramik Workshop"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={70}
                  />
                </div>

                <div className="text-center mt-auto">
              <Link
                href="/kurse-preise-sponk-keramik"
                className="block w-full bg-amber-700 text-white px-6 py-3 sm:py-4 rounded-lg font-bold text-base hover:bg-amber-800 active:bg-amber-900 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {t("home.bookWorkshop")}
              </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-6 sm:mt-8">
            <Link
              href="/kurse-preise-sponk-keramik"
              className="inline-block text-amber-700 font-bold text-base sm:text-lg hover:text-amber-800 active:text-amber-900 transition-colors touch-manipulation py-2 px-4 rounded-lg hover:bg-amber-50"
            >
              {t("home.viewAllWorkshops")}
            </Link>
          </div>

          {/* TrustIndex Reviews */}
          <TrustIndexWidget />
        </div>
      </section>

      {/* CTA Section - Mobile-first */}
      <section className="py-12 sm:py-16 bg-amber-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">
            {t("home.readyForAdventure")}
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white px-2 leading-relaxed">
            {t("home.visitUs")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              href="/kurse-atelier-zeiten"
              className="bg-white text-amber-800 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-amber-50 active:bg-amber-100 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation min-h-[48px] flex items-center justify-center"
            >
              {t("home.viewOpeningHours")}
            </Link>
            <Link
              href="/kontakt-sponk-keramik"
              className="bg-amber-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-amber-900 active:bg-black transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation min-h-[48px] flex items-center justify-center"
            >
              {t("home.getInTouch")}
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto">
            <NewsletterSignup />
          </div>
        </div>
      </section>
    </div>
  );
}
