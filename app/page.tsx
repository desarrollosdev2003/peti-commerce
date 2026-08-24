'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/app-context';
import { useLanguage } from '@/context/language-context';
import { Commission } from '@/lib/types';
import { ArtistHeader } from '@/components/artistree/artist-header';
import { CommissionCard } from '@/components/artistree/commission-card';
import { CommissionGridCard } from '@/components/commissions/commission-grid-card';
import { CommissionModal } from '@/components/artistree/commission-modal';
import { LayoutGrid, List, Sparkles, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const { commissions } = useApp();
  const { t, language } = useLanguage();

  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [modalInitialImageIdx, setModalInitialImageIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'artistree' | 'grid'>('artistree');

  const categories = ['all', ...Array.from(new Set(commissions.map((c) => c.category || 'General')))];

  const filteredCommissions = commissions.filter((c) => {
    if (!c.active) return false;
    if (selectedCategory === 'all') return true;
    return (c.category || 'General').toLowerCase() === selectedCategory.toLowerCase();
  });

  const handleOpenModal = (commission: Commission, imageIndex: number = 0) => {
    setSelectedCommission(commission);
    setModalInitialImageIdx(imageIndex);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Artist Profile Hero Banner */}
      <ArtistHeader />

      {/* Main Commission Storefront Area */}
      <main id="commissions-section" className="mx-auto max-w-5xl px-3.5 sm:px-6 pt-4 sm:pt-6 space-y-6 sm:space-y-8">
        
        {/* Filter & View Switcher Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-rose-100 dark:border-neutral-800 pb-3 sm:pb-4">
          
          {/* Categories horizontal list */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-sm shadow-rose-600/20'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400'
                }`}
              >
                {cat === 'all' ? (language === 'en' ? 'All Commissions' : 'Todas las Comisiones') : cat}
              </button>
            ))}
          </div>

          {/* View Mode Toggle: Artistree (Horizontal with Mosaic) vs Grid (4 cols / 2 cols) */}
          <div className="flex items-center self-end sm:self-auto gap-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1 text-xs">
            <button
              onClick={() => setViewMode('artistree')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-all ${
                viewMode === 'artistree'
                  ? 'bg-white dark:bg-neutral-900 text-rose-600 dark:text-rose-400 shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Vista estilo Artistree con mosaico"
            >
              <List className="h-3.5 w-3.5" />
              <span>Artistree</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-neutral-900 text-rose-600 dark:text-rose-400 shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Vista en cuadrícula"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Grid</span>
            </button>
          </div>

        </div>

        {/* Commissions Listing */}
        {filteredCommissions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 p-12 text-center space-y-3">
            <p className="text-sm font-semibold text-neutral-500">
              {t('catalog_no_results')}
            </p>
          </div>
        ) : viewMode === 'artistree' ? (
          /* Artistree Horizontal Cards List */
          <div className="space-y-4 sm:space-y-6">
            {filteredCommissions.map((commission) => (
              <CommissionCard
                key={commission.id}
                commission={commission}
                onOpenModal={handleOpenModal}
              />
            ))}
          </div>
        ) : (
          /* 4-Columns Desktop / 2-Columns Mobile Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredCommissions.map((commission) => (
              <CommissionGridCard
                key={commission.id}
                commission={commission}
                onOpenModal={handleOpenModal}
              />
            ))}
          </div>
        )}

        {/* Guarantee and Process info box */}
        <div className="mt-12 rounded-3xl border border-rose-100/90 dark:border-neutral-800 bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-emerald-500/10 p-6 sm:p-8 text-center space-y-3">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold tracking-wider text-neutral-900 dark:text-white">
            {language === 'en' ? 'How does the commission process work?' : '¿Cómo funciona el proceso de encargo?'}
          </h3>
          <p className="max-w-xl mx-auto text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {language === 'en' ? (
              <>
                1. Select your desired commission type and submit your briefing with visual references.
                <br />
                2. Complete secure checkout with <strong>Mercado Pago</strong> or <strong>Polar.sh (Stripe)</strong>.
                <br />
                3. Receive early sketches to review poses and enjoy 2 rounds of revisions until final high-res delivery.
              </>
            ) : (
              <>
                1. Selecciona la comisión y envía tu briefing con referencias visuales.
                <br />
                2. Realiza el pago seguro vía <strong>Mercado Pago</strong> o <strong>Polar.sh</strong>.
                <br />
                3. Recibe los primeros bocetos para validar poses y realiza 2 rondas de revisiones gratuitas hasta la entrega en alta calidad.
              </>
            )}
          </p>
        </div>

      </main>

      {/* Commission Detail & Order Form Modal */}
      <CommissionModal
        commission={selectedCommission}
        initialImageIndex={modalInitialImageIdx}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
