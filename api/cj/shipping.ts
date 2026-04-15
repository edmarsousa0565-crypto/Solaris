// GET /api/cj/shipping?pid=xxx&vid=xxx&qty=1&country=PT
// Devolve os métodos de envio disponíveis da CJ para um produto
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCJToken, CJ_BASE_URL } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pid, vid, qty = '1', country = 'PT' } = req.query;

  if (!pid) {
    return res.status(400).json({ error: 'Missing pid' });
  }

  try {
    const token = await getCJToken();

    const body = {
      startCountryCode: 'CN',
      endCountryCode: String(country),
      products: [
        {
          quantity: parseInt(String(qty)) || 1,
          vid: vid ? String(vid) : undefined,
          pid: String(pid),
        },
      ],
    };

    const response = await fetch(`${CJ_BASE_URL}/logistic/freightCalculate`, {
      method: 'POST',
      headers: {
        'CJ-Access-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!data.result) {
      return res.status(200).json({ methods: [], error: data.message });
    }

    const methods = (data.data || []).map((m: any) => ({
      id: m.logisticName,
      name: m.logisticName,
      price: parseFloat(m.logisticPrice || 0),
      priceFormatted: `€${parseFloat(m.logisticPrice || 0).toFixed(2)}`,
      minDays: m.minDeliveryDays ?? m.minDate ?? null,
      maxDays: m.maxDeliveryDays ?? m.maxDate ?? null,
      tracking: m.tracking ?? true,
      estimatedDelivery: m.minDeliveryDays && m.maxDeliveryDays
        ? `${m.minDeliveryDays}–${m.maxDeliveryDays} dias úteis`
        : m.ageLabel || 'Consultar',
    }));

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json({ methods });
  } catch (err: any) {
    console.error('CJ shipping error:', err);
    return res.status(500).json({ error: err.message, methods: [] });
  }
}
