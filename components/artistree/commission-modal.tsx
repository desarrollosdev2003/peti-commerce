'use client';

import React, { useState } from 'react';
import { Commission } from '@/lib/types';
import { CommissionForm } from './commission-form';
import { useApp } from '@/context/app-context';
import { useLanguage } from '@/context/language-context';
import { formatCurrency } from '@/lib/utils';
import { X, ChevronLeft, ChevronRight, Clock, Sparkles } from 'lucide-react';

interface CommissionModalProps {
  commission: Commission | null;
  initialImageIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const CommissionModal: React.FC<CommissionModalProps> = ({
  commission,
  initialImageIndex = 0,
  isOpen,
  onClose,
}) => {
  const { currency } = useApp();
  const { t } = useLanguage();
  const [activeImgIndex, setActiveImgIndex] = useState(initialImageIndex);

  if (!isOpen || !commission) return null;

  const samples = commission.samples && commission.samples.length > 0 ? commission.samples : [];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : samples.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev < samples.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-3xl border border-rose-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-40 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-black/60 sm:bg-neutral-100 sm:dark:bg-neutral-800 text-white sm:text-neutral-600 sm:dark:text-neutral-300 hover:bg-black/80 sm:hover:bg-neutral-200 transition-colors shadow-lg backdrop-blur-xs cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Modal Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          
          {/* Left Column: Image Carousel / Gallery */}
          <div className="md:col-span-6 p-3 sm:p-6 bg-rose-50/30 dark:bg-neutral-950/60 flex flex-col justify-between border-b md:border-b-0 md:border-r border-rose-100 dark:border-neutral-800">
            {/* Main Featured Image */}
            <div className="relative aspect-4/3 sm:aspect-square w-full max-h-64 sm:max-h-none overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-800 shadow-inner group mx-auto">
              {samples[activeImgIndex] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={samples[activeImgIndex]}
                  alt={`${commission.title} preview`}
                  className="h-full w-full object-cover object-center transition-all duration-300"
                />
              )}

              {/* Prev / Next Arrows */}
              {samples.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-xs"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-xs"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              <div className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-white backdrop-blur-xs">
                {activeImgIndex + 1} / {samples.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {samples.length > 1 && (
              <div className="mt-3 sm:mt-4 flex sm:grid grid-cols-6 gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {samples.map((thumb, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    className={`relative h-12 w-12 sm:h-auto sm:aspect-square shrink-0 sm:shrink overflow-hidden rounded-lg border-2 transition-all ${
                      activeImgIndex === idx
                        ? 'border-rose-500 scale-105 shadow-md'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumb} alt="thumb" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Commission Form */}
          <div className="md:col-span-6 p-4 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Header Info */}
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-wider text-neutral-900 dark:text-white">
                  {commission.title}
                </h2>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {commission.description}
                </p>
              </div>

              {/* Badges Line */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                <span className="rounded-full bg-rose-500/10 px-2.5 py-0.8 font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  {commission.priceMax
                    ? `${formatCurrency(commission.priceMin, currency)} - ${formatCurrency(commission.priceMax, currency)}`
                    : formatCurrency(commission.priceMin, currency)}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/10 px-2 py-0.8 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {t('modal_slots_count', { count: commission.slotsAvailable })}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-neutral-100 dark:bg-neutral-800 px-2 py-0.8 text-neutral-600 dark:text-neutral-300 font-medium">
                  <Clock className="h-3 w-3 text-neutral-400" />
                  {t('modal_days_count', { days: commission.deliveryDays })}
                </span>
              </div>

              {/* Guidelines / Additional Info */}
              {commission.additionalInfo && commission.additionalInfo.length > 0 && (
                <div className="mt-3.5 rounded-xl bg-rose-50/50 dark:bg-neutral-800/50 p-3 text-xs text-neutral-600 dark:text-neutral-400 space-y-1 border border-rose-100 dark:border-neutral-700/60">
                  <p className="font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1 text-[10px] uppercase tracking-wider">
                    <Sparkles className="h-3 w-3 text-rose-500" />
                    {t('modal_conditions')}
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5 text-[10px] sm:text-[11px]">
                    {commission.additionalInfo.map((info, i) => (
                      <li key={i}>{info}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Order Form */}
              <div className="mt-5">
                <CommissionForm commission={commission} onSuccess={onClose} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
