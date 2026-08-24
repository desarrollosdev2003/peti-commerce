import { NextResponse } from 'next/server';
import { getLiveUsdArsRate } from '@/lib/services/dolar-service';

export async function GET() {
  try {
    const rateData = await getLiveUsdArsRate();
    return NextResponse.json({
      success: true,
      ...rateData,
    });
  } catch (error) {
    console.error('Error en /api/exchange-rate:', error);
    const fallbackRate = Number(process.env.NEXT_PUBLIC_USD_ARS_RATE) || 1500;
    return NextResponse.json({
      success: false,
      rate: fallbackRate,
      venta: fallbackRate,
      casa: 'fallback',
      updatedAt: new Date().toISOString(),
    });
  }
}
