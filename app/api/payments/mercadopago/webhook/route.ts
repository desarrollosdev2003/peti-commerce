import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const mpAccessToken = process.env.MP_ACCESS_TOKEN || '';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic') || searchParams.get('type');
    const paymentId = searchParams.get('id') || searchParams.get('data.id');

    if (topic === 'payment' && paymentId && mpAccessToken) {
      // Query Mercado Pago Payment status
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${mpAccessToken}`,
        },
      });

      if (mpRes.ok) {
        const paymentData = await mpRes.json();
        const orderNumber = paymentData.external_reference;
        const status = paymentData.status;

        if (status === 'approved' && orderNumber) {
          console.log(`[Mercado Pago Webhook] Pago aprobado para orden ${orderNumber}`);
          
          // Update order in Supabase if configured
          const supabase = getSupabaseServerClient();
          if (supabase) {
            await supabase
              .from('orders')
              .update({ status: 'in_progress', updated_at: new Date().toISOString() })
              .eq('order_number', orderNumber);
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error en Webhook Mercado Pago:', error);
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
  }
}
