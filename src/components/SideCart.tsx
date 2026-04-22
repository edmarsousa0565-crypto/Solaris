'use client';

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SfDrawer, SfButton, SfIconAdd, SfIconRemove, SfIconClose } from '@storefront-ui/react';
import { trackInitiateCheckout } from '../lib/pixel';
import { gaBeginCheckout } from '../lib/analytics';
import { useCartStore } from '../store/cartStore';

export default function SideCart() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, syncPrices } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const syncedRef = useRef(false);

  // Sincroniza preços com Supabase quando o carrinho abre (corrige itens antigos com preço CJ)
  useEffect(() => {
    if (!isOpen || syncedRef.current) return;
    fetch('/api/admin/featured')
      .then(r => r.json())
      .then(data => {
        if (data.products?.length) {
          syncPrices(data.products);
          syncedRef.current = true;
        }
      })
      .catch(() => {});
  }, [isOpen, syncPrices]);

  const total = items.reduce((acc, item) => {
    const raw = String(item.price).replace(/[^0-9,.\-]/g, '');
    const normalized = raw.includes(',') && raw.includes('.')
      ? raw.replace(/\./g, '').replace(',', '.')
      : raw.replace(',', '.');
    const numericPrice = parseFloat(normalized);
    const qty = item.quantity || 1;
    return acc + (isNaN(numericPrice) ? 0 : numericPrice * qty);
  }, 0);

  const handleCheckout = async () => {
    if (!items.length) return;
    setLoading(true);
    setError(null);

    try {
      const checkoutItems = items.map(item => {
        // Parse robusto: remove símbolos e normaliza vírgula como decimal (formato EU)
        const raw = String(item.price).replace(/[^0-9,.\-]/g, '');
        // Se houver ',' e '.' juntos, assume '.' milhar e ',' decimal
        const normalized = raw.includes(',') && raw.includes('.')
          ? raw.replace(/\./g, '').replace(',', '.')
          : raw.replace(',', '.');
        const priceEur = parseFloat(normalized) || 0;
        return {
          name: `${item.name} (${item.size || 'Unique'})`,
          price: Math.round(priceEur * 100),
          quantity: item.quantity || 1,
          image: item.image || undefined,
          supplier: item.supplier || 'cj',
          cjPid: item.cjPid || undefined,
          variantId: item.variantId || undefined,
          matterhorn_id: item.matterhorn_id || undefined,
          variant_uid: item.variant_uid || undefined,
        };
      });

      trackInitiateCheckout({ value: total, numItems: items.length });
      gaBeginCheckout({ value: total, numItems: items.length });

      // Guarda o total para o evento Purchase na página /obrigado
      sessionStorage.setItem('solaris-checkout-total', String(total));

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems,
          successUrl: `${window.location.origin}/obrigado?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.href,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Erro ao iniciar checkout');
      }

      // Redireciona para a página de pagamento Stripe
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-absolute-black/30 backdrop-blur-sm z-[99]"
          onClick={() => setIsOpen(false)}
        />
      )}

      <SfDrawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        placement="right"
        aria-label="Carrinho de compras"
        className="fixed top-0 right-0 w-[90vw] md:w-[38vw] h-screen bg-stark-white border-l border-absolute-black/10 z-[100] p-8 flex flex-col font-mono text-xs md:text-sm shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-absolute-black/20 pb-6 mb-8">
          <div className="flex flex-col gap-1">
            <span className="uppercase tracking-widest font-bold">Receipt // Solaris</span>
            <span className="text-absolute-black/80">Date: {new Date().toLocaleDateString()}</span>
          </div>
          <SfButton
            variant="tertiary"
            onClick={() => setIsOpen(false)}
            className="uppercase tracking-widest text-xs text-absolute-black hover:text-oxidized-gold transition-colors !bg-transparent !shadow-none !p-0"
          >
            [ Close ]
          </SfButton>
        </div>

        {/* Itens */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-6 pr-2">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <span className="font-serif text-5xl text-absolute-black/10">☼</span>
              <p className="font-mono text-[11px] uppercase tracking-widest text-absolute-black/45">
                O teu carrinho está vazio
              </p>
            </div>
          ) : (
            items.map((item, i) => (
              <div key={i} className="flex justify-between items-center gap-4 group">
                <Link
                  to={`/shop/product/${item.cjPid || item.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex-shrink-0"
                >
                  {item.image ? (
                    <img loading="lazy" decoding="async"
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-14 object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-14 bg-bleached-concrete" />
                  )}
                </Link>
                <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-absolute-black/50 text-[13px]">{String(i + 1).padStart(2, '0')}</span>
                    <button
                      onClick={() => removeItem(item.id || item.cjPid || '', item.size, item.color)}
                      aria-label={`Remover ${item.name} do carrinho`}
                      className="font-mono text-[11px] uppercase tracking-widest text-absolute-black/40 hover:text-red-600 transition-colors py-1 px-1"
                    >
                      Remover
                    </button>
                  </div>
                  <Link
                    to={`/shop/product/${item.cjPid || item.id}`}
                    onClick={() => setIsOpen(false)}
                    className="uppercase tracking-wide group-hover:text-oxidized-gold transition-colors truncate hover:underline"
                  >
                    {item.name}
                  </Link>
                  <div className="flex gap-3">
                    <span className="text-[14px] text-absolute-black/60 uppercase">Size: {item.size || 'Unique'}</span>
                    {item.color && (
                      <span className="text-[14px] text-absolute-black/60 uppercase">Color: {item.color}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => updateQuantity(item.id || item.cjPid || '', item.size, item.color, (item.quantity || 1) - 1)}
                      aria-label="Diminuir quantidade"
                      className="w-[44px] h-[44px] flex items-center justify-center text-absolute-black/50 hover:text-absolute-black hover:bg-absolute-black/5 transition-colors"
                    >
                      <SfIconRemove size="xs" />
                    </button>
                    <span className="text-[13px] font-bold min-w-[24px] text-center">{item.quantity || 1}</span>
                    <button
                      onClick={() => updateQuantity(item.id || item.cjPid || '', item.size, item.color, (item.quantity || 1) + 1)}
                      aria-label="Aumentar quantidade"
                      className="w-[44px] h-[44px] flex items-center justify-center text-absolute-black/50 hover:text-absolute-black hover:bg-absolute-black/5 transition-colors"
                    >
                      <SfIconAdd size="xs" />
                    </button>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                   <span className="tracking-widest flex-shrink-0">{item.price}</span>
                   {item.quantity && item.quantity > 1 && (() => {
                     const r = String(item.price).replace(/[^0-9,.\-]/g, '');
                     const n = r.includes(',') && r.includes('.') ? r.replace(/\./g, '').replace(',', '.') : r.replace(',', '.');
                     const p = parseFloat(n) || 0;
                     return <span className="text-[14px] text-absolute-black/40">Total: €{(p * item.quantity).toFixed(2)}</span>;
                   })()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-absolute-black/20 pt-6 mt-8 flex flex-col gap-4">
          <div className="flex justify-between items-center uppercase tracking-widest font-bold">
            <span>Subtotal</span>
            <span>€{total.toFixed(2)}</span>
          </div>

          {error && (
            <p className="text-red-600 text-[13px] tracking-wider text-center">{error}</p>
          )}

          <SfButton
            size="lg"
            onClick={handleCheckout}
            disabled={loading || items.length === 0}
            className="w-full !bg-absolute-black !text-stark-white !rounded-none uppercase tracking-[0.2em] text-xs hover:!bg-oxidized-gold disabled:!opacity-50 disabled:!cursor-not-allowed transition-colors duration-300 py-5"
          >
            {loading ? 'A redirecionar...' : 'Finalizar Compra →'}
          </SfButton>

          <p className="text-center text-absolute-black/90 text-[13px] tracking-wider uppercase">
            Pagamento seguro via Stripe ©· SSL
          </p>
        </div>
      </SfDrawer>
    </>
  );
}
