'use client';

import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { supportedLocales, type SupportedLocale } from '@/lib/i18n';

function resolveStoredLocale(): SupportedLocale | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem('locale');
  if (stored && (supportedLocales as readonly string[]).includes(stored)) {
    return stored as SupportedLocale;
  }
  return null;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = resolveStoredLocale();
    if (stored) {
      void i18n.changeLanguage(stored);
    }

    const updateLang = (lng: string) => {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lng;
      }
    };

    updateLang(i18n.language);
    i18n.on('languageChanged', updateLang);
    return () => {
      i18n.off('languageChanged', updateLang);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
