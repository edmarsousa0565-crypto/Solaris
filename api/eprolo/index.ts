// /api/eprolo?action=products|categories|shipping|orders  —  POST /api/eprolo → cria encomenda
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { EPROLO_BASE_URL, getEproloAuthHeaders, getEproloAuthQS } from './_auth';

// ─── Map product ──────────────────────────────────────────────────────────────

function mapProduct(p: any) {
  const variants = p.variantlist || [];
  const images = (p.imagelist || []).map((img: any) => img.src).filter(Boolean);
  const firstVariant = variants[0];
  const mainImage = p.imagefirst || images[0] || '';
  return {
    id: String(p.id), cjPid: String(p.id), pid: String(p.id), eprolo_id: String(p.id),
    name: p.title, price: `€${(firstVariant?.cost || 0).toFixed(2)}`,
    priceNum: firstVariant?.cost || 0, image: mainImage, images: images.length ? images : [mainImage],
    category: 'Eprolo', collection: 'Eprolo',
    description: (p.body_html || p.title || '').replace(/<[^>]+>/g, '').slice(0, 500),
    supplier: 'eprolo' as const,
    isNew: false,
    isSoldOut: variants.every((v: any) => !v.inventory_quantity),
    stock_total: variants.reduce((s: number, v: any) => s + (v.inventory_quantity || 0), 0),
    shipping_template_id: p.shipping_template_id,
    logistics_cost_list: p.logistics_cost_list || [],
    variants: variants.map((v: any) => ({
      vid: String(v.id), variant_uid: String(v.id),
      name: [v.option1, v.option2, v.option3].filter(Boolean).join(' / ') || v.title || 'Default',
      variantNameEn: [v.option1, v.option2, v.option3].filter(Boolean).join(' / ') || v.title || 'Default',
      price: v.cost, variantSellPrice: v.cost, sellPrice: v.cost,
      stock: v.inventory_quantity || 0, variantStock: v.inventory_quantity || 0,
      sku: v.sku || '',
      image: (p.imagelist || []).find((img: any) => img.id == v.imagesid)?.src || mainImage,
    })),
    sizes: [...new Set(variants.map((v: any) => v.option1).filter(Boolean))],
  };
}

// ─── Products list ────────────────────────────────────────────────────────────

async function handleProducts(req: VercelRequest, res: VercelResponse) {
  const { pageNum = '1', page_index, pageSize = '20', page_size, wareTypeId = '' } = req.query;
  const effectivePage = String(page_index ?? pageNum);
  const effectiveSize = String(page_size ?? pageSize);

  const params = new URLSearchParams({
    pageNum: effectivePage,
    pageSize: effectiveSize,
    page_index: effectivePage,
    page_size: effectiveSize,
  });
  if (wareTypeId) params.set('wareTypeId', String(wareTypeId));

  const response = await fetch(`${EPROLO_BASE_URL}/eprolo_product_list.html?${getEproloAuthQS()}&${params}`, {
    headers: getEproloAuthHeaders(),
  });
  const data: any = await response.json();
  if (data.code !== '0' && data.code !== 0) {
    return res.status(400).json({ error: data.msg || 'Eprolo error' });
  }

  const list: any[] = data.data || [];
  const reqSize = parseInt(effectiveSize, 10) || 20;
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  return res.status(200).json({
    products: list.map(mapProduct),
    total: list.length,
    hasMore: list.length >= reqSize,
  });
}

// ─── My products (produtos adicionados à conta) ───────────────────────────────

async function handleMyProducts(req: VercelRequest, res: VercelResponse) {
  const { page_index = '0', page_size = '20', wareTypeId = '', status = '1',
    begin_time = '', end_time = '', begin_update_time = '', end_update_time = '' } = req.query;

  const params = new URLSearchParams({
    page_index: String(page_index),
    page_size: String(page_size),
    status: String(status),
  });
  if (wareTypeId) params.set('wareTypeId', String(wareTypeId));
  if (begin_time) params.set('begin_time', String(begin_time));
  if (end_time) params.set('end_time', String(end_time));
  if (begin_update_time) params.set('begin_update_time', String(begin_update_time));
  if (end_update_time) params.set('end_update_time', String(end_update_time));

  const response = await fetch(
    `${EPROLO_BASE_URL}/product_list.html?${getEproloAuthQS()}&${params}`,
    { headers: getEproloAuthHeaders() }
  );
  const data: any = await response.json();
  if (data.code !== '0' && data.code !== 0) {
    return res.status(400).json({ error: data.msg || 'Eprolo error' });
  }

  const list: any[] = data.data || [];
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  return res.status(200).json({
    products: list.map(mapProduct),
    total: list.length,
    hasMore: list.length >= parseInt(String(page_size), 10),
  });
}

