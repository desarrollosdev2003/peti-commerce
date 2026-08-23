'use client';

import React from 'react';
import { useApp } from '@/context/app-context';
import { formatCurrency } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const StatsOverview = () => {
  const { orders, commissions, currency } = useApp();

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const activeOrders = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
  const totalSlotsOpen = commissions.reduce((sum, c) => (c.active ? sum + c.slotsAvailable : sum), 0);

  const mpOrders = orders.filter((o) => o.paymentMethod === 'mercadopago');
  const polarOrders = orders.filter((o) => o.paymentMethod === 'polar');

  const mpRevenue = mpOrders.reduce((sum, o) => sum + o.total, 0);
  const polarRevenue = polarOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-wider text-neutral-900 dark:text-white">
          Estadísticas & Métricas de Negocio
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Rendimiento en vivo de tus comisiones, ingresos y pasarelas de pago.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Ingresos Totales
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatCurrency(totalRevenue, currency)}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            +18% este mes
          </p>
        </div>

        {/* Active Commissions */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              En Cola / Activas
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white">
            {activeOrders} pedidos
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {totalSlotsOpen} slots libres para nuevos encargos
          </p>
        </div>

        {/* Completed Orders */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Entregas Finalizadas
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white">
            {completedOrders} encargos
          </p>
          <p className="text-[11px] text-pink-600 dark:text-pink-400 font-semibold">
            100% satisfacción de clientes
          </p>
        </div>

        {/* Average Order Value */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Ticket Promedio
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white">
            {formatCurrency(avgOrderValue, currency)}
          </p>
          <p className="text-[11px] text-neutral-500 font-medium">
            Por encargo personalizado
          </p>
        </div>
      </div>

      {/* Payment Gateway Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mercado Pago */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-sky-500" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Mercado Pago
              </h3>
            </div>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
              {mpOrders.length} transacciones
            </span>
          </div>
          <p className="text-xl font-extrabold text-neutral-900 dark:text-white">
            {formatCurrency(mpRevenue, currency)}
          </p>
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full"
              style={{
                width: `${totalRevenue > 0 ? (mpRevenue / totalRevenue) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Polar.sh */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-purple-500" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Polar.sh (Internacional)
              </h3>
            </div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
              {polarOrders.length} transacciones
            </span>
          </div>
          <p className="text-xl font-extrabold text-neutral-900 dark:text-white">
            {formatCurrency(polarRevenue, currency)}
          </p>
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full"
              style={{
                width: `${totalRevenue > 0 ? (polarRevenue / totalRevenue) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
