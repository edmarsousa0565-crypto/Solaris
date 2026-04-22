// Utilitário interno — obtém e renova o access token da CJ Dropshipping
// Não é uma rota pública

const CJ_BASE = 'https://developers.cjdropshipping.com/api2.0/v1';

let cachedToken: string | null = null;
let tokenExpiry = 0;

export async function getCJToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const res = await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.CJ_EMAIL,
      password: process.env.CJ_API_KEY,
    }),
  });

  const data: any = await res.json();

  if (!data.result) {
    throw new Error(`CJ Auth failed: ${data.message}`);
  }

  cachedToken = data.data.accessToken;
  // Token válido por 6 dias — renova com 1h de antecedência
  tokenExpiry = Date.now() + (6 * 24 * 60 * 60 * 1000) - (60 * 60 * 1000);

  return cachedToken!;
}

export const CJ_BASE_URL = CJ_BASE;
