'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/language-context';
import { useApp } from '@/context/app-context';
import { Globe, Check, ChevronDown, Coins, Languages } from 'lucide-react';

export const PreferencesDropdown = () => {
  const { language, setLanguage } = useLanguage();
  const { currency, setCurrency } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        data-testid="language-toggle"
        className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold border border-rose-200/80 dark:border-neutral-800 hover:bg-rose-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer shadow-2xs hover:border-rose-300 dark:hover:border-neutral-700 whitespace-nowrap shrink-0"
        title={language === 'es' ? 'Cambiar idioma y moneda' : 'Change language & currency'}
        aria-label="Selector de idioma y moneda"
        aria-expanded={isOpen}
      >
        <Globe className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
        <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
          <span>{language.toUpperCase()}</span>
          <span className="text-neutral-300 dark:text-neutral-600">•</span>
          <span className="text-rose-600 dark:text-rose-400">{currency}</span>
        </span>
        <ChevronDown className={`h-3 w-3 text-neutral-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-rose-500' : ''}`} />
      </button>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2 shadow-2xl space-y-2 animate-in fade-in zoom-in-95 duration-150 z-50">
          
          {/* Section 1: Language */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 px-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              <Languages className="h-3 w-3 text-rose-500" />
              <span>{language === 'en' ? 'Language' : 'Idioma'}</span>
            </div>

            <button
              onClick={() => {
                setLanguage('es');
                setIsOpen(false);
              }}
              data-testid="lang-option-es"
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                language === 'es'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>🇪🇸</span>
                <span>Español</span>
              </span>
              {language === 'es' && <Check className="h-3.5 w-3.5 text-rose-500" />}
            </button>

            <button
              onClick={() => {
                setLanguage('en');
                setIsOpen(false);
              }}
              data-testid="lang-option-en"
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                language === 'en'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>🇺🇸</span>
                <span>English</span>
              </span>
              {language === 'en' && <Check className="h-3.5 w-3.5 text-rose-500" />}
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-neutral-100 dark:border-neutral-800" />

          {/* Section 2: Currency */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 px-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              <Coins className="h-3 w-3 text-emerald-500" />
              <span>{language === 'en' ? 'Currency' : 'Moneda'}</span>
            </div>

            <button
              onClick={() => {
                setCurrency('USD');
                setIsOpen(false);
              }}
              data-testid="currency-option-usd"
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                currency === 'USD'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">$</span>
                <span>USD (Dólares)</span>
              </span>
              {currency === 'USD' && <Check className="h-3.5 w-3.5 text-emerald-500" />}
            </button>

            <button
              onClick={() => {
                setCurrency('ARS');
                setIsOpen(false);
              }}
              data-testid="currency-option-ars"
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                currency === 'ARS'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">$</span>
                <span>ARS (Pesos Arg.)</span>
              </span>
              {currency === 'ARS' && <Check className="h-3.5 w-3.5 text-emerald-500" />}
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
