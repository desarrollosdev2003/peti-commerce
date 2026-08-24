'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useApp } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import { PaymentMethod, Order } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  X,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Sparkles,
  Mail,
  User,
  AlertCircle,
  Copy,
  MessageSquare,
  ArrowRight,
  Package,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { addOrder, currency } = useApp();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerDiscord, setCustomerDiscord] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mercadopago');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-fill from logged-in user
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerEmail) setCustomerEmail(user.email);
      if (!customerDiscord && user.discord) setCustomerDiscord(user.discord);
    }
  }, [user, customerName, customerEmail, customerDiscord]);

  if (!isOpen) return null;

  const total = subtotal;

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setError('Por favor ingresa un correo electrónico válido para recibir tus bocetos y archivos.');
      return;
    }
    if (!customerName.trim()) {
      setError('Por favor ingresa tu nombre o nickname.');
      return;
    }

    setError('');
    setIsProcessing(true);

    const orderNumber = `#PETI-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
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

    try {
      // Call payment gateway creation
      const endpoint =
        paymentMethod === 'mercadopago'
          ? '/api/payments/mercadopago/create-preference'
          : '/api/payments/polar/create-checkout';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder }),
      });

      const data = await res.json();
      
      // Save order in state
      addOrder({
        ...newOrder,
        paymentUrl: data.redirectUrl,
      });

      // Send confirmation email via Resend API
      fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'confirmation', order: newOrder }),
      }).catch((err) => console.log('Email background dispatch:', err));

      clearCart();
      setIsProcessing(false);
      setCompletedOrder(newOrder);

      // Redirect directly to real payment gateway (Mercado Pago / Polar)
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (err) {
      console.error('Error procesando pago:', err);
      setError('Hubo un error comunicando con la pasarela de pago. Por favor intenta de nuevo.');
      setIsProcessing(false);
    }
  };

  const handleCopyOrderId = () => {
    if (completedOrder) {
      navigator.clipboard.writeText(completedOrder.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoToTracking = () => {
    if (completedOrder) {
      const cleanNum = completedOrder.orderNumber.replace('#', '');
      onSuccess();
      router.push(`/track/${cleanNum}`);
    }
  };

  const handleGoToAccount = () => {
    onSuccess();
    router.push('/account');
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
            onClick={completedOrder ? onSuccess : onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {!completedOrder ? (
          /* Checkout Form */
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold tracking-wider text-neutral-900 dark:text-white">
                  Confirmar Encargo & Pago
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Total a abonar: <strong className="text-rose-600 dark:text-rose-400">{formatCurrency(total, currency)}</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitPayment} className="mt-5 space-y-3.5 sm:space-y-4 text-left">
              {/* Payment Gateway Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Pasarela de Pago
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Mercado Pago */}
                  <div
                    onClick={() => setPaymentMethod('mercadopago')}
                    className={`flex flex-col p-3 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'mercadopago'
                        ? 'border-sky-500 bg-sky-500/10 dark:bg-sky-500/15 shadow-2xs'
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
                      Tarjetas, Débito, Transferencia y Dinero en cuenta
                    </span>
                  </div>

                  {/* Polar.sh */}
                  <div
                    onClick={() => setPaymentMethod('polar')}
                    className={`flex flex-col p-3 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'polar'
                        ? 'border-purple-500 bg-purple-500/10 dark:bg-purple-500/15 shadow-2xs'
                        : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-purple-600 dark:text-purple-400">
                        Polar.sh
                      </span>
                      {paymentMethod === 'polar' && (
                        <CheckCircle2 className="h-4 w-4 text-purple-500" />
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-500 mt-0.5">
                      Pagos internacionales (Stripe, Tarjetas globales)
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2.5 pt-1">
                <div>
                  <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    <span>Email de Entrega & Contacto *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="tu-email@gmail.com"
                    className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 px-3.5 py-2 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      <span>Nombre / Nickname *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Alex / Kuro"
                      className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 px-3.5 py-2 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                      <span>Discord (Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={customerDiscord}
                      onChange={(e) => setCustomerDiscord(e.target.value)}
                      placeholder="@usuario#0000"
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
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 py-3.5 px-4 text-xs font-bold text-white shadow-lg shadow-rose-600/25 transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Conectando con {paymentMethod === 'mercadopago' ? 'Mercado Pago' : 'Polar.sh'}...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Pagar {formatCurrency(total, currency)}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Transacción protegida SSL</span>
              </div>
            </form>
          </div>
        ) : (
          /* Order Confirmation Screen */
          <div className="text-center space-y-4 py-2 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                ¡Encargo Confirmado!
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
                Gracias por tu pedido, {completedOrder.customerName}
              </h3>
              <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto">
                Hemos enviado un correo a <strong>{completedOrder.customerEmail}</strong> con el enlace a tu sala de seguimiento.
              </p>
            </div>

            {/* Tracking ID Box */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-3.5 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 font-medium">Número de Pedido:</span>
                <button
                  onClick={handleCopyOrderId}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              <p className="text-base sm:text-lg font-mono font-extrabold text-neutral-900 dark:text-white">
                {completedOrder.orderNumber}
              </p>
            </div>

            {/* Big Actions */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleGoToAccount}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 py-3.5 text-xs font-bold text-white shadow-lg shadow-rose-600/25 transition-all active:scale-95"
              >
                <Package className="h-4 w-4" />
                <span>Ver en Mis Pedidos & Chat</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={handleGoToTracking}
                className="w-full rounded-xl bg-neutral-100 dark:bg-neutral-800 py-2.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Abrir Sala de Seguimiento Pública</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
