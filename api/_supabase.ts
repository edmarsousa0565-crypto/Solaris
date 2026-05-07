// Helper centralizado para clientes Supabase no servidor.
// Usar a função correcta consoante o contexto:
//   getSupabasePublic() → leitura pública (anon key, RLS activo)
//   getSupabaseAdmin()  → operações privilegiadas (service key, bypassa RLS)
import { createClient } from '@supabase/supabase-js';

const URL = () => {
  const u = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  if (!u) throw new Error('SUPABASE_URL não configurado');
  return u;
};

/** Anon key — RLS activo. Usar para leitura pública (ex: featured_products GET). */
export function getSupabasePublic() {
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!key) throw new Error('SUPABASE_ANON_KEY não configurada');
  return createClient(URL(), key, { db: { schema: 'api' } });
}

/** Service key — bypassa RLS. Usar para operações admin/webhook (INSERT, UPDATE, DELETE). */
export function getSupabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_KEY não configurada — adicionar no Vercel');
  return createClient(URL(), key, { db: { schema: 'api' } });
}
