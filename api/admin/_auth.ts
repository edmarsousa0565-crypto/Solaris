// Helper de autenticação admin — usa HMAC SHA256 para tokens assinados.
// Não é um endpoint (começa com "_").
//
// Uso nos endpoints:
//   import { requireAuth } from './_auth';
//   if (!requireAuth(req, res)) return;
//
// O token é formado por `<expiresAt>.<hmac>` onde hmac = HMAC-SHA256(expiresAt, ADMIN_TOKEN_SECRET)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 horas

function getSecret(): string {
  const s = process.env.ADMIN_TOKEN_SECRET;
  if (!s) throw new Error('ADMIN_TOKEN_SECRET não configurado');
  return s;
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || '';
}

export function signToken(ttlMs: number = TOKEN_TTL_MS): string {
  const exp = Date.now() + ttlMs;
  const hmac = crypto.createHmac('sha256', getSecret()).update(String(exp)).digest('hex');
  return `${exp}.${hmac}`;
}

export function verifyToken(token: string): boolean {
  if (!token) return false;
  const [expStr, hmac] = token.split('.');
  if (!expStr || !hmac) return false;
  const exp = parseInt(expStr, 10);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = crypto.createHmac('sha256', getSecret()).update(expStr).digest('hex');
  // timing-safe compare
  if (hmac.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expected, 'hex'));
}

/** Middleware: devolve true se autenticado; se não, responde 401 e devolve false. */
export function requireAuth(req: VercelRequest, res: VercelResponse): boolean {
  const header = req.headers.authorization || req.headers.Authorization;
  const token = typeof header === 'string' && header.startsWith('Bearer ')
    ? header.slice(7)
    : '';
  if (!verifyToken(token)) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}
