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

      // Try custom ad-hoc checkout endpoint first
      let polarRes = await fetch('https://api.polar.sh/v1/checkouts/custom/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${polarAccessToken}`,
        },
        body: JSON.stringify(checkoutPayload),
      });

      // If custom endpoint is redirected or requires standard checkouts endpoint
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
        throw new Error('Error creando sesión de checkout en Polar');
      }

      const data = await polarRes.json();
      return NextResponse.json({
        success: true,
        redirectUrl: data.url || data.checkout_url,
      });
    }

    // Fallback: Simulation mode for local testing
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
