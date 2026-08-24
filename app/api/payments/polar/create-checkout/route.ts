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

    const totalCents = Math.round(order.total * 100);
    const itemTitles = order.items.map((i) => i.title).join(', ') || 'Comisión de Arte';

    // 1. Create a product in Polar with the exact order price (Polar name max_length is 64 chars)
    const rawName = `Pedido ${order.orderNumber} - ${itemTitles}`;
    const safeProductName = rawName.length > 55 ? `${rawName.substring(0, 52)}...` : rawName;

    const productPayload = {
      name: safeProductName,
      description: 'Ilustración digital personalizada por Peti',
      prices: [
        {
          amount_type: 'fixed',
          price_amount: totalCents,
          currency: 'usd',
        },
      ],
    };

    const prodRes = await fetch('https://api.polar.sh/v1/products/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${polarAccessToken}`,
      },
      body: JSON.stringify(productPayload),
    });

    if (!prodRes.ok) {
      const prodErr = await prodRes.json().catch(() => ({}));
      console.error('Error creating product in Polar:', prodErr);
      const msg = typeof prodErr.detail === 'string'
        ? prodErr.detail
        : prodErr.detail?.[0]?.msg || 'Error al preparar el producto en Polar';
      return NextResponse.json({ error: msg }, { status: prodRes.status });
    }

    const prodData = await prodRes.json();
    const productId = prodData.id;

    // 2. Create the Checkout Session
    const checkoutPayload = {
      products: [productId],
      customer_email: order.customerEmail,
      customer_name: order.customerName,
      success_url: `${successUrl}?checkout_id={CHECKOUT_ID}`,
      metadata: {
        order_id: order.id,
        order_number: order.orderNumber,
      },
    };

    const checkoutRes = await fetch('https://api.polar.sh/v1/checkouts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${polarAccessToken}`,
      },
      body: JSON.stringify(checkoutPayload),
    });

    if (!checkoutRes.ok) {
      const errData = await checkoutRes.json().catch(() => ({}));
      console.error('Polar Checkout API Error:', errData);
      const msg = typeof errData.detail === 'string'
        ? errData.detail
        : errData.detail?.[0]?.msg || 'Error creando sesión de checkout en Polar';
      return NextResponse.json({ error: msg }, { status: checkoutRes.status });
    }

    const data = await checkoutRes.json();
    return NextResponse.json({
      success: true,
      redirectUrl: data.url || data.checkout_url,
    });
  } catch (error) {
    console.error('Error en /api/payments/polar/create-checkout:', error);
    return NextResponse.json({ error: 'Error procesando checkout Polar' }, { status: 500 });
  }
}
