'use client';

import React, { useState } from 'react';
import { Commission, CommissionOption, UsageType } from '@/lib/types';
import { useCart } from '@/context/cart-context';
import { useApp } from '@/context/app-context';
import { useLanguage } from '@/context/language-context';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, Check, Sparkles, AlertCircle, Link2 } from 'lucide-react';

interface CommissionFormProps {
  commission: Commission;
  onSuccess?: () => void;
}

export const CommissionForm: React.FC<CommissionFormProps> = ({ commission, onSuccess }) => {
  const { addItem } = useCart();
  const { currency } = useApp();
  const { t, language } = useLanguage();

  const [usageType, setUsageType] = useState<UsageType>('personal');
  const [brief, setBrief] = useState('');
  const [references, setReferences] = useState('');
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [error, setError] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  // Calculate live price
  const basePrice = commission.priceMin;
  const commercialMultiplier = usageType === 'commercial' ? 1.5 : 1;
  
  const optionsTotal = commission.options
    .filter((opt) => selectedOptionIds.includes(opt.id))
    .reduce((sum, opt) => sum + opt.price, 0);

  const unitPrice = Math.round(basePrice * commercialMultiplier + optionsTotal);

  const toggleOption = (optId: string) => {
    setSelectedOptionIds((prev) =>
      prev.includes(optId) ? prev.filter((id) => id !== optId) : [...prev, optId]
    );
  };

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brief.trim()) {
      setError(t('modal_brief_error'));
      return;
    }

    setError('');

    const selectedOptNames = commission.options
      .filter((opt) => selectedOptionIds.includes(opt.id))
      .map((opt) => `${opt.name} (+${formatCurrency(opt.price, currency)})`);

    if (usageType === 'commercial') {
      selectedOptNames.unshift(language === 'en' ? 'Commercial License (+50%)' : 'Uso Comercial Licenciado (+50%)');
    }

    addItem({
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      commissionId: commission.id,
      title: commission.title,
      unitPrice,
      quantity: 1,
      sampleImage: commission.samples[0] || '',
      selectedOptionNames: selectedOptNames,
      commissionData: {
        usageType,
        brief,
        references,
        selectedOptions: selectedOptionIds,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
      },
    });

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleAddToCart} className="space-y-4 sm:space-y-5 text-left">
      {/* Usage Type Selector */}
      <div className="space-y-2">
        <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
          <span>{t('modal_license_type')}</span>
          <span className="text-[10px] sm:text-[11px] font-normal normal-case text-neutral-400">
            {t('modal_personal_default')}
          </span>
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setUsageType('personal')}
            className={`flex flex-col items-start p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              usageType === 'personal'
                ? 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 shadow-2xs'
                : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
              <span>{t('modal_personal_use')}</span>
              {usageType === 'personal' && <Check className="h-3.5 w-3.5 text-emerald-500" />}
            </div>
            <span className="text-[10px] sm:text-[11px] font-normal mt-0.5 text-neutral-500 dark:text-neutral-400">
              {t('modal_personal_desc')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setUsageType('commercial')}
            className={`flex flex-col items-start p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              usageType === 'commercial'
                ? 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 shadow-2xs'
                : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
              <span>{t('modal_commercial_use')}</span>
              {usageType === 'commercial' && <Check className="h-3.5 w-3.5 text-emerald-500" />}
            </div>
            <span className="text-[10px] sm:text-[11px] font-normal mt-0.5 text-neutral-500 dark:text-neutral-400">
              {t('modal_commercial_desc')}
            </span>
          </button>
        </div>
      </div>

      {/* Briefing Textarea */}
      <div className="space-y-1.5">
        <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
          <span>{t('modal_brief_label')}</span>
          <span className="text-[10px] font-normal normal-case text-rose-400">{t('modal_required')}</span>
        </label>
        <textarea
          rows={3}
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder={t('modal_brief_placeholder')}
          className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 p-3 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none transition-all resize-none"
          required
        />
      </div>

      {/* Reference Links */}
      <div className="space-y-1.5">
        <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
          <Link2 className="h-3.5 w-3.5" />
          <span>{t('modal_references_label')}</span>
        </label>
        <input
          type="text"
          value={references}
          onChange={(e) => setReferences(e.target.value)}
          placeholder={t('modal_references_placeholder')}
          className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 px-3 py-2 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none transition-all"
        />
      </div>

      {/* Additional Options / Add-ons */}
      {commission.options && commission.options.length > 0 && (
        <div className="space-y-2">
          <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {t('modal_addons_label')}
          </label>
          <div className="space-y-1.5">
            {commission.options.map((option) => {
              const isSelected = selectedOptionIds.includes(option.id);
              return (
                <label
                  key={option.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-rose-500/60 bg-rose-500/5 text-neutral-900 dark:text-white font-medium'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOption(option.id)}
                      className="h-4 w-4 rounded border-neutral-300 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <p className="font-semibold">{option.name}</p>
                      {option.description && (
                        <p className="text-[10px] text-neutral-400 font-normal">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(option.price, currency)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-2.5 text-xs text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Live Total & Add to Cart Button */}
      <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">{t('modal_estimated_total')}</span>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
            {formatCurrency(unitPrice, currency)}
          </p>
        </div>

        <button
          type="submit"
          disabled={commission.slotsAvailable <= 0}
          className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer ${
            commission.slotsAvailable <= 0
              ? 'bg-neutral-400 cursor-not-allowed opacity-60'
              : isAdded
              ? 'bg-emerald-600 scale-105'
              : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-600/20'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="h-4 w-4 animate-bounce" />
              <span>{t('modal_added_to_cart')}</span>
            </>
          ) : commission.slotsAvailable <= 0 ? (
            <span>{t('modal_no_slots')}</span>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              <span>{t('modal_add_to_cart')}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
