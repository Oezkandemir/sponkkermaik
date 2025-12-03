"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";

/**
 * Newsletter Unsubscribe Page
 * 
 * Allows users to unsubscribe from the newsletter by clicking the link in emails.
 */
export default function NewsletterUnsubscribePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("newsletter");
  const [email, setEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error" | "not-found">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    
    if (!emailParam) {
      setStatus("not-found");
      setMessage("Keine E-Mail-Adresse angegeben.");
      return;
    }

    setEmail(decodeURIComponent(emailParam));
    handleUnsubscribe(decodeURIComponent(emailParam));
  }, [searchParams]);

  /**
   * Handles the unsubscribe process
   */
  const handleUnsubscribe = async (emailAddress: string) => {
    try {
      const response = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailAddress }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Abmelden");
      }

      setStatus("success");
      setMessage("Sie haben sich erfolgreich vom Newsletter abgemeldet.");
    } catch (err) {
      console.error("Error unsubscribing:", err);
      setStatus("error");
      setMessage(
        err instanceof Error
          ? err.message
          : "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with Logo */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-8 text-center">
          <div className="relative w-full max-w-xs mx-auto h-24">
            <Image
              src="/images/emaillogo.webp"
              alt="Sponk Keramik Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          {status === "loading" && (
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-amber-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Bitte warten Sie...</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-green-600"
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                ✓ Erfolgreich abgemeldet
              </h1>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium mb-2">
                  Ihre Abmeldung wurde erfolgreich bearbeitet.
                </p>
                {email && (
                  <p className="text-sm text-green-700">
                    Die E-Mail-Adresse <strong>{email}</strong> wurde vom Newsletter abgemeldet.
                  </p>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Was bedeutet das?</strong>
                </p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Sie erhalten ab sofort keine Newsletter-E-Mails mehr von Sponk Keramik</li>
                  <li>Ihre E-Mail-Adresse bleibt in unserem System gespeichert, wird aber nicht mehr für Newsletter verwendet</li>
                  <li>Sie können sich jederzeit wieder anmelden, wenn Sie möchten</li>
                </ul>
              </div>
              <div className="space-y-3">
                <Link
                  href="/"
                  className="inline-block w-full px-6 py-3 bg-amber-700 text-white font-bold rounded-lg hover:bg-amber-800 transition-colors"
                >
                  Zur Startseite
                </Link>
                <p className="text-xs text-gray-500">
                  Falls Sie Fragen haben, können Sie uns jederzeit kontaktieren.
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Fehler beim Abmelden
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={() => email && handleUnsubscribe(email)}
                  className="w-full px-6 py-3 bg-amber-700 text-white font-bold rounded-lg hover:bg-amber-800 transition-colors"
                >
                  Erneut versuchen
                </button>
                <Link
                  href="/kontakt-sponk-keramik"
                  className="block w-full px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors text-center"
                >
                  Kontakt aufnehmen
                </Link>
              </div>
            </div>
          )}

          {status === "not-found" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Ungültiger Link
              </h1>
              <p className="text-gray-600 mb-6">
                {message || "Der Abmelde-Link ist ungültig oder fehlerhaft."}
              </p>
              <Link
                href="/kontakt-sponk-keramik"
                className="inline-block px-6 py-3 bg-amber-700 text-white font-bold rounded-lg hover:bg-amber-800 transition-colors"
              >
                Kontakt aufnehmen
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            Sponk Keramik • Fürstenplatz 15, 40215 Düsseldorf
          </p>
        </div>
      </div>
    </div>
  );
}

