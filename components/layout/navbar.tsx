'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Palette,
  LayoutDashboard,
  FileText,
  Menu,
  X,
  ShieldCheck,
  Search,
  MessageSquare,
  User,
  Package,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useCart } from '@/context/cart-context';
import { useApp } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';

export const Navbar = () => {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { artist, currency, setCurrency } = useApp();
  const { user, logout, setIsAuthModalOpen } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAdmin = user?.role === 'admin' || pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-rose-100/80 bg-white/90 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-950/90 transition-colors">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-3.5 sm:px-6">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 group shrink-0"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-emerald-400 text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <Palette className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-1.5 text-sm sm:text-base">
                {artist.name}
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Open
                </span>
              </span>
              <span className="text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                Commissions & Store
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'text-neutral-600 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400'
              }`}
            >
              Comisiones
            </Link>

            <Link
              href="/track"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                pathname.startsWith('/track')
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'text-neutral-600 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400'
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              Seguimiento
            </Link>

            {/* Mis Pedidos (Only shown if user is logged in or active in account) */}
            {user && (
              <Link
                href="/account"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  pathname.startsWith('/account') || pathname.startsWith('/my-orders')
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : 'text-neutral-600 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400'
                }`}
              >
                <Package className="h-3.5 w-3.5" />
                Mis Pedidos & Chat
              </Link>
            )}

            <Link
              href="/terms"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                pathname === '/terms'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'text-neutral-600 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Términos
            </Link>

            {/* Admin Panel (Only shown if user has admin role or is currently on /admin) */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  pathname.startsWith('/admin')
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'text-neutral-600 hover:text-emerald-600 dark:text-neutral-400 dark:hover:text-emerald-400'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Currency switch */}
          <button
            onClick={() => setCurrency(currency === 'USD' ? 'ARS' : 'USD')}
            className="flex items-center gap-0.5 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold border border-rose-200/80 dark:border-neutral-800 hover:bg-rose-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 transition-colors"
            title="Cambiar moneda"
          >
            <span className="font-bold text-rose-500 dark:text-rose-400">$</span>
            <span className="text-[11px] font-mono">{currency}</span>
          </button>

          <ThemeToggle />

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-1.5 rounded-xl bg-neutral-900 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-all active:scale-95"
            aria-label="Ver carrito"
          >
            <ShoppingBag className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Carrito</span>
            {totalItems > 0 && (
              <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] sm:text-[11px] font-bold text-white shadow-sm animate-in zoom-in">
                {totalItems}
              </span>
            )}
          </button>

          {/* Customer Auth Button / Avatar Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 p-1 sm:px-2 sm:py-1 hover:border-rose-300 transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt={user.name}
                  className="h-6 w-6 rounded-full object-cover"
                />
                <span className="hidden sm:inline text-xs font-bold text-neutral-800 dark:text-neutral-200 max-w-[80px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown className="h-3 w-3 text-neutral-400" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-1.5 shadow-xl space-y-0.5 animate-in fade-in zoom-in-95 duration-100 z-50"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <p className="text-xs font-bold text-neutral-900 dark:text-white truncate flex items-center justify-between">
                      <span>{user.name}</span>
                      {user.role === 'admin' && (
                        <span className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded-full font-extrabold">
                          Admin
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/account"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-neutral-700 dark:text-neutral-300 hover:bg-rose-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <Package className="h-3.5 w-3.5 text-rose-500" />
                    <span>Mis Pedidos</span>
                  </Link>

                  <Link
                    href="/account"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-neutral-700 dark:text-neutral-300 hover:bg-rose-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-rose-500" />
                    <span>Centro de Chats</span>
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Panel Admin (Peti)</span>
                    </Link>
                  )}

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-neutral-800 transition-colors text-left border-t border-neutral-100 dark:border-neutral-800"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/15 text-rose-600 dark:text-rose-400 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Acceder</span>
            </button>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            aria-label="Abrir menú móvil"
          >
            {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-rose-100 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 p-4 space-y-2 animate-in slide-in-from-top-2 duration-150 backdrop-blur-md">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-colors ${
              pathname === '/'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-rose-50 dark:hover:bg-neutral-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-rose-500" />
              Catálogo de Comisiones
            </span>
            <span className="text-[10px] text-emerald-500 font-semibold">Abiertas</span>
          </Link>

          {user && (
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-colors ${
                pathname.startsWith('/account')
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-rose-50 dark:hover:bg-neutral-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4 text-rose-500" />
                Mis Pedidos & Chat
              </span>
              <span className="text-[10px] text-rose-500 font-semibold">{user.name}</span>
            </Link>
          )}

          <Link
            href="/track"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-colors ${
              pathname.startsWith('/track')
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-rose-50 dark:hover:bg-neutral-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4 text-rose-500" />
              Seguimiento de Pedido
            </span>
            <MessageSquare className="h-4 w-4 text-emerald-500" />
          </Link>

          <Link
            href="/terms"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-colors ${
              pathname === '/terms'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-rose-50 dark:hover:bg-neutral-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-rose-500" />
              Términos del Servicio
            </span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-colors ${
                pathname.startsWith('/admin')
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4 text-emerald-500" />
                Panel de Artista (Mini Trello)
              </span>
              <span className="text-[10px] rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 font-bold">
                Admin
              </span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
