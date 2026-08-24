import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Default fallback reference exchange rate for USD -> ARS (DolarApi Blue Venta)
export const USD_TO_ARS_RATE = Number(process.env.NEXT_PUBLIC_USD_ARS_RATE) || 1500;

export function convertUsdToArs(amountUsd: number, customRate?: number): number {
  const rate = customRate && customRate > 0 ? customRate : USD_TO_ARS_RATE;
  return Math.round(amountUsd * rate);
}

export function convertArsToUsd(amountArs: number, customRate?: number): number {
  const rate = customRate && customRate > 0 ? customRate : USD_TO_ARS_RATE;
  return Number((amountArs / rate).toFixed(2));
}

export function formatCurrency(
  amount: number,
  currency: 'USD' | 'ARS' = 'USD',
  customRate?: number
): string {
  if (currency === 'ARS') {
    const arsAmount = convertUsdToArs(amount, customRate);
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(arsAmount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}
