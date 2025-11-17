"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

/**
 * Sign In Page Component
 * 
 * Allows users to sign in to their account using email and password.
 * Includes form validation and error handling.
 */
export default function SignInPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Set page title
    document.title = "Sign In - Sponk Keramik";
  }, []);

  /**
   * Handles form submission for sign in
   * 
   * Args:
   *   e (React.FormEvent): Form event
   */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError(t("errors.signInFailed"));
      setLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(t("errors.signInFailed"));
        setLoading(false);
        return;
      }

      // Redirect to home page after successful sign in
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(t("errors.signInFailed"));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        {/* Logo and Title */}
        <div className="text-center">
          <Link href="/" className="flex justify-center mb-6">
            <Image
              src="/images/logo.png"
              alt="Sponk Keramik Logo"
              width={120}
              height={30}
              className="h-auto"
              priority
            />
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t("signInTitle")}
          </h2>
          <p className="text-gray-600">{t("signInSubtitle")}</p>
        </div>

        {/* Sign In Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t("email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t("password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-amber-600 hover:text-amber-500 transition-colors"
              >
                {t("forgotPassword")}
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              t("signInWithEmail")
            )}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-600">{t("noAccount")} </span>
            <Link
              href="/auth/signup"
              className="font-medium text-amber-600 hover:text-amber-500 transition-colors"
            >
              {t("signUpLink")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

