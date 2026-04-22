export const MATTERHORN_BASE = 'https://matterhorn-wholesale.com/B2BAPI';

export function getMatterhornHeaders(): Record<string, string> {
  const key = process.env.MATTERHORN_API_KEY;
  if (!key) throw new Error('MATTERHORN_API_KEY not set');
  return {
    'accept': 'application/json',
    'Authorization': key,
  };
}
