// /api/matterhorn?action=products|product|categories|delivery|order-status
// POST /api/matterhorn → cria encomenda
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MATTERHORN_BASE, getMatterhornHeaders } from './_auth';
import { getSupabaseAdmin } from '../_supabase';

function getSupabase() {
  try { return getSupabaseAdmin(); } catch { return null; }
}

// ─── Products list ────────────────────────────────────────────────────────────

function mapProduct(p: any) {
  const priceEur = p.prices?.EUR ?? 0;
  return {
    id: String(p.id),
    name: p.name_without_number || p.name,
    price: `€${parseFloat(priceEur).toFixed(2)}`,
    priceNum: parseFloat(priceEur),
    image: p.images?.[0] || '',
    images: p.images || [],
    category: p.category_name || 'General',
    collection: p.brand || 'Matterhorn',
    description: p.description || p.name,
    color: p.color || '',
    brand: p.brand || '',
    sizes: (p.variants || []).map((v: any) => v.name).filter(Boolean),
    variants: (p.variants || []).map((v: any) => ({
      variant_uid: v.variant_uid,
      vid: v.variant_uid,
      name: v.name,
      variantNameEn: v.name,
      stock: parseInt(v.stock || '0', 10),
      variantStock: parseInt(v.stock || '0', 10),
      max_processing_time: v.max_processing_time,
      ean: v.ean || '',
    })),
    isNew: p.new_collection === 'Y',
    isSoldOut: p.stock_total === 0,
    stock_total: p.stock_total || 0,
    supplier: 'Matterhorn',
    matterhorn_id: String(p.id),
    pid: String(p.id),
  };
}

async function handleProducts(req: VercelRequest, res: VercelResponse) {
  const { page = '1', limit = '100', brand_id = '', category_id = '', new_collection = '', last_update = '' } = req.query;
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (brand_id) params.set('brand_id', String(brand_id));
  if (category_id) params.set('category_id', String(category_id));
  if (new_collection) params.set('new_collection', String(new_collection));
  if (last_update) params.set('last_update', String(last_update));

  const response = await fetch(`${MATTERHORN_BASE}/ITEMS/?${params}`, { headers: getMatterhornHeaders() });
  const data: any = await response.json();

  if (!Array.isArray(data)) {
    return res.status(400).json({ error: data?.detail || 'Unexpected response from Matterhorn' });
  }

  const limitNum = parseInt(String(limit), 10) || 100;
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  return res.status(200).json({ products: data.map(mapProduct), total: data.length, hasMore: data.length >= limitNum });
}

// ─── Single product ───────────────────────────────────────────────────────────

