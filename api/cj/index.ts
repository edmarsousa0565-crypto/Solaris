// /api/cj?action=products|product  —  POST /api/cj → cria encomenda
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCJToken, CJ_BASE_URL } from './_auth';
import { getSupabaseAdmin } from '../_supabase';

function getSupabase() {
  try { return getSupabaseAdmin(); } catch { return null; }
}

// ─── Products list ────────────────────────────────────────────────────────────

async function handleProducts(req: VercelRequest, res: VercelResponse) {
  const token = await getCJToken();
  const { query = '', page = '1', pageSize = '20', categoryId = '', searchMode = 'name' } = req.query;
  const queryStr = String(query).trim();
  const isPid = searchMode === 'pid' || (/^[A-Za-z0-9]{6,30}$/.test(queryStr) && searchMode === 'auto');

  if (isPid && queryStr) {
    const pidRes = await fetch(`${CJ_BASE_URL}/product/query?pid=${queryStr}`, {
      headers: { 'CJ-Access-Token': token, 'Content-Type': 'application/json' },
    });
    const pidData: any = await pidRes.json();
    if (pidData.result && pidData.data) {
      const p = pidData.data;
      return res.status(200).json({
        products: [{
          id: p.pid, name: p.productNameEn,
          price: `€${parseFloat(p.sellPrice || 0).toFixed(2)}`, priceNum: parseFloat(p.sellPrice || 0),
          image: p.productImage, category: p.categoryName || 'General',
          collection: 'CJ Dropshipping', description: p.productNameEn,
          sizes: [], colors: [], isNew: true, isSoldOut: false, cjPid: p.pid,
        }],
        total: 1,
      });
    }
  }

  const params = new URLSearchParams({
    productNameEn: queryStr, pageNum: String(page), pageSize: String(pageSize),
    ...(categoryId ? { categoryId: String(categoryId) } : {}),
  });
  const response = await fetch(`${CJ_BASE_URL}/product/list?${params}`, {
    headers: { 'CJ-Access-Token': token, 'Content-Type': 'application/json' },
  });
  const data: any = await response.json();
  if (!data.result) return res.status(400).json({ error: data.message });

  const products = (data.data?.list || []).map((p: any) => ({
    id: p.pid, name: p.productNameEn,
    price: `€${parseFloat(p.sellPrice || 0).toFixed(2)}`, priceNum: parseFloat(p.sellPrice || 0),
    image: p.productImage, category: p.categoryName || 'General',
    collection: 'CJ Dropshipping', description: p.productNameEn,
    sizes: [], colors: [], isNew: true, isSoldOut: false, cjPid: p.pid,
  }));

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  return res.status(200).json({ products, total: data.data?.total || 0 });
}

// ─── Product detail ───────────────────────────────────────────────────────────

