'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/app-context';
import { KanbanBoard } from '@/components/admin/kanban-board';
import { StatsOverview } from '@/components/admin/stats-overview';
import { CommissionCrud } from '@/components/admin/commission-crud';
import { CustomersDirectory } from '@/components/admin/customers-directory';
import {
  LayoutDashboard,
  Trello,
  BarChart3,
  Sliders,
  ArrowLeft,
  User,
  Users,
  CheckCircle2,
  ExternalLink,
  DollarSign,
} from 'lucide-react';

type AdminTab = 'kanban' | 'stats' | 'commissions' | 'customers' | 'profile';

export default function AdminPage() {
  const { artist, updateArtist, customers, currency } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>('kanban');

  // Artist profile editing state
  const [name, setName] = useState(artist.name);
  const [handle, setHandle] = useState(artist.handle);
  const [avatar, setAvatar] = useState(artist.avatar);
  const [bio, setBio] = useState(artist.bio);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateArtist({
      name: name.trim(),
      handle: handle.trim(),
      avatar: avatar.trim(),
      bio: bio.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-6 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Top Bar with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 dark:border-neutral-800 pb-5">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-neutral-500 hover:text-rose-500 transition-colors mb-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver a la Tienda</span>
          </Link>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 sm:h-7 sm:w-7 text-rose-500" />
            <span>Panel de Artista</span>
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none rounded-2xl bg-neutral-100 dark:bg-neutral-900 p-1.5">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'kanban'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Trello className="h-3.5 w-3.5" />
            <span>Mini Trello</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'customers'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Clientes ({customers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Estadísticas</span>
          </button>

          <button
            onClick={() => setActiveTab('commissions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'commissions'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Comisiones</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Perfil</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'kanban' && <KanbanBoard />}

        {activeTab === 'customers' && <CustomersDirectory />}

        {activeTab === 'stats' && <StatsOverview />}

        {activeTab === 'commissions' && <CommissionCrud />}

        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-8 shadow-xs space-y-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-wider text-neutral-900 dark:text-white">
                Editar Perfil de Artista
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Personaliza tu nombre, handle de redes, avatar y biografía que se muestran en la cabecera.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">
                    Nombre Artístico *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">
                    Handle / Usuario *
                  </label>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 dark:text-neutral-300">
                  URL del Avatar (Foto de perfil)
                </label>
                <input
                  type="text"
                  required
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 dark:text-neutral-300">
                  Biografía / Presentación *
                </label>
                <textarea
                  rows={3}
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-xs text-neutral-900 dark:text-white focus:border-rose-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
                {savedSuccess ? (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    ¡Perfil actualizado con éxito!
                  </span>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 px-5 py-2.5 font-bold text-white shadow-md shadow-rose-600/20"
                >
                  Guardar Perfil
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