// ─── Single product ───────────────────────────────────────────────────────────

function extractMethods(source: any): any[] {
  // Aceita qualquer forma: data.variantlist[].logistics_cost_list[].cost_list[], ou logistics_cost_list direta
  const out: any[] = [];
  const variantLists = source?.data?.variantlist || source?.variantlist || [];
  const directLogistics = source?.data?.logistics_cost_list || source?.logistics_cost_list || [];

  const pushMethod = (m: any) => {
    if (!m || out.find(x => x.id === String(m.logistics_id))) return;
    out.push({
      id: String(m.logistics_id),
      name: m.ship_method || String(m.logistics_id),
      price: m.cost || 0,
      priceFormatted: m.cost === 0 ? 'Grátis' : `€${(m.cost || 0).toFixed(2)}`,
      estimatedDelivery: m.shiptime || 'Consultar',
      country: m.country || '',
      countryCode: m.countrycode || '',
    });
  };

  for (const variant of variantLists) {
    for (const entry of (variant.logistics_cost_list || [])) {
      for (const m of (entry.cost_list || [])) pushMethod(m);
    }
  }
  for (const entry of directLogistics) {
    for (const m of (entry.cost_list || [])) pushMethod(m);
  }
  return out;
}

async function handleProduct(req: VercelRequest, res: VercelResponse) {
  const { id, variantId } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  // getproduct.html só funciona para produtos importados. Para catálogo público,
  // devolvemos apenas os métodos de envio via get_product_shiping_fees.html.
  const productRes = await fetch(
    `${EPROLO_BASE_URL}/getproduct.html?${getEproloAuthQS()}&id=${id}&product_id=${id}`,
    { headers: getEproloAuthHeaders() }
  );
  const data: any = await productRes.json();
  const raw = Array.isArray(data.data) ? data.data[0] : data.data;
  const product = raw ? mapProduct(raw) : null;

  let shippingMethods: any[] = product ? extractMethods(raw) : [];

  // Se precisamos de shipping e temos variantId, chama o endpoint dedicado
  if (shippingMethods.length === 0 && variantId) {
    try {
      const sRes = await fetch(
        `${EPROLO_BASE_URL}/get_product_shiping_fees.html?${getEproloAuthQS()}&productid=${id}&variantId=${variantId}&countrycode=PT`,
        { headers: getEproloAuthHeaders() }
      );
      const sData: any = await sRes.json();
      if (sData.code === '0' || sData.code === 0) {
        shippingMethods = extractMethods(sData);
      }
    } catch { /* ignora */ }
  }

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
  return res.status(200).json({ product, shippingMethods });
}

// ─── Categories ───────────────────────────────────────────────────────────────

async function handleCategories(req: VercelRequest, res: VercelResponse) {
  const { level = '1', typeid = '' } = req.query;
  const endpoint = level === '2' ? '/product_type_two.html' : '/product_type.html';
  const params = new URLSearchParams();
  if (level === '2' && typeid) params.set('typeid', String(typeid));

  const qs = params.toString();
  const response = await fetch(
    `${EPROLO_BASE_URL}${endpoint}?${getEproloAuthQS()}${qs ? '&' + qs : ''}`,
    { headers: getEproloAuthHeaders() }
  );
  const data: any = await response.json();
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  return res.status(200).json({
    categories: data.data?.list || data.data || [],
    root_path: data.data?.root_path || '',
  });
}

// ─── Shipping rates ───────────────────────────────────────────────────────────

