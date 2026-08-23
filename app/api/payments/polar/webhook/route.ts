import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const eventType = payload.type;
    const data = payload.data;

    if (eventType === 'order.created' || eventType === 'checkout.updated') {
      const orderNumber = data?.metadata?.order_number;

      if (orderNumber) {
        console.log(`[Polar Webhook] Pago confirmado para orden ${orderNumber}`);
        const supabase = getSupabaseServerClient();
        if (supabase) {
          await supabase
            .from('orders')
            .update({ status: 'in_progress', updated_at: new Date().toISOString() })
            .eq('order_number', orderNumber);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error en Webhook Polar:', error);
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
  }
}
