// Helpers partilhados entre o webhook Stripe e o retry admin.
// Cada função recebe uma Stripe.Checkout.Session (expandida com line_items.data.price.product)
// e cria a encomenda no fornecedor correspondente. Devolve o ID criado ou lança Error.
import Stripe from 'stripe';
import { getSupabaseAdmin as getSupabase } from '../_supabase';

// ─── CJ ──────────────────────────────────────────────────────────────────────

async function resolveVid(token: string, cjBaseUrl: string, cjPid: string): Promise<string | null> {
  try {
    const res = await fetch(`${cjBaseUrl}/product/query?pid=${cjPid}`, {
      headers: { 'CJ-Access-Token': token },
    });
    const data: any = await res.json();
    if (!data.result || !data.data?.variants?.length) return null;
    const variant = data.data.variants.find((v: any) => v.variantStock > 0) || data.data.variants[0];
    return variant?.vid ? String(variant.vid) : null;
  } catch {
    return null;
  }
}

export async function createCJOrder(session: Stripe.Checkout.Session): Promise<string | null> {
  const shipping = session.shipping_details;
  const lineItems = session.line_items?.data || [];
  if (!shipping?.address) throw new Error('Missing shipping address');

  const { getCJToken, CJ_BASE_URL } = await import('../cj/_auth');
  const token = await getCJToken();

  const products: { vid: string; quantity: number }[] = [];
  const pidsInOrder: string[] = [];

  for (const item of lineItems) {
    const meta = (item as any).price?.product?.metadata || {};
    if (meta.supplier && meta.supplier !== 'cj') continue;
    const variantId: string = meta.variantId || '';
    const cjPid: string = meta.cjPid || '';
    const quantity = item.quantity || 1;
    if (cjPid) pidsInOrder.push(cjPid);
    if (variantId) products.push({ vid: variantId, quantity });
    else if (cjPid) {
      const vid = await resolveVid(token, CJ_BASE_URL, cjPid);
      if (vid) products.push({ vid, quantity });
    }
  }
  if (!products.length) return null;

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
      if (fpRows?.[0]?.shipping_method) shippingNameCode = fpRows[0].shipping_method;
    } catch {}
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
  if (shippingNameCode) payload.shippingNameCode = shippingNameCode;

  const response = await fetch(`${CJ_BASE_URL}/shopping/order/createOrder`, {
    method: 'POST',
    headers: { 'CJ-Access-Token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data: any = await response.json();
  if (!data.result) throw new Error(`CJ: ${data.message || 'createOrder falhou'}`);
  return data.data?.orderId || null;
}

// ─── Matterhorn ──────────────────────────────────────────────────────────────

export async function createMatterhornOrder(session: Stripe.Checkout.Session): Promise<{ orderId: string; paymentUrl: string | null } | null> {
  const shipping = session.shipping_details;
  const lineItems = session.line_items?.data || [];
  if (!shipping?.address) throw new Error('Missing shipping address');

  const { MATTERHORN_BASE, getMatterhornHeaders } = await import('../matterhorn/_auth');

  const items: { variant_uid: number; quantity: number }[] = [];
  for (const item of lineItems) {
    const meta = (item as any).price?.product?.metadata || {};
    if (meta.supplier !== 'matterhorn') continue;
    const variant_uid = meta.variant_uid;
    if (!variant_uid) continue;
    items.push({ variant_uid: parseInt(variant_uid, 10), quantity: item.quantity || 1 });
  }
  if (!items.length) return null;

  let deliveryMethodId: number | undefined;
  try {
    const sb = getSupabase();
    const { data: setting } = await sb
      .from('settings').select('value').eq('key', 'matterhorn_shipping_method').single();
    if (setting?.value) deliveryMethodId = parseInt(setting.value, 10) || undefined;
  } catch {}

  const nameParts = (shipping.name || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const secondName = nameParts.slice(1).join(' ') || firstName;
  const addressLine = shipping.address.line1 || '';
  const houseMatch = addressLine.match(/(\d+\S*)\s*$/);
  const houseNumber = houseMatch ? houseMatch[1] : '';
  const street = houseMatch ? addressLine.slice(0, addressLine.lastIndexOf(houseMatch[0])).trim() : addressLine;

  const payload: Record<string, any> = {
    items,
    currency: 'EUR',
    delivery_to: {
      first_name: firstName,
      second_name: secondName,
      country: (shipping.address.country || 'PT').toLowerCase(),
      street: street || addressLine,
      house_number: houseNumber,
      zip: shipping.address.postal_code || '',
      city: shipping.address.city || '',
    },
    ...(deliveryMethodId ? { delivery_method_id: deliveryMethodId } : {}),
  };

  const response = await fetch(`${MATTERHORN_BASE}/ACCOUNT/ORDERS/`, {
    method: 'PUT',
    headers: { ...getMatterhornHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data: any = await response.json();
  if (!response.ok || !data.id) throw new Error(`Matterhorn: ${data?.error || data?.message || 'createOrder falhou'}`);
  return { orderId: String(data.id), paymentUrl: data.payment_url || null };
}

// ─── Eprolo ──────────────────────────────────────────────────────────────────

export async function createEproloOrder(session: Stripe.Checkout.Session): Promise<string | null> {
  const shipping = session.shipping_details;
  const lineItems = session.line_items?.data || [];
  if (!shipping?.address) throw new Error('Missing shipping address');

  const { EPROLO_BASE_URL, getEproloAuthHeaders, getEproloAuthQS } = await import('../eprolo/_auth');

  const products: { variantsid: string; quantity: number }[] = [];
  for (const item of lineItems) {
    const meta = (item as any).price?.product?.metadata || {};
    if (meta.supplier !== 'eprolo') continue;
    const variantsid = meta.variantsid || meta.variantId || '';
    if (!variantsid) continue;
    products.push({ variantsid, quantity: item.quantity || 1 });
  }
  if (!products.length) return null;

  const orderNo = `SOL-${session.id.slice(-8).toUpperCase()}`;
  const payload = {
    order_id: orderNo,
    order_number: orderNo,
    tax_cost: 0,
    shipping_name: shipping.name || '',
    shipping_country: shipping.address.country || 'PT',
    shipping_country_code: shipping.address.country || 'PT',
    shipping_province: shipping.address.state || shipping.address.city || '',
    shipping_province_code: shipping.address.state || shipping.address.city || '',
    shipping_city: shipping.address.city || '',
    shipping_address: shipping.address.line1 || '',
    shipping_address2: shipping.address.line2 || '',
    shipping_post_code: shipping.address.postal_code || '',
    shipping_phone: session.customer_details?.phone || '',
    email: session.customer_details?.email || '',
    orderItemlist: products,
  };

  const response = await fetch(`${EPROLO_BASE_URL}/add_order.html?${getEproloAuthQS()}`, {
    method: 'POST',
    headers: { ...getEproloAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data: any = await response.json();
  if (data.code !== '0' && data.code !== 0) throw new Error(`Eprolo: ${data.msg || 'add_order falhou'}`);
  return data.data?.order_id || data.data?.orderid || null;
}
