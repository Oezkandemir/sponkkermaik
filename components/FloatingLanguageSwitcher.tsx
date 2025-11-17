"use client";

import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { type Locale } from '@/i18n';

const localeFlags: Record<Locale, string> = {
  de: '🇩🇪',
  en: '🇬🇧'
};

const localeNames: Record<Locale, string> = {
  de: 'Deutsch',
  en: 'English'
};

const localeLabels: Record<Locale, string> = {
  de: 'Sprache',
  en: 'Language'
};

/**
 * Floating Language Switcher Component
 * 
 * A floating language switcher that appears below the header,
 * positioned above the "Gutschein kaufen" button.
 * Visible on all pages.
 */
export default function FloatingLanguageSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = (params.locale as Locale) || 'de';
  
  // Zeige immer die andere Sprache
  const targetLocale: Locale = currentLocale === 'de' ? 'en' : 'de';

  const switchLocale = () => {
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname, params },
        { locale: targetLocale }
      );
    });
  };

  return (
    <div className="fixed top-[100px] md:top-[90px] left-0 right-0 z-40 flex justify-center pointer-events-none">
      <button
        onClick={switchLocale}
        disabled={isPending}
        className={`pointer-events-auto px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-lg backdrop-blur-md border border-white/20 ${
          isPending 
            ? 'opacity-50 cursor-not-allowed bg-gray-100/80 text-gray-500' 
            : 'bg-white/90 text-gray-700 hover:text-amber-800 hover:bg-amber-50/90 hover:shadow-xl hover:scale-105 cursor-pointer'
        }`}
        aria-label={`Switch to ${localeNames[targetLocale]}`}
        title={`Switch to ${localeNames[targetLocale]}`}
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">{localeFlags[currentLocale]}</span>
          <span className="font-semibold">{localeLabels[currentLocale]}</span>
          <span className="text-xs opacity-70">→</span>
          <span className="text-lg">{localeFlags[targetLocale]}</span>
        </span>
      </button>
    </div>
  );
}

