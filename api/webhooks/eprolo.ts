// POST /api/webhooks/eprolo
// Distingue 3 tipos de evento pelo formato do payload:
//   Array com tracking_number  → type=0: order shipped
//   Array com orderItemlist    → type=1: quotation complete
//   Object com product_id      → product push
// Assinatura: header md5sign = MD5(rawBody + sign_key)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase não configurado');
  return createClient(url, key, { db: { schema: 'api' } });
}

// ─── type=0: Order shipped ────────────────────────────────────────────────────

async function handleOrderShipped(events: any[]) {
  const supabase = getSupabase();
  for (const event of events) {
    const eproloOrderId = String(event.order_id || '');
    const trackingNumber = event.tracking_number || '';
    const carrier = (event.tracking_company || '').trim();
    const trackingUrl = event.tracking_url || '';
    const stockStatus = String(event.stock_status || '');

    if (!eproloOrderId) continue;

    if (stockStatus === '2') {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'shipped',
          tracking_number: trackingNumber,
          carrier,
          tracking_url: trackingUrl,
          shipped_at: new Date().toISOString(),
        })
        .eq('eprolo_order_id', eproloOrderId);

      if (error) console.error(`Supabase update falhou para order ${eproloOrderId}:`, error);
      else console.log(`✓ Order ${eproloOrderId} enviada — tracking: ${trackingNumber} (${carrier})`);
    } else {
      console.log(`Order ${eproloOrderId} stock_status=${stockStatus} (hold)`);
    }
  }
}

// ─── type=1: Quotation complete ───────────────────────────────────────────────

async function handleQuotation(events: any[]) {
  const supabase = getSupabase();
  for (const event of events) {
    const eproloOrderId = String(event.order_id || '');
    const orderCode = event.order_code || '';
    const quotationStatus = event.quotation_status || '';
    const items: any[] = event.orderItemlist || [];

    if (!eproloOrderId) continue;

    // Calcula custo total dos itens cotados com sucesso
    const totalCost = items
      .filter(i => i.quotation_complete === 'Completed' || i.quotation_status === 'Completed')
      .reduce((sum, i) => sum + (parseFloat(i.sku_cost) || 0), 0);

    const statusMap: Record<string, string> = {
      Completed: 'quoted',
      Failure: 'quote_failed',
      Partially_completed: 'quote_partial',
      In_progress: 'quoting',
    };
    const newStatus = statusMap[quotationStatus] || 'quoting';

    const { error } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        quotation_status: quotationStatus,
        quotation_cost: totalCost > 0 ? totalCost : null,
        eprolo_order_code: orderCode,
      })
      .eq('eprolo_order_id', eproloOrderId);

    if (error) console.error(`Supabase quotation update falhou para order ${eproloOrderId}:`, error);
    else console.log(`✓ Order ${eproloOrderId} cotação: ${quotationStatus} | custo: €${totalCost.toFixed(2)}`);
  }
}

// ─── Product push ─────────────────────────────────────────────────────────────

async function handleProductPush(payload: any) {
  const id = payload.id || '';
  const productId = payload.product_id || '';
  console.log(`Eprolo product push: id=${id}, product_id=${productId}`);

  try {
    const supabase = getSupabase();
    await supabase
      .from('featured_products')
      .update({ needs_sync: true, synced_at: null })
      .or(`pid.eq.${productId},pid.eq.${id}`);
    console.log(`✓ Produto ${productId || id} marcado para re-sincronização`);
  } catch (err: any) {
    console.warn('Product push: Supabase update ignorado:', err.message);
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const rawBody = Buffer.concat(chunks).toString('utf8');

  // Verifica assinatura
  const signKey = process.env.EPROLO_WEBHOOK_SIGN_KEY || '';
  const receivedSign = (req.headers['md5sign'] as string || '').toUpperCase();
  if (signKey && receivedSign) {
    const expected = crypto.createHash('md5').update(rawBody + signKey).digest('hex').toUpperCase();
    if (receivedSign !== expected) {
      console.error('Eprolo webhook: assinatura inválida');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  let parsed: any;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  try {
    if (Array.isArray(parsed)) {
      const first = parsed[0] || {};
      if ('orderItemlist' in first || 'quotation_status' in first) {
        await handleQuotation(parsed);
      } else {
        await handleOrderShipped(parsed);
      }
    } else if (parsed && (parsed.product_id || parsed.id)) {
      await handleProductPush(parsed);
    } else {
      console.warn('Eprolo webhook: payload desconhecido', JSON.stringify(parsed).slice(0, 200));
    }
  } catch (err: any) {
    console.error('Eprolo webhook handler error:', err);
  }

  return res.status(200).json({ received: true });
}
