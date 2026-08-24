'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/app-context';
import { Order, OrderMessage, OrderStatus } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { uploadImageFile } from '@/lib/services/upload-service';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
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

const PROGRESS_STEPS: { id: OrderStatus; label: string; desc: string }[] = [
  { id: 'pending', label: '1. En Cola / Pendiente', desc: 'Validación de briefing y referencias' },
  { id: 'in_progress', label: '2. Boceto Preliminar', desc: 'Composición, pose y anatomía' },
  { id: 'in_review', label: '3. En Revisión', desc: 'Aprobación de boceto y color base' },
  { id: 'completed', label: '4. Finalizado', desc: 'Entrega de archivos en alta resolución' },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) || '';
  
  const { orders, getOrder, addOrderMessage, updateOrderStatus, artist, currency } = useApp();
  const [order, setOrder] = useState<Order | null>(null);
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [order?.messages]);

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
          const newMsg = payload.new as OrderMessage;
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
          Encargo no encontrado
        </h2>
        <p className="text-xs text-neutral-500 max-w-sm">
          No pudimos localizar ningún pedido con el identificador &quot;{rawId}&quot;.
        </p>
        <Link
          href="/track"
          className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2 text-xs font-bold text-white shadow-md"
        >
          Volver al buscador
        </Link>
      </div>
    );
  }

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');

    const newMsg = addOrderMessage(order.id, {
      orderId: order.id,
      sender: 'customer',
      senderName: order.customerName,
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
      const newMsg = addOrderMessage(order.id, {
        orderId: order.id,
        sender: 'customer',
        senderName: order.customerName,
        text: `Adjunté una imagen de referencia: ${uploaded.name}`,
        attachmentUrl: uploaded.url,
        attachmentName: uploaded.name,
        type: 'message',
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
            <span>Consultar otro pedido</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-wider text-neutral-900 dark:text-white font-mono">
              Pedido {order.orderNumber}
            </h1>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              order.status === 'completed'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
            }`}>
              {order.status === 'completed' ? 'Completado' : 'En Avance'}
            </span>

            {/* Live Realtime Pulsing Indicator */}
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>En vivo</span>
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
              Artista Asignada • En línea
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
                    Paso {idx + 1}
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
                  {step.label.split('. ')[1]}
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
              Detalles del Encargo
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
                    {item.commissionData.usageType === 'commercial' ? 'Uso Comercial (+50%)' : 'Uso Personal'}
                  </span>
                </div>
              </div>
            ))}

            {/* Briefing Recap */}
            <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-950 p-3.5 space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Tu Briefing & Concepto:
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
              <span className="text-neutral-500 font-medium">Total Abonado:</span>
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
                  ¡Tus Archivos Finales Están Listos!
                </h3>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                Descarga tus ilustraciones en resolución completa sin marcas de agua:
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
                  Chat directo con {artist.name}
                </h4>
                <p className="text-[10px] text-neutral-400">Canal privado de orden</p>
              </div>
            </div>

            {/* Quick action: Approve sketch button if sketch exists */}
            {order.status === 'in_progress' && (
              <button
                onClick={handleApproveSketch}
                className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-xs transition-all active:scale-95"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>Aprobar Boceto</span>
              </button>
            )}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-neutral-50/40 dark:bg-neutral-950/20">
            {order.messages && order.messages.length > 0 ? (
              order.messages.map((msg) => {
                const isMe = msg.sender === 'customer';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-neutral-400 font-semibold mb-1 px-1">
                      {isMe ? 'Tú' : artist.name}
                    </span>

                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 text-xs shadow-xs ${
                        isMe
                          ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-tr-xs'
                          : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border border-neutral-200/80 dark:border-neutral-700/80 rounded-tl-xs'
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
                            className="max-h-60 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold transition-opacity">
                            Hacer clic para ampliar
                          </div>
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] text-neutral-400 mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                Inicia la conversación con Peti...
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
              className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-rose-500 hover:border-rose-500 transition-colors shrink-0"
              title="Adjuntar imagen de referencia"
            >
              {isUploading ? <RefreshCw className="h-4 w-4 animate-spin text-rose-500" /> : <Paperclip className="h-4 w-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe tu mensaje o respuesta para Peti..."
              className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-rose-500 focus:outline-none"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 p-2.5 text-white shadow-md shadow-rose-600/20 disabled:opacity-40 transition-all shrink-0"
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
