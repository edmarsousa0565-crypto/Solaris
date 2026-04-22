import type { VercelRequest, VercelResponse } from '@vercel/node';
import featuredHandler from './_featured';
import ordersHandler from './_orders';
import metricsHandler from './_metrics';
import settingsHandler from './_settings';

const routes: Record<string, (req: VercelRequest, res: VercelResponse) => any> = {
  featured: featuredHandler,
  orders: ordersHandler,
  metrics: metricsHandler,
  settings: settingsHandler,
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  const segments = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
  const route = routes[segments[0] || ''];
  if (!route) return res.status(404).json({ error: 'Not found' });
  return route(req, res);
}
