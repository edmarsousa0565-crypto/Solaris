// POST /api/admin/refund
// Emite reembolso total ou parcial via Stripe e actualiza o Supabase
// Body: { stripeSessionId, amount?, reason? }
//   amount: valor em euros (omitir = reembolso total)
//   reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' (default)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from './_auth';
import Stripe from 'stripe';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY não configurada');
  return new Stripe(key, { apiVersion: '2023-10-16' });
}

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('SUPABASE_NOT_CONFIGURED');
  return createClient(url, key, { db: { schema: 'api' } });
}

const VALID_REASONS = ['duplicate', 'fraudulent', 'requested_by_customer'] as const;
type RefundReason = typeof VALID_REASONS[number];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (!requireAuth(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { stripeSessionId, amount, reason } = body as {
      stripeSessionId?: string;
      amount?: number;
      reason?: string;
    };

    if (!stripeSessionId) {
      return res.status(400).json({ error: 'stripeSessionId é obrigatório' });
    }

    const refundReason: RefundReason = VALID_REASONS.includes(reason as RefundReason)
      ? (reason as RefundReason)
      : 'requested_by_customer';

    const stripe = getStripe();

    // Busca a session para obter o payment_intent
    const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
    if (!session.payment_intent) {
      return res.status(400).json({ error: 'Session sem payment_intent — não é possível reembolsar' });
    }

    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent.id;

    // Constrói o payload de reembolso
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
      reason: refundReason,
    };
    if (typeof amount === 'number' && amount > 0) {
      refundParams.amount = Math.round(amount * 100); // euros → cêntimos
    }

    const refund = await stripe.refunds.create(refundParams);

    // Actualiza o estado da encomenda no Supabase
    const sb = getSupabase();
    const refundedAmount = refund.amount / 100;
    const isFullRefund = !amount || refundedAmount >= (session.amount_total || 0) / 100;

    await sb.from('orders').update({
      status: isFullRefund ? 'refunded' : 'partially_refunded',
      refund_id: refund.id,
      refunded_amount: refundedAmount,
      refunded_at: new Date().toISOString(),
    }).eq('stripe_session_id', stripeSessionId);

    console.log(`[REFUND] ${refund.id} — ${refundedAmount}€ — session ${stripeSessionId}`);

    return res.status(200).json({
      ok: true,
      refundId: refund.id,
      refundedAmount,
      status: refund.status,
      isFullRefund,
    });
  } catch (err: any) {
    console.error('Refund error:', err);
    return res.status(500).json({ error: err.message });
  }
}
