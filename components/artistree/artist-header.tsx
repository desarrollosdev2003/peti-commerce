'use client';

import React from 'react';
import { Star, ShieldCheck, CheckCircle2, Globe } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { useLanguage } from '@/context/language-context';

export const ArtistHeader = () => {
  const { artist, commissions } = useApp();
  const { t, language } = useLanguage();

  const totalSlots = commissions.reduce((sum, c) => (c.active ? sum + c.slotsAvailable : sum), 0);

  const displayBio =
    language === 'en'
      ? 'Digital Artist & Character Designer. Commissions Open for Anime, Furry, Chibi, VTuber Assets & Emotes. Fast turnaround with direct chat!'
      : artist.bio;

  return (
    <div className="relative mx-auto w-full max-w-4xl pt-10 sm:pt-12 pb-4 sm:pb-6 px-3 sm:px-4">
      {/* Outer Card Container */}
      <div className="relative rounded-3xl border border-rose-100/90 bg-white/95 p-4 pt-14 sm:p-8 sm:pt-18 text-center shadow-xs dark:border-neutral-800 dark:bg-neutral-900/95 backdrop-blur-md transition-all">
        
        {/* Floating Centered Avatar */}
        <div className="absolute -top-10 sm:-top-12 left-1/2 -translate-x-1/2">
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-white dark:border-neutral-900 shadow-lg overflow-hidden bg-gradient-to-tr from-rose-400 via-pink-400 to-emerald-400 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={artist.avatar}
              alt={artist.name}
              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute bottom-0 right-0 h-4.5 w-4.5 sm:h-5 sm:w-5 rounded-full border-2 border-white dark:border-neutral-900 bg-emerald-500 flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
            </div>
          </div>
        </div>

        {/* Artist Name & Handle */}
        <div className="space-y-0.5 sm:space-y-1">
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-wider text-neutral-900 dark:text-white flex items-center justify-center gap-1.5">
            <span>{artist.name}</span>
            <CheckCircle2 className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-rose-500 fill-rose-500/20" />
          </h1>
          <p className="text-[11px] sm:text-xs font-semibold text-rose-400/80 dark:text-rose-400/70">
            {artist.handle}
          </p>
        </div>

        {/* Bio */}
        <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-xs sm:text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 font-medium">
          {displayBio}
        </p>

        {/* Trust Badges & Metrics */}
        <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 text-[11px] sm:text-xs font-medium text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.8 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-amber-500 text-amber-500" />
            <span className="font-bold">{artist.rating}</span>
            <span className="text-[10px] opacity-80">({t('artist_reviews', { count: artist.reviewsCount })})</span>
          </div>

          <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.8 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{t('artist_open_slots', { count: totalSlots })}</span>
          </div>

          <div className="flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.8 text-rose-700 dark:text-rose-300 border border-rose-500/20">
            <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500" />
            <span>{t('artist_secure_payments')}</span>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-3 sm:pt-4 border-t border-rose-100/60 dark:border-neutral-800/80">
          {artist.socialLinks.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 hover:border-rose-500 hover:text-rose-600 dark:hover:border-rose-500 dark:hover:text-rose-400 transition-colors"
            >
              <Globe className="h-3 w-3" />
              <span>{link.label}</span>
            </a>
          ))}
        </div>

      </div>
    </div>
  );
};
