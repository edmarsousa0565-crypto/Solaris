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
  const pathVal = req.query.path;
  const segments = Array.isArray(pathVal) ? pathVal : (pathVal ? [pathVal] : []);
  // Tolerate Vercel including 'admin' as the first path segment
  const offset = segments[0] === 'admin' ? 1 : 0;
  const key = segments[offset] || '';
  const route = routes[key];
  if (!route) return res.status(404).json({ error: 'Not found', _debug: { key, segments, query: req.query } });
  return route(req, res);
}
