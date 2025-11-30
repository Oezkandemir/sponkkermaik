"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

/**
 * Sign Up Page Component
 * 
 * Allows users to create a new account using email and password.
 * Includes form validation, password confirmation, and error handling.
 */
export default function SignUpPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Set page title
    document.title = "Sign Up - Sponk Keramik";
  }, []);

  /**
   * Handles form submission for sign up
   * 
   * Args:
   *   e (React.FormEvent): Form event
   */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!email || !password || !confirmPassword) {
      setError(t("errors.signUpFailed"));
      setLoading(false);
      return;
    }

    // Reason: Email validation to ensure proper format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t("errors.invalidEmail"));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t("errors.passwordTooShort"));
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t("errors.passwordsDontMatch"));
      setLoading(false);
      return;
    }

    try {
      // Reason: Get the correct site URL for email redirects
      // Always use production URL for email redirects to avoid localhost issues
      const getRedirectUrl = () => {
        // Check if we're in development
        const isDevelopment = typeof window !== 'undefined' && 
          (window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('localhost'));
        
        if (isDevelopment) {
          // In development, use localhost
          return `${window.location.origin}/auth/callback`;
        }
        
        // In production, always use the production URL
        // This ensures emails redirect to the correct domain, not localhost
        const productionUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sponkkeramik.de';
        return `${productionUrl}/auth/callback`;
      };

      const redirectUrl = getRedirectUrl();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (signUpError) {
        // Reason: Check for common errors like email already exists
        if (signUpError.message.includes("already registered")) {
          setError(t("errors.emailAlreadyExists"));
        } else {
          setError(t("errors.signUpFailed"));
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      setShowResend(true);
      
      // Don't auto-redirect, let user resend email if needed
    } catch (err) {
      setError(t("errors.signUpFailed"));
      setLoading(false);
    }
  };

  /**
   * Handles resending confirmation email
   */
  const handleResendEmail = async () => {
    if (!email) return;
    
    setResending(true);
    setError("");
    
    try {
      const getRedirectUrl = () => {
        const isDevelopment = typeof window !== 'undefined' && 
          (window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('localhost'));
        
        if (isDevelopment) {
          return `${window.location.origin}/auth/callback`;
        }
        
        const productionUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sponkkeramik.de';
        return `${productionUrl}/auth/callback`;
      };

      const redirectUrl = getRedirectUrl();

      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (resendError) {
        setError(t("errors.resendFailed"));
        setResending(false);
        return;
      }

      setSuccess(true);
      setResending(false);
      setError("");
    } catch (err) {
      setError(t("errors.resendFailed"));
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t("success.signUpSuccess")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("success.checkEmail")}
          </p>
          
          {showResend && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                {t("resendEmail.notReceived")}
              </p>
              <button
                onClick={handleResendEmail}
                disabled={resending}
                className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? t("resendEmail.sending") : t("resendEmail.resend")}
              </button>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
          )}
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              href="/auth/signin"
              className="text-amber-600 hover:text-amber-700 font-medium text-sm"
            >
              {t("backToSignIn")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            {t("signUpTitle")}
          </h2>
          <p className="text-gray-600">{t("signUpSubtitle")}</p>
        </div>

        {/* Sign Up Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("errors.passwordTooShort")}
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t("confirmPassword")}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
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
              t("signUpWithEmail")
            )}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-600">{t("hasAccount")} </span>
            <Link
              href="/auth/signin"
              className="font-medium text-amber-600 hover:text-amber-500 transition-colors"
            >
              {t("signInLink")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

