'use client';

import { useEffect, useMemo } from 'react';
import type { ElementType } from 'react';
import { US, ES, BR } from 'country-flag-icons/react/3x2';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SupportedLocale } from '@/lib/i18n';

type FlagIcon = ElementType<{ className?: string; 'aria-hidden'?: boolean }>;

const languages: Array<{
  code: SupportedLocale;
  label: string;
  Flag: FlagIcon;
}> = [
  { code: 'en', label: 'English', Flag: US },
  { code: 'es', label: 'Espanol', Flag: ES },
  { code: 'pt', label: 'Portugues', Flag: BR },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('locale');
    if (stored && stored !== i18n.language) {
      void i18n.changeLanguage(stored);
    }
  }, [i18n]);

  const current = useMemo(() => {
    return (
      languages.find((lang) => i18n.language?.startsWith(lang.code)) ??
      languages[0]
    );
  }, [i18n.language]);

  const setLanguage = async (code: SupportedLocale) => {
    await i18n.changeLanguage(code);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('locale', code);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="lang-trigger">
          <current.Flag className="flag-icon" aria-hidden={true} />
          {current.code.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="lang-menu">
        {languages.map((lang) => (
          <DropdownMenuItem key={lang.code} onClick={() => setLanguage(lang.code)}>
            <lang.Flag className="flag-icon" aria-hidden={true} />
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
