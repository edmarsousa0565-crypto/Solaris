// GET /api/cj/products?query=shirt&page=1&pageSize=20&categoryId=...
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCJToken, CJ_BASE_URL } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = await getCJToken();

    const { query = '', page = '1', pageSize = '20', categoryId = '' } = req.query;

    const params = new URLSearchParams({
      productNameEn: String(query),
      pageNum: String(page),
      pageSize: String(pageSize),
      ...(categoryId ? { categoryId: String(categoryId) } : {}),
    });

    const response = await fetch(
      `${CJ_BASE_URL}/product/list?${params}`,
      {
        headers: {
          'CJ-Access-Token': token,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!data.result) {
      return res.status(400).json({ error: data.message });
    }

    // Normaliza os produtos para o formato da nossa loja
    const products = (data.data?.list || []).map((p: any) => ({
      id: p.pid,
      name: p.productNameEn,
      price: `€${parseFloat(p.sellPrice || p.productWeight * 2 + 10 || 0).toFixed(2)}`,
      priceNum: parseFloat(p.sellPrice || 0),
      image: p.productImage,
      category: p.categoryName || 'General',
      collection: 'CJ Dropshipping',
      description: p.productNameEn,
      sizes: [],
      colors: [],
      isNew: true,
      isSoldOut: false,
      cjPid: p.pid,
    }));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json({ products, total: data.data?.total || 0 });
  } catch (err: any) {
    console.error('CJ products error:', err);
    return res.status(500).json({ error: err.message });
  }
}
