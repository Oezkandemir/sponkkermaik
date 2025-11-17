"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import VoucherPurchaseModal from "@/components/VoucherPurchaseModal";
import type { User } from "@supabase/supabase-js";

/**
 * Vouchers Page Component
 * 
 * Displays user's gift vouchers (active and used).
 * Requires authentication to access.
 */
export default function VouchersPage() {
  const router = useRouter();
  const t = useTranslations("vouchers");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "used">("active");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [activeVouchers, setActiveVouchers] = useState<any[]>([]);
  const [usedVouchers, setUsedVouchers] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Reason: Check authentication and load vouchers
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/signin");
        return;
      }
      
      setUser(user);
      await loadVouchers(user.id);
      setLoading(false);
      
      // Check for success message from PayPal
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('payment') === 'success') {
        setSuccessMessage('✅ Zahlung erfolgreich! Dein Gutschein wurde erstellt.');
        // Remove the query parameter
        window.history.replaceState({}, '', window.location.pathname);
        // Reload vouchers after a short delay
        setTimeout(() => {
          loadVouchers(user.id);
        }, 1000);
      } else if (searchParams.get('payment') === 'cancelled') {
        setSuccessMessage('⚠️ Zahlung abgebrochen.');
        window.history.replaceState({}, '', window.location.pathname);
      }
    }

    getUser();
  }, [router, supabase.auth]);

  /**
   * Loads vouchers from database
   * 
   * Args:
   *   userId (string): User ID to load vouchers for
   */
  const loadVouchers = async (userId: string) => {
    // Load active and pending vouchers (pending vouchers are waiting for payment)
    const { data: active, error: activeError } = await supabase
      .from("vouchers")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["active", "pending"])
      .gt("valid_until", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (!activeError && active) {
      setActiveVouchers(active.map(v => ({
        ...v,
        valid_until: new Date(v.valid_until).toLocaleDateString()
      })));
    }

    // Load used vouchers
    const { data: used, error: usedError } = await supabase
      .from("vouchers")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "used")
      .order("used_at", { ascending: false });

    if (!usedError && used) {
      setUsedVouchers(used.map(v => ({
        ...v,
        used_date: v.used_at ? new Date(v.used_at).toLocaleDateString() : "",
        valid_until: new Date(v.valid_until).toLocaleDateString()
      })));
    }
  };

  // Reload vouchers when modal closes (to show newly purchased voucher)
  useEffect(() => {
    if (!isVoucherModalOpen && user) {
      loadVouchers(user.id);
    }
  }, [isVoucherModalOpen]);

  /**
   * Copies voucher code to clipboard
   * 
   * Args:
   *   code (string): Voucher code to copy
   */
  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600">{t("subtitle")}</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-800 font-medium">{successMessage}</p>
              <button
                onClick={() => setSuccessMessage(null)}
                className="ml-auto text-green-600 hover:text-green-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Buy Voucher Button */}
        <div className="mb-8">
          <button
            onClick={() => setIsVoucherModalOpen(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t("buyVoucher")}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "active"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {t("active")}
          </button>
          <button
            onClick={() => setActiveTab("used")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "used"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {t("used")}
          </button>
        </div>

        {/* Vouchers Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {activeTab === "active" ? (
            activeVouchers.length > 0 ? (
              activeVouchers.map((voucher) => (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  t={t}
                  onCopy={handleCopyCode}
                  copiedCode={copiedCode}
                />
              ))
            ) : (
              <div className="col-span-2">
                <EmptyState message={t("noActive")} />
              </div>
            )
          ) : usedVouchers.length > 0 ? (
            usedVouchers.map((voucher) => (
              <VoucherCard
                key={voucher.id}
                voucher={voucher}
                t={t}
                isUsed
              />
            ))
          ) : (
            <div className="col-span-2">
              <EmptyState message={t("noUsed")} />
            </div>
          )}
        </div>
      </div>

      {/* Voucher Purchase Modal */}
      <VoucherPurchaseModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
      />
    </div>
  );
}

/**
 * Voucher Card Component
 * 
 * Args:
 *   voucher: Voucher data object
 *   t: Translation function
 *   isUsed: Whether this voucher has been used
 *   onCopy: Function to copy voucher code
 *   copiedCode: Currently copied code (for feedback)
 */
function VoucherCard({
  voucher,
  t,
  isUsed = false,
  onCopy,
  copiedCode,
}: {
  voucher: any;
  t: any;
  isUsed?: boolean;
  onCopy?: (code: string) => void;
  copiedCode?: string | null;
}) {
  const isCopied = copiedCode === voucher.code;

  return (
    <div
      className={`relative bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg p-6 text-white overflow-hidden ${
        isUsed ? "opacity-60" : ""
      }`}
    >
      {/* Decorative pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <svg viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="40" />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Voucher Value */}
        <div className="mb-4">
          <p className="text-sm opacity-90 mb-1">{t("value")}</p>
          <p className="text-4xl font-bold">{voucher.value}€</p>
        </div>

        {/* Voucher Code */}
        <div className="mb-4">
          <p className="text-sm opacity-90 mb-2">{t("code")}</p>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between">
            <code className="text-lg font-mono font-semibold">
              {voucher.code}
            </code>
            {!isUsed && onCopy && (
              <button
                onClick={() => onCopy(voucher.code)}
                className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md transition-colors flex items-center gap-1"
              >
                {isCopied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">{t("codeCopied")}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">{t("copyCode")}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Status Badge */}
        {voucher.status === "pending" && (
          <div className="mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-200 text-amber-800">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t("purchase.confirmation.pending")}
            </span>
          </div>
        )}

        {/* Validity / Usage Date */}
        <div className="text-sm opacity-90">
          {isUsed ? (
            <p>
              {t("usedOn")}: {voucher.used_date}
            </p>
          ) : (
            <p>
              {t("validUntil")}: {voucher.valid_until}
            </p>
          )}
        </div>

        {/* Redeem Button */}
        {!isUsed && voucher.status === "active" && (
          <button className="mt-4 w-full px-4 py-2 bg-white text-amber-600 rounded-lg hover:bg-amber-50 transition-colors font-medium">
            {t("redeem")}
          </button>
        )}

        {/* Pending Notice */}
        {voucher.status === "pending" && (
          <div className="mt-4 p-3 bg-white/20 backdrop-blur-sm rounded-lg">
            <p className="text-xs text-white/90">
              {t("purchase.payment.bankTransferInfo")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Empty State Component
 * 
 * Args:
 *   message: Message to display
 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      </div>
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  );
}

