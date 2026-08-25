'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import {
  Search,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Clock,
  MessageSquare,
  ArrowRight,
  Package,
  User,
  Lock,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function TrackSearchPage() {
  const router = useRouter();
  const { orders } = useApp();
  const { user, isAdmin, setIsAuthModalOpen } = useAuth();
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Strict privacy: only show orders that belong to the logged-in user (or admin)
  const userOrders = user
    ? orders.filter(
        (o) =>
          (o.customerId && o.customerId === user.id) ||
          (o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase()) ||
          isAdmin ||
          user.role === 'admin'
      )
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = searchTerm.trim().replace('#', '');
    if (!cleanQuery) {
      setError(language === 'en' ? 'Please enter an order number.' : 'Por favor ingresa un número de pedido.');
      return;
    }

    const isEmailQuery = cleanQuery.includes('@');

    // If searching by email while unauthenticated, require logging in or using exact order number
    if (isEmailQuery && (!user || (!isAdmin && user.email.toLowerCase() !== cleanQuery.toLowerCase()))) {
      setError(
        language === 'en'
          ? 'For privacy and security, please sign in to search orders by email, or enter your exact order number (e.g. PETI-1234).'
          : 'Por privacidad y seguridad, inicia sesión para consultar por correo o ingresa tu número de pedido exacto (ej: PETI-1234).'
      );
      return;
    }

    const found = orders.find((o) => {
      const isOrderNumMatch =
        o.orderNumber.replace('#', '').toLowerCase() === cleanQuery.toLowerCase() ||
        o.id.toLowerCase() === cleanQuery.toLowerCase();
      if (isOrderNumMatch) return true;

      if (isEmailQuery && user && (isAdmin || user.email.toLowerCase() === cleanQuery.toLowerCase())) {
        return o.customerEmail.toLowerCase() === cleanQuery.toLowerCase();
      }
      return false;
    });

    if (found) {
      router.push(`/track/${found.orderNumber.replace('#', '')}`);
    } else {
      setError(
        language === 'en'
          ? `Could not find any order with code "${searchTerm}". Please verify your order number.`
          : `No encontramos ningún encargo con el código "${searchTerm}". Verifica tu número de pedido.`
      );
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
      {/* Return button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-rose-500 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>{language === 'en' ? 'Back to Store' : 'Volver a la Tienda'}</span>
      </Link>

      {/* Header Banner */}
      <div className="rounded-3xl border border-rose-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-10 text-center shadow-xs space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
          <Package className="h-6 w-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-neutral-900 dark:text-white">
          {t('track_title')}
        </h1>
        <p className="max-w-md mx-auto text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          {language === 'en'
            ? 'Enter your private order number (e.g. #PETI-8901) to track progress and chat with Peti.'
            : 'Ingresa tu número de pedido privado (ej: #PETI-8901) para ver el avance y chatear con Peti.'}
        </p>

        {/* Search Bar Form */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto pt-4 space-y-3">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setError('');
              }}
              placeholder={language === 'en' ? 'e.g. #PETI-8901' : 'ej: #PETI-8901'}
              className="w-full rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 py-3.5 pl-11 pr-24 text-xs sm:text-sm font-mono text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none transition-all shadow-inner"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition-all active:scale-95 cursor-pointer"
            >
              {language === 'en' ? 'Search' : 'Buscar'}
            </button>
          </div>

          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
              {error}
            </p>
          )}
        </form>

        {/* Guest Sign In Callout */}
        {!user && (
          <div className="pt-2">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-rose-500 transition-colors font-medium cursor-pointer"
            >
              <Lock className="h-3 w-3" />
              <span>
                {language === 'en'
                  ? 'Sign in to see all your orders automatically'
                  : 'Inicia sesión para ver todos tus pedidos automáticamente'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Orders List ONLY shown for the authenticated user's own orders */}
      {user && userOrders.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block text-center sm:text-left">
            {language === 'en' ? 'Your Personal Orders' : 'Tus Encargos Personales'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userOrders.map((ord) => (
              <Link
                key={ord.id}
                href={`/track/${ord.orderNumber.replace('#', '')}`}
                className="flex items-center justify-between p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-rose-500 hover:shadow-md transition-all group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                      {ord.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ord.status === 'completed'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : ord.status === 'in_review'
                          ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                          : ord.status === 'in_progress'
                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {ord.status === 'completed'
                        ? language === 'en'
                          ? 'Completed'
                          : 'Completado'
                        : ord.status === 'in_review'
                        ? language === 'en'
                          ? 'In Review'
                          : 'En Revisión'
                        : ord.status === 'in_progress'
                        ? language === 'en'
                          ? 'In Progress'
                          : 'En Proceso'
                        : language === 'en'
                        ? 'Pending'
                        : 'Pendiente'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    {ord.customerName} • {ord.items[0]?.title}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition-transform">
                  <MessageSquare className="h-4 w-4" />
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