async function handleProduct(req: VercelRequest, res: VercelResponse) {
  const { id, includeShipping, country = 'PT' } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id parameter' });

  const [mhResponse, supabaseRow] = await Promise.all([
    fetch(`${MATTERHORN_BASE}/ITEMS/${id}`, { headers: getMatterhornHeaders() }),
    (async () => {
      try {
        const sb = getSupabase();
        if (!sb) return null;
        const { data } = await sb
          .from('featured_products')
          .select('custom_name,custom_description,custom_image,custom_price,category,collection,variant_names,excluded_images')
          .eq('pid', String(id))
          .single();
        return data;
      } catch { return null; }
    })(),
  ]);

  const p: any = await mhResponse.json();
  if (!p || !p.id) return res.status(404).json({ error: 'Product not found' });

  let shippingMethods: any[] | null = null;
  if (includeShipping) {
    try {
      const countryCode = String(country).toLowerCase();
      const shRes = await fetch(`${MATTERHORN_BASE}/DICTIONARIES/DELIVERY/${countryCode}`, { headers: getMatterhornHeaders() });
      const shData: any = await shRes.json();
      shippingMethods = Array.isArray(shData)
        ? shData.map((m: any) => {
            const id = String(m.delivery_method_id ?? m.id ?? '');
            const price = parseFloat(m.price ?? m.cost ?? 0);
            return {
              id,
              name: m.name || m.delivery_name || id,
              price,
              priceFormatted: price === 0 ? 'Grátis' : `€${price.toFixed(2)}`,
              estimatedDelivery: m.delivery_time || m.estimated_delivery || 'Consultar',
              tracking: true,
            };
          })
        : [];
    } catch { shippingMethods = []; }
  }

  const priceEur = p.prices?.EUR ?? 0;
  const customName = supabaseRow?.custom_name || p.name_without_number || p.name;
  const customDesc = supabaseRow?.custom_description || p.description || p.name;
  const customImage = supabaseRow?.custom_image || p.images?.[0] || '';
  const customPrice = supabaseRow?.custom_price ? parseFloat(supabaseRow.custom_price) : parseFloat(priceEur);
  const variantNames: Record<string, string> = supabaseRow?.variant_names || {};
  const excludedImages: string[] = supabaseRow?.excluded_images || [];
  const allImages: string[] = p.images || [customImage];
  const filteredImages = allImages.filter((img: string) => !excludedImages.includes(img));

  const product = {
    id: String(p.id), pid: String(p.id), matterhorn_id: String(p.id),
    name: customName, price: `€${customPrice.toFixed(2)}`, priceNum: customPrice,
    image: customImage, images: filteredImages.length ? filteredImages : [customImage],
    excludedImages, category: supabaseRow?.category || p.category_name || 'General',
    collection: supabaseRow?.collection || p.brand || 'Matterhorn',
    description: customDesc, color: p.color || '', brand: p.brand || '',
    supplier: 'Matterhorn', stock_total: p.stock_total || 0,
    isNew: p.new_collection === 'Y', isSoldOut: p.stock_total === 0,
    variants: (p.variants || []).map((v: any) => ({
      variant_uid: v.variant_uid, vid: v.variant_uid,
      name: variantNames[v.variant_uid] || v.name,
      variantNameEn: variantNames[v.variant_uid] || v.name,
      originalName: v.name,
      stock: parseInt(v.stock || '0', 10),
      variantStock: parseInt(v.stock || '0', 10),
      max_processing_time: v.max_processing_time, ean: v.ean || '',
    })),
    sizes: (p.variants || []).map((v: any) => v.name).filter(Boolean),
    processingTime: '2-5', shippingTime: '5-10 dias úteis',
    size_table: p.size_table_txt || '', url: p.url || '',
  };

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
  return res.status(200).json({ product, ...(shippingMethods !== null ? { shippingMethods } : {}) });
}

// ─── Categories / brands ──────────────────────────────────────────────────────

async function handleCategories(req: VercelRequest, res: VercelResponse) {
  const { type = 'categories' } = req.query;
  const endpoint = String(type) === 'brands' ? 'BRANDS' : 'CATEGORIES';
  const response = await fetch(`${MATTERHORN_BASE}/DICTIONARIES/${endpoint}`, { headers: getMatterhornHeaders() });
  const data: any = await response.json();
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  return res.status(200).json({ [endpoint.toLowerCase()]: data });
}

// ─── Delivery methods ─────────────────────────────────────────────────────────

async function handleDelivery(req: VercelRequest, res: VercelResponse) {
  const { country = '' } = req.query;
  const path = country ? `/DICTIONARIES/DELIVERY/${String(country).toLowerCase()}` : '/DICTIONARIES/DELIVERY';
  const response = await fetch(`${MATTERHORN_BASE}${path}`, { headers: getMatterhornHeaders() });
  const data: any = await response.json();
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  return res.status(200).json({ methods: data });
}

// ─── Order status ─────────────────────────────────────────────────────────────

