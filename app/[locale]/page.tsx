import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { workshops } from "@/lib/data";
import CourseCard from "@/components/CourseCard";
import TrustIndexWidget from "@/components/TrustIndexWidget";
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
    images: [
      {
        url: "/images/sponkkeramik.webp",
        width: 1200,
        height: 630,
        alt: "Sponk Keramik Atelier - Handgefertigte Keramikkunst",
      },
    ],
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
  const featuredWorkshops = workshops.filter((w) => w.featured);

  return (
    <div className="bg-gray-50" style={{ marginTop: '0', paddingTop: '0' }}>
      {/* Hero Section - Mobile-first mit Hintergrundbild - 100vh */}
      <section className="relative min-h-screen w-full flex items-start justify-center overflow-hidden pt-12 md:pt-16" style={{ marginTop: '0' }}>
        {/* Hintergrundbild */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/sponkkeramik.webp"
            alt="Sponk Keramik Atelier - Handgefertigte Keramikkunst"
            fill
            priority
            fetchPriority="high"
            className="object-cover"
            quality={80}
            sizes="100vw"
          />
          {/* Overlay für bessere Textlesbarkeit */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-700/40 via-amber-600/30 to-orange-700/40"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-2 sm:py-4 md:py-6 lg:py-8">
          <div className="max-w-3xl mx-auto text-center">
            {/* Gutschein Aktions-Banner */}
            <div className="mb-6 sm:mb-8 animate-pulse">
              <Link
                href="/kontakt"
                className="inline-block bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg md:text-xl shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border-2 border-white/30 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  🎁 {t("home.buyGiftCard")}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </Link>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg">
              {t("home.title")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/95 mb-6 sm:mb-8 leading-relaxed px-2 drop-shadow-md font-bold">
              {t("home.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link
                href="/kurse-preise-sponk-keramik"
                className="bg-amber-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-amber-800 active:bg-amber-900 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation min-h-[48px] flex items-center justify-center backdrop-blur-sm"
              >
                {t("home.discoverWorkshops")}
              </Link>
              <Link
                href="/kontakt-sponk-keramik"
                className="bg-white/95 text-amber-800 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg border-2 border-white/50 hover:bg-white active:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation min-h-[48px] flex items-center justify-center backdrop-blur-sm"
              >
                {t("home.contact")}
              </Link>
            </div>
          </div>
        </div>
      </section>

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
            {featuredWorkshops.map((workshop) => (
              <CourseCard key={workshop.id} workshop={workshop} />
            ))}
            
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
    </div>
  );
}
