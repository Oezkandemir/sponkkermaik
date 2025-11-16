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

export default function LanguageSwitcher() {
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
    <button
      onClick={switchLocale}
      disabled={isPending}
      className={`px-3 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
        isPending 
          ? 'opacity-50 cursor-not-allowed text-gray-500' 
          : 'text-gray-700 hover:text-amber-800 hover:bg-amber-50 cursor-pointer'
      }`}
      aria-label={`Switch to ${localeNames[targetLocale]}`}
      title={`Switch to ${localeNames[targetLocale]}`}
    >
      <span className="flex items-center gap-1.5">
        <span className="text-base">{localeFlags[currentLocale]}</span>
        <span>{localeLabels[currentLocale]}</span>
      </span>
    </button>
  );
}

