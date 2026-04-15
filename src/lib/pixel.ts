// Meta Pixel — utilidade tipada para SOLARIS
// Pixel ID configurado via VITE_META_PIXEL_ID no .env.local

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any;
  }
}

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

// ─── Inicialização (chamada uma vez no arranque) ───────────────────────────────

export function initPixel() {
  if (!PIXEL_ID) return;
  if (typeof window === 'undefined') return;
  if (window.fbq) return; // já inicializado

  // Código base oficial Meta Pixel
  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', PIXEL_ID);
}

// ─── Eventos ──────────────────────────────────────────────────────────────────

function fbq(...args: any[]) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq(...args);
  }
}

/** Dispara em cada mudança de rota */
export function trackPageView() {
  fbq('track', 'PageView');
}

/** Produto visto */
export function trackViewContent(product: { id: string; name: string; price: number; currency?: string }) {
  fbq('track', 'ViewContent', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: product.currency ?? 'EUR',
  });
}

/** Adicionado ao carrinho */
export function trackAddToCart(product: { id: string; name: string; price: number; currency?: string }) {
  fbq('track', 'AddToCart', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: product.currency ?? 'EUR',
  });
}

/** Checkout iniciado */
export function trackInitiateCheckout(params: { value: number; numItems: number; currency?: string }) {
  fbq('track', 'InitiateCheckout', {
    value: params.value,
    num_items: params.numItems,
    currency: params.currency ?? 'EUR',
  });
}

/** Compra concluída — disparar na página /obrigado */
export function trackPurchase(params: { value: number; currency?: string; orderId?: string }) {
  fbq('track', 'Purchase', {
    value: params.value,
    currency: params.currency ?? 'EUR',
    ...(params.orderId ? { order_id: params.orderId } : {}),
  });
}