async function handleShipping(req: VercelRequest, res: VercelResponse) {
  const { productid, variantId, countrycode = '' } = req.query;
  if (!productid || !variantId) return res.status(400).json({ error: 'Missing productid or variantId' });

  const params = new URLSearchParams({
    productid: String(productid), variantId: String(variantId),
    ...(countrycode ? { countrycode: String(countrycode) } : {}),
  });
  const response = await fetch(
    `${EPROLO_BASE_URL}/get_product_shiping_fees.html?${getEproloAuthQS()}&${params}`,
    { headers: getEproloAuthHeaders() }
  );
  const data: any = await response.json();
  if (data.code !== '0' && data.code !== 0) return res.status(400).json({ error: data.msg });

  const variant = (data.data?.variantlist || [])[0];
  const costList = variant?.logistics_cost_list?.[0]?.cost_list || [];
  const methods = costList.map((m: any) => ({
    id: String(m.logistics_id),
    name: m.ship_method || String(m.logistics_id),
    price: m.cost || 0,
    priceFormatted: m.cost === 0 ? 'Grátis' : `€${(m.cost || 0).toFixed(2)}`,
    estimatedDelivery: m.shiptime || 'Consultar',
    country: m.country || '',
    countryCode: m.countrycode || '',
  }));

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  return res.status(200).json({ shippingMethods: methods });
}

// ─── Register webhook ─────────────────────────────────────────────────────────

async function handleRegisterWebhook(req: VercelRequest, res: VercelResponse) {
  const { url, sign_key, type = 0 } = req.body || {};
  if (!url || !sign_key) return res.status(400).json({ error: 'url and sign_key are required' });

  const response = await fetch(
    `${EPROLO_BASE_URL}/add_shop_webhook.html?${getEproloAuthQS()}`,
    {
      method: 'POST',
      headers: { ...getEproloAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, sign_key, type }),
    }
  );
  const data: any = await response.json();
  if (data.code !== '0' && data.code !== 0) {
    return res.status(400).json({ error: data.msg || 'Eprolo error' });
  }
  return res.status(200).json({ success: true });
}

// ─── Delete webhook ───────────────────────────────────────────────────────────

async function handleDeleteWebhook(req: VercelRequest, res: VercelResponse) {
  const { type } = req.body || {};
  if (type === undefined) return res.status(400).json({ error: 'Missing type' });

  const response = await fetch(
    `${EPROLO_BASE_URL}/delete_shop_webhook.html?${getEproloAuthQS()}`,
    {
      method: 'POST',
      headers: { ...getEproloAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    }
  );
  const data: any = await response.json();
  if (data.code !== '0' && data.code !== 0) {
    return res.status(400).json({ error: data.msg || 'Delete webhook failed' });
  }
  return res.status(200).json({ success: true });
}

// ─── Webhook list ─────────────────────────────────────────────────────────────

async function handleWebhooks(req: VercelRequest, res: VercelResponse) {
  const response = await fetch(
    `${EPROLO_BASE_URL}/shop_webhook_list.html?${getEproloAuthQS()}`,
    { headers: getEproloAuthHeaders() }
  );
  const data: any = await response.json();
  if (data.code !== '0' && data.code !== 0) {
    return res.status(400).json({ error: data.msg || 'Eprolo error' });
  }
  return res.status(200).json({ webhooks: data.data?.list || [] });
}

// ─── Order list ───────────────────────────────────────────────────────────────

async function handleOrders(req: VercelRequest, res: VercelResponse) {
  const {
    page = '1', page_index, page_size = '20', status = '0',
    eOrderCodes = '', order_id = '', order_number = '',
    shop_open_id = '', status_exception = '',
    begin_time = '', end_time = '',
    begin_update_time = '', end_update_time = '',
  } = req.query;

  const params = new URLSearchParams({
    page: String(page_index ?? page),
    page_size: String(page_size),
    status: String(status),
  });
  if (eOrderCodes)       params.set('eOrderCodes', String(eOrderCodes));
  if (order_id)          params.set('order_id', String(order_id));
  if (order_number)      params.set('order_number', String(order_number));
  if (shop_open_id)      params.set('shop_open_id', String(shop_open_id));
  if (status_exception)  params.set('status_exception', String(status_exception));
  if (begin_time)        params.set('begin_time', String(begin_time));
  if (end_time)          params.set('end_time', String(end_time));
  if (begin_update_time) params.set('begin_update_time', String(begin_update_time));
  if (end_update_time)   params.set('end_update_time', String(end_update_time));

  const response = await fetch(
    `${EPROLO_BASE_URL}/order_list.html?${getEproloAuthQS()}&${params}`,
    { headers: getEproloAuthHeaders() }
  );
  const data: any = await response.json();
  if (data.code !== '0' && data.code !== 0) {
    return res.status(400).json({ error: data.msg || 'Eprolo error' });
  }
  return res.status(200).json({ orders: data.data?.list || [], total: data.data?.total || 0 });
}

// ─── Import products to store ────────────────────────────────────────────────

async function handleImportProducts(req: VercelRequest, res: VercelResponse) {
  const { ids } = req.body || {};
  if (!ids?.length) return res.status(400).json({ error: 'Missing ids array' });

  const response = await fetch(
    `${EPROLO_BASE_URL}/add_product.html?${getEproloAuthQS()}`,
    {
      method: 'POST',
      headers: { ...getEproloAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.isArray(ids) ? ids : [ids] }),
    }
  );
  const data: any = await response.json();
  if (data.code !== '0' && data.code !== 0) {
    return res.status(400).json({ error: data.msg || 'Import failed' });
  }
  const list: any[] = Array.isArray(data.data) ? data.data : [];
  return res.status(200).json({ products: list.map(mapProduct), total: list.length });
}

