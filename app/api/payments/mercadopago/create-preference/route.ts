import { NextResponse } from 'next/server';
import { Order } from '@/lib/types';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { convertUsdToArs, USD_TO_ARS_RATE } from '@/lib/utils';

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

    // Store pending order in Supabase database
    const supabase = getSupabaseServerClient();
    if (supabase) {
      await supabase.from('orders').upsert({
        id: order.id,
        order_number: order.orderNumber,
        customer_id: order.customerId,
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        total: order.total,
        payment_method: 'mercadopago',
        status: 'pending',
        notes: order.notes,
        items: order.items,
        created_at: order.createdAt,
        estimated_delivery: order.estimatedDelivery,
      });

      // Insert welcome message in order chat
      await supabase.from('order_messages').insert({
        id: `msg-${Date.now()}-welcome`,
        order_id: order.id,
        sender: 'artist',
        sender_name: 'Peti',
        text: `¡Hola ${order.customerName}! Gracias por tu encargo (${order.orderNumber}). Ya he recibido tu briefing y referencias. Me pongo a trabajar en la composición inicial. Te compartiré por aquí los primeros bocetos para validar la pose y detalles. ✨`,
        type: 'system',
        created_at: new Date().toISOString(),
      });
    }

    // Convert items from USD to ARS for Mercado Pago Argentina
    const items = order.items.map((item) => {
      // If item is in USD (typical catalog base price like $95, $275, etc.)
      const unitPriceArs = convertUsdToArs(Number(item.unitPrice));

      return {
        id: item.commissionId,
        title: `${item.title} ($${item.unitPrice} USD)`,
        unit_price: unitPriceArs,
        quantity: item.quantity,
        currency_id: 'ARS',
        description: item.commissionData.brief.substring(0, 200),
      };
    });

    const preferenceData = {
      items,
      payer: {
        name: order.customerName,
        email: order.customerEmail,
      },
      back_urls: {
        success: `${returnUrl}?status=approved`,
        failure: `${returnUrl}?status=rejected`,
        pending: `${returnUrl}?status=pending`,
      },
      auto_return: 'approved',
      external_reference: order.orderNumber,
      statement_descriptor: 'PETI ART COMMISSIONS',
      notification_url: `${appUrl}/api/payments/mercadopago/webhook`,
      metadata: {
        usd_total: order.total,
        exchange_rate_used: USD_TO_ARS_RATE,
        order_id: order.id,
      },
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
