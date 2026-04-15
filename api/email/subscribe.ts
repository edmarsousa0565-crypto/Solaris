// POST /api/email/subscribe
// 1. Guarda o email na tabela email_subscribers do Supabase
// 2. Envia email de boas-vindas com código de desconto via Resend

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { welcomeEmailTemplate } from './_templates';

const DISCOUNT_CODE = 'SOLARIS10';
// Usa a variável de ambiente configurada no Vercel — se não existir, fallback para onboarding@resend.dev
// (o domínio de teste do Resend só envia para emails verificados na conta)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY; // service role — apenas no servidor
  if (!url || !key) throw new Error('Variáveis SUPABASE_URL / SUPABASE_SERVICE_KEY não configuradas');
  return createClient(url, key, { db: { schema: 'api' } });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body as { email?: string };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // ── 1. Guardar no Supabase ────────────────────────────────────────────────────
  try {
    const supabase = getSupabase();

    const { error: dbError } = await supabase
      .from('email_subscribers')
      .upsert(
        { email: normalizedEmail, source: 'popup', discount_code: DISCOUNT_CODE },
        { onConflict: 'email', ignoreDuplicates: true }
      );

    if (dbError) {
      console.error('[subscribe] Supabase error:', dbError.message);
      // Não bloqueia o fluxo — o email ainda é enviado
    }
  } catch (err: any) {
    console.error('[subscribe] Supabase connection error:', err.message);
  }

  // ── 2. Enviar email de boas-vindas via Resend ─────────────────────────────────
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Sem Resend configurado — retorna OK na mesma para não bloquear o UX
    console.warn('[subscribe] RESEND_API_KEY não configurada — email não enviado');
    return res.status(200).json({ ok: true, warning: 'email_not_sent' });
  }

  try {
    const resend = new Resend(apiKey);
    const { subject, html } = welcomeEmailTemplate(DISCOUNT_CODE);

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: normalizedEmail,
      subject,
      html,
    });

    if (result.error) {
      console.error('[subscribe] Resend error:', result.error);
      // Falha silenciosa — o email foi guardado no Supabase
      return res.status(200).json({ ok: true, warning: 'email_failed' });
    }

    return res.status(200).json({ ok: true, emailId: result.data?.id });
  } catch (err: any) {
    console.error('[subscribe] Resend exception:', err.message);
    return res.status(200).json({ ok: true, warning: 'email_exception' });
  }
}
