/**
 * DolarApi Service (Argentina)
 * Documentation: https://dolarapi.com/docs/argentina/
 * Utiliza el valor de "venta" de Dólar Blue (o tarjeta/oficial como fallback).
 */

const DOLAR_API_URL = 'https://dolarapi.com/v1/dolares/blue';
const FALLBACK_RATE = Number(process.env.NEXT_PUBLIC_USD_ARS_RATE) || 1500;

interface DolarApiResponse {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

let cachedRate: { rate: number; timestamp: number; data?: DolarApiResponse } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos de caché en memoria

/**
 * Obtiene la cotización en vivo de USD -> ARS usando el precio de "venta" de DolarApi
 */
export async function getLiveUsdArsRate(): Promise<{ rate: number; venta: number; casa: string; updatedAt: string }> {
  const now = Date.now();

  // Si tenemos caché válida en memoria, la retornamos
  if (cachedRate && now - cachedRate.timestamp < CACHE_TTL_MS) {
    return {
      rate: cachedRate.rate,
      venta: cachedRate.rate,
      casa: cachedRate.data?.casa || 'blue',
      updatedAt: cachedRate.data?.fechaActualizacion || new Date().toISOString(),
    };
  }

  try {
    const res = await fetch(DOLAR_API_URL, {
      next: { revalidate: 300 }, // Caché de Next.js por 5 minutos
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`DolarApi respondió con status ${res.status}`);
    }

    const data = (await res.json()) as DolarApiResponse;

    if (data && typeof data.venta === 'number' && data.venta > 0) {
      cachedRate = {
        rate: data.venta,
        timestamp: now,
        data,
      };

      return {
        rate: data.venta,
        venta: data.venta,
        casa: data.casa,
        updatedAt: data.fechaActualizacion,
      };
    }

    throw new Error('Formato inválido de respuesta de DolarApi');
  } catch (error) {
    console.warn('Advertencia: No se pudo obtener cotización de DolarApi, usando fallback:', error);
    return {
      rate: cachedRate?.rate || FALLBACK_RATE,
      venta: cachedRate?.rate || FALLBACK_RATE,
      casa: 'fallback',
      updatedAt: new Date().toISOString(),
    };
  }
}
