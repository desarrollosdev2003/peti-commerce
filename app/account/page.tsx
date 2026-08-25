'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useApp } from '@/context/app-context';
import { useLanguage } from '@/context/language-context';
import { Order, OrderStatus } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { uploadImageFile } from '@/lib/services/upload-service';
import {
  Package,
  MessageSquare,
  Sparkles,
  User,
  LogOut,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  Download,
  Send,
  Paperclip,
  RefreshCw,
  ThumbsUp,
  Image as ImageIcon,
  ShieldCheck,
} from 'lucide-react';

export default function CustomerAccountPage() {
  const { user, logout, updateProfile, setIsAuthModalOpen } = useAuth();
  const { orders, addOrderMessage, updateOrderStatus, artist, currency } = useApp();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'orders' | 'inbox' | 'files' | 'profile'>('orders');
  const [selectedChatOrderId, setSelectedChatOrderId] = useState<string | null>(null);
  const [chatInputText, setChatInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight + 1000,
        behavior,
      });
    }
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  // Profile form state
  const [nameInput, setNameInput] = useState('');
  const [discordInput, setDiscordInput] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setNameInput(user.name);
      setDiscordInput(user.discord || '');
    }
  }, [user]);

  // Filter orders strictly belonging to the user
  const userOrders = orders.filter((o) => {
    if (!user) return false;
    return (
      (o.customerId && o.customerId === user.id) ||
      (o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase())
    );
  });

  // Set default selected chat order
  useEffect(() => {
    if (userOrders.length > 0 && !selectedChatOrderId) {
      setSelectedChatOrderId(userOrders[0].id);
    }
  }, [userOrders, selectedChatOrderId]);

  // Scroll to bottom on messages update or tab switch
  useEffect(() => {
    if (activeTab === 'inbox') {
      scrollToBottom('smooth');
      const timer = setTimeout(() => scrollToBottom('smooth'), 80);
      return () => clearTimeout(timer);
    }
  }, [orders, selectedChatOrderId, activeTab, scrollToBottom]);

  if (!user) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center space-y-5 max-w-md mx-auto">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
          <User className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-wider text-neutral-900 dark:text-white">
            {t('account_title')}
          </h2>
          <p className="text-xs text-neutral-500">
            {t('account_subtitle')}
          </p>
        </div>

        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 py-3.5 px-6 text-xs font-bold text-white shadow-lg shadow-rose-600/25 transition-all active:scale-95 cursor-pointer"
        >
          <span>{language === 'en' ? 'Sign In / Register' : 'Iniciar Sesión / Registrarme'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const selectedOrder = orders.find((o) => o.id === selectedChatOrderId) || userOrders[0];

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !chatInputText.trim()) return;

    addOrderMessage(selectedOrder.id, {
      orderId: selectedOrder.id,
      sender: 'customer',
      senderName: user.name,
      text: chatInputText.trim(),
      type: 'message',
      isRead: false,
    });

    setChatInputText('');
  };

  const handleUploadChatImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedOrder) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadImageFile(file);
      addOrderMessage(selectedOrder.id, {
        orderId: selectedOrder.id,
        sender: 'customer',
        senderName: user.name,
        text: language === 'en' ? `Attached reference image: ${uploaded.name}` : `Adjunté una imagen de referencia: ${uploaded.name}`,
        attachmentUrl: uploaded.url,
        attachmentName: uploaded.name,
        type: 'message',
        isRead: false,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleApproveSketch = (orderId: string) => {
    addOrderMessage(orderId, {
      orderId,
      sender: 'customer',
      senderName: user.name,
      text: language === 'en' ? '✨ Sketch Approved! Proceeding to final lineart and coloring.' : '✨ ¡Boceto Aprobado! Autorizo continuar con el lineart y color final.',
      type: 'sketch_approval',
      isRead: false,
    });
    updateOrderStatus(orderId, 'in_review');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: nameInput.trim(),
      discord: discordInput.trim(),
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  // Collect all delivered files across all user orders
  const allDeliveredFiles = userOrders.flatMap((o) =>
    (o.deliveredFiles || []).map((f) => ({
      ...f,
      orderNumber: o.orderNumber,
      orderTitle: o.items[0]?.title || 'Ilustración',
    }))
  );

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Account Top Banner */}
      <div className="rounded-3xl border border-rose-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
            alt={user.name}
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl object-cover border-2 border-rose-200 dark:border-neutral-700 shadow-sm"
          />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
              {language === 'en' ? 'Customer Dashboard' : 'Panel de Cliente'}
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <span>{user.name}</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {language === 'en' ? 'Active Customer' : 'Cliente Activo'}
              </span>
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3.5 py-2 text-xs font-bold hover:bg-rose-500/15 transition-colors"
          >
            {language === 'en' ? '+ Order New Commission' : '+ Encargar Nueva Comisión'}
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-1 rounded-xl border border-neutral-200 dark:border-neutral-800 p-2 text-xs text-neutral-500 hover:text-rose-600 transition-colors cursor-pointer"
            title={t('nav_logout')}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 border-b border-neutral-200 dark:border-neutral-800 scrollbar-none">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-rose-50 dark:hover:bg-neutral-900'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>{t('account_my_orders')} ({userOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'inbox'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-rose-50 dark:hover:bg-neutral-900'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>{t('account_chats')}</span>
        </button>

        <button
          onClick={() => setActiveTab('files')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'files'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-rose-50 dark:hover:bg-neutral-900'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>{t('account_my_files')} ({allDeliveredFiles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-rose-50 dark:hover:bg-neutral-900'
          }`}
        >
          <User className="h-4 w-4" />
          <span>{t('account_profile')}</span>
        </button>
      </div>

      {/* Tab 1: Orders List */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {userOrders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 p-10 text-center space-y-3">
              <Package className="h-8 w-8 text-neutral-400 mx-auto" />
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                {t('account_no_orders')}
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                {language === 'en'
                  ? "Explore Peti's catalog and order your first custom illustration."
                  : 'Explora el catálogo de Peti y encarga tu primera ilustración personalizada.'}
              </p>
              <Link
                href="/"
                className="inline-block rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2 text-xs font-bold text-white shadow-md"
              >
                {t('cart_view_catalog')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 space-y-3.5 shadow-2xs hover:border-rose-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header: Order # + Status */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                        {ord.orderNumber}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        ord.status === 'completed'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : ord.status === 'in_review'
                          ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                          : ord.status === 'in_progress'
                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      }`}>
                        {ord.status === 'completed'
                          ? (language === 'en' ? 'Completed' : 'Completado')
                          : ord.status === 'in_review'
                          ? (language === 'en' ? 'In Review' : 'En Revisión de Boceto')
                          : ord.status === 'in_progress'
                          ? (language === 'en' ? 'In Progress' : 'En Proceso')
                          : (language === 'en' ? 'Queued / Pending' : 'En Cola / Pendiente')}
                      </span>
                    </div>

                    {/* Item details */}
                    {ord.items.map((item, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.sampleImage}
                          alt={item.title}
                          className="h-14 w-14 rounded-xl object-cover border border-neutral-200 dark:border-neutral-800 shrink-0"
                        />
                        <div className="space-y-0.5 text-xs">
                          <h4 className="font-bold text-neutral-900 dark:text-white leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-neutral-500 line-clamp-1">
                            {item.commissionData.brief}
                          </p>
                          <p className="font-bold text-rose-600 dark:text-rose-400 text-xs">
                            {formatCurrency(ord.total, currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(ord.createdAt)}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/track/${ord.orderNumber.replace('#', '')}`}
                        className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-all active:scale-95"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{language === 'en' ? 'Open Chat & Progress' : 'Abrir Chat & Avance'}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Live Chat & Inbox */}
      {activeTab === 'inbox' && (
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-0 h-[650px] sm:h-[600px] rounded-3xl border border-rose-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xl">
          {/* Left: Orders List / Conversations (4 Cols) */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800 flex lg:flex-col overflow-x-auto lg:overflow-y-auto p-2.5 sm:p-3 gap-2 bg-neutral-50/50 dark:bg-neutral-950/30 shrink-0 scrollbar-none">
            <span className="hidden lg:block text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 mb-1">
              {language === 'en' ? 'Your Conversations' : 'Tus Conversaciones'}
            </span>
            {userOrders.map((ord) => {
              const isSelected = selectedOrder?.id === ord.id;
              const lastMsg = ord.messages?.[ord.messages.length - 1];
              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedChatOrderId(ord.id)}
                  className={`p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all space-y-1 shrink-0 min-w-[180px] lg:min-w-0 ${
                    isSelected
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-xs font-bold">{ord.orderNumber}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                    }`}>
                      {ord.status === 'completed' ? (language === 'en' ? 'Completed' : 'Completado') : (language === 'en' ? 'Active' : 'Activo')}
                    </span>
                  </div>
                  <p className={`text-[11px] truncate ${isSelected ? 'text-white/90' : 'text-neutral-500'}`}>
                    {lastMsg ? lastMsg.text : ord.items[0]?.title}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right: Active Chat Window (8 Cols) */}
          {selectedOrder ? (
            <div className="lg:col-span-8 flex flex-col flex-1 min-h-0">
              {/* Chat Top Bar */}
              <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                      <span>{artist.name} • {language === 'en' ? 'Artist' : 'Artista'}</span>
                      <CheckCircle2 className="h-3 w-3 text-rose-500" />
                    </h4>
                    <p className="text-[10px] text-neutral-400">{selectedOrder.orderNumber} - {selectedOrder.items[0]?.title}</p>
                  </div>
                </div>

                {selectedOrder.status === 'in_progress' && (
                  <button
                    onClick={() => handleApproveSketch(selectedOrder.id)}
                    className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>{language === 'en' ? 'Approve Sketch' : 'Aprobar Boceto'}</span>
                  </button>
                )}
              </div>

              {/* Chat Messages */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-neutral-50/30 dark:bg-neutral-950/20">
                {selectedOrder.messages && selectedOrder.messages.length > 0 ? (
                  selectedOrder.messages.map((msg) => {
                    const isMe = msg.sender === 'customer';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-neutral-400 font-semibold mb-0.5 px-1">
                          {isMe ? (language === 'en' ? 'You' : 'Tú') : 'Peti'}
                        </span>
                        <div
                          className={`max-w-[80%] rounded-2xl p-3.5 text-xs space-y-2 shadow-xs ${
                            isMe
                              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-tr-xs'
                              : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-tl-xs'
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          {msg.attachmentUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={msg.attachmentUrl}
                              alt="adjunto"
                              onLoad={() => scrollToBottom('smooth')}
                              className="max-h-48 rounded-xl object-cover border border-black/10"
                            />
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
                    {language === 'en' ? 'No messages in this order yet.' : 'No hay mensajes en este pedido.'}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form
                onSubmit={handleSendChatMessage}
                className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center gap-2"
              >
                <input
                  type="file"
                  ref={chatFileInputRef}
                  onChange={handleUploadChatImage}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => chatFileInputRef.current?.click()}
                  className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-rose-500 transition-colors cursor-pointer"
                  title={language === 'en' ? 'Attach file' : 'Adjuntar archivo'}
                >
                  {isUploading ? <RefreshCw className="h-4 w-4 animate-spin text-rose-500" /> : <Paperclip className="h-4 w-4" />}
                </button>

                <input
                  type="text"
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  placeholder={language === 'en' ? 'Write a response for Peti...' : 'Escribe una respuesta para Peti...'}
                  className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-rose-500 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={!chatInputText.trim()}
                  className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 p-2.5 text-white shadow-xs disabled:opacity-40 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="lg:col-span-8 flex items-center justify-center text-xs text-neutral-400">
              {language === 'en' ? 'Select an order on the left to view the chat.' : 'Selecciona un pedido a la izquierda para ver el chat.'}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: My Files & Downloads */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          {allDeliveredFiles.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 p-10 text-center space-y-3">
              <Sparkles className="h-8 w-8 text-neutral-400 mx-auto" />
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                {language === 'en' ? 'No completed illustrations yet' : 'Aún no tienes ilustraciones completadas'}
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                {language === 'en'
                  ? 'When Peti finishes your art, all high-definition downloadable files (PNG 300 DPI and PSD) will appear here.'
                  : 'Cuando Peti finalice tus dibujos, aparecerán aquí todos los archivos descargables en alta definición (PNG 300 DPI y PSD).'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {allDeliveredFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3 flex flex-col justify-between shadow-2xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={file.url}
                    alt={file.name}
                    className="aspect-square w-full rounded-2xl object-cover border border-emerald-500/20 shadow-xs"
                  />
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                      {file.orderNumber} • {file.orderTitle}
                    </span>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {file.name}
                    </h4>
                    {file.size && <p className="text-[10px] text-neutral-400">{file.size}</p>}
                  </div>

                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white shadow-xs transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{language === 'en' ? 'Download File' : 'Descargar Archivo'}</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="max-w-xl mx-auto rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {language === 'en' ? 'Profile Settings' : 'Configuración de Perfil'}
            </h3>
            <p className="text-xs text-neutral-500">
              {language === 'en' ? 'Update your display name and contact info for commissions.' : 'Modifica tu nombre y datos de contacto para tus pedidos de comisiones.'}
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                {language === 'en' ? 'Email (Non-editable)' : 'Correo Electrónico (No editable)'}
              </label>
              <input
                type="text"
                disabled
                value={user.email}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800/50 px-3.5 py-2 text-xs text-neutral-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                {t('checkout_name_label')}
              </label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-xs text-neutral-900 dark:text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                {t('checkout_discord_label')}
              </label>
              <input
                type="text"
                value={discordInput}
                onChange={(e) => setDiscordInput(e.target.value)}
                placeholder="@usuario#0000"
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2 text-xs text-neutral-900 dark:text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            {profileSaved && (
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold bg-emerald-500/10 p-2.5 rounded-xl">
                <CheckCircle2 className="h-4 w-4" />
                <span>{language === 'en' ? 'Profile updated successfully.' : 'Perfil actualizado correctamente.'}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 py-3 text-xs font-bold text-white shadow-md shadow-rose-600/20 active:scale-98 transition-all cursor-pointer"
            >
              {language === 'en' ? 'Save Changes' : 'Guardar Cambios'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
