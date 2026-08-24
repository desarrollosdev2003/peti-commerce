import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Current reference exchange rate for USD -> ARS (Can be overridden by env variable)
export const USD_TO_ARS_RATE = Number(process.env.NEXT_PUBLIC_USD_ARS_RATE) || 1500;

export function convertUsdToArs(amountUsd: number): number {
  return Math.round(amountUsd * USD_TO_ARS_RATE);
}

export function convertArsToUsd(amountArs: number): number {
  return Number((amountArs / USD_TO_ARS_RATE).toFixed(2));
}

export function formatCurrency(amount: number, currency: 'USD' | 'ARS' = 'USD'): string {
  if (currency === 'ARS') {
    const arsAmount = convertUsdToArs(amount);
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
