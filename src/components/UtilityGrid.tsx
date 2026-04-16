'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import MagneticText from './MagneticText';
import type { CJProduct } from '../hooks/useCJProducts';
import { useWishlistStore } from '../store/wishlistStore';

gsap.registerPlugin(ScrollTrigger);

interface UtilityGridProps {
  products: CJProduct[];
  loading: boolean;
  onAddToCart: (e: React.MouseEvent, product: any) => void;
  onProductClick: (product: any) => void;
  activeFilter: string;
}

export default function UtilityGrid({ products, loading, onAddToCart, onProductClick, activeFilter }: UtilityGridProps) {
  const filtered = activeFilter === 'All'
    ? products
    : products.filter(item => item.category === activeFilter);
  const { toggle: toggleWishlist, has: inWishlist } = useWishlistStore();

  const headerRef = useRef<HTMLDivElement>(null);
  const lineRef   = useRef<HTMLDivElement>(null);
  const titleRef  = useRef<HTMLHeadingElement>(null);
  const metaRef   = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (loading) return;
    const items = gsap.utils.toArray<HTMLElement>('.inventory-item');
    gsap.killTweensOf(items);
    gsap.set(items, { opacity: 0, y: 30 });
    gsap.to(items, {
      opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
      stagger: 0.05,
    });
  }, [activeFilter, loading, filtered.length]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 85%',
        }
      });
      tl.fromTo(lineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.4, ease: 'expo.inOut', transformOrigin: 'left center' }
      );
      tl.fromTo(titleRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
        '-=0.8'
      );
      tl.fromTo(metaRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'power2.out' },
        '-=0.4'
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="utility-grid" className="w-full min-h-screen bg-raw-linen relative z-10">

      {/* Header */}
      <div ref={headerRef} className="px-8 md:px-24 pt-20 pb-16 bg-solar-yellow">
        <div
          ref={lineRef}
          className="w-full h-[0.5px] bg-absolute-black/20 mb-14"
          style={{ transform: 'scaleX(0)' }}
        />
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <h2
            ref={titleRef}
            className="font-serif text-5xl md:text-8xl font-light tracking-widest uppercase leading-none"
            style={{ opacity: 0 }}
          >
            The Archive
          </h2>
          <span ref={metaRef} className="font-mono text-[13px] uppercase tracking-widest text-absolute-black/70 md:pb-3" style={{ opacity: 0 }}>
            {loading ? '...' : `${filtered.length} ${filtered.length === 1 ? 'peça' : 'peças'} — ${activeFilter}`}
          </span>
        </div>
      </div>

      {/* Conteúdo */}
      {loading ? (
        /* Skeleton */
        <div className="grid grid-cols-2 md:grid-cols-2 gap-x-4 md:gap-x-16 gap-y-12 md:gap-y-32 px-4 md:px-24 py-10 md:py-16">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-6">
              <div className="w-full aspect-[3/4] bg-bleached-concrete/30 animate-pulse" />
              <div className="h-3 bg-bleached-concrete/20 w-2/3 animate-pulse" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        /* Estado vazio */
        <div className="flex flex-col items-center justify-center py-32 px-8 gap-6 text-center">
          <span className="font-serif italic text-[4rem] text-absolute-black/10 leading-none">☀</span>
          <p className="font-serif italic text-3xl text-absolute-black/40 font-light">
            {activeFilter === 'All' ? 'Coleção em breve' : `Sem produtos em "${activeFilter}"`}
          </p>
          <p className="font-mono text-[11px] tracking-[0.4em] uppercase text-absolute-black/30">
            {activeFilter === 'All'
              ? 'Os produtos estão a ser preparados para ti'
              : 'Experimenta outro filtro'}
          </p>
          <Link
            to="/shop"
            className="font-mono text-[13px] tracking-[0.3em] uppercase text-absolute-black border-b border-absolute-black/30 pb-1 hover:border-absolute-black transition-colors mt-2"
          >
            Ver todas as peças →
          </Link>
        </div>
      ) : (
        /* Grelha */
        <div className="grid grid-cols-2 md:grid-cols-2 gap-x-4 md:gap-x-16 gap-y-12 md:gap-y-32 px-4 md:px-24 py-10 md:py-16">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="inventory-item group relative flex flex-col gap-6"
              style={{ opacity: 0 }}
            >
              <Link
                to={`/shop/product/${item.cjPid || item.id}`}
                className="relative w-full aspect-[3/4] overflow-hidden bg-bleached-concrete/20 cursor-pointer block"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                  {item.isNew && (
                    <span className="font-mono text-[13px] tracking-widest uppercase bg-solar-yellow text-absolute-black px-2 py-1">
                      Novo
                    </span>
                  )}
                  {item.isSoldOut && (
                    <span className="font-mono text-[13px] tracking-widest uppercase bg-absolute-black text-stark-white px-2 py-1">
                      Esgotado
                    </span>
                  )}
                </div>

                {/* Wishlist */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleWishlist({ id: item.id, cjPid: item.cjPid, name: item.name, price: item.price, image: item.image, category: item.category }); }}
                  aria-label={inWishlist(item.cjPid) ? `Remover ${item.name} dos favoritos` : `Guardar ${item.name}`}
                  className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 text-base ${inWishlist(item.cjPid) ? 'bg-solar-yellow text-absolute-black opacity-100' : 'bg-stark-white/80 text-absolute-black/60 hover:bg-stark-white'}`}
                >
                  {inWishlist(item.cjPid) ? '♥' : '♡'}
                </button>

                {/* Quick Add */}
                {!item.isSoldOut && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddToCart(e, item); }}
                    aria-label={`Adicionar ${item.name} ao carrinho`}
                    className="absolute bottom-3 right-3 md:bottom-6 md:right-6 w-11 h-11 md:w-12 md:h-12 bg-absolute-black text-stark-white rounded-full flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 hover:bg-oxidized-gold hover:scale-110"
                  >
                    <span className="text-lg font-light leading-none">+</span>
                  </button>
                )}
              </Link>

              <Link
                to={`/shop/product/${item.cjPid || item.id}`}
                className="flex justify-between items-baseline font-mono text-xs uppercase tracking-widest px-2 hover:opacity-70 transition-opacity"
              >
                <MagneticText><span>{item.name}</span></MagneticText>
                <MagneticText><span className="text-absolute-black/70 shrink-0 ml-2">{item.price}</span></MagneticText>
              </Link>

            </div>
          ))}
        </div>
      )}
    </section>
  );
}
