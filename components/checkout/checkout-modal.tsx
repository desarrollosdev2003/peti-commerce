'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useApp } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { Order } from '@/lib/types';
import { formatCurrency, USD_TO_ARS_RATE } from '@/lib/utils';
import {
  X,
  CreditCard,
  CheckCircle2,
  Mail,
  User,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Loader2,
  Lock,
  FlaskConical,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const router = useRouter();
  const { items, subtotal: total, clearCart } = useCart();
  const { currency, addOrder } = useApp();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'polar' | 'test'>(
    currency === 'ARS' ? 'mercadopago' : 'polar'
  );
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerDiscord, setCustomerDiscord] = useState(user?.discord || '');
  const [liveExchangeRate, setLiveExchangeRate] = useState<number>(USD_TO_ARS_RATE);
  const [rateCasa, setRateCasa] = useState<string>('Blue');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Fetch live exchange rate from DolarApi on mount
  React.useEffect(() => {
    fetch('/api/exchange-rate')
      .then((res) => res.json())
      .then((data) => {
        if (data?.rate && typeof data.rate === 'number') {
          setLiveExchangeRate(data.rate);
          if (data.casa) setRateCasa(data.casa.toUpperCase());
        }
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerEmail.trim() || !customerName.trim()) {
      setError(t('checkout_fill_error'));
      return;
    }

    if (items.length === 0) {
      setError(t('checkout_empty_cart_error'));
      return;
    }

    setError('');
    setIsProcessing(true);

    const orderNumber = `#PETI-${Math.floor(1000 + Math.random() * 9000)}`;
    const pendingOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber,
      customerId: user?.id,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      items: [...items],
      total,
      paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: customerDiscord ? `Discord: ${customerDiscord}` : undefined,
      estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    // Inmediatamente registra el pedido en Supabase y abre la Sala de Seguimiento con Chat en Vivo
    if (paymentMethod === 'mercadopago' || paymentMethod === 'test') {
      try {
        // Enviar orden a la base de datos de Supabase y generar canal de chat
        await fetch('/api/payments/mercadopago/create-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: pendingOrder }),
        }).catch((e) => console.error('Supabase sync error:', e));

        addOrder(pendingOrder);
        clearCart();
        setIsProcessing(false);
        onSuccess();
        router.push(`/track/${orderNumber.replace('#', '')}`);
        return;
      } catch (err: any) {
        console.error('Error procesando pedido:', err);
        setError('Error al crear la orden. Por favor intenta de nuevo.');
        setIsProcessing(false);
        return;
      }
    }

    try {
      // Call payment gateway creation (Polar.sh)
      const endpoint = '/api/payments/polar/create-checkout';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: pendingOrder }),
      });

      const data = await res.json();

      if (!res.ok || !data.redirectUrl) {
        const errorMsg =
          typeof data.error === 'string'
            ? data.error
            : typeof data.error === 'object' && data.error !== null
            ? data.error.message || JSON.stringify(data.error)
            : 'No se pudo generar el enlace de pago con la pasarela.';
        throw new Error(errorMsg);
      }

      // Redirect directly to payment gateway (keep cart intact in case user clicks back)
      window.location.href = data.redirectUrl;
    } catch (err: any) {
      console.error('Error procesando pago:', err);
      const displayError =
        typeof err?.message === 'string' && err.message !== '[object Object]'
          ? err.message
          : 'Hubo un error comunicando con la pasarela de pago. Por favor intenta de nuevo.';
      setError(displayError);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-rose-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-8 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {!isProcessing && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Checkout Form */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-wider text-neutral-900 dark:text-white">
                {t('checkout_title')}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t('checkout_total_to_charge')}{' '}
                <strong className="text-rose-600 dark:text-rose-400">{formatCurrency(total, currency)}</strong>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitPayment} className="mt-5 space-y-3.5 sm:space-y-4 text-left">
            {/* Payment Gateway Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {t('checkout_payment_method')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Mercado Pago */}
                <div
                  onClick={() => setPaymentMethod('mercadopago')}
                  className={`flex flex-col p-3 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'mercadopago'
                      ? 'border-sky-500 bg-sky-500/10 dark:bg-sky-500/15 shadow-2xs ring-1 ring-sky-500'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-sky-600 dark:text-sky-400">
                      Mercado Pago
                    </span>
                    {paymentMethod === 'mercadopago' && (
                      <CheckCircle2 className="h-4 w-4 text-sky-500" />
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-0.5">
                    {t('checkout_mp_desc')}
                  </span>
                </div>

                {/* Polar.sh */}
                <div
                  onClick={() => setPaymentMethod('polar')}
                  className={`flex flex-col p-3 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'polar'
                      ? 'border-purple-500 bg-purple-500/10 dark:bg-purple-500/15 shadow-2xs ring-1 ring-purple-500'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-purple-600 dark:text-purple-400">
                      Polar.sh (Stripe)
                    </span>
                    {paymentMethod === 'polar' && (
                      <CheckCircle2 className="h-4 w-4 text-purple-500" />
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-0.5">
                    {t('checkout_polar_desc')}
                  </span>
                </div>
              </div>

              {/* Testing / Sandbox Option */}
              <div
                onClick={() => setPaymentMethod('test')}
                data-testid="payment-method-test"
                className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition-all text-xs ${
                  paymentMethod === 'test'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500 font-bold'
                    : 'border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:border-amber-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-[11px] font-bold">{t('checkout_test_mode')}</p>
                    <p className="text-[10px] text-neutral-400 font-normal">{t('checkout_test_mode_desc')}</p>
                  </div>
                </div>
                {paymentMethod === 'test' && <CheckCircle2 className="h-4 w-4 text-amber-500" />}
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-2.5 pt-1">
              <div>
                <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{t('checkout_email_label')}</span>
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder={t('checkout_email_placeholder')}
                  className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 px-3.5 py-2 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    <span>{t('checkout_name_label')}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={t('checkout_name_placeholder')}
                    className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 px-3.5 py-2 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                    <span>{t('checkout_discord_label')}</span>
                  </label>
                  <input
                    type="text"
                    value={customerDiscord}
                    onChange={(e) => setCustomerDiscord(e.target.value)}
                    placeholder={t('checkout_discord_placeholder')}
                    className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 px-3.5 py-2 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Error Notice */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-2.5 text-xs text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2 space-y-1.5 text-center">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 py-3.5 px-4 text-xs font-bold text-white shadow-lg shadow-rose-600/25 transition-all disabled:opacity-50 cursor-pointer active:scale-98"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('checkout_processing')}</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>
                      {paymentMethod === 'mercadopago'
                        ? t('checkout_pay_mp', { amount: formatCurrency(total, 'ARS', liveExchangeRate) })
                        : paymentMethod === 'polar'
                        ? t('checkout_pay_polar', { amount: total })
                        : t('checkout_pay_test', { amount: total })}
                    </span>
                  </>
                )}
              </button>

              {paymentMethod === 'mercadopago' && (
                <p className="text-[10px] text-neutral-400">
                  {language === 'en' ? (
                    <>
                      Live conversion (DolarApi • {rateCasa} Selling): <strong>${total} USD</strong> ≈{' '}
                      <strong className="text-sky-500">{formatCurrency(total, 'ARS', liveExchangeRate)}</strong> (1 USD = ${liveExchangeRate.toLocaleString('es-AR')} ARS)
                    </>
                  ) : (
                    <>
                      Conversión en vivo (DolarApi • {rateCasa} Venta): <strong>${total} USD</strong> ≈{' '}
                      <strong className="text-sky-500">{formatCurrency(total, 'ARS', liveExchangeRate)}</strong> (1 USD = ${liveExchangeRate.toLocaleString('es-AR')} ARS)
                    </>
                  )}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>{t('checkout_ssl_secure')}</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