async function handleOrderStatus(req: VercelRequest, res: VercelResponse) {
  const { orderId } = req.query;
  if (!orderId) return res.status(400).json({ error: 'Missing orderId parameter' });

  const response = await fetch(`${MATTERHORN_BASE}/ACCOUNT/ORDERS/${orderId}`, { headers: getMatterhornHeaders() });
  const data: any = await response.json();

  if (!response.ok || !data.id) return res.status(404).json({ error: data?.detail || 'Order not found' });

  return res.status(200).json({
    orderId: data.id, status: data.status, orderDate: data.order_date,
    shippingNumber: data.shipping_number || null, trackingUrl: data.tracking_url || null,
    shippingService: data.shipping_service || null, invoiceUrl: data.invoice_url || null,
    paymentUrl: data.payment_url || null, total: data.total_gross, currency: data.order_currency,
    items: (data.positions || [])
      .filter((pos: any) => pos.type === 'product')
      .map((pos: any) => ({
        productId: pos.product_id, variantUid: pos.product_variant_uid,
        variantName: pos.product_variant, name: pos.product_name,
        image: pos.product_image, quantity: pos.quantity,
        price: pos.grossprice, status: pos.status,
      })),
  });
}

// ─── Product by EAN ───────────────────────────────────────────────────────────

async function handleByEan(req: VercelRequest, res: VercelResponse) {
  const { ean } = req.query;
  if (!ean) return res.status(400).json({ error: 'Missing ean parameter' });
  const response = await fetch(`${MATTERHORN_BASE}/ITEMS/BYEAN/${ean}`, { headers: getMatterhornHeaders() });
  const p: any = await response.json();
  if (!response.ok || !p?.id) return res.status(404).json({ error: p?.detail || 'Product not found' });
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
  return res.status(200).json({ products: [mapProduct(p)], total: 1, hasMore: false });
}

// ─── Create order (POST) ──────────────────────────────────────────────────────

async function handleCreateOrder(req: VercelRequest, res: VercelResponse) {
  const { shippingAddress, products, deliveryMethodId, currency = 'EUR' } = req.body;

  if (!products?.length) return res.status(400).json({ error: 'No products provided' });

  const nameParts = (shippingAddress.name || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const secondName = nameParts.slice(1).join(' ') || firstName;
  const addressLine = shippingAddress.line1 || '';
  const houseMatch = addressLine.match(/(\d+\S*)\s*$/);
  const houseNumber = houseMatch ? houseMatch[1] : '';
  const street = houseMatch ? addressLine.slice(0, addressLine.lastIndexOf(houseMatch[0])).trim() : addressLine;

  const payload: Record<string, any> = {
    items: products.map((p: any) => ({
      variant_uid: parseInt(p.variant_uid || p.vid, 10),
      quantity: p.quantity,
    })),
    currency,
    ...(deliveryMethodId ? { delivery_method_id: parseInt(deliveryMethodId, 10) } : {}),
    delivery_to: {
      first_name: firstName, second_name: secondName,
      country: (shippingAddress.country || 'PT').toLowerCase(),
      street: street || addressLine, house_number: houseNumber,
      zip: shippingAddress.postalCode || '', city: shippingAddress.city || '',
      ...(shippingAddress.phone ? { phone: shippingAddress.phone } : {}),
    },
  };

  const response = await fetch(`${MATTERHORN_BASE}/ACCOUNT/ORDERS/`, {
    method: 'PUT',
    headers: { ...getMatterhornHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data: any = await response.json();
  if (!response.ok) return res.status(400).json({ error: data?.detail || 'Order creation failed' });

  return res.status(200).json({ orderId: data.id, paymentUrl: data.payment_url || null, status: data.status || 'New order', success: true });
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'POST') return await handleCreateOrder(req, res);
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { action } = req.query;
    switch (String(action || '')) {
      case 'products':      return await handleProducts(req, res);
      case 'product':       return await handleProduct(req, res);
      case 'categories':    return await handleCategories(req, res);
      case 'delivery':      return await handleDelivery(req, res);
      case 'order-status':  return await handleOrderStatus(req, res);
      case 'byean':         return await handleByEan(req, res);
      default:              return res.status(400).json({ error: 'Missing or invalid action param' });
    }
  } catch (err: any) {
    console.error('Matterhorn handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