// ─── Insert custom product to store ──────────────────────────────────────────

async function handleInsertProduct(req: VercelRequest, res: VercelResponse) {
  const body = req.body || {};
  if (!body.product_id || !body.title) return res.status(400).json({ error: 'Missing product_id or title' });

  const response = await fetch(
    `${EPROLO_BASE_URL}/insert_product.html?${getEproloAuthQS()}`,
    {
      method: 'POST',
      headers: { ...getEproloAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  const data: any = await response.json();
  if (data.code !== '0' && data.code !== 0) {
    return res.status(400).json({ error: data.msg || 'Insert product failed' });
  }
  return res.status(200).json({ product: data.data || null });
}

// ─── Add subitem to existing order ───────────────────────────────────────────

async function handleAddOrderItem(req: VercelRequest, res: VercelResponse) {
  const { orderid, items } = req.body || {};
  if (!orderid || !items?.length) return res.status(400).json({ error: 'Missing orderid or items' });

  const response = await fetch(
    `${EPROLO_BASE_URL}/add_order_item.html?${getEproloAuthQS()}`,
    {
      method: 'POST',
      headers: { ...getEproloAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderid, items }),
    }
  );
  const data: any = await response.json();
  if (data.code !== '0' && data.code !== 0) {
    return res.status(400).json({ error: data.msg || 'Add order item failed' });
  }
  return res.status(200).json({ order: data.data || null });
}

// ─── Edit order subitem ───────────────────────────────────────────────────────

async function handleEditOrderItem(req: VercelRequest, res: VercelResponse) {
  const { orderid, order_itemid, quantity } = req.body || {};
  if (!orderid || !order_itemid) return res.status(400).json({ error: 'Missing orderid or order_itemid' });

  const response = await fetch(
    `${EPROLO_BASE_URL}/modify_order_item.html?${getEproloAuthQS()}`,
    {
      method: 'POST',
      headers: { ...getEproloAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderid, order_itemid, ...(quantity !== undefined ? { quantity } : {}) }),
    }
  );
  const data: any = await response.json();
  if (data.code !== '0' && data.code !== 0) {
    return res.status(400).json({ error: data.msg || 'Edit order item failed' });
  }
  return res.status(200).json({ order: data.data || null });
}

// ─── Delete order subitem ─────────────────────────────────────────────────────

async function handleDeleteOrderItem(req: VercelRequest, res: VercelResponse) {
  const { id, orderid, remark = '' } = req.body || {};
  if (!id || !orderid) return res.status(400).json({ error: 'Missing id or orderid' });

  const response = await fetch(
    `${EPROLO_BASE_URL}/delete_order_item.html?${getEproloAuthQS()}`,
    {
      method: 'POST',
      headers: { ...getEproloAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, orderid, remark }),
    }
  );
  const data: any = await response.json();
  if (data.code !== '0' && data.code !== 0) {
    return res.status(400).json({ error: data.msg || 'Delete order item failed' });
  }
  return res.status(200).json({ order: data.data || null });
}

// ─── Cancel order ────────────────────────────────────────────────────────────

