'use client';

// Google Analytics 4 — SOLARIS
// Measurement ID via VITE_GA_MEASUREMENT_ID

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

function gtag(...args: any[]) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args);
  }
}

export function initGA() {
  if (!GA_ID || typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') return; // já inicializado

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: false });
}

export function gaPageView(path?: string) {
  if (!GA_ID) return;
  gtag('event', 'page_view', {
    page_path: path ?? window.location.pathname,
    page_location: window.location.href,
  });
}

export function gaViewItem(product: { id: string; name: string; price: number; currency?: string }) {
  gtag('event', 'view_item', {
    currency: product.currency ?? 'EUR',
    value: product.price,
    items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity: 1 }],
  });
}

export function gaAddToCart(product: { id: string; name: string; price: number; currency?: string; quantity?: number }) {
  const qty = product.quantity ?? 1;
  gtag('event', 'add_to_cart', {
    currency: product.currency ?? 'EUR',
    value: product.price * qty,
    items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity: qty }],
  });
}

export function gaBeginCheckout(params: { value: number; numItems: number; currency?: string }) {
  gtag('event', 'begin_checkout', {
    currency: params.currency ?? 'EUR',
    value: params.value,
    num_items: params.numItems,
  });
}

export function gaPurchase(params: { value: number; currency?: string; orderId?: string }) {
  gtag('event', 'purchase', {
    transaction_id: params.orderId ?? '',
    currency: params.currency ?? 'EUR',
    value: params.value,
  });
}
