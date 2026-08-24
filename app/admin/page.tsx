'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
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
  Lock,
  Mail,
  KeyRound,
  ShieldAlert,
  LogIn,
  LogOut,
  ArrowRight,
} from 'lucide-react';

type AdminTab = 'kanban' | 'stats' | 'commissions' | 'customers' | 'profile';

export default function AdminPage() {
  const { artist, updateArtist, customers } = useApp();
  const { user, isAdmin, logout, loginAdminWithPassword } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('kanban');

  // Admin Login with Email & Password Form state
  const [adminEmail, setAdminEmail] = useState('peti.artist@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Artist profile editing state
  const [name, setName] = useState(artist.name);
  const [handle, setHandle] = useState(artist.handle);
  const [avatar, setAvatar] = useState(artist.avatar);
  const [bio, setBio] = useState(artist.bio);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword.trim()) return;

    setIsLoading(true);
    setLoginError('');

    const res = await loginAdminWithPassword(adminEmail, adminPassword);
    setIsLoading(false);

    if (!res.success) {
      setLoginError(res.error || 'Credenciales de administrador incorrectas.');
    }
  };

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

  // 🔒 CASE 1: User is not authenticated as Admin -> Show Secure Email & Password Login
  if (!user || !isAdmin) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-rose-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-inner">
              <Lock className="h-7 w-7" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
                Acceso Exclusivo de Artista
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
                Panel de Administración
              </h1>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
              Ingresa con tu correo de artista y tu contraseña de seguridad.
            </p>
          </div>

          {/* If a customer account is currently logged in */}
          {user && !isAdmin && (
            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/30 p-3.5 space-y-1 text-xs text-amber-800 dark:text-amber-300">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Cuenta actual sin permisos de artista</span>
              </div>
              <p className="text-[11px] text-amber-700/90 dark:text-amber-400/90">
                Has iniciado como comprador (<strong className="font-semibold">{user.email}</strong>). Inicia sesión abajo con tu correo y contraseña de Peti.
              </p>
            </div>
          )}

          {/* Secure Email & Password Form */}
          <form onSubmit={handleAdminLogin} className="space-y-3.5 text-left text-xs">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                Correo Electrónico de Artista
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="peti.artist@gmail.com"
                  className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 py-3 pl-10 pr-4 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-rose-500 focus:outline-none"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                Contraseña de Administrador
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 py-3 pl-10 pr-4 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-rose-500 focus:outline-none"
                />
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold animate-in fade-in duration-200">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 py-3.5 px-4 text-xs font-bold text-white shadow-lg shadow-rose-600/25 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" />
              <span>{isLoading ? 'Verificando...' : 'Iniciar Sesión como Administrador'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors py-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Volver a la Tienda de Comisiones</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 👑 CASE 2: Authenticated Admin Dashboard
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
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 sm:h-7 sm:w-7 text-rose-500" />
              <span>Panel de Artista</span>
            </h1>
            <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold">
              Admin • {user.email}
            </span>
          </div>
        </div>

        {/* Tab Navigation & Logout */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none rounded-2xl bg-neutral-100 dark:bg-neutral-900 p-1.5">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Perfil</span>
            </button>
          </div>

          <button
            onClick={() => logout()}
            className="flex items-center gap-1 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-neutral-800 p-2 sm:px-3 sm:py-2 text-xs font-semibold text-neutral-500 transition-colors cursor-pointer"
            title="Cerrar Sesión de Administrador"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
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
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 px-5 py-2.5 font-bold text-white shadow-md shadow-rose-600/20 cursor-pointer"
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
