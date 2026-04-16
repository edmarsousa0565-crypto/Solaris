import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getCJToken, CJ_BASE_URL } from './_auth';

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { db: { schema: 'api' } });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pid, includeShipping, country = 'PT' } = req.query;

  if (!pid) {
    return res.status(400).json({ error: 'Missing pid parameter' });
  }

  try {
    const token = await getCJToken();

    // Fetch CJ data, Supabase custom data, e opcionalmente shipping em paralelo
    const [cjResponse, supabaseRow, shippingData] = await Promise.all([
      fetch(`${CJ_BASE_URL}/product/query?pid=${pid}`, {
        headers: { 'CJ-Access-Token': token, 'Content-Type': 'application/json' },
      }),
      (async () => {
        try {
          const sb = getSupabase();
          if (!sb) return null;
          const { data } = await sb
            .from('featured_products')
            .select('custom_name,custom_description,custom_image,custom_price,category,collection,variant_names')
            .eq('pid', String(pid))
            .single();
          return data;
        } catch {
          return null;
        }
      })(),
      // Shipping: só busca quando pedido (para evitar latência extra na loja)
      includeShipping ? (async () => {
        try {
          const shippingRes = await fetch(`${CJ_BASE_URL}/logistic/freightCalculate`, {
            method: 'POST',
            headers: { 'CJ-Access-Token': token, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              startCountryCode: 'CN',
              endCountryCode: String(country),
              products: [{ quantity: 1, pid: String(pid) }],
            }),
          });
          const sd = await shippingRes.json();
          if (!sd.result) return [];
          return (sd.data || []).map((m: any) => ({
            id: m.logisticName,
            name: m.logisticName,
            price: parseFloat(m.logisticPrice || 0),
            priceFormatted: parseFloat(m.logisticPrice || 0) === 0 ? 'Grátis' : `€${parseFloat(m.logisticPrice || 0).toFixed(2)}`,
            estimatedDelivery: m.minDeliveryDays && m.maxDeliveryDays
              ? `${m.minDeliveryDays}–${m.maxDeliveryDays} dias úteis`
              : 'Consultar',
            tracking: m.tracking ?? true,
          }));
        } catch {
          return [];
        }
      })() : Promise.resolve(null),
    ]);

    const data = await cjResponse.json();

    if (!data.result) {
      return res.status(404).json({ error: data.message });
    }

    const p = data.data;

    // Usa dados portugueses do Supabase se existirem, senão cai no CJ
    const customName = supabaseRow?.custom_name || p.productNameEn;
    const customDesc = supabaseRow?.custom_description || p.description || p.productNameEn;
    const customImage = supabaseRow?.custom_image || p.productImage;
    const customPrice = supabaseRow?.custom_price
      ? parseFloat(supabaseRow.custom_price)
      : parseFloat(p.sellPrice || 0);
    const customCategory = supabaseRow?.category || p.categoryName || 'General';
    const customCollection = supabaseRow?.collection || 'Solaris';
    const variantNames: Record<string, string> = supabaseRow?.variant_names || {};

    const product = {
      id: p.pid,
      name: customName,
      price: `€${customPrice.toFixed(2)}`,
      priceNum: customPrice,
      image: customImage,
      images: p.productImageSet?.length ? p.productImageSet : [customImage],
      category: customCategory,
      collection: customCollection,
      description: customDesc,
      variants: (p.variants || []).map((v: any) => ({
        vid: v.vid,
        // Keep both original and mapped field names for compatibility
        variantNameEn: variantNames[v.vid] || v.variantNameEn,
        name: variantNames[v.vid] || v.variantNameEn,
        originalName: v.variantNameEn,
        variantSellPrice: v.variantSellPrice,
        sellPrice: v.variantSellPrice,
        price: v.variantSellPrice,
        variantStock: v.variantStock ?? 0,
        stock: v.variantStock ?? 0,
        variantImage: v.variantImage,
        image: v.variantImage,
        sku: v.variantSku || '',
        variantKey: v.variantKey || '',
      })),
      sizes: [...new Set((p.variants || []).map((v: any) => {
        const parts = (v.variantNameEn || '').split('/');
        return parts.length > 1 ? parts[parts.length - 1].trim() : (v.variantNameEn || '').trim();
      }).filter(Boolean))],
      colors: [...new Set((p.variants || []).map((v: any) => {
        const parts = (v.variantNameEn || '').split('/');
        return parts.length > 1 ? parts[0].trim() : null;
      }).filter(Boolean))],
      cjPid: p.pid,
      pid: p.pid,
      supplier: p.supplierName || p.vendorName || '',
      moq: p.minBuyNum || 1,
      weight: p.productWeight || 0,
      processingTime: p.productProcessingTime || '2-5',
      shippingTime: '7-14 dias úteis',
      isNew: true,
      isSoldOut: false,
    };

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    return res.status(200).json({
      product,
      ...(shippingData !== null ? { shippingMethods: shippingData } : {}),
    });
  } catch (err: any) {
    console.error('CJ product detail error:', err);
    return res.status(500).json({ error: err.message });
  }
}
