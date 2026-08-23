'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/app-context';
import { Commission, CommissionOption } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  Truck,
  Image as ImageIcon,
  Layers,
} from 'lucide-react';

export const CommissionCrud = () => {
  const { commissions, addCommission, updateCommission, deleteCommission, currency } = useApp();

  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Anime');
  const [priceMin, setPriceMin] = useState(50);
  const [priceMax, setPriceMax] = useState<number | undefined>(150);
  const [slotsAvailable, setSlotsAvailable] = useState(5);
  const [deliveryDays, setDeliveryDays] = useState(7);
  const [samplesText, setSamplesText] = useState('');
  const [additionalInfoText, setAdditionalInfoText] = useState('');
  const [options, setOptions] = useState<CommissionOption[]>([]);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionPrice, setNewOptionPrice] = useState(25);
  const [active, setActive] = useState(true);

  const openCreateModal = () => {
    setEditingCommission(null);
    setTitle('');
    setDescription('');
    setCategory('Anime');
    setPriceMin(60);
    setPriceMax(180);
    setSlotsAvailable(5);
    setDeliveryDays(7);
    setSamplesText('https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80\nhttps://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80');
    setAdditionalInfoText('Archivos entregados en PNG 300 DPI + PSD\nIncluye 2 rondas de boceto gratuitas');
    setOptions([
      { id: 'opt-bg', name: 'Fondo Ilustrado Detallado', price: 40, description: 'Escenario completo con perspectiva e iluminación' },
      { id: 'opt-alt', name: 'Expresión o Ropa Alternativa', price: 20, description: 'Versión adicional con cambio de atuendo' },
    ]);
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (commission: Commission) => {
    setEditingCommission(commission);
    setTitle(commission.title);
    setDescription(commission.description);
    setCategory(commission.category || 'Anime');
    setPriceMin(commission.priceMin);
    setPriceMax(commission.priceMax);
    setSlotsAvailable(commission.slotsAvailable);
    setDeliveryDays(commission.deliveryDays);
    setSamplesText(commission.samples.join('\n'));
    setAdditionalInfoText(commission.additionalInfo ? commission.additionalInfo.join('\n') : '');
    setOptions(commission.options || []);
    setActive(commission.active);
    setIsModalOpen(true);
  };

  const handleAddOption = () => {
    if (!newOptionName.trim()) return;
    const newOpt: CommissionOption = {
      id: 'opt-' + Date.now(),
      name: newOptionName.trim(),
      price: newOptionPrice,
    };
    setOptions([...options, newOpt]);
    setNewOptionName('');
    setNewOptionPrice(20);
  };

  const handleRemoveOption = (optId: string) => {
    setOptions(options.filter((o) => o.id !== optId));
  };

  const handleSaveCommission = (e: React.FormEvent) => {
    e.preventDefault();
    const samplesArray = samplesText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const additionalInfoArray = additionalInfoText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const commissionData: Commission = {
      id: editingCommission ? editingCommission.id : 'comm-' + Date.now(),
      slug: editingCommission?.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'commission-' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      priceMin: Number(priceMin),
      priceMax: priceMax ? Number(priceMax) : undefined,
      slotsAvailable: Number(slotsAvailable),
      deliveryDays: Number(deliveryDays),
      samples: samplesArray.length > 0 ? samplesArray : ['https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'],
      additionalInfo: additionalInfoArray,
      options,
      active,
    };

    if (editingCommission) {
      updateCommission(editingCommission.id, commissionData);
    } else {
      addCommission(commissionData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & New Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-wider text-neutral-900 dark:text-white">
            Gestión Total de Comisiones (CRUD)
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Crea nuevos tipos de comisión, modifica precios, slots disponibles, adicionales y fotos de muestra.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Comisión</span>
        </button>
      </div>

      {/* Commissions Table / Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {commissions.map((comm) => (
          <div
            key={comm.id}
            className={`rounded-2xl border p-4 sm:p-5 space-y-4 transition-all ${
              comm.active
                ? 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs'
                : 'border-neutral-200 dark:border-neutral-800/60 bg-neutral-100/50 dark:bg-neutral-950/40 opacity-75'
            }`}
          >
            {/* Header: Title + Active Status */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={comm.samples[0] || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=200&q=80'}
                  alt={comm.title}
                  className="h-12 w-12 rounded-xl object-cover border border-neutral-200 dark:border-neutral-800 shrink-0"
                />
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-500 dark:text-rose-400">
                    {comm.category || 'General'}
                  </span>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    {comm.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    comm.active
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-neutral-200 text-neutral-500 dark:bg-neutral-800'
                  }`}
                >
                  {comm.active ? 'Activa' : 'Pausada'}
                </span>
              </div>
            </div>

            {/* Metrics: Price, Slots, Delivery */}
            <div className="grid grid-cols-3 gap-2 text-center rounded-xl bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs">
              <div>
                <span className="text-[10px] text-neutral-400 block font-medium">Rango Precio</span>
                <span className="font-extrabold text-rose-600 dark:text-rose-400">
                  {comm.priceMax
                    ? `${formatCurrency(comm.priceMin, currency)} - ${formatCurrency(comm.priceMax, currency)}`
                    : formatCurrency(comm.priceMin, currency)}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-neutral-400 block font-medium">Slots Libres</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {comm.slotsAvailable}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-neutral-400 block font-medium">Entrega</span>
                <span className="font-bold text-neutral-700 dark:text-neutral-300">
                  {comm.deliveryDays} días
                </span>
              </div>
            </div>

            {/* Quick Slots Adjuster & Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-neutral-400 text-[11px] font-medium mr-1">Slots:</span>
                <button
                  onClick={() => updateCommission(comm.id, { slotsAvailable: Math.max(0, comm.slotsAvailable - 1) })}
                  className="h-6 w-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                  -
                </button>
                <span className="px-2 font-bold text-emerald-600 dark:text-emerald-400">
                  {comm.slotsAvailable}
                </span>
                <button
                  onClick={() => updateCommission(comm.id, { slotsAvailable: comm.slotsAvailable + 1 })}
                  className="h-6 w-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                  +
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateCommission(comm.id, { active: !comm.active })}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    comm.active
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
                      : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                  }`}
                >
                  {comm.active ? 'Pausar' : 'Activar'}
                </button>

                <button
                  onClick={() => openEditModal(comm)}
                  className="flex items-center gap-1 p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-medium"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Editar</span>
                </button>

                <button
                  onClick={() => deleteCommission(comm.id)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Eliminar comisión"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CRUD Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-rose-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-7 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="text-lg font-bold tracking-wider text-neutral-900 dark:text-white">
                  {editingCommission ? 'Editar Comisión' : 'Crear Nueva Comisión'}
                </h3>
                <p className="text-xs text-neutral-500">
                  Configura todas las especificaciones y opciones que verá el cliente.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCommission} className="space-y-4 text-xs">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">
                    Título de la Comisión *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Anime Style Character Illustration"
                    className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Anime / VTuber / Chibi"
                    className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Price Min, Max, Slots & Delivery Days */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">
                    Precio Mín ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={priceMin}
                    onChange={(e) => setPriceMin(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">
                    Precio Máx ($)
                  </label>
                  <input
                    type="number"
                    value={priceMax || ''}
                    onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Opcional"
                    className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">
                    Slots Libres *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={slotsAvailable}
                    onChange={(e) => setSlotsAvailable(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">
                    Días de Entrega *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-neutral-700 dark:text-neutral-300">
                  Descripción Corta *
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ilustraciones completas con coloreado profesional y efectos visuales..."
                  className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-white focus:border-rose-500 focus:outline-none resize-none"
                />
              </div>

              {/* Sample Images (1 per line) */}
              <div>
                <label className="font-bold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                  <span>URLs de Imágenes de Muestra (1 por línea, ideal 6 fotos)</span>
                  <span className="text-[10px] text-neutral-400 font-normal">Para el mosaico 2x3</span>
                </label>
                <textarea
                  rows={3}
                  value={samplesText}
                  onChange={(e) => setSamplesText(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-[11px] font-mono text-neutral-900 dark:text-white focus:border-rose-500 focus:outline-none resize-none"
                />
              </div>

              {/* Additional Information (1 bullet per line) */}
              <div>
                <label className="font-bold text-neutral-700 dark:text-neutral-300">
                  Información Adicional / Reglas (1 por línea)
                </label>
                <textarea
                  rows={2}
                  value={additionalInfoText}
                  onChange={(e) => setAdditionalInfoText(e.target.value)}
                  placeholder="Incluye 2 rondas de boceto gratuitas&#10;Archivos entregados en PNG 300 DPI"
                  className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-white focus:border-rose-500 focus:outline-none resize-none"
                />
              </div>

              {/* Add-on Options Manager */}
              <div className="space-y-2 border-t border-neutral-200 dark:border-neutral-800 pt-3">
                <label className="font-bold text-neutral-800 dark:text-neutral-200 uppercase text-[11px] tracking-wider block">
                  Opciones Adicionales / Add-ons
                </label>
                
                {options.length > 0 && (
                  <div className="space-y-1.5">
                    {options.map((opt) => (
                      <div
                        key={opt.id}
                        className="flex items-center justify-between rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-2 text-xs"
                      >
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-white">{opt.name}</p>
                          {opt.description && (
                            <p className="text-[10px] text-neutral-400">{opt.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            +{formatCurrency(opt.price, currency)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(opt.id)}
                            className="text-neutral-400 hover:text-rose-500 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new option form row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                  <input
                    type="text"
                    value={newOptionName}
                    onChange={(e) => setNewOptionName(e.target.value)}
                    placeholder="Nombre del extra (ej: Fondo detallado)"
                    className="sm:col-span-7 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-2 text-xs text-neutral-900 dark:text-white"
                  />
                  <input
                    type="number"
                    value={newOptionPrice}
                    onChange={(e) => setNewOptionPrice(Number(e.target.value))}
                    placeholder="Precio"
                    className="sm:col-span-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-2 text-xs text-neutral-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="sm:col-span-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold p-2 hover:bg-neutral-800 text-xs flex items-center justify-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Añadir</span>
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/20"
                >
                  {editingCommission ? 'Guardar Cambios' : 'Crear Comisión'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
