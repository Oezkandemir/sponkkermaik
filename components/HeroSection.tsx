"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import VoucherPurchaseModal from "./VoucherPurchaseModal";

/**
 * Hero Section Component with Voucher Purchase Modal
 * 
 * Displays the hero section with a call-to-action button to open the voucher purchase modal.
 */
export default function HeroSection() {
  const t = useTranslations();
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  return (
    <>
      {/* Hero Section - Mobile-first mit Hintergrundbild - 100vh */}
      <section className="relative min-h-screen w-full flex items-start justify-center overflow-hidden pt-24 min-[780px]:pt-[99px]" style={{ marginTop: '0' }}>
        {/* Hintergrundbild */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/IMG_8374.jpg"
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
              <button
                onClick={() => setIsVoucherModalOpen(true)}
                className="inline-block bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg md:text-xl shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border-2 border-white/30 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  🎁 {t("home.buyGiftCard")}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
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

      {/* Voucher Purchase Modal */}
      <VoucherPurchaseModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
      />
    </>
  );
}