async function handleCancelOrder(req: VercelRequest, res: VercelResponse) {
  const { ids, remark = '' } = req.body || {};
  if (!ids?.length) return res.status(400).json({ error: 'Missing ids array' });

  const response = await fetch(
    `${EPROLO_BASE_URL}/cancel_orders.html?${getEproloAuthQS()}`,
    {
      method: 'POST',
      headers: { ...getEproloAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.isArray(ids) ? ids : [ids], remark }),
    }
  );
  const data: any = await response.json();
  if (data.code !== '0' && data.code !== 0) {
    return res.status(400).json({ error: data.msg || 'Cancel failed' });
  }
  return res.status(200).json({ success: true });
}

// ─── Edit order note ──────────────────────────────────────────────────────────

async function handleEditOrderNote(req: VercelRequest, res: VercelResponse) {
  const { orderid, note = '' } = req.body || {};
  if (!orderid) return res.status(400).json({ error: 'Missing orderid' });

  const response = await fetch(
    `${EPROLO_BASE_URL}/modify_node.html?${getEproloAuthQS()}`,
    {
      method: 'POST',
      headers: { ...getEproloAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderid, note }),
    }
  );
  const data: any = await response.json();
  if (data.code !== '0' && data.code !== 0) {
    return res.status(400).json({ error: data.msg || 'Edit note failed' });
  }
  return res.status(200).json({ success: true });
}

// ─── Block / unblock order ────────────────────────────────────────────────────

async function handleBlockOrder(req: VercelRequest, res: VercelResponse) {
  const { id, status, remark = '' } = req.body || {};
  if (!id || status === undefined) return res.status(400).json({ error: 'Missing id or status' });

  const response = await fetch(
    `${EPROLO_BASE_URL}/order_exception.html?${getEproloAuthQS()}`,
    {
      method: 'POST',
      headers: { ...getEproloAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, remark }),
    }
  );
  const data: any = await response.json();
  if (data.code !== '0' && data.code !== 0) {
    return res.status(400).json({ error: data.msg || 'Block order failed' });
  }
  return res.status(200).json({ success: true });
}

// ─── Edit order address ───────────────────────────────────────────────────────

