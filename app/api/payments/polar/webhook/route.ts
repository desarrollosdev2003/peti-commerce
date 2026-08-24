import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const eventType = payload.type;
    const data = payload.data;

    // Handle successful payment events from Polar.sh Webhook
    const isPaymentSuccess =
      eventType === 'order.created' ||
      (eventType === 'checkout.updated' && (data?.status === 'succeeded' || data?.status === 'confirmed'));

    if (isPaymentSuccess && data) {
      const orderNumber =
        data?.metadata?.order_number ||
        data?.custom_field_data?.order_number ||
        data?.order?.metadata?.order_number;

      if (orderNumber) {
        console.log(`[Polar Webhook] Pago confirmado para orden ${orderNumber} (${eventType})`);
        
        // Update database order state in Supabase
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
    return NextResponse.json({ error: 'Error procesando webhook de Polar' }, { status: 500 });
  }
}
