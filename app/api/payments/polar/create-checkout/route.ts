import { NextResponse } from 'next/server';
import { Order } from '@/lib/types';

const polarAccessToken = process.env.POLAR_ACCESS_TOKEN || '';
const polarOrgId = process.env.POLAR_ORGANIZATION_ID || '';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  try {
    const { order } = (await request.json()) as { order: Order };

    if (!order) {
      return NextResponse.json({ error: 'Faltan datos de la orden' }, { status: 400 });
    }

    const orderCleanNumber = order.orderNumber.replace('#', '');
    const successUrl = `${appUrl}/track/${orderCleanNumber}`;

    // If Polar API Key is provided, call Polar.sh Custom Checkout API
    if (polarAccessToken && !polarAccessToken.includes('tu-access-token')) {
      const checkoutPayload = {
        amount: Math.round(order.total * 100), // Polar uses cents
        currency: 'usd',
        customer_email: order.customerEmail,
        customer_name: order.customerName,
        success_url: successUrl,
        metadata: {
          order_id: order.id,
          order_number: order.orderNumber,
        },
      };

      const polarRes = await fetch('https://api.polar.sh/v1/checkouts/custom/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${polarAccessToken}`,
        },
        body: JSON.stringify(checkoutPayload),
      });

      if (!polarRes.ok) {
        const errData = await polarRes.json();
        console.error('Polar API Error:', errData);
        throw new Error('Error creando checkout en Polar');
      }

      const data = await polarRes.json();
      return NextResponse.json({
        success: true,
        redirectUrl: data.url,
      });
    }

    // Fallback: Simulation mode
    return NextResponse.json({
      success: true,
      mocked: true,
      redirectUrl: successUrl,
    });
  } catch (error) {
    console.error('Error en /api/payments/polar/create-checkout:', error);
    return NextResponse.json({ error: 'Error procesando checkout Polar' }, { status: 500 });
  }
}
