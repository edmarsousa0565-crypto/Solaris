// GET /api/admin/settings — lê configurações globais (protegido)
// POST /api/admin/settings — guarda configurações (protegido)
// POST /api/admin/settings?action=login — login admin, devolve token (público)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, signToken, getAdminPassword } from './_auth';

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('SUPABASE_NOT_CONFIGURED');
  return createClient(url, key, { db: { schema: 'api' } });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  // Login público — não requer auth
  if (req.method === 'POST' && req.query.action === 'login') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const password = String(body.password || '');
      const expected = getAdminPassword();
      if (!expected) return res.status(500).json({ error: 'ADMIN_PASSWORD não configurado' });
      // Comparação timing-safe
      const a = Buffer.from(password);
      const b = Buffer.from(expected);
      const ok = a.length === b.length && require('crypto').timingSafeEqual(a, b);
      if (!ok) return res.status(401).json({ error: 'Palavra-passe incorreta' });
      const token = signToken();
      return res.status(200).json({ token });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Todo o resto requer auth
  if (!requireAuth(req, res)) return;

  try {
    const sb = getSupabase();

    if (req.method === 'GET') {
      const { data, error } = await sb.from('settings').select('key,value');
      if (error) throw new Error(error.message);
      const map: Record<string, string | null> = {};
      for (const row of data || []) map[row.key] = row.value;
      return res.status(200).json(map);
    }

    if (req.method === 'POST') {
      const updates: Record<string, string | null> = req.body;
      for (const [key, value] of Object.entries(updates)) {
        const { error } = await sb.from('settings').upsert(
          { key, value: value ?? null, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );
        if (error) throw new Error(error.message);
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
