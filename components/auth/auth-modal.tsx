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
  User,
  Crown,
  LogIn,
  UserPlus,
  Loader2,
} from 'lucide-react';

export const AuthModal = () => {
  const router = useRouter();
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginWithGoogle,
    loginCustomerWithPassword,
    registerCustomerWithPassword,
    loginAdminWithPassword,
  } = useAuth();

  // Role Tab: 'customer' vs 'admin'
  const [roleTab, setRoleTab] = useState<'customer' | 'admin'>('customer');

  // Customer Mode: 'login' vs 'register'
  const [customerMode, setCustomerMode] = useState<'login' | 'register'>('login');

  // Customer Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerError, setCustomerError] = useState('');
  const [customerSuccess, setCustomerSuccess] = useState('');

  // Admin Form State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  // Handle Google Login
  const handleGoogleClick = async () => {
    setCustomerError('');
    setIsLoading(true);
    const res = await loginWithGoogle();
    setIsLoading(false);
    if (!res.success && res.error) {
      setCustomerError(res.error);
    }
  };

  // Handle Customer Form Submit (Login or Register)
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerError('');
    setCustomerSuccess('');

    if (!customerEmail.trim() || !customerPassword.trim()) {
      setCustomerError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (customerMode === 'register' && customerPassword.length < 6) {
      setCustomerError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    if (customerMode === 'register') {
      const res = await registerCustomerWithPassword(customerEmail, customerPassword, customerName);
      setIsLoading(false);
      if (res.success) {
        setIsAuthModalOpen(false);
        router.push('/account');
      } else {
        setCustomerError(res.error || 'No se pudo crear la cuenta.');
      }
    } else {
      const res = await loginCustomerWithPassword(customerEmail, customerPassword);
      setIsLoading(false);
      if (res.success) {
        setIsAuthModalOpen(false);
        router.push('/account');
      } else {
        setCustomerError(res.error || 'Credenciales inválidas.');
      }
    }
  };

  // Handle Admin Form Submit
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
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl border border-rose-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-2xl space-y-4"
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
              setRoleTab('customer');
              setCustomerError('');
              setAdminError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              roleTab === 'customer'
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
              setRoleTab('admin');
              setCustomerError('');
              setAdminError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              roleTab === 'admin'
                ? 'bg-white dark:bg-neutral-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Crown className="h-3.5 w-3.5" />
            <span>Soy el Artista</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: CLIENTES / COMPRADORES (Formulario primero, Google después) */}
        {/* ======================================================== */}
        {roleTab === 'customer' ? (
          <div className="space-y-3.5">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                Acceso de Clientes
              </span>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                {customerMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Accede a tu historial de encargos y chatea en vivo con Peti.
              </p>
            </div>

            {/* Mode Switcher: Iniciar Sesión vs Crear Cuenta */}
            <div className="flex rounded-xl bg-neutral-100 dark:bg-neutral-800/60 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setCustomerMode('login');
                  setCustomerError('');
                }}
                className={`flex-1 py-1.5 font-bold rounded-lg transition-all text-[11px] ${
                  customerMode === 'login'
                    ? 'bg-white dark:bg-neutral-900 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Ya tengo cuenta
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomerMode('register');
                  setCustomerError('');
                }}
                className={`flex-1 py-1.5 font-bold rounded-lg transition-all text-[11px] ${
                  customerMode === 'register'
                    ? 'bg-white dark:bg-neutral-900 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Crear cuenta nueva
              </button>
            </div>

            {/* Email + Password Form */}
            <form onSubmit={handleCustomerSubmit} className="space-y-2.5 text-xs text-left">
              {customerMode === 'register' && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                    Tu Nombre o Nickname
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 py-2.5 pl-9 pr-3.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-rose-500 focus:outline-none"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="tu-email@gmail.com"
                    className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 py-2.5 pl-9 pr-3.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-rose-500 focus:outline-none"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  Contraseña {customerMode === 'register' && '(Mínimo 6 caracteres)'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={customerPassword}
                    onChange={(e) => setCustomerPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 py-2.5 pl-9 pr-3.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-rose-500 focus:outline-none"
                  />
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                </div>
              </div>

              {customerError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold animate-in fade-in duration-200 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{customerError}</span>
                </div>
              )}

              {customerSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold animate-in fade-in duration-200 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>{customerSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 py-3 px-4 text-xs font-bold text-white shadow-md shadow-rose-600/25 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : customerMode === 'login' ? (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Entrar a mi Cuenta</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Crear mi Cuenta</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800" />
              <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-neutral-400">
                O continuar con
              </span>
              <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800" />
            </div>

            {/* Google OAuth Button */}
            <div>
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 py-3 px-4 text-xs font-bold text-neutral-800 dark:text-neutral-200 shadow-2xs transition-all active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {/* Google Icon SVG */}
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
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
            </div>

            <div className="pt-1 text-center">
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

            <form onSubmit={handleAdminSubmit} className="space-y-3 text-xs text-left">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
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
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
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
                <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold animate-in fade-in duration-200 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 py-3 px-4 text-xs font-bold text-white shadow-md shadow-rose-600/25 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Entrar al Panel Admin</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
