'use client';

import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import type { CJProduct } from '../hooks/useCJProducts';
import { authFetch, handleAuthResponse } from './adminUtils';

interface Props {
  featuredProducts: CJProduct[];
  featuredPids: string[];
  reorderProduct: (pid: string, direction: 'up' | 'down') => void;
  reordering: boolean;
  confirmRemove: string | null;
  setConfirmRemove: (pid: string | null) => void;
  toggleFeatured: (product: CJProduct) => void;
  saving: string | null;
  openDetails: (product: CJProduct) => void;
  globalSettings: Record<string, string | null>;
  setGlobalSettings: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
  mhShippingMethods: any[];
  mhShippingLoading: boolean;
  savingSettings: boolean;
  setSavingSettings: (v: boolean) => void;
  onNavigateBrowse: () => void;
}

export default function AdminStore({
  featuredProducts, featuredPids, reorderProduct, reordering, confirmRemove, setConfirmRemove,
  toggleFeatured, saving, openDetails,
  globalSettings, setGlobalSettings, mhShippingMethods, mhShippingLoading, savingSettings, setSavingSettings,
  onNavigateBrowse,
}: Props) {
  const saveShipping = async (id: string | null) => {
    setSavingSettings(true);
    await handleAuthResponse(await authFetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matterhorn_shipping_method: id }),
    }));
    setGlobalSettings(s => ({ ...s, matterhorn_shipping_method: id }));
    setSavingSettings(false);
  };

  const sorted = [...featuredProducts].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <motion.div
      key="store"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="px-8 md:px-12 py-10 flex flex-col gap-10"
    >
      {/* Matterhorn Global Shipping */}
      <div className="border border-absolute-black/10 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-mono text-[13px] tracking-[0.3em] uppercase font-bold">Matterhorn · Método de Envio Global</h3>
            <p className="font-mono text-[11px] text-absolute-black/45 mt-1 tracking-widest">Aplica-se a todas as encomendas Matterhorn.</p>
          </div>
          {savingSettings && <span className="font-mono text-[11px] text-absolute-black/40 animate-pulse">A guardar...</span>}
        </div>
        {mhShippingLoading ? (
          <p className="font-mono text-[11px] text-absolute-black/30 tracking-widest animate-pulse">A carregar métodos Matterhorn...</p>
        ) : mhShippingMethods.length === 0 ? (
          <p className="font-mono text-[11px] text-absolute-black/30 tracking-widest">Sem métodos disponíveis. Verifica a MATTERHORN_API_KEY.</p>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => saveShipping(null)}
              className={`flex items-center gap-3 px-4 py-3 border-2 text-left transition-all ${!globalSettings.matterhorn_shipping_method ? 'border-absolute-black bg-absolute-black/3' : 'border-absolute-black/10 hover:border-absolute-black/25'}`}
            >
              <div className="flex-1">
                <p className="font-mono text-[12px] uppercase tracking-widest">Automático (Matterhorn decide)</p>
                <p className="font-mono text-[11px] text-absolute-black/40 mt-0.5">Matterhorn escolhe o método mais económico</p>
              </div>
              <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${!globalSettings.matterhorn_shipping_method ? 'border-absolute-black bg-absolute-black' : 'border-absolute-black/25'}`}>
                {!globalSettings.matterhorn_shipping_method && <span className="w-1.5 h-1.5 rounded-full bg-stark-white block" />}
              </div>
            </button>
            {mhShippingMethods.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => saveShipping(m.id)}
                className={`flex items-center gap-3 px-4 py-3 border-2 text-left transition-all ${globalSettings.matterhorn_shipping_method === m.id ? 'border-absolute-black bg-absolute-black/3' : 'border-absolute-black/10 hover:border-absolute-black/25'}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[12px] uppercase tracking-widest truncate">{m.name}</p>
                  <p className="font-mono text-[11px] text-absolute-black/40 mt-0.5">
                    {m.estimatedDelivery}
                    {m.price === 0 ? <span className="text-green-600 ml-2">· Grátis</span> : <span className="ml-2">· {m.priceFormatted}</span>}
                  </p>
                </div>
                <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${globalSettings.matterhorn_shipping_method === m.id ? 'border-absolute-black bg-absolute-black' : 'border-absolute-black/25'}`}>
                  {globalSettings.matterhorn_shipping_method === m.id && <span className="w-1.5 h-1.5 rounded-full bg-stark-white block" />}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product list */}
      {featuredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p className="font-serif italic text-4xl text-absolute-black/70 font-light">Loja vazia</p>
          <p className="font-mono text-xs text-absolute-black/90 tracking-widest uppercase">Vai ao "Explorar Catalogo" e adiciona produtos</p>
          <button
            onClick={onNavigateBrowse}
            className="font-mono text-[13px] tracking-[0.3em] uppercase text-absolute-black border-b border-absolute-black/30 pb-1 hover:border-absolute-black transition-colors mt-2"
          >
            Explorar agora →
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="font-serif italic text-2xl font-light">
              {featuredProducts.length} produto{featuredProducts.length !== 1 ? 's' : ''} na loja
            </h2>
            <Link to="/shop" target="_blank" className="font-mono text-[13px] tracking-[0.3em] uppercase text-absolute-black/60 hover:text-absolute-black transition-colors border-b border-absolute-black/20 pb-1">
              Ver loja ↗
            </Link>
          </div>

          <div className="flex items-start gap-3 bg-solar-yellow/15 border border-solar-yellow/40 px-5 py-4">
            <span className="text-solar-yellow text-lg leading-none mt-0.5">☀</span>
            <p className="font-mono text-[13px] tracking-widest text-absolute-black/70 leading-relaxed">
              Os <strong>3 primeiros produtos</strong> aparecem na segunda secção da homepage.
              Usa as setas para reordenar.
              {reordering && <span className="ml-2 opacity-50">A guardar...</span>}
            </p>
          </div>

          <div className="hidden md:grid grid-cols-[32px_64px_1fr_120px_140px_180px] gap-4 items-center border-b border-absolute-black/10 pb-3">
            <span /><span />
            <span className="font-mono text-[13px] uppercase tracking-[0.3em] text-absolute-black/40">Produto</span>
            <span className="font-mono text-[13px] uppercase tracking-[0.3em] text-absolute-black/40">Preço</span>
            <span className="font-mono text-[13px] uppercase tracking-[0.3em] text-absolute-black/40">Categoria</span>
            <span />
          </div>

          <div className="flex flex-col divide-y divide-absolute-black/8">
            {sorted.map((product, idx) => {
              const isSpotlight = idx < 3;
              return (
                <div
                  key={product.id}
                  className={`grid grid-cols-[32px_64px_1fr] md:grid-cols-[32px_64px_1fr_120px_140px_180px] gap-4 items-center py-4 ${isSpotlight ? 'bg-solar-yellow/5' : ''}`}
                >
                  <div className="flex flex-col gap-0.5 items-center">
                    <button onClick={() => reorderProduct(product.cjPid, 'up')} disabled={idx === 0 || reordering} aria-label="Mover para cima" className="w-6 h-6 flex items-center justify-center text-absolute-black/30 hover:text-absolute-black disabled:opacity-15 transition-colors text-xs">▲</button>
                    <button onClick={() => reorderProduct(product.cjPid, 'down')} disabled={idx === sorted.length - 1 || reordering} aria-label="Mover para baixo" className="w-6 h-6 flex items-center justify-center text-absolute-black/30 hover:text-absolute-black disabled:opacity-15 transition-colors text-xs">▼</button>
                  </div>

                  <div className="relative w-16 h-20 overflow-hidden bg-bleached-concrete/20 shrink-0">
                    <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {isSpotlight && <div className="absolute bottom-0 left-0 right-0 bg-solar-yellow text-absolute-black font-mono text-[9px] tracking-widest uppercase text-center py-0.5">{idx + 1}</div>}
                  </div>

                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-[13px] tracking-wider text-absolute-black leading-tight line-clamp-2">{product.name}</p>
                      {isSpotlight && <span className="hidden md:inline-block shrink-0 font-mono text-[10px] tracking-widest uppercase bg-solar-yellow text-absolute-black px-1.5 py-0.5">Destaque</span>}
                    </div>
                    <div className="flex gap-3 md:hidden">
                      <span className="font-mono text-[13px] text-absolute-black/60">{product.price}</span>
                      {product.category && <span className="font-mono text-[13px] text-absolute-black/40">{product.category}</span>}
                    </div>
                    <div className="flex gap-3 mt-2 md:hidden">
                      <button onClick={() => openDetails(product)} className="font-mono text-[13px] uppercase tracking-widest px-4 py-2 border border-absolute-black/20 hover:border-absolute-black transition-colors min-h-[44px]">Editar</button>
                      {confirmRemove === product.cjPid ? (
                        <div className="flex gap-2 items-center">
                          <button onClick={() => { toggleFeatured(product); setConfirmRemove(null); }} disabled={saving === product.cjPid} className="font-mono text-[13px] uppercase tracking-widest px-4 py-2 bg-red-500 text-stark-white hover:bg-red-600 transition-colors min-h-[44px] disabled:opacity-50">{saving === product.cjPid ? '...' : 'Confirmar'}</button>
                          <button onClick={() => setConfirmRemove(null)} className="font-mono text-[13px] uppercase tracking-widest px-4 py-2 border border-absolute-black/20 hover:border-absolute-black transition-colors min-h-[44px]">Cancelar</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmRemove(product.cjPid)} className="font-mono text-[13px] uppercase tracking-widest px-4 py-2 border border-red-300 text-red-500 hover:bg-red-50 transition-colors min-h-[44px]">Remover</button>
                      )}
                    </div>
                  </div>

                  <span className="hidden md:block font-mono text-[13px] text-absolute-black/70">{product.price}</span>
                  <span className="hidden md:block font-mono text-[13px] text-absolute-black/40 tracking-widest uppercase">{product.category || '—'}</span>

                  <div className="hidden md:flex gap-3 items-center justify-end">
                    <button onClick={() => openDetails(product)} className="font-mono text-[13px] uppercase tracking-widest px-5 py-2 border border-absolute-black/20 hover:border-absolute-black transition-colors min-h-[44px]">Editar</button>
                    {confirmRemove === product.cjPid ? (
                      <>
                        <button onClick={() => { toggleFeatured(product); setConfirmRemove(null); }} disabled={saving === product.cjPid} className="font-mono text-[13px] uppercase tracking-widest px-5 py-2 bg-red-500 text-stark-white hover:bg-red-600 transition-colors min-h-[44px] disabled:opacity-50">{saving === product.cjPid ? '...' : 'Confirmar'}</button>
                        <button onClick={() => setConfirmRemove(null)} className="font-mono text-[13px] uppercase tracking-widest px-4 py-2 border border-absolute-black/20 hover:border-absolute-black transition-colors min-h-[44px]">Não</button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmRemove(product.cjPid)} className="font-mono text-[13px] uppercase tracking-widest px-5 py-2 border border-red-300 text-red-500 hover:bg-red-50 transition-colors min-h-[44px]">Remover</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
