"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Link } from "@/i18n/navigation";

/**
 * VoucherPurchaseModal Component
 * 
 * Modal for purchasing gift vouchers with 4 amount options: 40€, 80€, 120€, 200€
 * Integrated with PayPal checkout for secure payments
 * 
 * Args:
 *   isOpen (boolean): Whether the modal is open
 *   onClose (function): Callback function to close the modal
 */
interface VoucherPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "amount" | "payment" | "confirmation";
type PaymentMethod = "paypal" | "bank_transfer" | null;

export default function VoucherPurchaseModal({ isOpen, onClose }: VoucherPurchaseModalProps) {
  const t = useTranslations("vouchers.purchase");
  const router = useRouter();
  const [step, setStep] = useState<Step>("amount");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [orderID, setOrderID] = useState<string>("");
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  // Reason: Get current user ID when modal opens (but don't redirect - let user browse first)
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // Just set the userId - don't redirect here
      // User can browse vouchers and will be prompted to login when trying to pay
      setUserId(user?.id || null);
    };
    
    if (isOpen) {
      getUser();
    }
  }, [isOpen, supabase.auth]);

  // Reason: Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const voucherAmounts = [40, 80, 120, 200];

  /**
   * Handles selecting a voucher amount
   * 
   * Args:
   *   amount (number): The voucher amount selected
   */
  const handleSelectAmount = (amount: number) => {
    // Allow user to select amount without login - they'll be prompted when trying to pay
    setSelectedAmount(amount);
    setPaymentMethod(null); // Reset payment method
    setStep("payment");
  };

  /**
   * Handles selecting payment method
   * 
   * Args:
   *   method (PaymentMethod): The payment method selected
   */
  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setError(null);
  };

  /**
   * Handles bank transfer payment process
   */
  const handleBankTransferPayment = async () => {
    // Check if user is logged in - show error immediately
    if (!userId) {
      setError(t("payment.loginRequired"));
      // Wait a moment to show the error, then redirect
      setTimeout(() => {
        onClose();
        router.push("/auth/signin");
      }, 2000);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/vouchers/create-bank-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedAmount,
          userId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create voucher');
      }

      const data = await response.json();
      setVoucherCode(data.voucherCode);
      setOrderID(data.voucher?.id || `BT-${Date.now()}`);
      setStep("confirmation");
      
      // Reload vouchers page to show the new voucher
      // The modal will be closed and vouchers will be reloaded via useEffect in VouchersPage
    } catch (err) {
      console.error('Bank transfer voucher creation error:', err);
      setError(err instanceof Error ? err.message : 'Voucher creation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Creates a PayPal order
   * 
   * Returns:
   *   Promise<string>: PayPal Order ID
   */
  const createPayPalOrder = async (): Promise<string> => {
    const response = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: selectedAmount,
        currency: 'EUR',
        description: `Sponk Keramik Gift Voucher - ${selectedAmount}€`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create order');
    }

    const data = await response.json();
    return data.id;
  };

  /**
   * Approves and captures a PayPal order
   * 
   * Args:
   *   orderID (string): PayPal Order ID to capture
   */
  const approvePayPalOrder = async (orderID: string) => {
    const response = await fetch('/api/paypal/capture-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderID }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to capture order');
    }

    const data = await response.json();
    return data;
  };

  /**
   * Handles PayPal payment process
   */
  const handlePayPalPayment = async () => {
    // Check if user is logged in - show error immediately
    if (!userId) {
      setError(t("payment.loginRequired"));
      // Wait a moment to show the error, then redirect
      setTimeout(() => {
        onClose();
        router.push("/auth/signin");
      }, 2000);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create PayPal order
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedAmount,
          currency: 'EUR',
          description: `Sponk Keramik Gift Voucher - ${selectedAmount}€`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const orderData = await response.json();
      setOrderID(orderData.orderID);

      // Find approval link
      const approvalUrl = orderData.links?.find((link: any) => link.rel === 'approve')?.href;

      if (approvalUrl) {
        // Redirect to PayPal for payment
        window.location.href = approvalUrl;
      } else {
        throw new Error('No approval URL received from PayPal');
      }
    } catch (err) {
      console.error('PayPal payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
      setIsProcessing(false);
    }
  };

  /**
   * Handles closing and resetting the modal
   */
  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setStep("amount");
      setSelectedAmount(null);
      setPaymentMethod(null);
      setOrderID("");
      setVoucherCode("");
      setError(null);
      setIsProcessing(false);
    }, 300);
  };

  /**
   * Handles going back to previous step
   */
  const handleBack = () => {
    if (step === "payment") {
      setStep("amount");
      setError(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Modal Content */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label={t("close")}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Step 1: Select Amount */}
        {step === "amount" && (
          <>
            {/* Header */}
            <div className="text-center pt-12 pb-8 px-8 bg-gradient-to-br from-amber-50 to-orange-50">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                {t("title")}
              </h2>
              <p className="text-xl text-gray-600 mb-2">
                {t("subtitle")}
              </p>
              <p className="text-gray-500">
                {t("perfectGift")}
              </p>
            </div>

            {/* Voucher Cards Grid */}
            <div className="p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                {t("selectAmount")}
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {voucherAmounts.map((amount) => (
                  <VoucherCard
                    key={amount}
                    amount={amount}
                    onPurchase={() => handleSelectAmount(amount)}
                    t={t}
                  />
                ))}
              </div>

              {/* Benefits Section */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  {t("benefits.title")}
                </h4>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{t("benefits.instant")}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{t("benefits.flexible")}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{t("benefits.valid")}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{t("benefits.workshops")}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 2: Payment Method Selection */}
        {step === "payment" && (
          <PaymentScreen
            amount={selectedAmount!}
            paymentMethod={paymentMethod}
            isProcessing={isProcessing}
            error={error}
            userId={userId}
            onBack={handleBack}
            onSelectPaymentMethod={handleSelectPaymentMethod}
            onPayWithPayPal={handlePayPalPayment}
            onPayWithBankTransfer={handleBankTransferPayment}
            t={t}
          />
        )}

        {/* Step 3: Confirmation */}
        {step === "confirmation" && (
          <ConfirmationScreen
            amount={selectedAmount!}
            orderID={orderID}
            voucherCode={voucherCode}
            paymentMethod={paymentMethod}
            onClose={handleClose}
            t={t}
          />
        )}
      </div>
    </div>
  );
}

/**
 * VoucherCard Component
 * 
 * Individual voucher card with logo and amount
 * 
 * Args:
 *   amount (number): Voucher amount in euros
 *   onPurchase (function): Callback when purchase button is clicked
 *   t (function): Translation function
 */
function VoucherCard({
  amount,
  onPurchase,
  t,
}: {
  amount: number;
  onPurchase: () => void;
  t: any;
}) {
  return (
    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl">
      {/* Card Header with Logo */}
      <div className="bg-white p-6 flex justify-center">
        <Image
          src="/images/logo.png"
          alt="Sponk Keramik Logo"
          width={120}
          height={30}
          className="h-auto"
        />
      </div>

      {/* Card Body */}
      <div className="p-6 text-white text-center">
        <h3 className="text-lg font-semibold mb-4">
          {t("cardTitle")}
        </h3>
        
        {/* Amount */}
        <div className="mb-6">
          <div className="text-6xl font-bold mb-2">
            {amount}€
          </div>
        </div>

        {/* Purchase Button */}
        <button
          onClick={onPurchase}
          className="w-full py-3 px-6 bg-white text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {t("buy")}
        </button>
      </div>

      {/* Decorative Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="40" />
          <circle cx="20" cy="80" r="15" />
          <circle cx="80" cy="20" r="20" />
        </svg>
      </div>
    </div>
  );
}

/**
 * PaymentScreen Component
 * 
 * Shows payment method selection interface
 */
function PaymentScreen({
  amount,
  paymentMethod,
  isProcessing,
  error,
  userId,
  onBack,
  onSelectPaymentMethod,
  onPayWithPayPal,
  onPayWithBankTransfer,
  t,
}: {
  amount: number;
  paymentMethod: "paypal" | "bank_transfer" | null;
  isProcessing: boolean;
  error: string | null;
  userId: string | null;
  onBack: () => void;
  onSelectPaymentMethod: (method: "paypal" | "bank_transfer" | null) => void;
  onPayWithPayPal: () => void;
  onPayWithBankTransfer: () => void;
  t: any;
}) {
  return (
    <>
      <div className="text-center pt-12 pb-8 px-8 bg-gradient-to-br from-amber-50 to-orange-50">
        <h2 className="text-4xl font-bold text-gray-900 mb-3">
          {t("payment.title")}
        </h2>
        <p className="text-xl text-gray-600">
          {t("payment.subtitle")}
        </p>
        <div className="mt-4 inline-block bg-white px-6 py-2 rounded-full">
          <span className="text-2xl font-bold text-amber-600">{amount}€</span>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            </div>
          )}

          {/* Payment Method Selection */}
          <div className="mb-8 space-y-4">
            {/* PayPal Option */}
            <button
              onClick={() => onSelectPaymentMethod("paypal")}
              disabled={isProcessing}
              className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                paymentMethod === "paypal"
                  ? "border-amber-600 bg-amber-50"
                  : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === "paypal" ? "border-amber-600 bg-amber-600" : "border-gray-300"
                }`}>
                  {paymentMethod === "paypal" && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-8 h-8 text-[#0070ba]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.479a.77.77 0 0 1 .762-.64h8.68a5.622 5.622 0 0 1 3.764 1.348 4.944 4.944 0 0 1 1.535 3.826 8.254 8.254 0 0 1-.827 3.609 6.807 6.807 0 0 1-2.283 2.597 6.198 6.198 0 0 1-3.395.998H10.76a.77.77 0 0 0-.762.64l-.545 3.48a.641.641 0 0 1-.633.64zm.633-2.09a.641.641 0 0 1-.633-.74l.545-3.48a.77.77 0 0 1 .762-.64h2.42a5.176 5.176 0 0 0 2.836-.831 5.673 5.673 0 0 0 1.904-2.165 6.881 6.881 0 0 0 .69-3.01c0-2.156-1.406-3.206-4.218-3.206H7.696a.641.641 0 0 0-.634.64L5.116 18.933a.641.641 0 0 0 .633.74h1.96z"/>
                      <path d="M19.314 7.576a5.173 5.173 0 0 1-.332 1.865 5.673 5.673 0 0 1-1.904 2.165 5.176 5.176 0 0 1-2.836.831H12.18a.641.641 0 0 0-.634.64l-.545 3.48a.641.641 0 0 0 .633.74h3.093a.77.77 0 0 0 .762-.64l.367-2.327a.77.77 0 0 1 .762-.64h.473a4.21 4.21 0 0 0 2.303-.671 4.612 4.612 0 0 0 1.547-1.757 5.58 5.58 0 0 0 .56-2.447c0-1.694-1.134-2.52-3.404-2.52"/>
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900">{t("payment.paypal")}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{t("payment.paypalDescription")}</p>
                </div>
              </div>
            </button>

            {/* Bank Transfer Option */}
            <button
              onClick={() => onSelectPaymentMethod("bank_transfer")}
              disabled={isProcessing}
              className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                paymentMethod === "bank_transfer"
                  ? "border-amber-600 bg-amber-50"
                  : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === "bank_transfer" ? "border-amber-600 bg-amber-600" : "border-gray-300"
                }`}>
                  {paymentMethod === "bank_transfer" && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900">{t("payment.bankTransfer")}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{t("payment.bankTransferDescription")}</p>
                </div>
              </div>
            </button>
          </div>

          {/* Payment Buttons */}
          {paymentMethod && (
            <div className="mb-6">
              {paymentMethod === "paypal" ? (
                <>
                  {!userId && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800 flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t("payment.loginRequired")}
                      </p>
                      <p className="text-sm text-red-800">
                        {t("payment.loginRequiredOr")}{" "}
                        <Link 
                          href="/auth/signup" 
                          className="font-semibold underline hover:text-red-900 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          {t("payment.signUpHere")}
                        </Link>
                      </p>
                    </div>
                  )}
                  <button
                    onClick={onPayWithPayPal}
                    disabled={isProcessing || !userId}
                    className="w-full py-4 px-6 bg-[#0070ba] hover:bg-[#003087] text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                  >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t("payment.processing")}
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.479a.77.77 0 0 1 .762-.64h8.68a5.622 5.622 0 0 1 3.764 1.348 4.944 4.944 0 0 1 1.535 3.826 8.254 8.254 0 0 1-.827 3.609 6.807 6.807 0 0 1-2.283 2.597 6.198 6.198 0 0 1-3.395.998H10.76a.77.77 0 0 0-.762.64l-.545 3.48a.641.641 0 0 1-.633.64zm.633-2.09a.641.641 0 0 1-.633-.74l.545-3.48a.77.77 0 0 1 .762-.64h2.42a5.176 5.176 0 0 0 2.836-.831 5.673 5.673 0 0 0 1.904-2.165 6.881 6.881 0 0 0 .69-3.01c0-2.156-1.406-3.206-4.218-3.206H7.696a.641.641 0 0 0-.634.64L5.116 18.933a.641.641 0 0 0 .633.74h1.96z"/>
                        <path d="M19.314 7.576a5.173 5.173 0 0 1-.332 1.865 5.673 5.673 0 0 1-1.904 2.165 5.176 5.176 0 0 1-2.836.831H12.18a.641.641 0 0 0-.634.64l-.545 3.48a.641.641 0 0 0 .633.74h3.093a.77.77 0 0 0 .762-.64l.367-2.327a.77.77 0 0 1 .762-.64h.473a4.21 4.21 0 0 0 2.303-.671 4.612 4.612 0 0 0 1.547-1.757 5.58 5.58 0 0 0 .56-2.447c0-1.694-1.134-2.52-3.404-2.52"/>
                      </svg>
                      {t("payment.payWithPayPal")}
                    </>
                  )}
                  </button>
                </>
              ) : (
                <>
                  {!userId && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800 flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t("payment.loginRequired")}
                      </p>
                      <p className="text-sm text-red-800">
                        {t("payment.loginRequiredOr")}{" "}
                        <Link 
                          href="/auth/signup" 
                          className="font-semibold underline hover:text-red-900 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          {t("payment.signUpHere")}
                        </Link>
                      </p>
                    </div>
                  )}
                  {/* Bank Details */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      {t("payment.bankDetails.title")}
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">{t("payment.bankDetails.bankName")}:</span>
                        <span className="text-gray-900 font-semibold">{t("payment.bankDetails.bankName")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">{t("payment.bankDetails.accountHolder")}:</span>
                        <span className="text-gray-900 font-semibold">{t("payment.bankDetails.accountHolder")}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-gray-700">IBAN:</span>
                        <span className="text-gray-900 font-mono font-semibold text-right">{t("payment.bankDetails.iban")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">BIC:</span>
                        <span className="text-gray-900 font-mono font-semibold">{t("payment.bankDetails.bic")}</span>
                      </div>
                      <div className="pt-3 border-t border-amber-200">
                        <p className="text-xs text-gray-600 mb-2">{t("payment.bankDetails.referenceNote")}</p>
                        <div className="bg-white rounded-lg p-3 border border-amber-200">
                          <span className="text-xs font-medium text-gray-700">{t("payment.bankDetails.reference")}:</span>
                          <span className="text-xs text-gray-500 ml-2 italic">[Voucher code will be shown after order]</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={onPayWithBankTransfer}
                    disabled={isProcessing || !userId}
                    className="w-full py-4 px-6 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-3 mb-4"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t("payment.processing")}
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        {t("payment.payWithBankTransfer")}
                      </>
                    )}
                  </button>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 flex items-start gap-2">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t("payment.bankTransferInfo")}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Secure Payment Notice */}
          {paymentMethod === "paypal" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {t("payment.securePayment")}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onBack}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("payment.back")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * ConfirmationScreen Component
 * 
 * Shows order confirmation and voucher details
 */
function ConfirmationScreen({
  amount,
  orderID,
  voucherCode,
  paymentMethod,
  onClose,
  t,
}: {
  amount: number;
  orderID: string;
  voucherCode: string;
  paymentMethod: "paypal" | "bank_transfer" | null;
  onClose: () => void;
  t: any;
}) {
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucherCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  // Calculate valid until date (12 months from now)
  const validUntil = new Date();
  validUntil.setMonth(validUntil.getMonth() + 12);
  const validUntilStr = validUntil.toLocaleDateString('de-DE', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {t("confirmation.title")}
        </h2>

        {/* Order Details */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 mb-6">
          <div className="grid gap-4 text-left">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">{t("confirmation.orderNumber")}:</span>
              <span className="font-bold text-gray-900">{orderID}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">{t("confirmation.voucherCode")}:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-600">{voucherCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 hover:bg-amber-100 rounded transition-colors"
                  title={t("confirmation.copyCode")}
                >
                  {codeCopied ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">{t("confirmation.amount")}:</span>
              <span className="font-bold text-amber-600">{amount}€</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">{t("confirmation.status")}:</span>
              <span className={`font-bold ${
                paymentMethod === "paypal" ? "text-green-600" : "text-amber-600"
              }`}>
                {paymentMethod === "paypal" ? t("confirmation.paid") : t("confirmation.pending")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">{t("confirmation.validUntil")}:</span>
              <span className="font-bold text-gray-900">{validUntilStr}</span>
            </div>
          </div>
        </div>

        {/* Bank Details for Bank Transfer */}
        {paymentMethod === "bank_transfer" && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 mb-6 text-left">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              {t("payment.bankDetails.title")}
            </h3>
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">{t("payment.bankDetails.bankName")}:</span>
                <span className="text-gray-900 font-semibold">{t("payment.bankDetails.bankName")}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">{t("payment.bankDetails.accountHolder")}:</span>
                <span className="text-gray-900 font-semibold">{t("payment.bankDetails.accountHolder")}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="font-medium text-gray-700">IBAN:</span>
                <span className="text-gray-900 font-mono font-semibold text-right">{t("payment.bankDetails.iban")}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">BIC:</span>
                <span className="text-gray-900 font-mono font-semibold">{t("payment.bankDetails.bic")}</span>
              </div>
              <div className="pt-3 border-t border-amber-200">
                <p className="text-xs text-gray-600 mb-2">{t("payment.bankDetails.referenceNote")}</p>
                <div className="bg-white rounded-lg p-3 border border-amber-200">
                  <span className="text-xs font-medium text-gray-700">{t("payment.bankDetails.reference")}:</span>
                  <span className="text-xs text-gray-900 font-mono font-semibold ml-2">{voucherCode}</span>
                </div>
              </div>
            </div>
            <div className="bg-amber-100 border border-amber-300 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                {t("payment.bankDetails.importantNote")}
              </p>
            </div>
          </div>
        )}

        {/* How to Use */}
        <div className="bg-white border-2 border-amber-200 rounded-xl p-6 mb-6 text-left">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t("confirmation.howToUse")}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {t("confirmation.useInstructions")}
          </p>
        </div>

        {/* Email Confirmation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {t("confirmation.emailConfirmation")}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
        >
          {t("close")}
        </button>
      </div>
    </div>
  );
}
