'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface ProductDetailOverlayProps {
  product: any;
  onClose: () => void;
  onAddToCart: (e: React.MouseEvent, product: any) => void;
}

/* ─────────────────────────────────────────────────────────────────────────────
   CARROSSEL EDITORIAL
   – Ken Burns (zoom lento) em cada imagem
   – Crossfade elegante entre imagens
   – Pausa ao hover, barra de progresso, navegação por setas + dots
───────────────────────────────────────────────────────────────────────────── */
function Carousel({ images }: { images: string[] }) {
  const [idx,    setIdx]    = useState(0);
  const [paused, setPaused] = useState(false);
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);

  const go = useCallback((next: number) => setIdx(next), []);

  /* Auto-avanço */
  useEffect(() => {
    if (paused || images.length < 2) return;
    const id = setInterval(() => go((idx + 1) % images.length), 4000);
    return () => clearInterval(id);
  }, [idx, paused, images.length, go]);

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-[#0c0b09]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((src, i) => (
        <div
          key={src + i}
          ref={el => { imgRefs.current[i] = el; }}
          className="absolute inset-0 transition-opacity duration-[900ms] ease-in-out"
          style={{ opacity: i === idx ? 1 : 0, zIndex: i === idx ? 1 : 0 }}
        >
          <img
            src={src}
            alt=""
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
            style={{
              transform: i === idx ? 'scale(1.04)' : 'scale(1)',
              transition: i === idx ? 'transform 6s ease-out' : 'none',
            }}
          />
          {/* Gradiente lateral direito para o painel */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#121212]/40 pointer-events-none hidden md:block" />
          {/* Gradiente inferior para os dots */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0c0b09]/70 to-transparent pointer-events-none" />
        </div>
      ))}

      {/* ── Setas de navegação (desktop) */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => go((idx - 1 + images.length) % images.length)}
            className="absolute left-5 top-1/2 -translate-y-1/2 z-10 hidden md:flex w-10 h-10 items-center justify-center rounded-full border border-white/20 bg-black/20 backdrop-blur-sm hover:bg-black/40 hover:border-white/50 transition-all duration-300"
            aria-label="Anterior"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={() => go((idx + 1) % images.length)}
            className="absolute right-5 top-1/2 -translate-y-1/2 z-10 hidden md:flex w-10 h-10 items-center justify-center rounded-full border border-white/20 bg-black/20 backdrop-blur-sm hover:bg-black/40 hover:border-white/50 transition-all duration-300"
            aria-label="Seguinte"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2l5 5-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </>
      )}

      {/* ── Contador + dots */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-10 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Imagem ${i + 1}`}
                className="group"
              >
                <div className={`rounded-full transition-all duration-400 ${
                  i === idx ? 'w-6 h-[3px] bg-[#F4A623]' : 'w-[3px] h-[3px] bg-white/40 group-hover:bg-white/70'
                }`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Barra de progresso */}
      {images.length > 1 && !paused && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-10">
          <div
            key={`prog-${idx}`}
            className="h-full bg-[#F4A623]/60"
            style={{ animation: 'solaris-progress 4s linear forwards' }}
          />
        </div>
      )}

      {/* ── Contador mono */}
      <div className="absolute top-6 left-6 z-10 font-mono text-[10px] tracking-[0.4em] text-white/50">
        {String(idx + 1).padStart(2, '0')} <span className="text-white/25 mx-1">/</span> {String(images.length).padStart(2, '0')}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   OVERLAY PRINCIPAL
───────────────────────────────────────────────────────────────────────────── */
export default function ProductDetailOverlay({ product, onClose, onAddToCart }: ProductDetailOverlayProps) {
  const overlayRef   = useRef<HTMLDivElement>(null);
  const panelRef     = useRef<HTMLDivElement>(null);
  const headingRef   = useRef<HTMLHeadingElement>(null);
  const contentRef   = useRef<HTMLDivElement>(null);
  const mobileSheet  = useRef<HTMLDivElement>(null);

  const [selectedSize,  setSelectedSize]  = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  /* Array de imagens */
  const images: string[] = Array.isArray(product.images) && product.images.length > 1
    ? product.images.slice(0, 4)
    : [product.image];

  /* Auto-select única opção */
  useEffect(() => {
    if (product.sizes?.length  === 1) setSelectedSize(product.sizes[0]);
    if (product.colors?.length === 1) setSelectedColor(product.colors[0]);
  }, [product]);

  /* Animação de entrada */
  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power2.out' }
    ).fromTo(panelRef.current,
      { x: 60, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
      '-=0.2'
    ).fromTo(headingRef.current,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
      '-=0.4'
    );

    /* sem animação separada no corpo — o painel já arrasta tudo consigo */

    /* Mobile: sheet sobe */
    if (mobileSheet.current) {
      gsap.fromTo(mobileSheet.current,
        { y: '40%', opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', delay: 0.15 }
      );
    }
  }, []);

  const handleClose = useCallback(() => {
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: onClose,
    });
  }, [onClose]);

  /* Esc + overflow */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [handleClose]);

  /* Bloqueia Lenis no painel desktop — listener nativo antes do window */
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const block = (e: WheelEvent) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    };
    el.addEventListener('wheel', block, { passive: false, capture: true });
    return () => el.removeEventListener('wheel', block, { capture: true });
  }, []);

  /* Swipe down → close (mobile) */
  useEffect(() => {
    let sy = 0;
    const s = (e: TouchEvent) => { sy = e.touches[0].clientY; };
    const e = (ev: TouchEvent) => { if (ev.changedTouches[0].clientY - sy > 70) handleClose(); };
    window.addEventListener('touchstart', s, { passive: true });
    window.addEventListener('touchend',   e, { passive: true });
    return () => {
      window.removeEventListener('touchstart', s);
      window.removeEventListener('touchend',   e);
    };
  }, [handleClose]);

  /* Variante e preço */
  const currentVariant = product.variants?.find((v: any) => {
    const parts  = v.variantNameEn.split('/');
    const vColor = parts.length > 1 ? parts[0].trim() : null;
    const vSize  = parts.length > 1 ? parts[parts.length - 1].trim() : v.variantNameEn.trim();
    if (selectedColor && selectedSize) return vColor === selectedColor && vSize === selectedSize;
    if (selectedSize  && !product.colors?.length) return vSize  === selectedSize;
    if (selectedColor && !product.sizes?.length)  return vColor === selectedColor;
    return false;
  });

  const displayPrice = currentVariant
    ? `€${parseFloat(currentVariant.sellPrice).toFixed(2)}`
    : product.price;

  const handleAdd = (e: React.MouseEvent) => {
    if (!selectedSize  && product.sizes?.length  > 0) { alert('Seleciona um tamanho.'); return; }
    if (!selectedColor && product.colors?.length > 0) { alert('Seleciona uma cor.');    return; }
    const matched = product.variants?.find((v: any) => {
      const parts  = v.variantNameEn.split('/');
      const vColor = parts.length > 1 ? parts[0].trim() : null;
      const vSize  = parts.length > 1 ? parts[parts.length - 1].trim() : v.variantNameEn.trim();
      if (selectedColor && selectedSize) return vColor === selectedColor && vSize === selectedSize;
      if (selectedSize)  return vSize  === selectedSize;
      if (selectedColor) return vColor === selectedColor;
      return false;
    });
    onAddToCart(e, {
      ...product,
      size: selectedSize, color: selectedColor,
      variantName: [selectedColor, selectedSize].filter(Boolean).join(' / '),
      vid:      matched?.vid  || product.cjPid,
      price:    matched ? `€${parseFloat(matched.sellPrice).toFixed(2)}` : product.price,
      priceNum: matched ? parseFloat(matched.sellPrice) : product.priceNum,
    });
    handleClose();
  };

  /* ────────────────────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @keyframes solaris-progress {
          from { width: 0; }
          to   { width: 100%; }
        }
      `}</style>

      <div
        ref={overlayRef}
        className="fixed inset-0 z-[100]"
        style={{ opacity: 0 }}
      >

        {/* ════════════════════════════════════════════════════════════════
            DESKTOP
        ════════════════════════════════════════════════════════════════ */}
        <div className="hidden md:flex h-full">

          {/* Carrossel — 65% */}
          <div className="flex-1 h-full relative">
            <Carousel images={images} />

            {/* Botão fechar sobre a imagem */}
            <button
              onClick={handleClose}
              aria-label="Fechar"
              className="absolute top-6 right-6 z-20 group flex items-center gap-2.5"
            >
              <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-white/40 group-hover:text-white/80 transition-colors duration-300">
                Fechar
              </span>
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/60 group-hover:bg-white/10 transition-all duration-300">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 1l8 8M9 1L1 9" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
            </button>
          </div>

          {/* Painel Info — 35% */}
          <div
            ref={panelRef}
            className="w-[38%] max-w-[480px] bg-[#121212] flex flex-col h-full"
          >
            {/* Cabeçalho do painel */}
            <div className="px-10 pt-10 pb-8 border-b border-white/8 flex-shrink-0">
              <p className="font-mono text-[9px] tracking-[0.6em] uppercase text-[#F4A623]/70 mb-5">
                Solaris — Verão 2025
              </p>
              <h1
                ref={headingRef}
                className="font-serif italic font-light text-[clamp(1.8rem,3.2vw,2.6rem)] text-[#F7F7F5] leading-[0.95] mb-6"
              >
                {product.name}
              </h1>
              <div className="flex items-end justify-between">
                <span className="font-mono text-2xl text-[#F4A623] tracking-wide">
                  {displayPrice}
                </span>
                {selectedColor && (
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#F7F7F5]/30">
                    {selectedColor}
                  </span>
                )}
              </div>
            </div>

            {/* Corpo com scroll */}
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto px-10 py-8 flex flex-col gap-8"
              style={{ scrollbarWidth: 'none' }}
            >

              {/* Descrição */}
              {product.description && (
                <div>
                  <p className="font-mono text-[9px] tracking-[0.5em] uppercase text-[#F7F7F5]/25 mb-3">
                    Descrição
                  </p>
                  <p className="font-sans text-[13px] leading-relaxed text-[#F7F7F5]/55">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Separador */}
              <div className="w-8 h-[0.5px] bg-[#F4A623]/30" />

              {/* Seletor de Cores */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] tracking-[0.5em] uppercase text-[#F7F7F5]/25 mb-4">
                    Cor
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 font-mono text-[10px] tracking-widest uppercase border transition-all duration-200
                          ${selectedColor === color
                            ? 'bg-[#F4A623] text-[#121212] border-[#F4A623]'
                            : 'bg-transparent text-[#F7F7F5]/50 border-[#F7F7F5]/15 hover:border-[#F7F7F5]/40 hover:text-[#F7F7F5]/80'
                          }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Seletor de Tamanhos */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] tracking-[0.5em] uppercase text-[#F7F7F5]/25 mb-4">
                    Tamanho
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[48px] h-11 px-3 font-mono text-[11px] tracking-widest uppercase border transition-all duration-200
                          ${selectedSize === size
                            ? 'bg-[#F7F7F5] text-[#121212] border-[#F7F7F5]'
                            : 'bg-transparent text-[#F7F7F5]/50 border-[#F7F7F5]/15 hover:border-[#F7F7F5]/40 hover:text-[#F7F7F5]/80'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust */}
              <div className="flex flex-col gap-3 pt-2">
                {[
                  { icon: '→', label: 'Devolução gratuita em 30 dias' },
                  { icon: '→', label: 'Envio grátis acima de €49' },
                  { icon: '→', label: 'Pagamento 100% seguro' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-[#F4A623]/60">{icon}</span>
                    <span className="font-mono text-[10px] tracking-wider text-[#F7F7F5]/35 uppercase">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA fixo no fundo */}
            <div className="px-10 pb-10 pt-6 border-t border-white/8 flex-shrink-0">
              <button
                onClick={handleAdd}
                className="group w-full h-14 bg-[#F4A623] text-[#121212] font-mono text-[11px] tracking-[0.4em] uppercase flex items-center justify-between px-6 hover:bg-[#F7F7F5] transition-colors duration-300"
              >
                <span>Adicionar ao Carrinho</span>
                <span className="text-lg group-hover:translate-x-1 transition-transform duration-300">→</span>
              </button>
              <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#F7F7F5]/20 text-center mt-3">
                Pressiona Esc para fechar
              </p>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            MOBILE
        ════════════════════════════════════════════════════════════════ */}
        <div className="md:hidden h-full bg-[#0c0b09] flex flex-col">

          {/* Imagem topo — 55vh */}
          <div className="relative flex-shrink-0" style={{ height: '55svh' }}>
            <Carousel images={images} />

            {/* Botão fechar */}
            <button
              onClick={handleClose}
              aria-label="Fechar"
              className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm flex items-center justify-center"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1l8 8M9 1L1 9" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Sheet de produto — fundo com scroll */}
          <div
            ref={mobileSheet}
            className="flex-1 bg-[#121212] flex flex-col overflow-hidden"
          >
            {/* Handle de swipe */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-8 h-[3px] rounded-full bg-white/15" />
            </div>

            {/* Conteúdo scrollável */}
            <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4" style={{ scrollbarWidth: 'none' }}>
              {/* Nome + preço */}
              <div className="mb-5">
                <p className="font-mono text-[9px] tracking-[0.5em] uppercase text-[#F4A623]/60 mb-2">
                  Solaris — Verão 2025
                </p>
                <div className="flex items-start justify-between gap-3">
                  <h1 className="font-serif italic font-light text-[1.7rem] text-[#F7F7F5] leading-[0.95] flex-1">
                    {product.name}
                  </h1>
                  <span className="font-mono text-xl text-[#F4A623] whitespace-nowrap mt-1">
                    {displayPrice}
                  </span>
                </div>
                {product.description && (
                  <p className="font-sans text-[12px] leading-relaxed text-[#F7F7F5]/45 mt-3">
                    {product.description}
                  </p>
                )}
              </div>

              <div className="w-6 h-[0.5px] bg-[#F4A623]/30 mb-5" />

              {/* Cores */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-5">
                  <p className="font-mono text-[9px] tracking-[0.5em] uppercase text-[#F7F7F5]/25 mb-3">Cor</p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.colors.map((c: string) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-3 py-1.5 font-mono text-[10px] tracking-wider uppercase border transition-all
                          ${selectedColor === c
                            ? 'bg-[#F4A623] text-[#121212] border-[#F4A623]'
                            : 'bg-transparent text-[#F7F7F5]/45 border-[#F7F7F5]/15'
                          }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tamanhos */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-5">
                  <p className="font-mono text-[9px] tracking-[0.5em] uppercase text-[#F7F7F5]/25 mb-3">Tamanho</p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.sizes.map((s: string) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`w-11 h-9 font-mono text-[11px] tracking-wide uppercase border transition-all
                          ${selectedSize === s
                            ? 'bg-[#F7F7F5] text-[#121212] border-[#F7F7F5]'
                            : 'bg-transparent text-[#F7F7F5]/45 border-[#F7F7F5]/12'
                          }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust mobile */}
              <div className="flex flex-col gap-2 pb-2">
                {['Devolução 30 dias', 'Envio grátis +€49', 'Pagamento seguro'].map(l => (
                  <div key={l} className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#F4A623]/50">→</span>
                    <span className="font-mono text-[10px] tracking-wider text-[#F7F7F5]/30 uppercase">{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA fixo mobile */}
            <div className="px-6 pb-8 pt-4 border-t border-white/8 flex-shrink-0 bg-[#121212]">
              <button
                onClick={handleAdd}
                className="group w-full h-14 bg-[#F4A623] text-[#121212] font-mono text-[11px] tracking-[0.4em] uppercase flex items-center justify-between px-6 active:scale-[0.98] transition-all"
              >
                <span>Adicionar ao Carrinho</span>
                <span className="text-lg group-active:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
