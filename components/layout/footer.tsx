import React from 'react';
import Link from 'next/link';
import { Palette, Heart, ShieldCheck, Code, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-rose-100/80 bg-rose-50/20 dark:border-neutral-800/80 dark:bg-neutral-950/60 py-10 transition-colors">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-sm shadow-rose-500/20">
              <Palette className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900 dark:text-white">
                Peti E-commerce • Art Commissions
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Plataforma de comisiones artísticas y pagos seguros
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
            <Link href="/" className="hover:text-rose-500 transition-colors">
              Comisiones
            </Link>
            <Link href="/track" className="hover:text-rose-500 transition-colors">
              Seguimiento de Pedido
            </Link>
            <Link href="/terms" className="hover:text-rose-500 transition-colors flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Términos del Servicio
            </Link>
            <Link href="/admin" className="hover:text-rose-500 transition-colors">
              Panel Artista
            </Link>
          </div>
        </div>

        {/* Developer Credit & Copyright Row */}
        <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500 text-center md:text-left">
          <div className="space-y-1">
            <p>© {new Date().getFullYear()} Peti commissions. Todos los derechos reservados.</p>
            <p className="flex items-center justify-center md:justify-start gap-1 text-[11px] text-neutral-500 dark:text-neutral-400">
              <span>Diseñado y Desarrollado con</span>
              <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
              <span>por</span>
              <a
                href="https://github.com/FrancoBerlochi"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-neutral-900 dark:text-white hover:text-rose-500 dark:hover:text-rose-400 transition-colors inline-flex items-center gap-1 underline underline-offset-2"
              >
                <span>Franco Berlochi</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span>Pagos procesados por</span>
            <span className="font-semibold text-sky-500">Mercado Pago</span>
            <span>&</span>
            <span className="font-semibold text-purple-500">Polar.sh</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
