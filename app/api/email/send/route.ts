import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, sendNewMessageNotification } from '@/lib/services/email-service';
import { Order, OrderMessage } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, order, message } = body;

    if (type === 'confirmation' && order) {
      const result = await sendOrderConfirmationEmail(order as Order);
      return NextResponse.json(result);
    }

    if (type === 'message_notification' && order && message) {
      const result = await sendNewMessageNotification(order as Order, message as OrderMessage);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Tipo de email no soportado o datos incompletos' }, { status: 400 });
  } catch (error) {
    console.error('Error en /api/email/send:', error);
    return NextResponse.json({ error: 'Error interno procesando email' }, { status: 500 });
  }
}
