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
      className={`p-2 rounded-lg text-2xl transition-all hover:scale-110 hover:bg-amber-50 ${
        isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      aria-label={`Switch to ${localeNames[targetLocale]}`}
      title={`Switch to ${localeNames[targetLocale]}`}
    >
      {localeFlags[targetLocale]}
    </button>
  );
}

