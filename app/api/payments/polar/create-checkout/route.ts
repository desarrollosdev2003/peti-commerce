import { NextResponse } from 'next/server';
import { Order } from '@/lib/types';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const polarAccessToken = process.env.POLAR_ACCESS_TOKEN || '';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  try {
    const { order } = (await request.json()) as { order: Order };

    if (!order) {
      return NextResponse.json({ error: 'Faltan datos de la orden' }, { status: 400 });
    }

    if (!polarAccessToken || polarAccessToken.includes('tu-access-token')) {
      return NextResponse.json(
        { error: 'Credenciales de Polar.sh no configuradas en el servidor.' },
        { status: 500 }
      );
    }

    const orderCleanNumber = order.orderNumber.replace('#', '');
    const successUrl = `${appUrl}/track/${orderCleanNumber}`;

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
        payment_method: 'polar',
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
        text: `¡Hola ${order.customerName}! Gracias por tu encargo (${order.orderNumber}). Ya he recibido tu briefing y referencias. Te compartiré por aquí los primeros bocetos para validar la pose y detalles. ✨`,
        type: 'system',
        created_at: new Date().toISOString(),
      });
    }

    const checkoutPayload = {
      amount: Math.round(order.total * 100), // Polar expects integer in cents (e.g. $95.00 -> 9500)
      currency: 'usd',
      customer_email: order.customerEmail,
      customer_name: order.customerName,
      success_url: `${successUrl}?checkout_id={CHECKOUT_ID}`,
      metadata: {
        order_id: order.id,
        order_number: order.orderNumber,
      },
    };

    // Call Polar.sh Custom Checkout API
    let polarRes = await fetch('https://api.polar.sh/v1/checkouts/custom/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${polarAccessToken}`,
      },
      body: JSON.stringify(checkoutPayload),
    });

    if (!polarRes.ok && polarRes.status === 404) {
      polarRes = await fetch('https://api.polar.sh/v1/checkouts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${polarAccessToken}`,
        },
        body: JSON.stringify(checkoutPayload),
      });
    }

    if (!polarRes.ok) {
      const errData = await polarRes.json().catch(() => ({}));
      console.error('Polar API Error:', errData);
      return NextResponse.json(
        { error: errData.detail || 'Error creando sesión de checkout en Polar' },
        { status: polarRes.status }
      );
    }

    const data = await polarRes.json();
    return NextResponse.json({
      success: true,
      redirectUrl: data.url || data.checkout_url,
    });
  } catch (error) {
    console.error('Error en /api/payments/polar/create-checkout:', error);
    return NextResponse.json({ error: 'Error procesando checkout Polar' }, { status: 500 });
  }
}
