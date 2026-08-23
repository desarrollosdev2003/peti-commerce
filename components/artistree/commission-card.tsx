'use client';

import React, { useState } from 'react';
import { Commission } from '@/lib/types';
import { SampleMosaic } from './sample-mosaic';
import { useApp } from '@/context/app-context';
import { formatCurrency } from '@/lib/utils';
import { ChevronDown, ChevronUp, Truck, ArrowRight, ShoppingBag } from 'lucide-react';

interface CommissionCardProps {
  commission: Commission;
  onOpenModal: (commission: Commission, imageIndex?: number) => void;
}

export const CommissionCard: React.FC<CommissionCardProps> = ({ commission, onOpenModal }) => {
  const { currency } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  const priceText = commission.priceMax
    ? `${formatCurrency(commission.priceMin, currency)} - ${formatCurrency(commission.priceMax, currency)}`
    : formatCurrency(commission.priceMin, currency);

  return (
    <div className="group relative rounded-3xl border border-neutral-200/90 bg-white p-3.5 sm:p-5 shadow-xs transition-all duration-300 hover:border-rose-400/80 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/90">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-start">
        
        {/* Left Column: Sample Mosaic Collage (2x3) */}
        <div className="md:col-span-5 lg:col-span-5 w-full">
          <SampleMosaic
            samples={commission.samples}
            title={commission.title}
            onSelectImage={(idx) => onOpenModal(commission, idx)}
          />
        </div>

        {/* Right Column: Title, Badges, Expandable Info & Action */}
        <div className="md:col-span-7 lg:col-span-7 flex flex-col justify-between h-full space-y-3 sm:space-y-4">
          <div>
            {/* Title and Pink/Rose Price Pill */}
            <div className="flex items-start justify-between gap-2.5">
              <h3
                onClick={() => onOpenModal(commission, 0)}
                className="text-base sm:text-lg font-bold tracking-wider text-neutral-900 dark:text-white hover:text-rose-500 dark:hover:text-rose-400 cursor-pointer transition-colors leading-snug"
              >
                {commission.title}
              </h3>
              
              {/* Pink Price Badge with reactive currency */}
              <div className="shrink-0 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 px-2.5 py-1 text-xs font-extrabold text-white shadow-xs">
                {priceText}
              </div>
            </div>

            {/* Badges: Slots and Delivery Time (Green / Emerald Accents) */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
              <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.8 font-semibold ${
                commission.slotsAvailable > 0
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${commission.slotsAvailable > 0 ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                <span>{commission.slotsAvailable} slots available</span>
              </span>

              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2 py-0.8 font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <Truck className="h-3 w-3" />
                <span>{commission.deliveryDays} days</span>
              </span>
            </div>

            {/* Additional Information Expand Section */}
            <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Additional Information:
                </span>
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center gap-1 rounded-md bg-rose-50 dark:bg-neutral-800 px-2 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              </div>

              {/* Collapsible Content */}
              <div className={`mt-2 space-y-1 text-xs text-neutral-600 dark:text-neutral-400 transition-all ${
                isExpanded ? 'block' : 'line-clamp-2'
              }`}>
                {commission.additionalInfo && commission.additionalInfo.map((info, idx) => (
                  <p key={idx} className="leading-relaxed text-[11px] sm:text-xs">
                    {info}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <span className="text-[11px] text-neutral-400 font-medium hidden sm:inline">
              Incluye 2 revisiones de boceto
            </span>

            <button
              type="button"
              onClick={() => onOpenModal(commission, 0)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition-all active:scale-95 group/btn"
            >
              <ShoppingBag className="h-4 w-4 text-white shrink-0" />
              <span>Solicitar Comisión</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
