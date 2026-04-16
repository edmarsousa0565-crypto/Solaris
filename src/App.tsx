/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useRef, useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SmoothScroll from './components/SmoothScroll';
import GridSystem from './components/GridSystem';
import HeroSection from './components/HeroSection';
import ProductCard from './components/ProductCard';
import ManifestoSection from './components/ManifestoSection';
const SideCart = lazy(() => import('./components/SideCart'));
import UtilityGrid from './components/UtilityGrid';
import StickyHeader from './components/StickyHeader';
const ProductDetailOverlay = lazy(() => import('./components/ProductDetailOverlay'));
import SolarClock from './components/SolarClock';
import Journal from './components/Journal';
import Materiality from './components/Materiality';
import FinalFooter from './components/FinalFooter';
import MobileBottomNav from './components/MobileBottomNav';

const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const ReturnsPage = lazy(() => import('./pages/ReturnsPage'));
const CookiesPage = lazy(() => import('./pages/CookiesPage'));
const TrackingPage = lazy(() => import('./pages/TrackingPage'));
const ThankYouPage = lazy(() => import('./pages/ThankYouPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ShippingPage = lazy(() => import('./pages/ShippingPage'));
import { initPixel, trackPageView, trackAddToCart } from './lib/pixel';
import UrgencyBar from './components/UrgencyBar';
import EmailPopup from './components/EmailPopup';
import ReviewsSection from './components/ReviewsSection';
import InstagramFeed from './components/InstagramFeed';
import CookieConsent from './components/CookieConsent';
const WishlistDrawer = lazy(() => import('./components/WishlistDrawer'));

// Regista o plugin ScrollTrigger do GSAP e useGSAP
gsap.registerPlugin(ScrollTrigger, useGSAP);

// Inicializa o Meta Pixel uma vez
initPixel();

import { useCartAnimation } from './hooks/useCartAnimation';
import { useFeaturedProducts } from './hooks/useFeaturedProducts';

export default function App() {
  // PageView por rota
  useEffect(() => { trackPageView(); }, []);

  // Produtos reais da CJ via Supabase
  const { products: featuredProducts, loading } = useFeaturedProducts();

  // Apenas produtos reais — sem fallback fictício
  const HORIZONTAL_PRODUCTS = featuredProducts.slice(0, 3).map(p => ({
    id: p.id,
    cjPid: p.cjPid,
    name: p.name,
    price: p.price,
    image: p.image,
  }));

  // Categorias derivadas dos produtos reais
  const REAL_CATEGORIES = ['All', ...Array.from(new Set(featuredProducts.map(p => p.category).filter(Boolean)))];

  return (
    <HelmetProvider>
    <>
      <UrgencyBar />
      <EmailPopup />
      <CookieConsent />
      <Suspense fallback={null}>
        <SideCart />
      </Suspense>
      <Suspense fallback={null}>
        <WishlistDrawer />
      </Suspense>
      <Suspense fallback={<div className="h-screen w-screen bg-absolute-black z-50 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-solar-yellow border-t-transparent animate-spin"/></div>}>
      <Routes>
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/privacidade" element={<PrivacyPage />} />
        <Route path="/termos" element={<TermsPage />} />
        <Route path="/devolucoes" element={<ReturnsPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/obrigado" element={<ThankYouPage />} />
        <Route path="/shop/product/:pid" element={<ProductPage />} />
        <Route path="/envios" element={<ShippingPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/" element={<HomePage
          HORIZONTAL_PRODUCTS={HORIZONTAL_PRODUCTS}
          featuredProducts={featuredProducts}
          featuredLoading={loading}
          categories={REAL_CATEGORIES}
        />} />
      </Routes>
    </Suspense>
    <MobileBottomNav />
    </>
    </HelmetProvider>
  );
}

function HomePage({ HORIZONTAL_PRODUCTS, featuredProducts, featuredLoading, categories }: any) {
  const handleAddToCart = useCartAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef   = useRef<HTMLDivElement>(null);

  // Estado dos Filtros
  const [activeFilter, setActiveFilter] = useState('All');

  // Estado da PDP
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Scroll horizontal — corre quando HomePage monta (fresh a cada navegação)
  useGSAP(() => {
    if (!wrapperRef.current || !containerRef.current) return;
    if (window.innerWidth < 768) return;

    const scrollTween = gsap.to(containerRef.current, {
      x: () => -(containerRef.current!.scrollWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: wrapperRef.current,
        pin: true,
        scrub: 1,
        end: () => '+=' + containerRef.current!.scrollWidth,
        refreshPriority: 1,
        onUpdate: (self) => {
          const velocity = self.getVelocity();
          const skew = Math.max(-2, Math.min(2, velocity / 400));
          gsap.to('.product-image-wrapper', { skewX: skew, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
        }
      }
    });

    const cards = gsap.utils.toArray('.product-card');
    cards.forEach((card: any) => {
      const wrapper = card.querySelector('.product-image-wrapper');
      const image   = card.querySelector('.product-image');
      gsap.to(wrapper, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.5,
        ease: 'power4.inOut',
        scrollTrigger: { trigger: card, containerAnimation: scrollTween, start: 'left 85%' }
      });
      gsap.to(image, {
        xPercent: -15,
        ease: 'none',
        scrollTrigger: { trigger: card, containerAnimation: scrollTween, start: 'left right', end: 'right left', scrub: true }
      });
    });

    const manifestoVideo = document.querySelector('.manifesto-video-container');
    if (manifestoVideo) {
      gsap.to(manifestoVideo, { opacity: 1, ease: 'none', scrollTrigger: { trigger: manifestoVideo.parentElement, containerAnimation: scrollTween, start: 'left 60%', end: 'center center', scrub: true } });
      gsap.to(manifestoVideo, { opacity: 0, ease: 'none', scrollTrigger: { trigger: manifestoVideo.parentElement, containerAnimation: scrollTween, start: 'right 120%', end: 'right 50%', scrub: true } });
    }

    gsap.utils.toArray('.manifesto-word').forEach((word: any) => {
      const speed = parseFloat(word.getAttribute('data-speed') || '0');
      gsap.to(word, {
        x: () => window.innerWidth * speed,
        ease: 'none',
        scrollTrigger: { trigger: word.parentElement.parentElement, containerAnimation: scrollTween, start: 'left right', end: 'right left', scrub: true }
      });
    });

    let rafId: number;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    ro.observe(containerRef.current);
    return () => { ro.disconnect(); cancelAnimationFrame(rafId); };
  }, { scope: wrapperRef });

  return (
    <>
    <SmoothScroll>
      <StickyHeader
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        categories={categories}
      />

      {selectedProduct && (
        <Suspense fallback={null}>
          <ProductDetailOverlay
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={(e: any, p: any) => handleAddToCart(e, p)}
          />
        </Suspense>
      )}

      <main className="relative min-h-screen font-sans text-absolute-black selection:bg-oxidized-gold selection:text-stark-white">

        {/* ══════════════════════════════════════════════════════
            MOBILE — Layout vertical inspirado na Bershka
            Oculto em ≥ md (768px)
        ══════════════════════════════════════════════════════ */}
        <div className="md:hidden pb-16">

          {/* 1. Hero fullscreen */}
          <section className="relative h-[100svh] flex flex-col justify-end overflow-hidden">
            <img
              src="/hero-campaign.webp"
              alt="Solaris Verao 2025"
              className="absolute inset-0 w-full h-full object-cover object-center"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-absolute-black/90 via-absolute-black/40 to-absolute-black/10" />
            {/* Logo no topo */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 pt-6 z-10">
              <span className="font-serif text-xs tracking-[0.5em] uppercase text-stark-white/80">Solaris</span>
              <Link to="/shop" className="font-mono text-[10px] tracking-[0.4em] uppercase text-stark-white/60 hover:text-stark-white transition-colors">
                Shop →
              </Link>
            </div>
            <div className="relative z-10 px-6 pb-24 flex flex-col gap-4">
              <p className="font-mono text-[10px] tracking-[0.6em] uppercase text-solar-yellow">
                Verao 2025
              </p>
              <h1 className="font-serif text-[3.5rem] italic font-light text-stark-white leading-[0.92]">
                A colecao<br />que te define.
              </h1>
              <p className="font-mono text-[11px] tracking-widest text-stark-white/55 uppercase">
                Moda consciente · Entrega EU
              </p>
              <div className="flex items-center gap-3 mt-2">
                <Link
                  to="/shop"
                  className="flex items-center gap-3 bg-solar-yellow text-absolute-black font-mono text-[11px] tracking-[0.3em] uppercase px-7 py-4"
                >
                  Ver Colecao <span>→</span>
                </Link>
                <Link
                  to="/tracking"
                  className="flex items-center gap-3 border border-stark-white/30 text-stark-white font-mono text-[11px] tracking-[0.3em] uppercase px-5 py-4 hover:border-stark-white transition-colors"
                >
                  Rastrear
                </Link>
              </div>
            </div>
          </section>

          {/* 2. Touch Carousel — Nova Coleção */}
          {/* 2. Produtos em Destaque */}
          {(featuredLoading || HORIZONTAL_PRODUCTS.length > 0) && (
          <section className="bg-raw-linen pt-8 pb-4">
            <div className="px-5 mb-4 flex justify-between items-center">
              <div>
                <p className="font-mono text-[9px] tracking-[0.5em] uppercase text-absolute-black/35 mb-0.5">Nova Colecao</p>
                <p className="font-serif italic text-lg font-light text-absolute-black">Destaques</p>
              </div>
              <Link to="/shop" className="font-mono text-[10px] tracking-widest uppercase text-absolute-black/60 hover:text-oxidized-gold transition-colors border-b border-absolute-black/20 pb-0.5">
                Ver tudo
              </Link>
            </div>

            <div
              className="flex overflow-x-auto gap-4 px-5 pb-3 scrollbar-none"
              style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
            >
              {featuredLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="shrink-0 w-[65vw] flex flex-col gap-3" style={{ scrollSnapAlign: 'start' }}>
                      <div className="aspect-[3/4] bg-bleached-concrete/30 animate-pulse rounded-sm" />
                      <div className="h-3 bg-bleached-concrete/20 w-3/4 animate-pulse" />
                    </div>
                  ))
                : HORIZONTAL_PRODUCTS.map((product) => (
                <div key={product.id} className="shrink-0 w-[65vw] flex flex-col gap-3" style={{ scrollSnapAlign: 'start' }}>
                  <Link to={`/shop/product/${product.cjPid || product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-bleached-concrete/20">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </Link>
                  <div>
                    <p className="font-mono text-[11px] tracking-widest uppercase text-absolute-black leading-snug line-clamp-1 mb-1">{product.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] tracking-widest text-absolute-black/60">{product.price}</span>
                      <button
                        onClick={(e) => handleAddToCart(e as any, product)}
                        aria-label={`Adicionar ${product.name} ao carrinho`}
                        className="w-9 h-9 bg-absolute-black text-stark-white rounded-full flex items-center justify-center text-base hover:bg-solar-yellow hover:text-absolute-black transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {!featuredLoading && (
              <div className="shrink-0 w-[50vw] flex flex-col" style={{ scrollSnapAlign: 'start' }}>
                <Link to="/shop" className="aspect-[3/4] bg-absolute-black flex flex-col items-center justify-center gap-3 text-stark-white">
                  <span className="font-serif italic text-2xl text-solar-yellow">→</span>
                  <p className="font-mono text-[9px] tracking-[0.4em] uppercase text-stark-white/50 text-center px-3">Ver toda<br />a colecao</p>
                </Link>
              </div>
              )}
            </div>

            {!featuredLoading && HORIZONTAL_PRODUCTS.length > 1 && (
              <div className="flex justify-center gap-1 mt-3">
                {HORIZONTAL_PRODUCTS.map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-absolute-black/20" />
                ))}
              </div>
            )}
          </section>
          )}

          {/* 3. Manifesto */}
          <section className="bg-absolute-black px-6 py-12">
            <p className="font-mono text-[9px] tracking-[0.5em] uppercase text-solar-yellow/60 mb-4">— Manifesto</p>
            <h2 className="font-serif italic text-[2.6rem] font-light text-stark-white leading-[0.95] mb-4">
              Veste-te<br />de calma.
            </h2>
            <p className="font-mono text-[11px] tracking-wider text-stark-white/35 leading-relaxed max-w-xs">
              Roupa que respeita o teu tempo.<br />Materiais que respeitam o planeta.
            </p>
            <Link to="/shop" className="inline-flex items-center gap-3 mt-6 font-mono text-[10px] tracking-[0.4em] uppercase text-solar-yellow border-b border-solar-yellow/30 pb-0.5 hover:border-solar-yellow transition-colors">
              Ver colecao →
            </Link>
          </section>

          {/* 4. Grid Editorial — usa imagens reais se existirem */}
          <section className="grid grid-cols-2 h-[70vw]">
            {[
              HORIZONTAL_PRODUCTS[0]?.image || '/hero-campaign.webp',
              HORIZONTAL_PRODUCTS[1]?.image || '/hero-beach.jpg',
            ].map((img, i) => (
              <Link key={i} to="/shop" className="relative overflow-hidden block">
                <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                <div className="absolute inset-0 bg-absolute-black/25" />
                <span className="absolute bottom-3 left-3 font-mono text-[9px] tracking-widest uppercase text-stark-white/70">
                  {i === 0 ? 'Colecao' : 'Novidades'}
                </span>
              </Link>
            ))}
          </section>

          {/* 5. Archive CTA */}
          <section className="bg-solar-yellow px-6 py-10">
            <p className="font-mono text-[9px] tracking-[0.5em] uppercase text-absolute-black/40 mb-2">The Archive</p>
            <h2 className="font-serif text-[2.4rem] font-light text-absolute-black leading-tight mb-6">
              {featuredProducts.length > 0 ? `${featuredProducts.length} pecas.` : 'Nova colecao.'}<br />Uma visao.
            </h2>
            <Link
              to="/shop"
              className="flex items-center justify-between w-full bg-absolute-black text-solar-yellow font-mono text-[11px] tracking-[0.3em] uppercase px-6 py-4"
            >
              <span>Ver todas as colecoes</span>
              <span>→</span>
            </Link>
          </section>
        </div>

        {/* ══════════════════════════════════════════════════════
            DESKTOP — Scroll Horizontal Cinético (GSAP)
            Oculto em < md (768px)
        ══════════════════════════════════════════════════════ */}
        <div ref={wrapperRef} className="hidden md:block h-screen overflow-hidden">
          <div ref={containerRef} className="flex h-full will-change-transform w-max">

            {/* Section 01: Hero */}
            <div className="w-screen shrink-0">
              <HeroSection />
            </div>

            {/* Section 03: Collection — só renderiza se houver produtos */}
            {HORIZONTAL_PRODUCTS.length >= 1 && (
            <section className="w-[150vw] h-full flex items-center relative border-r border-absolute-black/10 shrink-0 px-[10vw]">
              <div className="flex items-center gap-[10vw] w-full h-full">
                {HORIZONTAL_PRODUCTS[0] && (
                <ProductCard
                  number="01"
                  title={HORIZONTAL_PRODUCTS[0].name}
                  price={HORIZONTAL_PRODUCTS[0].price}
                  image={HORIZONTAL_PRODUCTS[0].image}
                  className="w-[35vw] -translate-y-12"
                  onAddToCart={(e) => handleAddToCart(e, HORIZONTAL_PRODUCTS[0])}
                />
                )}
                {HORIZONTAL_PRODUCTS[1] && (
                <ProductCard
                  number="02"
                  title={HORIZONTAL_PRODUCTS[1].name}
                  price={HORIZONTAL_PRODUCTS[1].price}
                  image={HORIZONTAL_PRODUCTS[1].image}
                  className="w-[45vw] translate-y-24"
                  onAddToCart={(e) => handleAddToCart(e, HORIZONTAL_PRODUCTS[1])}
                />
                )}
                {HORIZONTAL_PRODUCTS[2] && (
                <ProductCard
                  number="03"
                  title={HORIZONTAL_PRODUCTS[2].name}
                  price={HORIZONTAL_PRODUCTS[2].price}
                  image={HORIZONTAL_PRODUCTS[2].image}
                  className="w-[25vw] -translate-y-4"
                  onAddToCart={(e) => handleAddToCart(e, HORIZONTAL_PRODUCTS[2])}
                />
                )}
              </div>
            </section>
            )}

            {/* Section: Brand Manifesto */}
            <ManifestoSection />

            {/* The Archive */}
            <section className="w-screen h-full relative bg-solar-yellow shrink-0 overflow-hidden flex items-end">
              <div className="absolute right-0 top-0 w-[55%] h-full">
                {HORIZONTAL_PRODUCTS[0]?.image ? (
                  <img loading="lazy" decoding="async"
                    src={HORIZONTAL_PRODUCTS[0].image}
                    alt="Coleção Solaris"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-solar-yellow-pale" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-solar-yellow via-solar-yellow/30 to-transparent" />
              </div>
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.04] z-10"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '180px' }}
              />
              <div className="relative z-20 px-20 pb-24 w-[55%] flex flex-col gap-8">
                <p className="absolute top-10 left-20 font-mono text-[13px] tracking-[0.5em] uppercase text-absolute-black/70">
                  Solaris — Arquivo
                </p>
                <span className="font-serif text-[20vw] leading-none font-light text-absolute-black/[0.06] select-none absolute right-[50%] bottom-0 translate-x-1/2">03</span>
                <h2 className="font-serif font-light leading-[0.9] tracking-tight">
                  <span className="block text-[clamp(3.5rem,7vw,7rem)] text-absolute-black">The</span>
                  <span className="block text-[clamp(4.5rem,9vw,10rem)] italic text-absolute-black">Archive.</span>
                </h2>
                <p className="font-mono text-sm tracking-widest uppercase text-absolute-black/80 max-w-xs leading-relaxed">
                  {featuredProducts.length > 0 ? `${featuredProducts.length} peças.` : 'Nova coleção.'}<br />Tudo o que somos.
                </p>
                <Link
                  to="/shop"
                  className="group inline-flex items-center gap-4 bg-absolute-black text-solar-yellow font-mono text-xs tracking-[0.3em] uppercase px-8 py-5 w-fit hover:bg-deep-night transition-colors duration-300"
                >
                  Ver todas as coleções
                  <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                </Link>
                <p className="font-mono text-[13px] tracking-[0.4em] uppercase text-absolute-black/90 mt-2">
                  Ou continua a fazer scroll ↓
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* ══ Secções comuns (mobile + desktop) ══ */}
        <UtilityGrid
          products={featuredProducts}
          loading={featuredLoading}
          onAddToCart={handleAddToCart}
          onProductClick={(product) => setSelectedProduct(product)}
          activeFilter={activeFilter}
        />
        <ReviewsSection />
        <InstagramFeed />
        <SolarClock />
        <Journal />
        <Materiality />
        <FinalFooter />

      </main>
    </SmoothScroll>
    </>
  );
}
