"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Newsletter Signup Component
 * 
 * Allows users to subscribe to the newsletter with email validation.
 * Sends confirmation email via Resend API.
 */
export default function NewsletterSignup() {
  const t = useTranslations("newsletter");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  /**
   * Handles newsletter subscription
   */
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: "error", text: t("invalidEmail") });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show migration message if table doesn't exist
        if (data.migrationRequired) {
          throw new Error(
            data.error + " Migration: " + data.migrationFile
          );
        }
        throw new Error(data.error || t("subscriptionFailed"));
      }

      setMessage({ type: "success", text: t("subscriptionSuccess") });
      setEmail("");
    } catch (err) {
      console.error("Error subscribing to newsletter:", err);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : t("subscriptionFailed"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 border border-gray-200">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
          <span className="text-3xl">📧</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          {t("title")}
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          {t("description")}
        </p>
      </div>

      <form onSubmit={handleSubscribe} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            required
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-amber-700 text-white font-bold rounded-lg hover:bg-amber-800 active:bg-amber-900 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? t("subscribing") : t("subscribe")}
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}

