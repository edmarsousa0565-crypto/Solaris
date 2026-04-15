// POST /api/cj/order — cria encomenda na CJ após pagamento confirmado
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCJToken, CJ_BASE_URL } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = await getCJToken();

    const {
      orderNumber,
      shippingAddress,
      products,
    } = req.body;

    // Formato esperado pela CJ API
    const payload = {
      orderNumber,
      shippingCountry: shippingAddress.country,
      shippingCustomerName: shippingAddress.name,
      shippingAddress: shippingAddress.line1,
      shippingCity: shippingAddress.city,
      shippingProvince: shippingAddress.state,
      shippingZip: shippingAddress.postalCode,
      shippingPhone: shippingAddress.phone,
      products: products.map((p: any) => ({
        vid: p.vid,
        quantity: p.quantity,
      })),
    };

    const response = await fetch(`${CJ_BASE_URL}/shopping/order/createOrder`, {
      method: 'POST',
      headers: {
        'CJ-Access-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.result) {
      return res.status(400).json({ error: data.message });
    }

    return res.status(200).json({ orderId: data.data?.orderId, success: true });
  } catch (err: any) {
    console.error('CJ order error:', err);
    return res.status(500).json({ error: err.message });
  }
}
