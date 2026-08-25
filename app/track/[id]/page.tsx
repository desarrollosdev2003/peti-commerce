'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import { Order, OrderMessage, OrderStatus } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { uploadImageFile } from '@/lib/services/upload-service';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useCart } from '@/context/cart-context';
import { useLanguage } from '@/context/language-context';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Send,
  Image as ImageIcon,
  Paperclip,
  Sparkles,
  Download,
  AlertCircle,
  ShieldCheck,
  User,
  MessageSquare,
  ThumbsUp,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Radio,
} from 'lucide-react';

const formatMessageTime = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) || '';
  
  const { orders, getOrder, addOrderMessage, updateOrderStatus, artist, currency } = useApp();
  const { user, isAdmin } = useAuth();
  const { clearCart } = useCart();
  const { t, language } = useLanguage();
  const [order, setOrder] = useState<Order | null>(null);

  const PROGRESS_STEPS: { id: OrderStatus; label: string; desc: string }[] = [
    { id: 'pending', label: t('track_step_1_title'), desc: t('track_step_1_desc') },
    { id: 'in_progress', label: t('track_step_2_title'), desc: t('track_step_2_desc') },
    { id: 'in_review', label: t('track_step_3_title'), desc: t('track_step_3_desc') },
    { id: 'completed', label: t('track_step_4_title'), desc: t('track_step_4_desc') },
  ];

  // Determine if the current viewer is the Admin (Peti) or Customer
  const isViewerAdmin = Boolean(
    isAdmin ||
    user?.role === 'admin' ||
    (user?.email && user.email.toLowerCase() === (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').toLowerCase())
  );

  // Clear cart when confirmed order tracking room is loaded
  useEffect(() => {
    if (rawId) {
      clearCart();
    }
  }, [rawId]);
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight + 1000,
        behavior,
      });
    }
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  // Sync order state whenever AppContext orders change
  useEffect(() => {
    if (rawId) {
      const found = getOrder(rawId);
      if (found) {
        setOrder((prev) => {
          if (!prev) return found;
          // Only update if something changed
          if (prev.status !== found.status || prev.messages?.length !== found.messages?.length || prev.updatedAt !== found.updatedAt) {
            return found;
          }
          return prev;
        });
      }
    }
  }, [rawId, orders, getOrder]);

  // Scroll to bottom on new message or order update
  useEffect(() => {
    scrollToBottom('smooth');
    const timer = setTimeout(() => scrollToBottom('smooth'), 80);
    return () => clearTimeout(timer);
  }, [order?.messages, scrollToBottom]);

  // Realtime Supabase Channel Subscription (orders status & chat messages)
  useEffect(() => {
    if (!order) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channelName = `realtime-order-${order.id}-${order.orderNumber.replace('#', '')}`;
    const channel = supabase
      .channel(channelName)
      // 1. Live Order Status Updates (When moved in Mini Trello)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const updated = payload.new as any;
          if (
            updated &&
            (updated.id === order.id || updated.order_number === order.orderNumber) &&
            updated.status
          ) {
            setOrder((prev) => (prev ? { ...prev, status: updated.status, updatedAt: new Date().toISOString() } : null));
          }
        }
      )
      // 2. Live Chat Messages Updates
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_messages',
          filter: `order_id=eq.${order.id}`,
        },
        (payload) => {
          const raw = payload.new as any;
          if (!raw) return;
          const newMsg: OrderMessage = {
            id: raw.id,
            orderId: raw.order_id || raw.orderId,
            sender: raw.sender,
            senderName: raw.sender_name || raw.senderName || 'Usuario',
            text: raw.text || '',
            attachmentUrl: raw.attachment_url || raw.attachmentUrl,
            attachmentName: raw.attachment_name || raw.attachmentName,
            type: raw.type || 'message',
            createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
            isRead: raw.is_read ?? raw.isRead ?? true,
          };

          setOrder((prev) => {
            if (!prev) return null;
            if (prev.messages?.some((m) => m.id === newMsg.id)) return prev;
            return {
              ...prev,
              messages: [...(prev.messages || []), newMsg],
            };
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsLiveConnected(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setIsLiveConnected(false);
    };
  }, [order?.id, order?.orderNumber]);

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          {language === 'en' ? 'Order not found' : 'Encargo no encontrado'}
        </h2>
        <p className="text-xs text-neutral-500 max-w-sm">
          {language === 'en'
            ? `We could not locate any order with ID "${rawId}".`
            : `No pudimos localizar ningún pedido con el identificador "${rawId}".`}
        </p>
        <Link
          href="/track"
          className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2 text-xs font-bold text-white shadow-md cursor-pointer"
        >
          {language === 'en' ? 'Back to Search' : 'Volver al buscador'}
        </Link>
      </div>
    );
  }

  // Privacy Check: An authenticated customer cannot view another customer's order
  const isOrderOwner = Boolean(
    (order.customerId && user?.id && order.customerId === user.id) ||
    (order.customerEmail && user?.email && order.customerEmail.toLowerCase() === user.email.toLowerCase()) ||
    !user // Guest with direct link / order receipt
  );

  const isAuthorized = isViewerAdmin || isOrderOwner;

  if (!isAuthorized) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
        <div className="h-14 w-14 rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            {language === 'en' ? 'Private Order' : 'Encargo Privado'}
          </h2>
          <p className="text-xs text-neutral-500">
            {language === 'en'
              ? 'This tracking room and chat belong to another customer account. You cannot view other clients’ orders.'
              : 'Esta sala de seguimiento y chat pertenecen a la cuenta de otro cliente. No tienes permiso para ver los pedidos de otros usuarios.'}
          </p>
        </div>
        <Link
          href="/track"
          className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2 text-xs font-bold text-white shadow-md cursor-pointer"
        >
          {language === 'en' ? 'Back to Search' : 'Volver al buscador'}
        </Link>
      </div>
    );
  }

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');

    const senderRole = isViewerAdmin ? 'artist' : 'customer';
    const senderName = isViewerAdmin ? 'Peti' : (order.customerName || user?.name || 'Cliente');

    const newMsg = addOrderMessage(order.id, {
      orderId: order.id,
      sender: senderRole,
      senderName,
      text,
      type: 'message',
      isRead: false,
    });

    // Update local state instantly
    setOrder((prev) => prev ? { ...prev, messages: [...(prev.messages || []), newMsg] } : null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadImageFile(file);
      const senderRole = isViewerAdmin ? 'artist' : 'customer';
      const senderName = isViewerAdmin ? 'Peti' : (order.customerName || user?.name || 'Cliente');

      const newMsg = addOrderMessage(order.id, {
        orderId: order.id,
        sender: senderRole,
        senderName,
        text: isViewerAdmin ? '🎨 Boceto / archivo adjunto compartido:' : `Adjunté una imagen de referencia: ${uploaded.name}`,
        attachmentUrl: uploaded.url,
        attachmentName: uploaded.name,
        type: isViewerAdmin ? 'sketch_submission' : 'message',
        isRead: false,
      });

      setOrder((prev) => prev ? { ...prev, messages: [...(prev.messages || []), newMsg] } : null);
    } catch (err) {
      console.error('Error subiendo archivo', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleApproveSketch = () => {
    const newMsg = addOrderMessage(order.id, {
      orderId: order.id,
      sender: 'customer',
      senderName: order.customerName,
      text: '✨ ¡Boceto Aprobado! Me gusta mucho la propuesta, autorizo avanzar a la etapa de lineart y coloreado definitivo.',
      type: 'sketch_approval',
      isRead: false,
    });

    updateOrderStatus(order.id, 'in_review');
    setOrder((prev) => prev ? { ...prev, status: 'in_review', messages: [...(prev.messages || []), newMsg] } : null);
  };

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'pending') return 0;
    if (status === 'in_progress') return 1;
    if (status === 'in_review') return 2;
    if (status === 'completed') return 3;
    return 0;
  };

  const currentStepIdx = getStepIndex(order.status);

  return (
    <div className="min-h-screen py-6 sm:py-10 px-3.5 sm:px-6 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Return & Order Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 dark:border-neutral-800 pb-4">
        <div>
          <Link
            href="/track"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-rose-500 transition-colors mb-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{language === 'en' ? 'Check another order' : 'Consultar otro pedido'}</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-wider text-neutral-900 dark:text-white font-mono">
              {language === 'en' ? 'Order' : 'Pedido'} {order.orderNumber}
            </h1>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              order.status === 'completed'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
            }`}>
              {order.status === 'completed' ? (language === 'en' ? 'Completed' : 'Completado') : (language === 'en' ? 'In Progress' : 'En Avance')}
            </span>

            {/* Live Realtime Pulsing Indicator */}
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>{language === 'en' ? 'Live' : 'En vivo'}</span>
            </span>
          </div>
        </div>

        {/* Artist Contact Mini Badge */}
        <div className="flex items-center gap-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artist.avatar}
            alt={artist.name}
            className="h-9 w-9 rounded-full object-cover border border-rose-200"
          />
          <div>
            <p className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1">
              <span>{artist.name}</span>
              <CheckCircle2 className="h-3 w-3 text-rose-500 fill-rose-500/20" />
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {language === 'en' ? 'Assigned Artist • Online' : 'Artista Asignada • En línea'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Timeline Stepper (Updates live when moved in Trello) */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-6 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PROGRESS_STEPS.map((step, idx) => {
            const isPassed = currentStepIdx > idx;
            const isCurrent = currentStepIdx === idx;
            return (
              <div
                key={step.id}
                className={`flex flex-col p-3.5 rounded-2xl border transition-all duration-300 ${
                  isCurrent
                    ? 'border-rose-500 bg-rose-500/10 shadow-md shadow-rose-500/10 scale-102 ring-1 ring-rose-500/30'
                    : isPassed
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isCurrent
                      ? 'text-rose-600 dark:text-rose-400'
                      : isPassed
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-neutral-400'
                  }`}>
                    {language === 'en' ? `Step ${idx + 1}` : `Paso ${idx + 1}`}
                  </span>
                  {isPassed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 animate-in zoom-in-50" />
                  ) : isCurrent ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                    </span>
                  ) : null}
                </div>
                <h4 className="font-bold text-xs text-neutral-900 dark:text-white mt-1.5">
                  {step.label.includes('. ') ? step.label.split('. ')[1] : step.label}
                </h4>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-tight">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Details + Live Chat Window */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Order Briefing & Final Deliverables (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Order Details Card */}
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              {language === 'en' ? 'Order Details' : 'Detalles del Encargo'}
            </h3>

            {order.items.map((item, idx) => (
              <div key={idx} className="flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.sampleImage}
                  alt={item.title}
                  className="h-16 w-16 rounded-xl object-cover border border-neutral-200 dark:border-neutral-800 shrink-0"
                />
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-neutral-900 dark:text-white leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-rose-600 dark:text-rose-400 font-extrabold">
                    {formatCurrency(item.unitPrice, currency)}
                  </p>
                  <span className="inline-block rounded-md bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.2 text-[10px] font-medium text-neutral-600 dark:text-neutral-400">
                    {item.commissionData.usageType === 'commercial'
                      ? (language === 'en' ? 'Commercial Use (+50%)' : 'Uso Comercial (+50%)')
                      : (language === 'en' ? 'Personal Use' : 'Uso Personal')}
                  </span>
                </div>
              </div>
            ))}

            {/* Briefing Recap */}
            <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-950 p-3.5 space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                {language === 'en' ? 'Your Briefing & Concept:' : 'Tu Briefing & Concepto:'}
              </span>
              <p className="leading-relaxed text-xs">
                &quot;{order.items[0]?.commissionData?.brief}&quot;
              </p>
              {order.items[0]?.commissionData?.references && (
                <p className="pt-1 text-[11px] flex items-center gap-1 text-rose-500 font-medium">
                  <strong>Ref:</strong>
                  <a
                    href={order.items[0].commissionData.references}
                    target="_blank"
                    rel="noreferrer"
                    className="underline truncate"
                  >
                    {order.items[0].commissionData.references}
                  </a>
                </p>
              )}
            </div>

            {/* Financial summary */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
              <span className="text-neutral-500 font-medium">{language === 'en' ? 'Total Paid:' : 'Total Abonado:'}</span>
              <span className="font-extrabold text-sm text-neutral-900 dark:text-white">
                {formatCurrency(order.total, currency)}
              </span>
            </div>
          </div>

          {/* Final Deliverables Box (When Completed) */}
          {order.status === 'completed' && order.deliveredFiles && order.deliveredFiles.length > 0 && (
            <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/5 p-5 space-y-3 shadow-xs animate-in zoom-in-95">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-5 w-5" />
                <h3 className="text-sm font-bold tracking-wider">
                  {language === 'en' ? 'Your Final Files Are Ready!' : '¡Tus Archivos Finales Están Listos!'}
                </h3>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                {language === 'en'
                  ? 'Download your high-resolution illustrations without watermarks:'
                  : 'Descarga tus ilustraciones en resolución completa sin marcas de agua:'}
              </p>
              <div className="space-y-2 pt-1">
                {order.deliveredFiles.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-neutral-900 border border-emerald-500/30 hover:border-emerald-500 text-xs font-bold text-neutral-900 dark:text-white transition-all shadow-xs group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Download className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    {file.size && <span className="text-[10px] text-neutral-400 font-normal">{file.size}</span>}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Chat Window (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-rose-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl overflow-hidden flex flex-col h-[580px]">
          
          {/* Chat Top Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-rose-100 dark:border-neutral-800 bg-rose-50/30 dark:bg-neutral-950/40">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={artist.avatar}
                  alt={artist.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                  {t('track_chat_with', { artist: artist.name })}
                </h4>
                <p className="text-[10px] text-neutral-400">{language === 'en' ? 'Private order channel' : 'Canal privado de orden'}</p>
              </div>
            </div>

            {/* Quick action: Approve sketch button if sketch exists */}
            {order.status === 'in_progress' && (
              <button
                onClick={handleApproveSketch}
                className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>{language === 'en' ? 'Approve Sketch' : 'Aprobar Boceto'}</span>
              </button>
            )}
          </div>

          {/* Messages Scroll Area */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/50 dark:bg-neutral-950/40">
            {order.messages && order.messages.length > 0 ? (
              order.messages.map((msg) => {
                const isMsgFromArtist = msg.sender === 'artist';
                // Is this message from ME (the viewer)?
                const isMe = isViewerAdmin ? isMsgFromArtist : !isMsgFromArtist;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2.5 ${
                      isMe ? 'flex-row-reverse self-end ml-auto' : 'flex-row self-start mr-auto'
                    } max-w-[88%] sm:max-w-[80%]`}
                  >
                    {/* Avatar Icon */}
                    <div className="shrink-0 mb-1">
                      {isMsgFromArtist ? (
                        <div className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={artist.avatar}
                            alt="Peti"
                            className="h-8 w-8 rounded-full object-cover border-2 border-rose-400 shadow-xs"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border border-white dark:border-neutral-900 flex items-center justify-center text-[7px] text-white">
                            ✓
                          </span>
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center border-2 border-sky-300 shadow-xs">
                          {(msg.senderName || order.customerName || 'C')[0].toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Bubble and Header */}
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {/* Name Tag & Role Badge */}
                      <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px]">
                        {isMsgFromArtist ? (
                          <span className="font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <span>{isMe ? (language === 'en' ? 'You (Peti ✨)' : 'Tú (Peti ✨)') : (language === 'en' ? 'Peti (Artist ✨)' : 'Peti (Artista ✨)')}</span>
                            <span className="text-[9px] bg-rose-500/10 text-rose-600 dark:text-rose-400 px-1.5 py-0.2 rounded-md font-bold uppercase">
                              {language === 'en' ? 'Artist' : 'Artista'}
                            </span>
                          </span>
                        ) : (
                          <span className="font-extrabold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                            <span>{isMe ? `${language === 'en' ? 'You' : 'Tú'} (${msg.senderName || order.customerName})` : (msg.senderName || order.customerName)}</span>
                            <span className="text-[9px] bg-sky-500/10 text-sky-600 dark:text-sky-400 px-1.5 py-0.2 rounded-md font-bold uppercase">
                              {language === 'en' ? 'Customer' : 'Cliente'}
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Bubble Text */}
                      <div
                        className={`rounded-2xl p-3.5 space-y-2 text-xs shadow-xs ${
                          isMsgFromArtist
                            ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-tr-xs shadow-rose-600/15'
                            : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-tl-xs shadow-neutral-900/5'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                        {/* Attached sketch / image */}
                        {msg.attachmentUrl && (
                          <div
                            onClick={() => setSelectedImagePreview(msg.attachmentUrl || null)}
                            className="relative rounded-xl overflow-hidden cursor-pointer group mt-2 border border-black/10 dark:border-white/10"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={msg.attachmentUrl}
                              alt="boceto adjunto"
                              onLoad={() => scrollToBottom('smooth')}
                              className="max-h-60 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold transition-opacity">
                              {language === 'en' ? 'Click to expand' : 'Hacer clic para ampliar'}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Timestamp */}
                      <span className="text-[9px] text-neutral-400 mt-1 px-1">
                        {formatMessageTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                {language === 'en' ? 'Start conversation with Peti...' : 'Inicia la conversación con Peti...'}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-rose-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center gap-2"
          >
            {/* Image upload button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-rose-500 hover:border-rose-500 transition-colors shrink-0 cursor-pointer"
              title={language === 'en' ? 'Attach reference image' : 'Adjuntar imagen de referencia'}
            >
              {isUploading ? <RefreshCw className="h-4 w-4 animate-spin text-rose-500" /> : <Paperclip className="h-4 w-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isViewerAdmin
                  ? (language === 'en' ? 'Write a message as Peti (Artist)...' : 'Escribe un mensaje o respuesta como Peti (Artista)...')
                  : t('track_input_placeholder')
              }
              className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-rose-500 focus:outline-none"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 p-2.5 text-white shadow-md shadow-rose-600/20 disabled:opacity-40 transition-all shrink-0 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>

      </div>

      {/* Lightbox Image Preview Modal */}
      {selectedImagePreview && (
        <div
          onClick={() => setSelectedImagePreview(null)}
          className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImagePreview}
              alt="Preview en grande"
              className="max-h-[85vh] w-auto object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
