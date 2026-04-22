// POST /api/webhooks/stripe
// Recebe eventos da Stripe e processa:
//   checkout.session.completed → cria encomenda CJ + guarda Supabase + email confirmação
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createCJOrder, createMatterhornOrder, createEproloOrder } from './_suppliers';

// ─── Clientes ────────────────────────────────────────────────────────────────

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY não configurada');
  return new Stripe(key, { apiVersion: '2023-10-16' });
}

function getSupabase() {
  const url  = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key  = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase não configurado');
  return createClient(url, key, { db: { schema: 'api' } });
}

// ─── Enviar email de confirmação ──────────────────────────────────────────────

async function sendConfirmationEmail(session: Stripe.Checkout.Session, orderNumber: string) {
  // VERCEL_URL é a URL do deployment actual (não o alias) — usa VERCEL_PROJECT_PRODUCTION_URL se disponível
  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  const lineItems = session.line_items?.data || [];
  const items = lineItems.map((item: any) => ({
    name: item.description || 'Produto SOLARIS',
    price: `€${((item.amount_total || 0) / 100).toFixed(2)}`,
    quantity: item.quantity || 1,
  }));

  const shipping = session.shipping_details;
  const customerEmail = session.customer_details?.email || session.customer_email || '';

  if (!customerEmail) {
    console.warn('sendConfirmationEmail: sem email do cliente — email não enviado');
    return;
  }

  const res = await fetch(`${baseUrl}/api/email/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'order-confirmation',
      data: {
        customerName: session.customer_details?.name || 'Cliente',
        customerEmail,
        orderNumber,
        items,
        total: `€${((session.amount_total || 0) / 100).toFixed(2)}`,
        shippingAddress: {
          name: shipping?.name || '',
          line1: shipping?.address?.line1 || '',
          city: shipping?.address?.city || '',
          postalCode: shipping?.address?.postal_code || '',
          country: shipping?.address?.country || 'PT',
        },
        estimatedDelivery: '7–14 dias úteis',
      },
    }),
  });

  const result: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Email API ${res.status}: ${result.error || 'erro desconhecido'}`);
  }
  console.log(`✓ Email de confirmação enviado para ${customerEmail} (id: ${result.id})`);
}

// ─── Notificar admin ──────────────────────────────────────────────────────────