async function handleProduct(req: VercelRequest, res: VercelResponse) {
  const { pid, includeShipping, country = 'PT' } = req.query;
  if (!pid) return res.status(400).json({ error: 'Missing pid parameter' });

  const token = await getCJToken();

  const [cjResponse, supabaseRow] = await Promise.all([
    fetch(`${CJ_BASE_URL}/product/query?pid=${pid}`, {
      headers: { 'CJ-Access-Token': token, 'Content-Type': 'application/json' },
    }),
    (async () => {
      try {
        const sb = getSupabase();
        if (!sb) return null;
        const { data } = await sb
          .from('featured_products')
          .select('custom_name,custom_description,custom_image,custom_price,category,collection,variant_names,excluded_images')
          .eq('pid', String(pid))
          .single();
        return data;
      } catch { return null; }
    })(),
  ]);

  const data: any = await cjResponse.json();

  let shippingData: any[] | null = null;
  if (includeShipping && data.result) {
    try {
      const variants: any[] = data.data?.variants || [];
      const firstVid = variants.find((v: any) => v.variantStock > 0)?.vid || variants[0]?.vid;
      const shippingPayload: Record<string, any> = {
        startCountryCode: 'CN',
        endCountryCode: String(country),
        products: firstVid
          ? [{ quantity: 1, vid: String(firstVid) }]
          : [{ quantity: 1, pid: String(pid) }],
      };
      const shippingRes = await fetch(`${CJ_BASE_URL}/logistic/freightCalculate`, {
        method: 'POST',
        headers: { 'CJ-Access-Token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify(shippingPayload),
      });
      const sd: any = await shippingRes.json();
      if (sd.result && sd.data?.length) {
        shippingData = (sd.data as any[]).map((m: any) => ({
          id: m.logisticName, name: m.logisticName,
          price: parseFloat(m.logisticPrice || 0),
          priceFormatted: parseFloat(m.logisticPrice || 0) === 0 ? 'Grátis' : `€${parseFloat(m.logisticPrice || 0).toFixed(2)}`,
          estimatedDelivery: m.minDeliveryDays && m.maxDeliveryDays
            ? `${m.minDeliveryDays}–${m.maxDeliveryDays} dias úteis` : 'Consultar',
          tracking: m.tracking ?? true,
        }));
      } else {
        shippingData = [];
      }
    } catch { shippingData = []; }
  }

  if (!data.result) return res.status(404).json({ error: data.message });

  const p = data.data;
  const customName = supabaseRow?.custom_name || p.productNameEn;
  const customDesc = supabaseRow?.custom_description || p.description || p.productNameEn;
  const customImage = supabaseRow?.custom_image || p.productImage;
  const customPrice = supabaseRow?.custom_price ? parseFloat(supabaseRow.custom_price) : parseFloat(p.sellPrice || 0);
  const variantNames: Record<string, string> = supabaseRow?.variant_names || {};
  const excludedImages: string[] = supabaseRow?.excluded_images || [];
  const allImages: string[] = p.productImageSet?.length ? p.productImageSet : [customImage];
  const filteredImages = allImages.filter((img: string) => !excludedImages.includes(img));

  const product = {
    id: p.pid, name: customName,
    price: `€${customPrice.toFixed(2)}`, priceNum: customPrice,
    image: customImage, images: filteredImages.length ? filteredImages : [customImage],
    excludedImages, category: supabaseRow?.category || p.categoryName || 'General',
    collection: supabaseRow?.collection || 'Solaris', description: customDesc,
    variants: (p.variants || []).map((v: any) => ({
      vid: v.vid, variantNameEn: variantNames[v.vid] || v.variantNameEn,
      name: variantNames[v.vid] || v.variantNameEn, originalName: v.variantNameEn,
      variantSellPrice: v.variantSellPrice, sellPrice: v.variantSellPrice,
      price: v.variantSellPrice, variantStock: v.variantStock ?? 0, stock: v.variantStock ?? 0,
      variantImage: v.variantImage, image: v.variantImage, sku: v.variantSku || '', variantKey: v.variantKey || '',
    })),
    sizes: [...new Set((p.variants || []).map((v: any) => {
      const parts = (v.variantNameEn || '').split('/');
      return parts.length > 1 ? parts[parts.length - 1].trim() : (v.variantNameEn || '').trim();
    }).filter(Boolean))],
    colors: [...new Set((p.variants || []).map((v: any) => {
      const parts = (v.variantNameEn || '').split('/');
      return parts.length > 1 ? parts[0].trim() : null;
    }).filter(Boolean))],
    cjPid: p.pid, pid: p.pid, supplier: p.supplierName || p.vendorName || '',
    moq: p.minBuyNum || 1, weight: p.productWeight || 0,
    processingTime: p.productProcessingTime || '2-5', shippingTime: '7-14 dias úteis',
    isNew: true, isSoldOut: false,
  };

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
  return res.status(200).json({ product, ...(shippingData !== null ? { shippingMethods: shippingData } : {}) });
}

// ─── Create order (POST) ──────────────────────────────────────────────────────

async function handleCreateOrder(req: VercelRequest, res: VercelResponse) {
  const token = await getCJToken();
  const { orderNumber, shippingAddress, products } = req.body;

  const payload = {
    orderNumber,
    shippingCountry: shippingAddress.country,
    shippingCustomerName: shippingAddress.name,
    shippingAddress: shippingAddress.line1,
    shippingCity: shippingAddress.city,
    shippingProvince: shippingAddress.state,
    shippingZip: shippingAddress.postalCode,
    shippingPhone: shippingAddress.phone,
    products: (products || []).map((p: any) => ({ vid: p.vid, quantity: p.quantity })),
  };

  const response = await fetch(`${CJ_BASE_URL}/shopping/order/createOrder`, {
    method: 'POST',
    headers: { 'CJ-Access-Token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data: any = await response.json();
  if (!data.result) return res.status(400).json({ error: data.message });
  return res.status(200).json({ orderId: data.data?.orderId, success: true });
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'POST') return await handleCreateOrder(req, res);
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const action = String(req.query.action || '');
    switch (action) {
      case 'products': return await handleProducts(req, res);
      case 'product':  return await handleProduct(req, res);
      default:         return res.status(400).json({ error: 'Missing or invalid action param' });
    }
  } catch (err: any) {
    console.error('CJ handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
