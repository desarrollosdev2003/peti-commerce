import { Resend } from 'resend';
import { Order, OrderMessage } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'Peti Commissions <onboarding@resend.dev>';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const isResendConfigured = Boolean(
  resendApiKey && !resendApiKey.includes('tu_resend')
);

const resend = isResendConfigured ? new Resend(resendApiKey) : null;

/**
 * Sends order confirmation email with direct link to live chat & tracking
 */
export async function sendOrderConfirmationEmail(order: Order) {
  if (!resend) {
    console.warn('Resend API key no configurada');
    return { success: false, error: 'Resend API key no configurada' };
  }

  const trackingLink = `${appUrl}/track/${order.orderNumber.replace('#', '')}`;

  try {
    const data = await resend.emails.send({
      from: resendFromEmail,
      to: order.customerEmail,
      subject: `¡Encargo confirmado! Pedido ${order.orderNumber} con Peti`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #f1e6eb; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #e11d48; margin-top: 0;">¡Hola ${order.customerName}! 🎨</h2>
          <p>Tu encargo <strong>${order.orderNumber}</strong> ha sido recibido exitosamente por Peti.</p>
          
          <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #9f1239;"><strong>Total Abonado:</strong> ${formatCurrency(order.total, 'USD')}</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #9f1239;"><strong>Pasarela:</strong> ${order.paymentMethod === 'mercadopago' ? 'Mercado Pago' : 'Polar.sh'}</p>
          </div>

          <p>Puedes seguir el avance de tu ilustración y **chatear en vivo con Peti** para revisar tus primeros bocetos en el siguiente enlace:</p>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${trackingLink}" style="background-color: #e11d48; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; display: inline-block;">
              Abrir Chat & Seguimiento del Pedido
            </a>
          </div>

          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">Peti Art Commissions • Todos los derechos reservados</p>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error enviando email con Resend:', error);
    return { success: false, error };
  }
}

/**
 * Sends notification when a new message or sketch is posted
 */
export async function sendNewMessageNotification(order: Order, message: OrderMessage) {
  if (!resend) {
    console.warn('Resend API key no configurada');
    return { success: false, error: 'Resend API key no configurada' };
  }

  const trackingLink = `${appUrl}/track/${order.orderNumber.replace('#', '')}`;
  const isFromArtist = message.sender === 'artist';
  const recipient = isFromArtist ? order.customerEmail : 'peti.artist@gmail.com';

  try {
    const data = await resend.emails.send({
      from: resendFromEmail,
      to: recipient,
      subject: isFromArtist
        ? `🎨 Peti ha enviado un nuevo mensaje en tu pedido ${order.orderNumber}`
        : `💬 Nuevo mensaje de ${order.customerName} en el pedido ${order.orderNumber}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
          <h3 style="color: #0f172a;">${isFromArtist ? 'Peti te ha enviado un mensaje:' : `${order.customerName} escribió:`}</h3>
          <blockquote style="background-color: #f8fafc; border-left: 4px solid #e11d48; padding: 12px; margin: 16px 0; font-size: 14px;">
            "${message.text}"
          </blockquote>
          ${message.attachmentUrl ? `<p style="font-size: 12px; color: #059669;">🖼️ <strong>Boceto adjunto incluido</strong></p>` : ''}
          <div style="text-align: center; margin: 24px 0;">
            <a href="${trackingLink}" style="background-color: #e11d48; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; display: inline-block;">
              Ver Conversación & Responder
            </a>
          </div>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error enviando notificación con Resend:', error);
    return { success: false, error };
  }
}
