"use client";

import { useState } from "react";

interface VoucherReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherId: string;
  customerEmail: string;
  customerName: string;
  voucherCode: string;
  voucherValue: number;
  validUntil: string;
  onSuccess?: () => void;
}

/**
 * Voucher Reply Modal Component
 * 
 * Allows admins to send email replies about vouchers.
 * 
 * Args:
 *   isOpen: Whether the modal is open
 *   onClose: Function to close the modal
 *   voucherId: ID of the voucher
 *   customerEmail: Customer's email address
 *   customerName: Customer's name
 *   voucherCode: Voucher code
 *   voucherValue: Voucher value in EUR
 *   validUntil: Valid until date
 *   onSuccess: Callback when reply is sent successfully
 */
export default function VoucherReplyModal({
  isOpen,
  onClose,
  voucherId,
  customerEmail,
  customerName,
  voucherCode,
  voucherValue,
  validUntil,
  onSuccess,
}: VoucherReplyModalProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  /**
   * Handles sending the reply
   */
  const handleSend = async () => {
    if (!message.trim()) {
      setError("Bitte geben Sie eine Nachricht ein.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = await fetch("/api/vouchers/send-reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voucherId,
          message: message.trim(),
          customerEmail,
          customerName,
          voucherCode,
          voucherValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.error || "Fehler beim Senden der Antwort";
        if (data.details) {
          errorMessage = `${errorMessage}\n\nDetails: ${data.details}`;
        }
        if (data.code) {
          errorMessage += `\nFehlercode: ${data.code}`;
        }
        throw new Error(errorMessage);
      }

      // Success - reset form and close modal
      setMessage("");
      setError(null);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Error sending reply:", err);
      setError(err instanceof Error ? err.message : "Fehler beim Senden der Antwort");
    } finally {
      setSending(false);
    }
  };

  /**
   * Handles closing the modal
   */
  const handleClose = () => {
    if (!sending) {
      setMessage("");
      setError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Antwort senden</h2>
            <button
              onClick={handleClose}
              disabled={sending}
              className="text-white hover:text-gray-200 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Voucher Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Gutschein-Details</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Kunde:</span> {customerName}</p>
              <p><span className="font-medium">E-Mail:</span> {customerEmail}</p>
              <p><span className="font-medium">Gutschein-Code:</span> <strong className="font-mono">{voucherCode}</strong></p>
              <p><span className="font-medium">Wert:</span> {voucherValue}€</p>
              <p><span className="font-medium">Gültig bis:</span> {new Date(validUntil).toLocaleDateString("de-DE", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</p>
            </div>
          </div>

          {/* Message Input */}
          <div className="mb-4">
            <label htmlFor="voucher-reply-message" className="block text-sm font-medium text-gray-700 mb-2">
              Ihre Antwort <span className="text-red-500">*</span>
            </label>
            <textarea
              id="voucher-reply-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              disabled={sending}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Schreiben Sie hier Ihre Antwort an den Kunden..."
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <p className="whitespace-pre-wrap">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleClose}
              disabled={sending}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Wird gesendet...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Senden
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}




