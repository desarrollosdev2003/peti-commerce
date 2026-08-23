'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useApp } from '@/context/app-context';
import { formatCurrency } from '@/lib/utils';
import { CheckoutModal } from '@/components/checkout/checkout-modal';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';

export const CartSheet = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, clearCart, subtotal } = useCart();
  const { currency } = useApp();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isCartOpen) return null;

  const total = subtotal;

  const handleStartCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const handleGoToCatalog = () => {
    setIsCartOpen(false);
    if (pathname === '/') {
      const el = document.getElementById('commissions-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 350, behavior: 'smooth' });
      }
    } else {
      router.push('/#commissions-section');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
        <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
          <div
            className="w-screen max-w-full sm:max-w-md border-l border-rose-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-neutral-800 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold tracking-wider text-neutral-900 dark:text-white">
                    Carrito de Comisiones
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400">
                    {items.length} {items.length === 1 ? 'encargo' : 'encargos'} añadidos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[11px] font-semibold text-neutral-400 hover:text-rose-500 transition-colors px-2 py-1"
                  >
                    Vaciar
                  </button>
                )}
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 sm:space-y-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center space-y-3 py-12">
                  <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-neutral-900 text-rose-400">
                    <ShoppingBag className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Tu carrito está vacío
                  </h4>
                  <p className="max-w-xs text-xs text-neutral-500 dark:text-neutral-400">
                    Explora las comisiones disponibles en el catálogo, personaliza tu briefing y agrégalas aquí.
                  </p>
                  <button
                    onClick={handleGoToCatalog}
                    className="mt-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer active:scale-95 shadow-md shadow-rose-600/20"
                  >
                    Ver Catálogo
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="relative rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 p-3.5 space-y-2.5 shadow-2xs"
                  >
                    {/* Top Row: Thumbnail + Title + Price */}
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.sampleImage}
                        alt={item.title}
                        className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl object-cover border border-neutral-200 dark:border-neutral-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                            {item.title}
                          </h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-neutral-400 hover:text-rose-500 transition-colors p-0.5"
                            title="Eliminar producto"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                            {formatCurrency(item.unitPrice, currency)}
                          </span>
                          <span className="text-[9px] rounded-md bg-rose-100/70 dark:bg-neutral-800 px-1 py-0.2 text-rose-700 dark:text-rose-300 font-medium">
                            {item.commissionData.usageType === 'commercial' ? 'Comercial' : 'Personal'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Briefing summary */}
                    <div className="rounded-lg bg-white dark:bg-neutral-950 p-2 text-[10px] sm:text-[11px] text-neutral-600 dark:text-neutral-400 space-y-0.5 border border-neutral-200/60 dark:border-neutral-800/60">
                      <p className="line-clamp-2">
                        <strong className="text-neutral-900 dark:text-neutral-200">Idea:</strong> {item.commissionData.brief}
                      </p>
                      {item.selectedOptionNames && item.selectedOptionNames.length > 0 && (
                        <p className="text-[10px] text-neutral-500 truncate">
                          <strong>Extras:</strong> {item.selectedOptionNames.join(', ')}
                        </p>
                      )}
                      {item.commissionData.references && (
                        <p className="text-[10px] text-rose-500 dark:text-rose-400 truncate">
                          <strong>Refs:</strong> {item.commissionData.references}
                        </p>
                      )}
                    </div>

                    {/* Quantity Selector + Row Subtotal */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-neutral-500 text-[10px]">Cant:</span>
                        <div className="flex items-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-1.5 font-bold text-neutral-900 dark:text-white text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="font-bold text-neutral-900 dark:text-white text-[11px] sm:text-xs">
                        Subtotal: {formatCurrency(item.unitPrice * item.quantity, currency)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout Action */}
            {items.length > 0 && (
              <div className="border-t border-rose-100 dark:border-neutral-800 bg-rose-50/20 dark:bg-neutral-900/60 p-4 sm:p-5 space-y-3 sm:space-y-4">
                <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {formatCurrency(subtotal, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comisión de plataforma</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">$0.00 (Gratis)</span>
                  </div>
                  <div className="pt-1.5 border-t border-neutral-200 dark:border-neutral-800 flex justify-between text-sm sm:text-base font-extrabold text-neutral-900 dark:text-white">
                    <span>Total a Pagar</span>
                    <span className="text-rose-600 dark:text-rose-400">
                      {formatCurrency(total, currency)}
                    </span>
                  </div>
                </div>

                {/* Checkout Trigger */}
                <button
                  onClick={handleStartCheckout}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 py-3 sm:py-3.5 px-4 text-xs sm:text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition-all active:scale-95"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Proceder al Pago</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <p className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 text-center">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Garantía de reembolso y entrega segura
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => {
          setIsCheckoutOpen(false);
          setIsCartOpen(false);
        }}
      />
    </>
  );
};
