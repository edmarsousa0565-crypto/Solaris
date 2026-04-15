// POST /api/webhooks/cj
// Recebe notificações de status da CJ Dropshipping e:
//   SHIPPED   → atualiza Supabase + envia email de tracking ao cliente
//   DELIVERED → atualiza Supabase + envia email de entrega + pedido de review
//
// A CJ envia um POST com o corpo:
//   { orderId, orderNum, status, trackingNumber, trackingUrl, logisticsName }
//
// Configurar em: CJ Dashboard → Settings → Webhook → https://solarisstore.pt/api/webhooks/cj

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// ─── Tipos do payload CJ ──────────────────────────────────────────────────────

interface CJWebhookPayload {
  orderId: string;
  orderNum?: string;       // número interno CJ
  status: string;          // ex: "SHIPPED", "DELIVERED", "IN_TRANSIT"
  trackingNumber?: string;
  trackingUrl?: string;
  logisticsName?: string;  // nome da transportadora
}

// ─── Supabase ─────────────────────────────────────────────────────────────────

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase não configurado');
  return createClient(url, key);
}

// ─── Envia email via endpoint interno ─────────────────────────────────────────

async function sendEmail(type: 'shipping' | 'delivered', data: Record<string, unknown>) {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/email/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, data }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Email send failed (${res.status}): ${text}`);
  }
}

// ─── Handler principal ────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body as CJWebhookPayload;

  if (!payload?.orderId || !payload?.status) {
    return res.status(400).json({ error: 'Payload inválido: faltam orderId ou status' });
  }

  const { orderId, status, trackingNumber, trackingUrl, logisticsName } = payload;
  const normalizedStatus = status.toUpperCase();

  // Só processa estados relevantes
  if (!['SHIPPED', 'DELIVERED', 'IN_TRANSIT'].includes(normalizedStatus)) {
    return res.status(200).json({ received: true, skipped: true, status });
  }

  try {
    const supabase = getSupabase();

    // 1. Encontra a encomenda pelo cj_order_id
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_number, customer_email, customer_name, status, tracking_number')
      .eq('cj_order_id', orderId)
      .single();

    if (fetchError || !order) {
      console.error(`Encomenda CJ ${orderId} não encontrada:`, fetchError?.message);
      // Devolve 200 para a CJ não fazer retry — encomenda pode ter sido criada manualmente
      return res.status(200).json({ received: true, warning: 'order_not_found' });
    }

    // ── SHIPPED ──────────────────────────────────────────────────────────────
    if (normalizedStatus === 'SHIPPED' || normalizedStatus === 'IN_TRANSIT') {
      // Evita re-processar se já está shipped
      if (order.status === 'shipped' && order.tracking_number === trackingNumber) {
        return res.status(200).json({ received: true, skipped: true, reason: 'already_shipped' });
      }

      // Atualiza Supabase
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'shipped',
          tracking_number: trackingNumber || null,
          tracking_url: trackingUrl || null,
          carrier: logisticsName || null,
          shipped_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('Supabase update error (shipped):', updateError.message);
      }

      // Envia email de tracking
      if (order.customer_email && trackingNumber) {
        await sendEmail('shipping', {
          customerName: order.customer_name || 'Cliente',
          customerEmail: order.customer_email,
          orderNumber: order.order_number,
          trackingNumber,
          trackingUrl: trackingUrl || `https://t.17track.net/en#nums=${trackingNumber}`,
          carrier: logisticsName || 'Transportadora',
          estimatedDelivery: '3–7 dias úteis',
        }).catch(e => console.error('Shipping email error:', e));
      }

      console.log(`✓ Encomenda ${order.order_number} marcada como SHIPPED | Tracking: ${trackingNumber}`);
    }

    // ── DELIVERED ─────────────────────────────────────────────────────────────
    if (normalizedStatus === 'DELIVERED') {
      // Evita re-processar se já está delivered
      if (order.status === 'delivered') {
        return res.status(200).json({ received: true, skipped: true, reason: 'already_delivered' });
      }

      // Atualiza Supabase
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('Supabase update error (delivered):', updateError.message);
      }

      // Envia email de entrega + pedido de review
      if (order.customer_email) {
        await sendEmail('delivered', {
          customerName: order.customer_name || 'Cliente',
          customerEmail: order.customer_email,
          orderNumber: order.order_number,
          reviewUrl: `https://solarisstore.pt/reviews?order=${order.order_number}`,
        }).catch(e => console.error('Delivered email error:', e));
      }

      console.log(`✓ Encomenda ${order.order_number} marcada como DELIVERED`);
    }

    return res.status(200).json({ received: true, orderId, status: normalizedStatus });
  } catch (err: any) {
    console.error('CJ webhook error:', err);
    // Devolve 200 para evitar retries excessivos da CJ
    return res.status(200).json({ received: true, error: err.message });
  }
}
