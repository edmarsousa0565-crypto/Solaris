// GET /api/admin/metrics?range=7d|30d|90d|all
// Dashboard de métricas: receita, pedidos, AOV, produtos top, por fornecedor
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from './_auth';
import { getSupabaseAdmin as getSupabase } from '../_supabase';

function rangeToDate(range: string): Date | null {
  const now = new Date();
  switch (range) {
    case '7d': return new Date(now.getTime() - 7 * 864e5);
    case '30d': return new Date(now.getTime() - 30 * 864e5);
    case '90d': return new Date(now.getTime() - 90 * 864e5);
    case 'all':
    default: return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const range = String(req.query.range || '30d');

  try {
    const sb = getSupabase();
    let query = sb.from('orders').select('*');
    const startDate = rangeToDate(range);
    if (startDate) query = query.gte('created_at', startDate.toISOString());

    const { data: orders, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    const list = orders || [];

    // Métricas gerais
    const revenue = list.reduce((s: number, o: any) => s + (parseFloat(o.total_amount) || 0), 0);
    const orderCount = list.length;
    const aov = orderCount ? revenue / orderCount : 0;

    // Por fornecedor
    const bySupplier: Record<string, { count: number; revenue: number }> = {
      cj: { count: 0, revenue: 0 },
      matterhorn: { count: 0, revenue: 0 },
      mixed: { count: 0, revenue: 0 },
    };
    for (const o of list) {
      const hasCj = !!o.cj_order_id;
      const hasMh = !!o.matterhorn_order_id;
      const key = hasCj && hasMh ? 'mixed' : hasMh ? 'matterhorn' : 'cj';
      bySupplier[key].count++;
      bySupplier[key].revenue += parseFloat(o.total_amount) || 0;
    }

    // Por estado
    const byStatus: Record<string, number> = {};
    for (const o of list) {
      const s = o.status || 'unknown';
      byStatus[s] = (byStatus[s] || 0) + 1;
    }

    // Receita por dia (últimos N dias com dados)
    const daily: Record<string, { revenue: number; orders: number }> = {};
    for (const o of list) {
      const date = new Date(o.created_at).toISOString().slice(0, 10);
      if (!daily[date]) daily[date] = { revenue: 0, orders: 0 };
      daily[date].revenue += parseFloat(o.total_amount) || 0;
      daily[date].orders++;
    }
    const dailySeries = Object.entries(daily)
      .map(([date, d]) => ({ date, ...d }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top produtos (extraídos dos items JSON)
    const productStats: Record<string, { name: string; count: number; revenue: number }> = {};
    for (const o of list) {
      const items = Array.isArray(o.items) ? o.items : [];
      for (const item of items) {
        const name = item.description || item.name || 'Produto desconhecido';
        const qty = item.quantity || 1;
        const amount = (item.amount_total || item.price || 0) / 100;
        if (!productStats[name]) productStats[name] = { name, count: 0, revenue: 0 };
        productStats[name].count += qty;
        productStats[name].revenue += amount;
      }
    }
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Pagamentos Matterhorn pendentes (requerem ação do admin)
    const pendingMatterhornPayments = list
      .filter((o: any) => o.matterhorn_payment_url && o.status !== 'matterhorn_paid')
      .map((o: any) => ({
        orderNumber: o.order_number,
        matterhornOrderId: o.matterhorn_order_id,
        paymentUrl: o.matterhorn_payment_url,
        customerEmail: o.customer_email,
        createdAt: o.created_at,
      }));

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      range,
      totals: { revenue, orderCount, aov },
      bySupplier,
      byStatus,
      dailySeries,
      topProducts,
      pendingMatterhornPayments,
    });
  } catch (err: any) {
    console.error('Metrics error:', err);
    return res.status(500).json({ error: err.message });
  }
}