async function sendAdminNotification(session: Stripe.Checkout.Session, orderNumber: string, cjOrderId: string | null) {
  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  const lineItems = session.line_items?.data || [];
  const items = lineItems.map((item: any) => ({
    name: item.description || 'Produto SOLARIS',
    price: `€${((item.amount_total || 0) / 100).toFixed(2)}`,
    quantity: item.quantity || 1,
  }));

  const shipping = session.shipping_details;

  await fetch(`${baseUrl}/api/email/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'admin-order-notification',
      data: {
        orderNumber,
        customerName: session.customer_details?.name || 'Desconhecido',
        customerEmail: session.customer_details?.email || session.customer_email || '',
        total: `€${((session.amount_total || 0) / 100).toFixed(2)}`,
        items,
        shippingAddress: {
          name: shipping?.name || '',
          line1: shipping?.address?.line1 || '',
          city: shipping?.address?.city || '',
          postalCode: shipping?.address?.postal_code || '',
          country: shipping?.address?.country || 'PT',
        },
        cjOrderId,
      },
    }),
  });
}

// ─── Handler principal ────────────────────────────────────────────────────────

export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(503).json({ error: 'STRIPE_WEBHOOK_SECRET não configurado' });
  }

  // Lê o body raw para verificar assinatura
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const rawBody = Buffer.concat(chunks);

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    const signature = req.headers['stripe-signature'] as string;
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Processa apenas o evento de pagamento completo
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Expande line_items (não vêm por defeito no webhook)
    let fullSession = session;
    try {
      const stripe = getStripe();
      fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items', 'line_items.data.price.product'],
      });
    } catch (e) {
      console.error('Error expanding session:', e);
    }

    const orderNumber = `SOL-${session.id.slice(-8).toUpperCase()}`;

    try {
      // 1. Identifica que fornecedores são necessários (para saber o que falhou vs não aplicável)
      const lineItems = fullSession.line_items?.data || [];
      const needsCj = lineItems.some((i: any) => {
        const m = i.price?.product?.metadata || {};
        return !m.supplier || m.supplier === 'cj';
      });
      const needsMatterhorn = lineItems.some((i: any) => (i.price?.product?.metadata?.supplier) === 'matterhorn');
      const needsEprolo = lineItems.some((i: any) => (i.price?.product?.metadata?.supplier) === 'eprolo');

      const supplierErrors: Record<string, string> = {};

      // 2. Cria encomendas nos fornecedores em paralelo
      const [cjOrderId, matterhornResult, eproloOrderId] = await Promise.all([
        needsCj
          ? createCJOrder(fullSession).catch(e => { const msg = e?.message || String(e); console.error('CJ order error:', msg); supplierErrors.cj = msg; return null; })
          : Promise.resolve(null),
        needsMatterhorn
          ? createMatterhornOrder(fullSession).catch(e => { const msg = e?.message || String(e); console.error('Matterhorn order error:', msg); supplierErrors.matterhorn = msg; return null; })
          : Promise.resolve(null),
        needsEprolo
          ? createEproloOrder(fullSession).catch(e => { const msg = e?.message || String(e); console.error('Eprolo order error:', msg); supplierErrors.eprolo = msg; return null; })
          : Promise.resolve(null),
      ]);

      const matterhornOrderId = matterhornResult?.orderId || null;
      const matterhornPaymentUrl = matterhornResult?.paymentUrl || null;

      // Marca como erro se o fornecedor era necessário mas não devolveu orderId
      if (needsCj && !cjOrderId && !supplierErrors.cj) supplierErrors.cj = 'createOrder retornou null (ver logs)';
      if (needsMatterhorn && !matterhornOrderId && !supplierErrors.matterhorn) supplierErrors.matterhorn = 'createOrder retornou null (ver logs)';
      if (needsEprolo && !eproloOrderId && !supplierErrors.eprolo) supplierErrors.eprolo = 'createOrder retornou null (ver logs)';

      const hasErrors = Object.keys(supplierErrors).length > 0;
      const allSucceeded = (!needsCj || cjOrderId) && (!needsMatterhorn || matterhornOrderId) && (!needsEprolo || eproloOrderId);

      // 3. Guarda no Supabase
      const supabase = getSupabase();
      await supabase.from('orders').upsert({
        stripe_session_id: session.id,
        cj_order_id: cjOrderId,
        eprolo_order_id: eproloOrderId,
        matterhorn_order_id: matterhornOrderId,
        matterhorn_payment_url: matterhornPaymentUrl,
        customer_email: session.customer_details?.email || session.customer_email || '',
        customer_name: session.customer_details?.name || '',
        shipping_address: session.shipping_details,
        items: fullSession.line_items?.data || [],
        total_amount: (session.amount_total || 0) / 100,
        currency: session.currency?.toUpperCase() || 'EUR',
        status: allSucceeded ? 'processing' : hasErrors ? 'supplier_failed' : 'payment_received',
        supplier_errors: supplierErrors,
        order_number: orderNumber,
      }, { onConflict: 'stripe_session_id' });

      // Alerta admin em falhas de fornecedor (email separado)
      if (hasErrors) {
        console.error(`[ORDER ${orderNumber}] SUPPLIER FAILURES:`, supplierErrors);
      }

      // 3. Envia email de confirmação ao cliente
      await sendConfirmationEmail(fullSession, orderNumber).catch(e => {
        console.error('Email error:', e);
      });

      // 4. Notifica o admin
      await sendAdminNotification(fullSession, orderNumber, cjOrderId).catch(e => {
        console.error('Admin notification error:', e);
      });

      console.log(`✓ Encomenda ${orderNumber} processada | CJ: ${cjOrderId} | Matterhorn: ${matterhornOrderId} | Eprolo: ${eproloOrderId}`);
    } catch (err: any) {
      console.error('Error processing order:', err);
      // Não devolvemos erro ao Stripe para evitar retry — o erro foi logado
    }
  }

  return res.status(200).json({ received: true });
}