async function handleEditOrderAddress(req: VercelRequest, res: VercelResponse) {
  const body = req.body || {};
  if (!body.orderid) return res.status(400).json({ error: 'Missing orderid' });

  const response = await fetch(
    `${EPROLO_BASE_URL}/modify_order_address.html?${getEproloAuthQS()}`,
    {
      method: 'POST',
      headers: { ...getEproloAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  const data: any = await response.json();
  if (data.code !== '0' && data.code !== 0) {
    return res.status(400).json({ error: data.msg || 'Edit address failed' });
  }
  return res.status(200).json({ order: data.data || null });
}

// ─── Pay order ────────────────────────────────────────────────────────────────

async function handlePayOrder(req: VercelRequest, res: VercelResponse) {
  const { operate = 'pre', pay_subtotal, orderlist } = req.body || {};
  if (!orderlist?.length || pay_subtotal === undefined) {
    return res.status(400).json({ error: 'Missing orderlist or pay_subtotal' });
  }

  const response = await fetch(
    `${EPROLO_BASE_URL}/pay_order.html?${getEproloAuthQS()}`,
    {
      method: 'POST',
      headers: { ...getEproloAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ operate, pay_subtotal, orderlist }),
    }
  );
  const data: any = await response.json();
  if (data.code !== '0' && data.code !== 0) {
    return res.status(400).json({ error: data.msg || 'Pay failed' });
  }
  return res.status(200).json({ success: true, data: data.data || null });
}

// ─── Get order price ──────────────────────────────────────────────────────────

async function handleOrderPrice(req: VercelRequest, res: VercelResponse) {
  const { shipping_country_code, skulistName } = req.query;
  if (!shipping_country_code || !skulistName) {
    return res.status(400).json({ error: 'Missing shipping_country_code or skulistName' });
  }

  const params = new URLSearchParams({
    shipping_country_code: String(shipping_country_code),
    skulistName: typeof skulistName === 'string' ? skulistName : JSON.stringify(skulistName),
  });
  const response = await fetch(
    `${EPROLO_BASE_URL}/getCostByProduct.html?${getEproloAuthQS()}&${params}`,
    { headers: getEproloAuthHeaders() }
  );
  const data: any = await response.json();
  if (data.code !== '0' && data.code !== 0) {
    return res.status(400).json({ error: data.msg || 'Eprolo error' });
  }
  return res.status(200).json({ price: data.data || null });
}

// ─── Product inventory ────────────────────────────────────────────────────────

async function handleInventory(req: VercelRequest, res: VercelResponse) {
  const { productid = '', variantsid = '', stock_id = '', areatype = '',
    page_index = '0', page_size = '20' } = req.query;

  const params = new URLSearchParams({ page_index: String(page_index), page_size: String(page_size) });
  if (productid)  params.set('productid', String(productid));
  if (variantsid) params.set('variantsid', String(variantsid));
  if (stock_id)   params.set('stock_id', String(stock_id));
  if (areatype)   params.set('areatype', String(areatype));

  const response = await fetch(
    `${EPROLO_BASE_URL}/product_inventory.html?${getEproloAuthQS()}&${params}`,
    { headers: getEproloAuthHeaders() }
  );
  const data: any = await response.json();
  if (data.code !== '0' && data.code !== 0) {
    return res.status(400).json({ error: data.msg || 'Eprolo error' });
  }
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  return res.status(200).json({ inventory: data.data || [] });
}

// ─── Create order (POST) ──────────────────────────────────────────────────────

async function handleCreateOrder(req: VercelRequest, res: VercelResponse) {
  const { shipping, products, orderNo } = req.body;
  if (!products?.length) return res.status(400).json({ error: 'No products' });

  const payload: Record<string, any> = {
    order_id: orderNo,
    order_number: orderNo,
    tax_cost: 0,
    shipping_name: shipping.name,
    shipping_country: shipping.country,
    shipping_country_code: shipping.country,
    shipping_province: shipping.state || shipping.city || '',
    shipping_province_code: shipping.state || shipping.city || '',
    shipping_city: shipping.city,
    shipping_address: shipping.line1,
    shipping_address2: shipping.line2 || '',
    shipping_post_code: shipping.postalCode,
    shipping_phone: shipping.phone || '',
    email: shipping.email || '',
    orderItemlist: products.map((p: any) => ({
      variantsid: String(p.variantsid || p.vid),
      quantity: p.quantity,
      ...(p.logistics_id ? { logistics_id: p.logistics_id } : {}),
    })),
  };

  const response = await fetch(
    `${EPROLO_BASE_URL}/add_order.html?${getEproloAuthQS()}`,
    {
      method: 'POST',
      headers: { ...getEproloAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );
  const data: any = await response.json();
  if (data.code !== '0' && data.code !== 0) {
    console.error('Eprolo createOrder failed:', data.msg, JSON.stringify(payload));
    return res.status(400).json({ error: data.msg || 'Order creation failed' });
  }
  return res.status(200).json({ orderId: data.data?.order_id || data.data?.orderid, success: true });
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const action = String(req.query.action || '');

    if (req.method === 'POST') {
      if (action === 'register-webhook')  return await handleRegisterWebhook(req, res);
      if (action === 'delete-webhook')    return await handleDeleteWebhook(req, res);
      if (action === 'import-products')  return await handleImportProducts(req, res);
      if (action === 'insert-product')   return await handleInsertProduct(req, res);
      if (action === 'add-order-item')    return await handleAddOrderItem(req, res);
      if (action === 'delete-order-item') return await handleDeleteOrderItem(req, res);
      if (action === 'edit-order-item')  return await handleEditOrderItem(req, res);
      if (action === 'cancel-order')       return await handleCancelOrder(req, res);
      if (action === 'edit-order-note')   return await handleEditOrderNote(req, res);
      if (action === 'edit-order-address') return await handleEditOrderAddress(req, res);
      if (action === 'block-order')       return await handleBlockOrder(req, res);
      if (action === 'pay-order')         return await handlePayOrder(req, res);
      return await handleCreateOrder(req, res);
    }
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    switch (action) {
      case 'products':         return await handleProducts(req, res);
      case 'my-products':      return await handleMyProducts(req, res);
      case 'product':          return await handleProduct(req, res);
      case 'categories':       return await handleCategories(req, res);
      case 'shipping':         return await handleShipping(req, res);
      case 'orders':           return await handleOrders(req, res);
      case 'order-price':      return await handleOrderPrice(req, res);
      case 'inventory':        return await handleInventory(req, res);
      case 'webhooks':         return await handleWebhooks(req, res);
      default:                 return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err: any) {
    console.error('Eprolo handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
