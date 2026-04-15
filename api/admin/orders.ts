// GET /api/admin/orders — lista de encomendas do Supabase
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('SUPABASE_NOT_CONFIGURED');
  return createClient(url, key, { db: { schema: 'api' } });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw new Error(error.message);

    const orders = (data || []).map((o: any) => ({
      id: o.id,
      orderNumber: o.order_number,
      customerName: o.customer_name,
      customerEmail: o.customer_email,
      total: o.total_amount,
      currency: o.currency || 'EUR',
      status: o.status,
      cjOrderId: o.cj_order_id,
      stripeSessionId: o.stripe_session_id,
      items: o.items || [],
      shippingAddress: o.shipping_address,
      createdAt: o.created_at,
    }));

    // Metricas basicas
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
    const statusCounts = orders.reduce((acc: Record<string, number>, o: any) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    // Produto mais vendido
    const productCounts: Record<string, { name: string; count: number }> = {};
    for (const order of orders) {
      for (const item of (order.items as any[])) {
        const name = item.description || 'Produto';
        if (!productCounts[name]) productCounts[name] = { name, count: 0 };
        productCounts[name].count += item.quantity || 1;
      }
    }
    const topProducts = Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return res.status(200).json({
      orders,
      metrics: {
        totalOrders: orders.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageOrder: orders.length > 0 ? Math.round((totalRevenue / orders.length) * 100) / 100 : 0,
        statusCounts,
        topProducts,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message, orders: [], metrics: null });
  }
}
