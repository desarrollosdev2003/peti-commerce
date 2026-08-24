'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  X,
  Mail,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Lock,
  User,
  Crown,
  LogIn,
} from 'lucide-react';

export const AuthModal = () => {
  const router = useRouter();
  const { isAuthModalOpen, setIsAuthModalOpen, loginWithOAuth, loginAdminWithPassword } = useAuth();
  
  // Tab switcher: 'customer' (Google/Discord) vs 'admin' (Email + Password)
  const [tab, setTab] = useState<'customer' | 'admin'>('customer');

  // Admin form state (Empty initial state)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword.trim()) return;

    setIsLoading(true);
    setAdminError('');

    const res = await loginAdminWithPassword(adminEmail, adminPassword);
    setIsLoading(false);

    if (res.success) {
      setIsAuthModalOpen(false);
      router.push('/admin');
    } else {
      setAdminError(res.error || 'Credenciales de administrador incorrectas.');
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-3xl border border-rose-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Role Selector Tabs */}
        <div className="flex rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-1">
          <button
            type="button"
            onClick={() => {
              setTab('customer');
              setAdminError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'customer'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Soy Comprador</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('admin');
              setAdminError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'admin'
                ? 'bg-white dark:bg-neutral-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Crown className="h-3.5 w-3.5" />
            <span>Soy el Artista</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: CLIENTES / COMPRADORES (Solo Google o Discord) */}
        {/* ======================================================== */}
        {tab === 'customer' ? (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                Acceso de Clientes
              </span>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Iniciar Sesión con 1 Clic
              </h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                No necesitas contraseñas. Tus pedidos y chats se vinculan automáticamente a tu cuenta.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => loginWithOAuth('google')}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 py-3.5 px-4 text-xs font-bold text-neutral-800 dark:text-neutral-200 shadow-2xs transition-all active:scale-98 cursor-pointer"
              >
                {/* Google Icon SVG */}
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                  />
                </svg>
                <span>Continuar con Google</span>
              </button>

              <button
                type="button"
                onClick={() => loginWithOAuth('discord')}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] py-3.5 px-4 text-xs font-bold text-white shadow-md shadow-[#5865F2]/20 transition-all active:scale-98 cursor-pointer"
              >
                {/* Discord Icon SVG */}
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <span>Continuar con Discord</span>
              </button>
            </div>

            <div className="pt-2 text-center">
              <p className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Tus datos y compras están protegidos con cifrado SSL.</span>
              </p>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* VIEW 2: ARTISTA / ADMIN (Solo Email + Contraseña)       */
          /* ======================================================== */
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                Acceso de Artista
              </span>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Iniciar Sesión de Administrador
              </h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Ingresa con tu correo de Peti y tu contraseña registrada en Supabase.
              </p>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-3.5 text-xs text-left">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="tu-correo@gmail.com"
                    className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 py-2.5 pl-9 pr-3.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-rose-500 focus:outline-none"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  Contraseña de Artista
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 py-2.5 pl-9 pr-3.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-rose-500 focus:outline-none"
                  />
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                </div>
              </div>

              {adminError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold animate-in fade-in duration-200">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 py-3 px-4 text-xs font-bold text-white shadow-md shadow-rose-600/25 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <LogIn className="h-4 w-4" />
                <span>{isLoading ? 'Verificando...' : 'Entrar al Panel Admin'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
