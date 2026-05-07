// GET  /api/admin/featured   → lista de produtos em destaque
// POST /api/admin/featured   → { pid, action: 'add'|'remove', vids?, metadata? }
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from './_auth';
import { getSupabasePublic, getSupabaseAdmin } from '../_supabase';
import crypto from 'crypto';

// Importa automaticamente um produto Eprolo na conta (necessário para getproduct.html funcionar)
async function eproloAutoImport(pid: string): Promise<void> {
  const apiKey = process.env.EPROLO_API_KEY || '';
  const apiSecret = process.env.EPROLO_API_SECRET || '';
  if (!apiKey || !apiSecret) return;
  const timestamp = Date.now().toString();
  const sign = crypto.createHash('md5').update(`${apiKey}${timestamp}${apiSecret}`).digest('hex').toUpperCase();
  await fetch(
    `https://openapi.eprolo.com/add_product.html?sign=${sign}&timestamp=${timestamp}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apiKey },
      body: JSON.stringify({ ids: [pid] }),
    }
  ).catch(() => { /* não bloqueia — import em best-effort */ });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Cache: GET público recebe s-maxage após sucesso; escrita/erro nunca cacheado
  res.setHeader('Cache-Control', req.method === 'GET' ? 'public, s-maxage=60, stale-while-revalidate=300' : 'no-store');

  // GET usa anon key (leitura pública com RLS), POST usa service key (escrita admin)
  const supabase = req.method === 'GET' ? getSupabasePublic() : getSupabaseAdmin();

  // ─── GET ────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('featured_products')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw new Error(error.message);

      const pids = (data || []).map((r: any) => r.pid);

      if (pids.length === 0) return res.status(200).json({ products: [], pids: [] });

      const resolvedProducts = (data || [])
        .filter((r: any) => r.custom_name && r.custom_image)
        .map((r: any) => ({
          id: r.pid,
          cjPid: r.pid,
          name: r.custom_name,
          price: `€${parseFloat(r.custom_price || 0).toFixed(2)}`,
          priceNum: parseFloat(r.custom_price || 0),
          image: r.custom_image,
          category: r.category || 'General',
          collection: r.collection || 'Solaris',
          description: r.custom_description || r.custom_name,
          selectedVids: r.vids || [],
          variants: [],
          sizes: [],
          colors: [],
          isNew: r.is_new ?? true,
          isSoldOut: r.is_sold_out ?? false,
          sortOrder: r.sort_order || 0,
          shippingMethod: r.shipping_method || '',
          variantNames: r.variant_names || {},
          excludedImages: r.excluded_images ?? [],
          supplier: r.supplier || 'cj',
          matterhorn_id: r.supplier === 'matterhorn' ? r.pid : undefined,
          sizeChartType: r.size_chart_type || 'clothing',
          materialsInfo: r.materials_info || '',
        }));

      return res.status(200).json({ products: resolvedProducts, pids });
    } catch (err: any) {
      return res.status(500).json({ error: err.message, products: [], pids: [] });
    }
  }

  // ─── POST ───────────────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    if (!requireAuth(req, res)) return;
    const { pid, action, vids, metadata } = req.body as any;
    if (!pid || !action) return res.status(400).json({ error: 'Missing pid or action' });

    try {
      if (action === 'add') {
        const payload: Record<string, any> = {
          pid,
          vids: vids || [],
        };

        // Só actualiza os campos enviados — não sobrescreve os que não vieram
        if (metadata?.name !== undefined)           payload.custom_name        = metadata.name || null;
        if (metadata?.description !== undefined)    payload.custom_description = metadata.description || null;
        if (metadata?.image !== undefined)          payload.custom_image       = metadata.image || null;
        if (metadata?.price !== undefined)          payload.custom_price       = metadata.price || null;
        if (metadata?.category !== undefined)       payload.category           = metadata.category || null;
        if (metadata?.collection !== undefined)     payload.collection         = metadata.collection || null;
        if (metadata?.shippingMethod !== undefined) payload.shipping_method    = metadata.shippingMethod || null;
        if (metadata?.variantNames !== undefined)    payload.variant_names      = metadata.variantNames || {};
        if (metadata?.excludedImages !== undefined) payload.excluded_images    = metadata.excludedImages || [];
        if (metadata?.isNew !== undefined)          payload.is_new             = metadata.isNew;
        if (metadata?.isSoldOut !== undefined)      payload.is_sold_out        = metadata.isSoldOut;
        if (metadata?.sortOrder !== undefined)      payload.sort_order         = metadata.sortOrder;
        if (metadata?.supplier !== undefined)       payload.supplier           = metadata.supplier || 'cj';
        if (metadata?.sizeChartType !== undefined)  payload.size_chart_type    = metadata.sizeChartType || null;
        if (metadata?.materialsInfo !== undefined)  payload.materials_info     = metadata.materialsInfo || null;

        let { error } = await supabase
          .from('featured_products')
          .upsert(payload, { onConflict: 'pid' });

        // Se colunas ainda não existem no schema, tenta sem elas
        if (error?.message?.includes('excluded_images') || error?.message?.includes('size_chart_type') || error?.message?.includes('materials_info')) {
          const { excluded_images: _d1, size_chart_type: _d2, materials_info: _d3, ...payloadWithout } = payload;
          const retry = await supabase
            .from('featured_products')
            .upsert(payloadWithout, { onConflict: 'pid' });
          error = retry.error;
        }

        if (error) throw new Error(error.message);

        // Auto-importa na conta Eprolo para que getproduct.html funcione
        if ((metadata?.supplier || payload.supplier) === 'eprolo') {
          await eproloAutoImport(pid);
        }

      } else if (action === 'remove') {
        const { error } = await supabase
          .from('featured_products')
          .delete()
          .eq('pid', pid);

        if (error) throw new Error(error.message);

      } else if (action === 'reorder') {
        // Recebe array de { pid, sortOrder } — batch upsert em vez de N queries sequenciais
        const items = req.body.items as Array<{ pid: string; sortOrder: number }>;
        if (!items?.length) return res.status(400).json({ error: 'Missing items' });

        const { error: reorderError } = await supabase
          .from('featured_products')
          .upsert(
            items.map(i => ({ pid: i.pid, sort_order: i.sortOrder })),
            { onConflict: 'pid' }
          );
        if (reorderError) throw new Error(reorderError.message);
      }

      const { data } = await supabase.from('featured_products').select('pid');
      const pids = (data || []).map((r: any) => r.pid);
      return res.status(200).json({ ok: true, pids });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
