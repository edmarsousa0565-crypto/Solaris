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

  const { pid } = req.query;

  if (!pid) {
    return res.status(400).json({ error: 'Missing pid parameter' });
  }

  try {
    const token = await getCJToken();

    // Fetch CJ data e Supabase custom data em paralelo
    const [cjResponse, supabaseRow] = await Promise.all([
      fetch(`${CJ_BASE_URL}/product/query?pid=${pid}`, {
        headers: {
          'CJ-Access-Token': token,
          'Content-Type': 'application/json',
        },
      }),
      (async () => {
        try {
          const sb = getSupabase();
          if (!sb) return null;
          const { data } = await sb
            .from('featured_products')
            .select('custom_name,custom_description,custom_image,custom_price,category,collection')
            .eq('pid', String(pid))
            .single();
          return data;
        } catch {
          return null;
        }
      })(),
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
        name: v.variantNameEn,
        price: v.variantSellPrice,
        stock: v.variantStock,
        image: v.variantImage,
      })),
      sizes: [...new Set((p.variants || []).map((v: any) => {
        // Tenta extrair tamanho da string (ex: "Blue / XL" -> "XL")
        const parts = v.variantNameEn.split('/');
        return parts.length > 1 ? parts[parts.length - 1].trim() : v.variantNameEn.trim();
      }).filter(Boolean))],
      colors: [...new Set((p.variants || []).map((v: any) => {
        const parts = v.variantNameEn.split('/');
        return parts.length > 1 ? parts[0].trim() : null;
      }).filter(Boolean))],
      cjPid: p.pid,
      shippingTime: '7-14 dias úteis',
      isNew: true,
      isSoldOut: false,
    };

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    return res.status(200).json({ product });
  } catch (err: any) {
    console.error('CJ product detail error:', err);
    return res.status(500).json({ error: err.message });
  }
}
