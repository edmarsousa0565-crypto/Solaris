// GET /api/cj/categories
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCJToken, CJ_BASE_URL } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = await getCJToken();

    const response = await fetch(`${CJ_BASE_URL}/product/getCategory`, {
      headers: {
        'CJ-Access-Token': token,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!data.result) {
      return res.status(400).json({ error: data.message });
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json({ categories: data.data || [] });
  } catch (err: any) {
    console.error('CJ categories error:', err);
    return res.status(500).json({ error: err.message });
  }
}
