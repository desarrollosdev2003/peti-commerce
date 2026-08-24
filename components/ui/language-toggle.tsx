'use client';

import React from 'react';
import { useLanguage } from '@/context/language-context';
import { Globe, Languages } from 'lucide-react';

export const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      data-testid="language-toggle"
      className="flex items-center gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold border border-rose-200/80 dark:border-neutral-800 hover:bg-rose-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer shadow-2xs hover:border-rose-300 dark:hover:border-neutral-700"
      title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
      aria-label="Cambiar idioma / Switch language"
    >
      <Languages className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
      <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider">
        {language === 'es' ? (
          <span className="flex items-center gap-0.5">
            <span>ES</span>
            <span className="text-[10px] text-neutral-400 font-normal">/ EN</span>
          </span>
        ) : (
          <span className="flex items-center gap-0.5">
            <span>EN</span>
            <span className="text-[10px] text-neutral-400 font-normal">/ ES</span>
          </span>
        )}
      </span>
    </button>
  );
};
