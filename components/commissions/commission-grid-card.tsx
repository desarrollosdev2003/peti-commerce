'use client';

import React from 'react';
import { Commission } from '@/lib/types';
import { useApp } from '@/context/app-context';
import { useLanguage } from '@/context/language-context';
import { formatCurrency } from '@/lib/utils';
import { Clock, ArrowRight } from 'lucide-react';

interface CommissionGridCardProps {
  commission: Commission;
  onOpenModal: (commission: Commission, imageIndex?: number) => void;
}

export const CommissionGridCard: React.FC<CommissionGridCardProps> = ({ commission, onOpenModal }) => {
  const { currency } = useApp();
  const { language } = useLanguage();

  const mainSample = commission.samples[0] || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80';
  const priceDisplay = commission.priceMax
    ? `${formatCurrency(commission.priceMin, currency)} - ${formatCurrency(commission.priceMax, currency)}`
    : formatCurrency(commission.priceMin, currency);

  return (
    <div
      onClick={() => onOpenModal(commission, 0)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-rose-400/80 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 cursor-pointer"
    >
      {/* Thumbnail Image */}
      <div className="relative aspect-4/3 sm:aspect-square w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mainSample}
          alt={commission.title}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Floating Pink Price Pill with reactive currency */}
        <div className="absolute top-2 right-2 rounded-md sm:rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold text-white shadow-md">
          {priceDisplay}
        </div>

        {/* Slots Badge */}
        <div className="absolute bottom-2 left-2 rounded-md bg-neutral-900/85 backdrop-blur-xs px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-white">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1" />
          {commission.slotsAvailable} {language === 'en' ? 'slots' : 'cupos'}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-4 space-y-2">
        <div>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">
            {commission.category || 'Commission'}
          </span>
          <h4 className="mt-0.5 line-clamp-2 text-xs sm:text-sm font-bold tracking-wider text-neutral-900 dark:text-white group-hover:text-rose-500 transition-colors leading-snug">
            {commission.title}
          </h4>
        </div>

        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {commission.deliveryDays}{language === 'en' ? 'd turnaround' : 'd entrega'}
          </span>
          <span className="flex items-center gap-0.5 font-bold text-rose-600 dark:text-rose-400 group-hover:translate-x-0.5 transition-transform">
            {language === 'en' ? 'Order' : 'Pedir'}
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
