import { NextResponse } from 'next/server';
import { Order } from '@/lib/types';

const mpAccessToken = process.env.MP_ACCESS_TOKEN || '';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  try {
    const { order } = (await request.json()) as { order: Order };

    if (!order) {
      return NextResponse.json({ error: 'Faltan datos de la orden' }, { status: 400 });
    }

    if (!mpAccessToken || mpAccessToken.includes('tu-access-token')) {
      return NextResponse.json(
        { error: 'Credenciales de Mercado Pago no configuradas en el servidor.' },
        { status: 500 }
      );
    }

    const orderCleanNumber = order.orderNumber.replace('#', '');
    const returnUrl = `${appUrl}/track/${orderCleanNumber}`;

    const items = order.items.map((item) => ({
      id: item.commissionId,
      title: `${item.title} (${item.commissionData.usageType})`,
      unit_price: Number(item.unitPrice),
      quantity: item.quantity,
      currency_id: 'ARS',
      description: item.commissionData.brief.substring(0, 200),
    }));

    const preferenceData = {
      items,
      payer: {
        name: order.customerName,
        email: order.customerEmail,
      },
      back_urls: {
        success: returnUrl,
        failure: returnUrl,
        pending: returnUrl,
      },
      auto_return: 'approved',
      external_reference: order.orderNumber,
      statement_descriptor: 'PETI COMMISSIONS',
      notification_url: `${appUrl}/api/payments/mercadopago/webhook`,
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mpAccessToken}`,
      },
      body: JSON.stringify(preferenceData),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error('Mercado Pago API error:', errData);
      return NextResponse.json(
        { error: errData.message || 'Error comunicando con Mercado Pago' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      preferenceId: data.id,
      redirectUrl: data.init_point || data.sandbox_init_point,
    });
  } catch (error) {
    console.error('Error en create-preference Mercado Pago:', error);
    return NextResponse.json({ error: 'Error procesando pasarela de pago' }, { status: 500 });
  }
}
