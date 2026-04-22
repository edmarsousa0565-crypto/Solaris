import crypto from 'crypto';

export const EPROLO_BASE_URL = 'https://openapi.eprolo.com';

export function getEproloAuthQS(): string {
  const timestamp = Date.now().toString(); // milliseconds (13 dígitos)
  const apiKey = process.env.EPROLO_API_KEY || '';
  const apiSecret = process.env.EPROLO_API_SECRET || '';
  const sign = crypto.createHash('md5').update(`${apiKey}${timestamp}${apiSecret}`).digest('hex').toUpperCase();
  return `sign=${sign}&timestamp=${timestamp}`;
}

export function getEproloAuthHeaders(): Record<string, string> {
  return { apiKey: process.env.EPROLO_API_KEY || '' };
}
