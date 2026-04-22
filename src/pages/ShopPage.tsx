'use client';

import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SfButton } from '@storefront-ui/react';
import { useFeaturedProducts } from '../hooks/useFeaturedProducts';
import { type CJProduct } from '../hooks/useCJProducts';
import { useCartAnimation } from '../hooks/useCartAnimation';

type SortOption = 'default' | 'price-asc' | 'price-desc';

import { useCartStore } from '../store/cartStore';

export default function ShopPage() {
  const onAddToCart = useCartAnimation();
  const cartItems = useCartStore(state => state.items);
  const setIsOpen = useCartStore(state => state.setIsOpen);
  const [search, setSearch] = useState('');

  const [sort, setSort] = useState<SortOption>('default');

  const headerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const { products: allProducts, loading } = useFeaturedProducts();

  // Filtro por pesquisa local
  const filtered = allProducts.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  // Ordenação local
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price-asc') return a.priceNum - b.priceNum;
    if (sort === 'price-desc') return b.priceNum - a.priceNum;
    return 0;
  });

  useGSAP(() => {
    gsap.fromTo(titleRef.current,
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out', delay: 0.2 }
    );
  }, { scope: headerRef });

  return (
    <>
    <Helmet>
      <title>Loja — SOLARIS | Moda Feminina Verão 2025</title>
      <meta name="description" content="Descobre a coleção SOLARIS — peças femininas para o verão, com design intemporal e materiais de qualidade. Envio para Portugal, Brasil e Europa." />
      <meta property="og:title" content="Loja SOLARIS — Moda Feminina Verão 2025" />
      <meta property="og:description" content="Peças femininas para o verão. Envio para Portugal, Brasil e Europa." />
      <meta property="og:url" content="https://solaris-drab.vercel.app/shop" />
    </Helmet>
    <div className="min-h-screen bg-raw-linen text-absolute-black">
      {/* Header fixo */}
      <header className="fixed top-0 left-0 w-full h-16 z-50 bg-raw-linen/90 backdrop-blur-md flex items-center justify-between px-8 md:px-16 border-b border-absolute-black/10">
        <Link to="/" className="font-serif text-sm tracking-[0.4em] uppercase hover:text-oxidized-gold transition-colors">
          ← Solaris
        </Link>
        <span className="font-mono text-[13px] tracking-[0.5em] uppercase text-absolute-black/90 hidden md:block">
          Coleção
        </span>
        <button id="cart-icon" onClick={() => setIsOpen(true)} className="font-mono text-xs hover:text-oxidized-gold transition-colors">
          [{String(cartItems.length).padStart(2, '0')}]
        </button>
      </header>

      <main className="pt-16">

        {/* Hero */}
        <section ref={headerRef} className="px-8 md:px-16 pt-20 pb-16 bg-solar-yellow border-b border-absolute-black/10">
          <p className="font-mono text-[13px] tracking-[0.5em] uppercase text-absolute-black/90 mb-6">
            Solaris — Shop
          </p>
          <h1 ref={titleRef} className="font-serif italic text-[clamp(3rem,8vw,7rem)] font-light tracking-wide leading-none mb-8">
            {loading ? 'Coleção' : `${allProducts.length} peças`}
          </h1>

          {/* Pesquisa + ordenação */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center sm:justify-between">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar..."
              className="bg-absolute-black/10 border-b border-absolute-black/30 px-4 py-3 font-mono text-xs tracking-widest uppercase placeholder:text-absolute-black/90 focus:outline-none focus:border-absolute-black w-full sm:w-60"
            />
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              className="bg-transparent font-mono text-[13px] tracking-[0.2em] uppercase text-absolute-black/80 border border-absolute-black/20 px-3 py-3 outline-none w-full sm:w-auto"
            >
              <option value="default">Ordenar</option>
              <option value="price-asc">Preço: Menor</option>
              <option value="price-desc">Preço: Maior</option>
            </select>
          </div>
        </section>

        {/* Grelha de produtos */}
        <section className="px-8 md:px-16 py-16">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4 animate-pulse">
                  <div className="aspect-[3/4] bg-bleached-concrete/30" />
                  <div className="h-3 bg-bleached-concrete/30 w-3/4" />
                  <div className="h-3 bg-bleached-concrete/30 w-1/2" />
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <p className="font-serif italic text-4xl text-absolute-black/70 font-light">
                {search ? 'Sem resultados' : 'Em breve'}
              </p>
              <p className="font-mono text-xs text-absolute-black/90 tracking-widest uppercase">
                {search ? 'Tenta outra pesquisa' : 'Novos produtos a caminho'}
              </p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="font-mono text-[13px] tracking-[0.3em] uppercase text-absolute-black/70 hover:text-absolute-black transition-colors border-b border-absolute-black/20 pb-1 mt-2"
                >
                  Limpar pesquisa
                </button>
              )}
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16"
            >
              {sorted.map((product, i) => (
                <ProductTile key={product.id} product={product} index={i} onAddToCart={onAddToCart} />
              ))}
            </motion.div>
          )}
        </section>

        {/* Footer */}
        <footer className="border-t border-absolute-black/10 px-8 md:px-16 py-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-[13px] tracking-[0.4em] uppercase text-absolute-black/90">
            Solaris © 2025
          </p>
          <Link to="/" className="font-mono text-[13px] tracking-[0.4em] uppercase text-absolute-black/90 hover:text-absolute-black transition-colors">
            ← Voltar ao início
          </Link>
        </footer>

      </main>
    </div>
    </>
  );
}

// Tile de produto
function ProductTile({ product, index, onAddToCart }: { product: CJProduct; index: number; onAddToCart: (e: React.MouseEvent, p: any) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col gap-4"
    >
      <Link to={`/shop/product/${product.cjPid}${product.supplier === 'matterhorn' ? '?s=mh' : product.supplier === 'eprolo' ? '?s=ep' : ''}`} className="block relative aspect-[3/4] overflow-hidden bg-bleached-concrete/20">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.isNew && (
            <span className="font-mono text-[13px] tracking-widest uppercase bg-solar-yellow text-absolute-black px-2 py-1">
              Novo
            </span>
          )}
          {product.isSoldOut && (
            <span className="font-mono text-[13px] tracking-widest uppercase bg-absolute-black text-stark-white px-2 py-1">
              Esgotado
            </span>
          )}
        </div>
        {!product.isSoldOut && (
          <SfButton
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(e, product); }}
            size="sm"
            className="absolute bottom-4 left-4 right-4 !rounded-none !bg-absolute-black/90 !text-stark-white font-mono text-[13px] tracking-widest uppercase opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:!bg-solar-yellow hover:!text-absolute-black w-[calc(100%-2rem)]"
          >
            + Adicionar
          </SfButton>
        )}
      </Link>
      <Link to={`/shop/product/${product.cjPid}${product.supplier === 'matterhorn' ? '?s=mh' : product.supplier === 'eprolo' ? '?s=ep' : ''}`} className="flex flex-col gap-1 px-1 hover:opacity-70 transition-opacity">
        <div className="flex justify-between items-baseline gap-2">
          <span className="font-mono text-xs tracking-widest uppercase text-absolute-black truncate">{product.name}</span>
          <span className="font-mono text-xs text-absolute-black/80 shrink-0">{product.price}</span>
        </div>
        <span className="font-mono text-[13px] tracking-wider uppercase text-absolute-black/90">
          {product.category}
        </span>
      </Link>
    </motion.div>
  );
}
