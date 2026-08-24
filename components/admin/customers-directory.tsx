'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/app-context';
import { CustomerUser, Order } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Users,
  Search,
  Mail,
  MessageSquare,
  DollarSign,
  Package,
  Calendar,
  ExternalLink,
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const CustomersDirectory = () => {
  const { customers, orders, currency } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerUser | null>(null);

  // Compute metrics per customer
  const customerStats = customers.map((cust) => {
    const custOrders = orders.filter(
      (o) =>
        (o.customerId && o.customerId === cust.id) ||
        o.customerEmail.toLowerCase() === cust.email.toLowerCase() ||
        o.customerName.toLowerCase().includes(cust.name.toLowerCase())
    );

    const totalSpent = custOrders.reduce((sum, o) => sum + o.total, 0);
    const hasActiveOrder = custOrders.some((o) => o.status !== 'completed' && o.status !== 'cancelled');
    const latestOrder = custOrders[0] || null;

    return {
      ...cust,
      orders: custOrders,
      totalOrders: custOrders.length,
      totalSpent,
      hasActiveOrder,
      latestOrder,
    };
  });

  // Filtered by search term
  const filteredCustomers = customerStats.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.discord && c.discord.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalRegistered = customers.length;
  const totalRevenue = customerStats.reduce((acc, c) => acc + c.totalSpent, 0);
  const totalActiveBuyers = customerStats.filter((c) => c.hasActiveOrder).length;

  const selectedStats = selectedCustomer
    ? customerStats.find((c) => c.id === selectedCustomer.id)
    : null;

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="rounded-2xl border border-rose-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-rose-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Total Clientes Registrados
            </span>
            <Users className="h-4 w-4" />
          </div>
          <p className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            {totalRegistered}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Ingresos Totales (LTV)
            </span>
            <DollarSign className="h-4 w-4" />
          </div>
          <p className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            {formatCurrency(totalRevenue, currency)}
          </p>
        </div>

        <div className="rounded-2xl border border-purple-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-purple-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Clientes con Pedidos Activos
            </span>
            <Package className="h-4 w-4" />
          </div>
          <p className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            {totalActiveBuyers}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, email o discord..."
            className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-2.5 pl-9 pr-4 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-rose-500 focus:outline-none shadow-2xs"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
        </div>
        <span className="text-xs text-neutral-500">
          Mostrando <strong>{filteredCustomers.length}</strong> de <strong>{totalRegistered}</strong> clientes
        </span>
      </div>

      {/* Customers List / Table */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-950/60 border-b border-neutral-200 dark:border-neutral-800 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
              <tr>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4">Pedidos & Gasto</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-neutral-400">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 mb-2">
                      <Users className="h-5 w-5" />
                    </div>
                    <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                      {searchTerm ? 'No se encontraron clientes con esa búsqueda' : 'Aún no hay clientes registrados'}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5 max-w-sm mx-auto">
                      Los compradores aparecerán aquí automáticamente en cuanto se registren con Google / Discord o encarguen una comisión.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedCustomer(cust)}
                  >
                    {/* Customer Avatar & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cust.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                          alt={cust.name}
                          className="h-9 w-9 rounded-full object-cover border border-rose-200 dark:border-neutral-700 shadow-2xs"
                        />
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                            <span>{cust.name}</span>
                            {cust.totalOrders > 1 && (
                              <span className="rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 px-1.5 py-0.2 text-[9px] font-bold">
                                Frecuente
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-neutral-400">
                            Registrado: {formatDate(cust.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email & Discord */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <p className="text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                          <Mail className="h-3 w-3 text-neutral-400 shrink-0" />
                          <span className="truncate max-w-[160px]">{cust.email}</span>
                        </p>
                        {cust.discord && (
                          <p className="text-[10px] text-indigo-500 font-semibold flex items-center gap-1">
                            <span>Discord: {cust.discord}</span>
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Orders count & Spending */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <p className="font-extrabold text-rose-600 dark:text-rose-400">
                          {formatCurrency(cust.totalSpent, currency)}
                        </p>
                        <p className="text-[10px] text-neutral-500">
                          {cust.totalOrders} {cust.totalOrders === 1 ? 'encargo' : 'encargos'}
                        </p>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {cust.hasActiveOrder ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Pedido en Curso
                        </span>
                      ) : cust.totalOrders > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">
                          <CheckCircle2 className="h-3 w-3 text-neutral-400" />
                          Completado
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-400">Sin pedidos</span>
                      )}
                    </td>

                    {/* Action button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(cust);
                        }}
                        className="inline-flex items-center gap-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-500 hover:text-white px-3 py-1.5 text-[11px] font-bold text-neutral-700 dark:text-neutral-300 transition-colors"
                      >
                        <span>Ver Ficha</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && selectedStats && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-7 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header info */}
            <div className="flex items-center gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedCustomer.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                alt={selectedCustomer.name}
                className="h-14 w-14 rounded-2xl object-cover border-2 border-rose-200 dark:border-neutral-700 shadow-sm"
              />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                  Ficha de Cliente
                </span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {selectedCustomer.name}
                </h3>
                <p className="text-xs text-neutral-500">{selectedCustomer.email}</p>
                {selectedCustomer.discord && (
                  <p className="text-[11px] text-indigo-500 font-semibold mt-0.5">
                    Discord: {selectedCustomer.discord}
                  </p>
                )}
              </div>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-950 p-3.5 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-neutral-400">Total Invertido</span>
                <p className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                  {formatCurrency(selectedStats.totalSpent, currency)}
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-950 p-3.5 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-neutral-400">Encargos Totales</span>
                <p className="text-base font-extrabold text-neutral-900 dark:text-white">
                  {selectedStats.totalOrders} pedidos
                </p>
              </div>
            </div>

            {/* Orders list */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                Historial de Encargos con Peti
              </span>

              {selectedStats.orders.length === 0 ? (
                <p className="text-xs text-neutral-400 py-4 text-center">
                  Este usuario no tiene encargos registrados aún.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  {selectedStats.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-3.5 space-y-2 text-xs bg-neutral-50/50 dark:bg-neutral-950/50 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-neutral-900 dark:text-white">
                          {ord.orderNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                          ord.status === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-600'
                            : 'bg-rose-500/15 text-rose-600'
                        }`}>
                          {ord.status === 'completed' ? 'Completado' : 'En Avance'}
                        </span>
                      </div>

                      <p className="text-[11px] text-neutral-600 dark:text-neutral-300 font-medium">
                        {ord.items.map((i) => i.title).join(', ')}
                      </p>

                      <div className="pt-1.5 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          {formatCurrency(ord.total, currency)}
                        </span>
                        <Link
                          href={`/track/${ord.orderNumber.replace('#', '')}`}
                          target="_blank"
                          className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline"
                        >
                          <MessageSquare className="h-3 w-3" />
                          <span>Abrir Chat del Pedido</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Close */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-xl bg-neutral-900 dark:bg-white px-4 py-2 text-xs font-bold text-white dark:text-neutral-900"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
