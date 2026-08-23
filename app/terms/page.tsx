'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText, Sparkles, Scale, RefreshCw, AlertCircle } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
      {/* Return button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-rose-500 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Volver a la Tienda</span>
      </Link>

      {/* Header */}
      <div className="rounded-3xl border border-rose-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-10 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-neutral-900 dark:text-white">
              Términos del Servicio & Condiciones
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Última actualización: Agosto 2026 • Políticas claras para el cliente y el artista
            </p>
          </div>
        </div>
      </div>

      {/* Terms Sections */}
      <div className="space-y-6 text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">
        {/* Section 1 */}
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-bold tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-rose-500" />
            1. Proceso de Trabajo y Fases
          </h2>
          <p>
            Al solicitar una comisión a través de la plataforma, el proceso sigue las siguientes etapas en nuestro Mini Trello:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
            <li><strong>Cola / Pendiente:</strong> Se valida el briefing, las referencias visuales y el pago.</li>
            <li><strong>Boceto preliminar (Sketch):</strong> Se envía el primer borrador para validar la pose, composición y anatomía.</li>
            <li><strong>Lineart & Color base:</strong> Se avanza en los trazos definitivos y la paleta de colores.</li>
            <li><strong>Renderizado final & Entrega:</strong> Se aplican luces, sombras y efectos, entregando archivos PNG en alta resolución (300 DPI) y PSD si fue contratado.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-bold tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-purple-500" />
            2. Revisiones y Modificaciones
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
            <li>Cada encargo incluye <strong>2 rondas de revisiones gratuitas</strong> durante la fase de boceto.</li>
            <li>Se incluye <strong>1 revisión de ajuste de color</strong> una vez finalizado el coloreado.</li>
            <li>Cambios estructurales mayores solicitados después de haber aprobado el boceto tendrán un recargo proporcional al tiempo extra requerido.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-bold tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            3. Derechos de Autor y Licencia Comercial
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-950 p-4 border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-bold tracking-wider text-neutral-900 dark:text-white text-sm mb-1">Uso Personal</h3>
              <p className="text-neutral-500">
                Puedes usar el arte como avatar, fondo de pantalla, imprimirlo para uso propio o publicarlo en tus redes sociales acreditando al artista (@peti_art). No está permitida la reventa ni monetización.
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/10 p-4 border border-emerald-500/20">
              <h3 className="font-bold tracking-wider text-emerald-700 dark:text-emerald-300 text-sm mb-1">Uso Comercial</h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                Permite el uso de la ilustración para streaming (Twitch/YouTube), portadas de álbumes, merchandising físico o digital, publicidad y branding sin regalías adicionales.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4 */}
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-bold tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            4. Pagos, Pasarelas y Política de Reembolsos
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
            <li>Los pagos se procesan de manera segura mediante <strong>Mercado Pago</strong> (Argentina / Latam) y <strong>Polar.sh</strong> (Internacional).</li>
            <li><strong>Reembolso del 100%:</strong> Si el artista no puede iniciar el trabajo o si el cliente cancela antes del envío del primer boceto.</li>
            <li><strong>Reembolso del 50%:</strong> Si se cancela durante la fase de boceto inicial.</li>
            <li><strong>No reembolsable:</strong> Una vez aprobado el boceto y comenzado el lineart/color definitivo.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
