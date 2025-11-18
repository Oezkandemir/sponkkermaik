"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

/**
 * Voucher Purchase Success Page
 * 
 * Displays success message after PayPal payment and redirects to vouchers page
 */
export default function VoucherSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("vouchers");
  const [countdown, setCountdown] = useState(5);

  const voucherCode = searchParams.get("code");
  const amount = searchParams.get("amount");
  const orderNumber = searchParams.get("order");

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/vouchers");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t("purchase.success.title") || "Zahlung erfolgreich!"}
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            {t("purchase.success.subtitle") ||
              "Vielen Dank für deinen Kauf! Dein Gutschein wurde erstellt."}
          </p>

          {/* Voucher Details */}
          {(voucherCode || amount || orderNumber) && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t("purchase.success.details") || "Bestelldetails"}
              </h2>

              <div className="space-y-3">
                {orderNumber && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">
                      {t("purchase.success.orderNumber") || "Bestellnummer"}:
                    </span>
                    <span className="font-bold text-gray-900">{orderNumber}</span>
                  </div>
                )}

                {voucherCode && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">
                      {t("purchase.success.voucherCode") || "Gutscheincode"}:
                    </span>
                    <code className="font-mono font-bold text-amber-600 text-lg">
                      {voucherCode}
                    </code>
                  </div>
                )}

                {amount && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">
                      {t("purchase.success.amount") || "Betrag"}:
                    </span>
                    <span className="font-bold text-amber-600 text-xl">{amount}€</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-800 flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {t("purchase.success.info") ||
                "Dein Gutschein findest du in deinem Konto unter 'Meine Gutscheine'."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/vouchers"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
              {t("purchase.success.viewVouchers") || "Zu meinen Gutscheinen"}
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              {t("purchase.success.backToHome") || "Zur Startseite"}
            </Link>
          </div>

          {/* Countdown */}
          <p className="text-sm text-gray-500 mt-6">
            {t("purchase.success.redirecting") || "Weiterleitung in"} {countdown}{" "}
            {t("purchase.success.seconds") || "Sekunden"}...
          </p>
        </div>
      </div>
    </div>
  );
}

