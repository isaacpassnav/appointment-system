'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { dictionaries, resolveLocaleFromNavigator, type Dictionary, type Locale } from '@/lib/i18n';

type LocaleContextValue = {
  locale: Locale;
  t: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  t: dictionaries.en,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    setLocale(resolveLocaleFromNavigator());
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => {
    const dict = dictionaries[locale] ?? dictionaries.en;
    return { locale, t: dict };
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  return useContext(LocaleContext);
}
