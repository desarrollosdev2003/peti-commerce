'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useApp } from '@/context/app-context';
import { Order, OrderStatus, OrderMessage } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { uploadImageFile } from '@/lib/services/upload-service';
import {
  ChevronRight,
  ChevronLeft,
  Eye,
  Trash2,
  Mail,
  ExternalLink,
  User,
  X,
  GripVertical,
  MessageSquare,
  Send,
  Paperclip,
  Sparkles,
  Upload,
  RefreshCw,
} from 'lucide-react';

const COLUMNS: { id: OrderStatus; label: string; color: string; badgeColor: string; headerBorder: string }[] = [
  { id: 'pending', label: 'Pendientes / Nuevos', color: 'border-rose-500/30 bg-rose-500/5', badgeColor: 'bg-rose-500/20 text-rose-600 dark:text-rose-400', headerBorder: 'border-rose-500/40' },
  { id: 'in_progress', label: 'En Proceso (Arte)', color: 'border-purple-500/30 bg-purple-500/5', badgeColor: 'bg-purple-500/20 text-purple-600 dark:text-purple-400', headerBorder: 'border-purple-500/40' },
  { id: 'in_review', label: 'En Revisión (Bocetos)', color: 'border-pink-500/30 bg-pink-500/5', badgeColor: 'bg-pink-500/20 text-pink-600 dark:text-pink-400', headerBorder: 'border-pink-500/40' },
  { id: 'completed', label: 'Completados', color: 'border-emerald-500/30 bg-emerald-500/5', badgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400', headerBorder: 'border-emerald-500/40' },
];

/* Droppable Column Component */
interface KanbanColumnProps {
  column: (typeof COLUMNS)[0];
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  currency: 'USD' | 'ARS';
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  orders,
  onSelectOrder,
  currency,
  onUpdateStatus,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'Column', column },
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border p-3 sm:p-3.5 ${column.color} flex flex-col space-y-3 min-h-[380px] sm:min-h-[440px] transition-all duration-200 ${
        isOver ? 'ring-2 ring-rose-500/80 bg-rose-500/10 border-rose-500' : ''
      }`}
    >
      {/* Column Header */}
      <div className={`flex items-center justify-between pb-2.5 border-b ${column.headerBorder}`}>
        <span className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
          <span>{column.label}</span>
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${column.badgeColor}`}>
          {orders.length}
        </span>
      </div>

      {/* Orders List */}
      <SortableContext items={orders.map((o) => o.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2.5 flex-1 min-h-[100px]">
          {orders.length === 0 ? (
            <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 text-center text-xs text-neutral-400">
              Arrastra un pedido aquí
            </div>
          ) : (
            orders.map((order) => (
              <SortableOrderCard
                key={order.id}
                order={order}
                onSelectOrder={onSelectOrder}
                currency={currency}
                onUpdateStatus={onUpdateStatus}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
};

/* Sortable Draggable Card */
interface SortableOrderCardProps {
  order: Order;
  onSelectOrder: (order: Order) => void;
  currency: 'USD' | 'ARS';
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const SortableOrderCard: React.FC<SortableOrderCardProps> = ({
  order,
  onSelectOrder,
  currency,
  onUpdateStatus,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: order.id,
    data: { type: 'Order', order },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-40 rounded-xl border-2 border-dashed border-rose-500 bg-rose-500/5 p-4 min-h-[140px]"
      />
    );
  }

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    if (current === 'pending') return 'in_progress';
    if (current === 'in_progress') return 'in_review';
    if (current === 'in_review') return 'completed';
    return null;
  };

  const getPrevStatus = (current: OrderStatus): OrderStatus | null => {
    if (current === 'completed') return 'in_review';
    if (current === 'in_review') return 'in_progress';
    if (current === 'in_progress') return 'pending';
    return null;
  };

  const nextStatus = getNextStatus(order.status);
  const prevStatus = getPrevStatus(order.status);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 sm:p-3.5 shadow-2xs space-y-2.5 transition-all hover:border-rose-500/60 hover:shadow-md touch-manipulation"
    >
      {/* Top: Drag Handle + Order # and Payment */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Arrastrar tarjeta"
            aria-label="Arrastrar tarjeta"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
            {order.orderNumber}
          </span>
        </div>

        <span
          className={`text-[10px] font-bold uppercase rounded-md px-1.5 py-0.5 ${
            order.paymentMethod === 'mercadopago'
              ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
              : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
          }`}
        >
          {order.paymentMethod === 'mercadopago' ? 'Mercado Pago' : 'Polar'}
        </span>
      </div>

      {/* Customer & Commission Title */}
      <div>
        <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
          <User className="h-3 w-3 text-neutral-400" />
          {order.customerName}
        </p>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
          {order.items.map((i) => i.title).join(', ')}
        </p>
      </div>

      {/* Messages badge counter */}
      {order.messages && order.messages.length > 0 && (
        <div className="flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-neutral-800/80 px-2 py-0.5 rounded-md border border-rose-100 dark:border-neutral-700">
          <MessageSquare className="h-3 w-3" />
          <span>{order.messages.length} mensajes en chat</span>
        </div>
      )}

      {/* Price & Date */}
      <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800 text-[11px]">
        <span className="font-bold text-rose-600 dark:text-rose-400">
          {formatCurrency(order.total, currency)}
        </span>
        <span className="text-neutral-400 text-[10px]">{formatDate(order.createdAt)}</span>
      </div>

      {/* Card Actions: Prev, View Modal, Next */}
      <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800/60">
        {prevStatus ? (
          <button
            onClick={() => onUpdateStatus(order.id, prevStatus)}
            className="flex items-center gap-0.5 rounded-lg p-1 text-[10px] font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Mover al estado anterior"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Atrás</span>
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={() => onSelectOrder(order)}
          className="flex items-center gap-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 px-2 py-1 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        >
          <Eye className="h-3 w-3" />
          <span>Detalles</span>
        </button>

        {nextStatus ? (
          <button
            onClick={() => onUpdateStatus(order.id, nextStatus)}
            className="flex items-center gap-0.5 rounded-lg p-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Avanzar al siguiente estado"
          >
            <span className="hidden sm:inline">Avanzar</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};

/* Drag Overlay Card */
const DraggingCardPreview: React.FC<{ order: Order; currency: 'USD' | 'ARS' }> = ({ order, currency }) => {
  return (
    <div className="w-64 sm:w-72 rounded-xl border-2 border-rose-500 bg-white dark:bg-neutral-900 p-3.5 shadow-2xl space-y-2 rotate-2 scale-105 pointer-events-none">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
          {order.orderNumber}
        </span>
        <span className="text-[10px] font-bold uppercase rounded-md bg-rose-500/10 text-rose-600 px-1.5 py-0.5">
          {order.paymentMethod === 'mercadopago' ? 'Mercado Pago' : 'Polar'}
        </span>
      </div>
      <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
        {order.customerName}
      </p>
      <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
        {formatCurrency(order.total, currency)}
      </p>
    </div>
  );
};

/* Main Kanban Board */
export const KanbanBoard = () => {
  const { orders, updateOrderStatus, deleteOrder, addOrderMessage, addDeliveredFile, currency, refreshOrders } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeDraggingOrder, setActiveDraggingOrder] = useState<Order | null>(null);
  const [mobileActiveColumn, setMobileActiveColumn] = useState<OrderStatus>('pending');
  const [modalTab, setModalTab] = useState<'details' | 'chat'>('details');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshOrders();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Admin chat input states
  const [adminChatText, setAdminChatText] = useState('');
  const [isUploadingSketch, setIsUploadingSketch] = useState(false);
  const adminFileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const order = orders.find((o) => o.id === active.id);
    if (order) setActiveDraggingOrder(order);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeOrder = orders.find((o) => o.id === activeId);
    if (!activeOrder) return;

    if (COLUMNS.some((col) => col.id === overId)) {
      const newStatus = overId as OrderStatus;
      if (activeOrder.status !== newStatus) updateOrderStatus(activeId, newStatus);
      return;
    }

    const overOrder = orders.find((o) => o.id === overId);
    if (overOrder && activeOrder.status !== overOrder.status) {
      updateOrderStatus(activeId, overOrder.status);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDraggingOrder(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeOrder = orders.find((o) => o.id === activeId);
    if (!activeOrder) return;

    if (COLUMNS.some((col) => col.id === overId)) {
      updateOrderStatus(activeId, overId as OrderStatus);
      return;
    }

    const overOrder = orders.find((o) => o.id === overId);
    if (overOrder && activeOrder.status !== overOrder.status) {
      updateOrderStatus(activeId, overOrder.status);
    }
  };

  const handleAdminSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !adminChatText.trim()) return;

    const msg = addOrderMessage(selectedOrder.id, {
      orderId: selectedOrder.id,
      sender: 'artist',
      senderName: 'Peti',
      text: adminChatText.trim(),
      type: 'message',
      isRead: false,
    });

    setAdminChatText('');
    setSelectedOrder({
      ...selectedOrder,
      messages: [...(selectedOrder.messages || []), msg],
    });
  };

  const handleAdminUploadSketch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedOrder) return;

    setIsUploadingSketch(true);
    try {
      const uploaded = await uploadImageFile(file);
      const msg = addOrderMessage(selectedOrder.id, {
        orderId: selectedOrder.id,
        sender: 'artist',
        senderName: 'Peti',
        text: '🎨 ¡Nuevo avance de boceto compartido para tu revisión!',
        attachmentUrl: uploaded.url,
        attachmentName: uploaded.name,
        type: 'sketch_submission',
        isRead: false,
      });

      setSelectedOrder({
        ...selectedOrder,
        status: 'in_progress',
        messages: [...(selectedOrder.messages || []), msg],
      });
      updateOrderStatus(selectedOrder.id, 'in_progress');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingSketch(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info & Mobile Column Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
              <span>Mini Trello de Comisiones</span>
              <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                {orders.length} pedidos
              </span>
            </h2>

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1 text-[11px] font-bold text-neutral-600 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-50 dark:hover:bg-neutral-700 px-2.5 py-1 rounded-xl transition-all cursor-pointer border border-neutral-200 dark:border-neutral-700"
              title="Sincronizar pedidos desde la base de datos de Supabase"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin text-rose-500' : ''}`} />
              <span>{isRefreshing ? 'Cargando...' : 'Sincronizar'}</span>
            </button>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Arrastra y suelta tarjetas entre columnas o abre el modal para chatear con el cliente.
          </p>
        </div>

        {/* Mobile-only Column Tabs Switcher for small screens */}
        <div className="flex lg:hidden items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-neutral-200 dark:border-neutral-800">
          {COLUMNS.map((col) => {
            const count = orders.filter((o) => o.status === col.id).length;
            return (
              <button
                key={col.id}
                onClick={() => setMobileActiveColumn(col.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  mobileActiveColumn === col.id
                    ? `${col.badgeColor} ring-1 ring-rose-500/50 shadow-xs`
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                }`}
              >
                <span>{col.label.split(' ')[0]}</span>
                <span className="rounded-full bg-black/10 dark:bg-white/10 px-1.5 py-0.2 text-[10px]">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DndContext Wrapping Columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Desktop View: 4 Columns Grid */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              orders={orders.filter((o) => o.status === col.id)}
              onSelectOrder={setSelectedOrder}
              currency={currency}
              onUpdateStatus={updateOrderStatus}
            />
          ))}
        </div>

        {/* Mobile / Tablet View: Display active tab column + quick switcher */}
        <div className="lg:hidden">
          {COLUMNS.filter((col) => col.id === mobileActiveColumn).map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              orders={orders.filter((o) => o.status === col.id)}
              onSelectOrder={setSelectedOrder}
              currency={currency}
              onUpdateStatus={updateOrderStatus}
            />
          ))}
        </div>

        {/* Drag Overlay during active drag */}
        <DragOverlay>
          {activeDraggingOrder ? (
            <DraggingCardPreview order={activeDraggingOrder} currency={currency} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Order Details & Chat Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Gestión de Orden</span>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-mono flex items-center gap-2">
                  <span>{selectedOrder.orderNumber}</span>
                  <Link
                    href={`/track/${selectedOrder.orderNumber.replace('#', '')}`}
                    target="_blank"
                    className="text-xs text-rose-500 font-sans hover:underline flex items-center gap-0.5 font-normal"
                    title="Ver página como la ve el cliente"
                  >
                    <span>Ver como Cliente</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Subtabs (Detalles vs Chat en Vivo) */}
            <div className="flex items-center gap-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1 text-xs">
              <button
                onClick={() => setModalTab('details')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  modalTab === 'details'
                    ? 'bg-white dark:bg-neutral-900 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-neutral-500'
                }`}
              >
                Detalles & Briefing
              </button>
              <button
                onClick={() => setModalTab('chat')}
                className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                  modalTab === 'chat'
                    ? 'bg-white dark:bg-neutral-900 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-neutral-500'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Chat con el Cliente</span>
                {selectedOrder.messages && selectedOrder.messages.length > 0 && (
                  <span className="rounded-full bg-rose-500 text-white text-[9px] px-1.5 py-0.2">
                    {selectedOrder.messages.length}
                  </span>
                )}
              </button>
            </div>

            {modalTab === 'details' ? (
              /* Tab 1: Order Details */
              <div className="space-y-4">
                {/* Customer Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="rounded-xl bg-neutral-50 dark:bg-neutral-950 p-3">
                    <span className="text-neutral-400 font-semibold block text-[10px] uppercase">Cliente</span>
                    <p className="font-bold text-neutral-900 dark:text-white mt-0.5">{selectedOrder.customerName}</p>
                    <p className="text-neutral-500 text-[11px] truncate flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{selectedOrder.customerEmail}</span>
                    </p>
                  </div>

                  <div className="rounded-xl bg-neutral-50 dark:bg-neutral-950 p-3">
                    <span className="text-neutral-400 font-semibold block text-[10px] uppercase">Monto & Pago</span>
                    <p className="font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                      {formatCurrency(selectedOrder.total, currency)}
                    </p>
                    <p className="text-neutral-500 text-[11px] uppercase font-semibold mt-1">
                      {selectedOrder.paymentMethod === 'mercadopago' ? 'Mercado Pago' : 'Polar.sh'}
                    </p>
                  </div>
                </div>

                {/* Commission Items and Briefings */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-neutral-400 uppercase">Encargos Solicitados</span>
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-3.5 space-y-2 text-xs bg-neutral-50/50 dark:bg-neutral-950/50"
                    >
                      <div className="flex items-center justify-between font-bold text-neutral-900 dark:text-white">
                        <span className="truncate">{item.title}</span>
                        <span className="text-rose-600 dark:text-rose-400 shrink-0">{formatCurrency(item.unitPrice, currency)}</span>
                      </div>

                      <div className="rounded-xl bg-white dark:bg-neutral-900 p-3 space-y-1.5 text-neutral-700 dark:text-neutral-300">
                        <p>
                          <strong>Briefing / Idea:</strong> {item.commissionData.brief}
                        </p>
                        {item.commissionData.references && (
                          <p className="flex items-center gap-1 text-rose-500 dark:text-rose-400">
                            <strong>Referencias:</strong>
                            <a
                              href={item.commissionData.references}
                              target="_blank"
                              rel="noreferrer"
                              className="underline flex items-center gap-0.5 truncate"
                            >
                              <span className="truncate">{item.commissionData.references}</span>
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          </p>
                        )}
                        {item.selectedOptionNames && item.selectedOptionNames.length > 0 && (
                          <p className="text-neutral-500 text-[11px]">
                            <strong>Adicionales:</strong> {item.selectedOptionNames.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Change Status Controls */}
                <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <span className="text-xs font-bold text-neutral-400 uppercase">Cambiar Estado en Trello</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {COLUMNS.map((col) => (
                      <button
                        key={col.id}
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, col.id);
                          setSelectedOrder({ ...selectedOrder, status: col.id });
                        }}
                        className={`py-2 px-1 rounded-xl text-[10px] font-bold text-center transition-all ${
                          selectedOrder.status === col.id
                            ? `${col.badgeColor} ring-2 ring-rose-500`
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                      >
                        {col.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Tab 2: Live Chat with Customer */
              <div className="space-y-3">
                <div className="h-64 overflow-y-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-3 space-y-3">
                  {selectedOrder.messages && selectedOrder.messages.length > 0 ? (
                    selectedOrder.messages.map((msg) => {
                      const isArtist = msg.sender === 'artist';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isArtist ? 'items-end' : 'items-start'}`}
                        >
                          <span className="text-[10px] text-neutral-400 font-semibold mb-0.5">
                            {isArtist ? 'Tú (Peti)' : selectedOrder.customerName}
                          </span>
                          <div
                            className={`max-w-[85%] rounded-2xl p-3 text-xs space-y-1.5 ${
                              isArtist
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
                                className="max-h-40 rounded-lg object-cover border border-white/20"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                      No hay mensajes previos con este cliente.
                    </div>
                  )}
                </div>

                {/* Admin Chat Input */}
                <form onSubmit={handleAdminSendMessage} className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={adminFileInputRef}
                    onChange={handleAdminUploadSketch}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingSketch}
                    onClick={() => adminFileInputRef.current?.click()}
                    className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-rose-500 hover:border-rose-500 transition-colors"
                    title="Subir y enviar boceto preliminar"
                  >
                    {isUploadingSketch ? <RefreshCw className="h-4 w-4 animate-spin text-rose-500" /> : <Upload className="h-4 w-4" />}
                  </button>

                  <input
                    type="text"
                    value={adminChatText}
                    onChange={(e) => setAdminChatText(e.target.value)}
                    placeholder="Escribe una respuesta para el cliente..."
                    className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-rose-500 focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={!adminChatText.trim()}
                    className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 p-2.5 text-white shadow-xs disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Delete Order option */}
            <div className="flex justify-between items-center pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => {
                  deleteOrder(selectedOrder.id);
                  setSelectedOrder(null);
                }}
                className="flex items-center gap-1 text-xs text-rose-500 hover:underline"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Eliminar orden</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
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
