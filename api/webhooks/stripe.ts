// POST /api/webhooks/stripe
// Recebe eventos da Stripe e processa:
//   checkout.session.completed → cria encomenda CJ + guarda Supabase + email confirmação
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

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

// ─── Criar encomenda na CJ ────────────────────────────────────────────────────

// Para itens sem variantId (adicionados da ShopPage sem selecção de variante),
// consulta a CJ para obter o primeiro vid disponível com stock
async function resolveVid(token: string, cjBaseUrl: string, cjPid: string): Promise<string | null> {
  try {
    const res = await fetch(`${cjBaseUrl}/product/query?pid=${cjPid}`, {
      headers: { 'CJ-Access-Token': token },
    });
    const data = await res.json();
    if (!data.result || !data.data?.variants?.length) return null;
    const variant = data.data.variants.find((v: any) => v.variantStock > 0) || data.data.variants[0];
    return variant?.vid ? String(variant.vid) : null;
  } catch {
    return null;
  }
}

async function createCJOrder(session: Stripe.Checkout.Session) {
  const shipping = session.shipping_details;
  const lineItems = session.line_items?.data || [];

  if (!shipping?.address) return null;

  const { getCJToken, CJ_BASE_URL } = await import('../cj/_auth');
  const token = await getCJToken();

  // Resolve vid para cada item — usa o metadata do Stripe se existir,
  // senão consulta CJ pelo pid para obter o primeiro variant disponível
  const products: { vid: string; quantity: number }[] = [];
  const pidsInOrder: string[] = [];

  for (const item of lineItems) {
    const meta = (item as any).price?.product?.metadata || {};
    const variantId: string = meta.variantId || '';
    const cjPid: string = meta.cjPid || '';
    const quantity = item.quantity || 1;

    if (cjPid) pidsInOrder.push(cjPid);

    if (variantId) {
      products.push({ vid: variantId, quantity });
    } else if (cjPid) {
      const vid = await resolveVid(token, CJ_BASE_URL, cjPid);
      if (vid) products.push({ vid, quantity });
      else console.warn(`Não encontrou vid para pid ${cjPid} — item ignorado na encomenda CJ`);
    } else {
      console.warn(`Item sem cjPid nem variantId: ${(item as any).description}`);
    }
  }

  if (!products.length) {
    console.warn('createCJOrder: nenhum produto com vid válido — encomenda CJ não criada');
    return null;
  }

  // Busca o método de envio configurado no admin para o(s) produto(s) da encomenda
  let shippingNameCode: string | undefined;
  if (pidsInOrder.length > 0) {
    try {
      const sb = getSupabase();
      const { data: fpRows } = await sb
        .from('featured_products')
        .select('shipping_method')
        .in('pid', pidsInOrder)
        .not('shipping_method', 'is', null)
        .limit(1);
      if (fpRows?.[0]?.shipping_method) {
        shippingNameCode = fpRows[0].shipping_method;
        console.log(`Método de envio configurado: ${shippingNameCode}`);
      }
    } catch (e) {
      console.warn('Não foi possível obter shipping_method:', e);
    }
  }

  const payload: Record<string, any> = {
    orderNumber: `SOL-${session.id.slice(-8).toUpperCase()}`,
    shippingCountry: shipping.address.country,
    shippingCustomerName: shipping.name,
    shippingAddress: shipping.address.line1,
    shippingCity: shipping.address.city,
    shippingProvince: shipping.address.state || '',
    shippingZip: shipping.address.postal_code,
    shippingPhone: session.customer_details?.phone || '',
    products,
  };

  if (shippingNameCode) {
    payload.shippingNameCode = shippingNameCode;
  }

  const response = await fetch(`${CJ_BASE_URL}/shopping/order/createOrder`, {
    method: 'POST',
    headers: { 'CJ-Access-Token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!data.result) {
    console.error('CJ createOrder falhou:', data.message, JSON.stringify(payload));
    return null;
  }
  return data.data?.orderId || null;
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

  const result = await res.json().catch(() => ({}));
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
      // 1. Cria encomenda na CJ
      const cjOrderId = await createCJOrder(fullSession).catch(e => {
        console.error('CJ order error:', e);
        return null;
      });

      // 2. Guarda no Supabase
      const supabase = getSupabase();
      await supabase.from('orders').upsert({
        stripe_session_id: session.id,
        cj_order_id: cjOrderId,
        customer_email: session.customer_details?.email || session.customer_email || '',
        customer_name: session.customer_details?.name || '',
        shipping_address: session.shipping_details,
        items: fullSession.line_items?.data || [],
        total_amount: (session.amount_total || 0) / 100,
        currency: session.currency?.toUpperCase() || 'EUR',
        status: cjOrderId ? 'processing' : 'payment_received',
        order_number: orderNumber,
      }, { onConflict: 'stripe_session_id' });

      // 3. Envia email de confirmação ao cliente
      await sendConfirmationEmail(fullSession, orderNumber).catch(e => {
        console.error('Email error:', e);
      });

      // 4. Notifica o admin
      await sendAdminNotification(fullSession, orderNumber, cjOrderId).catch(e => {
        console.error('Admin notification error:', e);
      });

      console.log(`✓ Encomenda ${orderNumber} processada | CJ: ${cjOrderId}`);
    } catch (err: any) {
      console.error('Error processing order:', err);
      // Não devolvemos erro ao Stripe para evitar retry — o erro foi logado
    }
  }

  return res.status(200).json({ received: true });
}
