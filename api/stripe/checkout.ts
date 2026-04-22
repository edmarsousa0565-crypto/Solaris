// POST /api/stripe/checkout
// Cria uma Stripe Checkout Session e devolve o URL de pagamento
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY não configurada');
  return new Stripe(key, { apiVersion: '2023-10-16' });
}

export interface CheckoutItem {
  name: string;
  price: number;   // em cêntimos (ex: 4999 = €49,99)
  quantity: number;
  image?: string;
  // CJ
  cjPid?: string;
  variantId?: string;
  // Matterhorn
  matterhorn_id?: string;
  variant_uid?: string;
  // Fornecedor: 'cj' | 'matterhorn' | 'eprolo'
  supplier?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    items,
    customerEmail,
    successUrl,
    cancelUrl,
  }: {
    items: CheckoutItem[];
    customerEmail?: string;
    successUrl: string;
    cancelUrl: string;
  } = req.body;

  if (!items?.length) {
    return res.status(400).json({ error: 'Carrinho vazio' });
  }

  try {
    const stripe = getStripe();

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          // Stripe só aceita imagens HTTPS publicamente acessíveis — omite URLs CJ
          metadata: {
            supplier: item.supplier || 'cj',
            cjPid: item.cjPid || '',
            variantId: item.variantId || '',
            matterhorn_id: item.matterhorn_id || '',
            variant_uid: item.variant_uid || '',
          },
        },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      success_url: successUrl,
      cancel_url: cancelUrl,
      shipping_address_collection: {
        allowed_countries: ['PT', 'BR', 'AO', 'ES', 'FR', 'DE', 'GB', 'NL', 'BE', 'IT'],
      },
      phone_number_collection: { enabled: true },
      metadata: {
        source: 'solaris-store',
      },
      locale: 'pt',
    });

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error('Stripe checkout error type:', err?.type);
    console.error('Stripe checkout error code:', err?.code);
    console.error('Stripe checkout error raw:', err?.raw);
    console.error('Stripe checkout error message:', err?.message);
    return res.status(500).json({
      error: err.message,
      type: err?.type,
      code: err?.code,
      stripeCode: err?.statusCode,
    });
  }
}
