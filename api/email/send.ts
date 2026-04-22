// POST /api/email/send
// Envia emails transacionais via Resend
//
// Body:
//   { type: 'order-confirmation', data: OrderConfirmationData }
//   { type: 'shipping',           data: ShippingData          }
//   { type: 'delivered',          data: DeliveredData         }

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import {
  orderConfirmationTemplate,
  shippingTemplate,
  deliveredTemplate,
  adminOrderNotificationTemplate,
  type OrderConfirmationData,
  type ShippingData,
  type DeliveredData,
  type AdminOrderNotificationData,
} from './_templates';

interface ContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Se o domínio solaris.pt ainda não estiver verificado no Resend,
// define RESEND_FROM_EMAIL=noreply@solaris.pt nas env vars do Vercel.
// Durante testes pode usar-se o domínio do Resend: onboarding@resend.dev
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'SOLARIS <noreply@solaris.pt>';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'RESEND_API_KEY não configurada' });
  }

  const { type, data } = req.body as {
    type: 'order-confirmation' | 'shipping' | 'delivered' | 'admin-order-notification' | 'contact';
    data: OrderConfirmationData | ShippingData | DeliveredData | AdminOrderNotificationData | ContactData;
  };

  if (!type || !data) {
    return res.status(400).json({ error: 'Faltam campos: type e data' });
  }

  try {
    const resend = new Resend(apiKey);

    let email: { subject: string; html: string };
    let to: string;

    switch (type) {
      case 'order-confirmation': {
        const d = data as OrderConfirmationData;
        email = orderConfirmationTemplate(d);
        to = d.customerEmail;
        break;
      }
      case 'shipping': {
        const d = data as ShippingData;
        email = shippingTemplate(d);
        to = d.customerEmail;
        break;
      }
      case 'delivered': {
        const d = data as DeliveredData;
        email = deliveredTemplate(d);
        to = d.customerEmail;
        break;
      }
      case 'admin-order-notification': {
        const d = data as AdminOrderNotificationData;
        email = adminOrderNotificationTemplate(d);
        to = process.env.ADMIN_EMAIL || 'edmar@pakkaz.com';
        break;
      }
      case 'contact': {
        const d = data as ContactData;
        if (!d.name || !d.email || !d.message) {
          return res.status(400).json({ error: 'Campos obrigatórios: name, email, message' });
        }
        const adminEmail = process.env.ADMIN_EMAIL || 'edmar@pakkaz.com';
        email = {
          subject: `[Contacto SOLARIS] ${d.subject || 'Nova mensagem'} — ${d.name}`,
          html: `<p><strong>Nome:</strong> ${d.name}</p><p><strong>Email:</strong> ${d.email}</p><p><strong>Assunto:</strong> ${d.subject || '—'}</p><hr/><p style="white-space:pre-wrap">${d.message}</p>`,
        };
        to = adminEmail;
        // Envia confirmação ao remetente em paralelo
        resend.emails.send({
          from: FROM_EMAIL,
          to: d.email,
          subject: 'SOLARIS — Recebemos a tua mensagem',
          html: `<p>Olá ${d.name},</p><p>Recebemos a tua mensagem e responderemos em 24 horas em dias úteis.</p><p>Obrigado,<br/>Equipa SOLARIS</p>`,
        }).catch(() => {});
        break;
      }
      default:
        return res.status(400).json({ error: `Tipo de email desconhecido: ${type}` });
    }

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: email.subject,
      html: email.html,
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return res.status(500).json({ error: result.error.message });
    }

    return res.status(200).json({ ok: true, id: result.data?.id });
  } catch (err: any) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: err.message });
  }
}
