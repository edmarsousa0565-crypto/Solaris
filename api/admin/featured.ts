// GET  /api/admin/featured   → lista de produtos em destaque
// POST /api/admin/featured   → { pid, action: 'add'|'remove', vids?, metadata? }
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('SUPABASE_NOT_CONFIGURED');
  return createClient(url, key, { db: { schema: 'api' } });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (
    !(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) ||
    !(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY)
  ) {
    return res.status(503).json({ error: 'SUPABASE_NOT_CONFIGURED', products: [], pids: [] });
  }

  const supabase = getSupabase();

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
        }));

      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      return res.status(200).json({ products: resolvedProducts, pids });
    } catch (err: any) {
      return res.status(500).json({ error: err.message, products: [], pids: [] });
    }
  }

  // ─── POST ───────────────────────────────────────────────────────────────────
  if (req.method === 'POST') {
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
        if (metadata?.variantNames !== undefined)   payload.variant_names      = metadata.variantNames || {};
        if (metadata?.isNew !== undefined)          payload.is_new             = metadata.isNew;
        if (metadata?.isSoldOut !== undefined)      payload.is_sold_out        = metadata.isSoldOut;
        if (metadata?.sortOrder !== undefined)      payload.sort_order         = metadata.sortOrder;

        const { error } = await supabase
          .from('featured_products')
          .upsert(payload, { onConflict: 'pid' });

        if (error) throw new Error(error.message);

      } else if (action === 'remove') {
        const { error } = await supabase
          .from('featured_products')
          .delete()
          .eq('pid', pid);

        if (error) throw new Error(error.message);

      } else if (action === 'reorder') {
        // Recebe array de { pid, sortOrder }
        const items = req.body.items as Array<{ pid: string; sortOrder: number }>;
        if (!items?.length) return res.status(400).json({ error: 'Missing items' });

        for (const item of items) {
          await supabase
            .from('featured_products')
            .update({ sort_order: item.sortOrder })
            .eq('pid', item.pid);
        }
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
