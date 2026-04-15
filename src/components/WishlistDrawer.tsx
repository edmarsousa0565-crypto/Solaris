'use client';

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';

export default function WishlistDrawer() {
  const { items, isOpen, setIsOpen, remove, clear } = useWishlistStore();
  const addToCart = useCartStore(state => state.addItem);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Foca o drawer ao abrir
  useEffect(() => {
    if (isOpen) drawerRef.current?.focus();
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Fecha com ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setIsOpen]);

  const moveToCart = (item: typeof items[0]) => {
    addToCart({ ...item, quantity: 1 });
    remove(item.cjPid);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[290] bg-absolute-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            tabIndex={-1}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-[90vw] max-w-sm z-[295] bg-raw-linen flex flex-col outline-none"
            role="dialog"
            aria-modal="true"
            aria-label="Lista de desejos"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-absolute-black/10">
              <div>
                <h2 className="font-serif italic text-lg">Lista de Desejos</h2>
                <p className="font-mono text-[11px] tracking-widest uppercase text-absolute-black/40 mt-0.5">
                  {items.length} {items.length === 1 ? 'peca' : 'pecas'} guardadas
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Fechar lista de desejos"
                className="w-11 h-11 flex items-center justify-center font-mono text-absolute-black/50 hover:text-absolute-black transition-colors hover:rotate-90 duration-300"
              >
                ✕
              </button>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
                  <span className="text-4xl opacity-20">♡</span>
                  <p className="font-serif italic text-xl text-absolute-black/40 font-light">
                    Nada guardado ainda
                  </p>
                  <p className="font-mono text-[11px] tracking-widest uppercase text-absolute-black/30">
                    Guarda as pecas que gostas
                  </p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="font-mono text-[13px] tracking-[0.3em] uppercase text-absolute-black border-b border-absolute-black/30 pb-1 hover:border-absolute-black transition-colors mt-2"
                  >
                    Explorar loja →
                  </button>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-absolute-black/8">
                  {items.map(item => (
                    <div key={item.cjPid} className="flex gap-4 px-6 py-4">
                      <Link
                        to={`/shop/product/${item.cjPid}`}
                        onClick={() => setIsOpen(false)}
                        className="w-16 h-20 shrink-0 overflow-hidden bg-bleached-concrete/20"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </Link>
                      <div className="flex flex-col flex-1 min-w-0 gap-1">
                        <Link
                          to={`/shop/product/${item.cjPid}`}
                          onClick={() => setIsOpen(false)}
                          className="font-mono text-[13px] tracking-wider text-absolute-black leading-tight line-clamp-2 hover:text-oxidized-gold transition-colors"
                        >
                          {item.name}
                        </Link>
                        <p className="font-mono text-[13px] text-absolute-black/60">{item.price}</p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => moveToCart(item)}
                            className="font-mono text-[11px] uppercase tracking-widest px-3 py-2 bg-absolute-black text-stark-white hover:bg-oxidized-gold transition-colors min-h-[44px] flex-1"
                          >
                            + Carrinho
                          </button>
                          <button
                            onClick={() => remove(item.cjPid)}
                            aria-label={`Remover ${item.name} da lista`}
                            className="w-11 h-11 flex items-center justify-center border border-absolute-black/15 text-absolute-black/40 hover:text-red-500 hover:border-red-300 transition-colors font-mono"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-absolute-black/10 flex flex-col gap-3">
                <Link
                  to="/shop"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-solar-yellow text-absolute-black font-mono text-[13px] tracking-[0.3em] uppercase py-4 text-center hover:bg-solar-yellow/90 transition-colors"
                >
                  Ver Loja Completa
                </Link>
                <button
                  onClick={clear}
                  className="font-mono text-[11px] tracking-widest uppercase text-absolute-black/30 hover:text-absolute-black/60 transition-colors text-center"
                >
                  Limpar lista
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
