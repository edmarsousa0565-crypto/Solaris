// GET  /api/admin/orders — lista de encomendas do Supabase
// GET  /api/admin/orders?format=csv — exporta CSV para contabilidade
// POST /api/admin/orders?action=retry  — retomar encomenda que falhou num fornecedor
//      body: { stripeSessionId, supplier: 'cj'|'matterhorn'|'eprolo' }
// POST /api/admin/orders?action=refund — emitir reembolso total ou parcial
//      body: { stripeSessionId, amount?, reason? }
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from './_auth';
import Stripe from 'stripe';
import { getSupabaseAdmin as getSupabase } from '../_supabase';

function csvEscape(value: any): string {
  if (value == null) return '';
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rangeToDate(range: string): Date | null {
  const now = new Date();
  switch (range) {
    case '7d': return new Date(now.getTime() - 7 * 864e5);
    case '30d': return new Date(now.getTime() - 30 * 864e5);
    case '90d': return new Date(now.getTime() - 90 * 864e5);
    default: return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (!requireAuth(req, res)) return;

  // ─── POST ?action=refund — emitir reembolso Stripe ────────────────────────
  if (req.method === 'POST' && req.query.action === 'refund') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { stripeSessionId, amount, reason } = body as { stripeSessionId?: string; amount?: number; reason?: string };
      if (!stripeSessionId) return res.status(400).json({ error: 'stripeSessionId é obrigatório' });

      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) return res.status(503).json({ error: 'STRIPE_SECRET_KEY não configurado' });
      const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

      const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
      if (!session.payment_intent) return res.status(400).json({ error: 'Session sem payment_intent' });
      const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent.id;

      const VALID_REASONS = ['duplicate', 'fraudulent', 'requested_by_customer'] as const;
      const refundReason = VALID_REASONS.includes(reason as any) ? (reason as any) : 'requested_by_customer';

      const refundParams: Stripe.RefundCreateParams = { payment_intent: paymentIntentId, reason: refundReason };
      if (typeof amount === 'number' && amount > 0) refundParams.amount = Math.round(amount * 100);

      const refund = await stripe.refunds.create(refundParams);
      const refundedAmount = refund.amount / 100;
      const isFullRefund = !amount || refundedAmount >= (session.amount_total || 0) / 100;

      const sb = getSupabase();
      await sb.from('orders').update({
        status: isFullRefund ? 'refunded' : 'partially_refunded',
        refund_id: refund.id,
        refunded_amount: refundedAmount,
        refunded_at: new Date().toISOString(),
      }).eq('stripe_session_id', stripeSessionId);

      console.log(`[REFUND] ${refund.id} — ${refundedAmount}€ — session ${stripeSessionId}`);
      return res.status(200).json({ ok: true, refundId: refund.id, refundedAmount, status: refund.status, isFullRefund });
    } catch (err: any) {
      console.error('Refund error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ─── POST ?action=retry — re-executar criação no fornecedor que falhou ────
  if (req.method === 'POST' && req.query.action === 'retry') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const stripeSessionId = String(body.stripeSessionId || '');
      const supplier = String(body.supplier || '') as 'cj' | 'matterhorn' | 'eprolo';
      if (!stripeSessionId || !['cj', 'matterhorn', 'eprolo'].includes(supplier)) {
        return res.status(400).json({ error: 'Missing stripeSessionId or invalid supplier' });
      }

      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) return res.status(503).json({ error: 'STRIPE_SECRET_KEY não configurado' });
      const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
      const session = await stripe.checkout.sessions.retrieve(stripeSessionId, {
        expand: ['line_items', 'line_items.data.price.product', 'shipping_details'],
      });

      const { createCJOrder, createMatterhornOrder, createEproloOrder } = await import('../webhooks/_suppliers');

      const sb = getSupabase();
      const { data: order } = await sb.from('orders').select('*').eq('stripe_session_id', stripeSessionId).single();
      if (!order) return res.status(404).json({ error: 'Order not found' });

      const update: Record<string, any> = {
        retry_count: (order.retry_count || 0) + 1,
        last_retry_at: new Date().toISOString(),
      };
      const newErrors = { ...(order.supplier_errors || {}) };

      try {
        if (supplier === 'cj') {
          const id = await createCJOrder(session as any);
          if (!id) throw new Error('createCJOrder retornou null');
          update.cj_order_id = id;
          delete newErrors.cj;
        } else if (supplier === 'matterhorn') {
          const result = await createMatterhornOrder(session as any);
          if (!result?.orderId) throw new Error('createMatterhornOrder retornou null');
          update.matterhorn_order_id = result.orderId;
          update.matterhorn_payment_url = result.paymentUrl;
          delete newErrors.matterhorn;
        } else {
          const id = await createEproloOrder(session as any);
          if (!id) throw new Error('createEproloOrder retornou null');
          update.eprolo_order_id = id;
          delete newErrors.eprolo;
        }
      } catch (e: any) {
        newErrors[supplier] = e?.message || String(e);
        update.supplier_errors = newErrors;
        await sb.from('orders').update(update).eq('stripe_session_id', stripeSessionId);
        return res.status(500).json({ error: e?.message || 'Retry falhou', errors: newErrors });
      }

      update.supplier_errors = newErrors;
      if (Object.keys(newErrors).length === 0) update.status = 'processing';
      await sb.from('orders').update(update).eq('stripe_session_id', stripeSessionId);

      return res.status(200).json({ ok: true, errors: newErrors });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const format = String(req.query.format || '');
  const range = String(req.query.range || 'all');

  try {
    const supabase = getSupabase();
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (format === 'csv') {
      const startDate = rangeToDate(range);
      if (startDate) query = query.gte('created_at', startDate.toISOString());
    } else {
      query = query.limit(200);
    }
    const { data, error } = await query;

    if (error) throw new Error(error.message);

    const orders = (data || []).map((o: any) => ({
      id: o.id,
      orderNumber: o.order_number,
      customerName: o.customer_name,
      customerEmail: o.customer_email,
      total: o.total_amount,
      currency: o.currency || 'EUR',
      status: o.status,
      cjOrderId: o.cj_order_id,
      matterhornOrderId: o.matterhorn_order_id,
      matterhornPaymentUrl: o.matterhorn_payment_url,
      eproloOrderId: o.eprolo_order_id,
      stripeSessionId: o.stripe_session_id,
      supplierErrors: o.supplier_errors || {},
      retryCount: o.retry_count || 0,
      lastRetryAt: o.last_retry_at,
      items: o.items || [],
      shippingAddress: o.shipping_address,
      createdAt: o.created_at,
    }));

    // Metricas basicas
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
    const statusCounts = orders.reduce((acc: Record<string, number>, o: any) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    // Produto mais vendido
    const productCounts: Record<string, { name: string; count: number }> = {};
    for (const order of orders) {
      for (const item of (order.items as any[])) {
        const name = item.description || 'Produto';
        if (!productCounts[name]) productCounts[name] = { name, count: 0 };
        productCounts[name].count += item.quantity || 1;
      }
    }
    const topProducts = Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // CSV export
    if (format === 'csv') {
      const headers = ['order_number','created_at','customer_name','customer_email','status','total_amount','currency','cj_order_id','matterhorn_order_id','matterhorn_payment_url','shipping_name','shipping_city','shipping_country','item_count'];
      const rows = (data || []).map((o: any) => {
        const sa = o.shipping_address || {};
        const address = sa.address || {};
        const items = Array.isArray(o.items) ? o.items : [];
        const itemCount = items.reduce((s: number, i: any) => s + (i.quantity || 1), 0);
        return [o.order_number, o.created_at, o.customer_name, o.customer_email, o.status, o.total_amount, o.currency, o.cj_order_id || '', o.matterhorn_order_id || '', o.matterhorn_payment_url || '', sa.name || '', address.city || '', address.country || '', itemCount].map(csvEscape).join(',');
      });
      const csv = [headers.join(','), ...rows].join('\r\n');
      const fileName = `solaris-orders-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.status(200).send('\ufeff' + csv);
    }

    return res.status(200).json({
      orders,
      metrics: {
        totalOrders: orders.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageOrder: orders.length > 0 ? Math.round((totalRevenue / orders.length) * 100) / 100 : 0,
        statusCounts,
        topProducts,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message, orders: [], metrics: null });
  }
}
