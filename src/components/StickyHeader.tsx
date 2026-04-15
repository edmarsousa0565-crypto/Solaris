'use client';

import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { SfBadge, SfChip } from '@storefront-ui/react';
import { useCartStore } from '../store/cartStore';

gsap.registerPlugin(ScrollTrigger);

interface StickyHeaderProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  categories?: string[];
}

export default function StickyHeader({ activeFilter, onFilterChange, categories = ['All'] }: StickyHeaderProps) {
  const headerRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const { items, setIsOpen } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const cartCount = items.length;

  // Fecha menu ao mudar de rota
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Bloqueia scroll do body quando menu aberto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(headerRef.current, { yPercent: -100 });
      gsap.set(lineRef.current, { scaleX: 0 });

      let lastDirection = 0;

      ScrollTrigger.create({
        trigger: '#utility-grid',
        start: 'top top',
        end: 'bottom top',
        onEnter: () => {
          gsap.to(headerRef.current, { yPercent: 0, duration: 0.8, ease: 'expo.out' });
          gsap.to(lineRef.current, { scaleX: 1, duration: 1, ease: 'expo.out', delay: 0.4 });
        },
        onLeaveBack: () => {
          gsap.to(headerRef.current, { yPercent: -100, duration: 0.5, ease: 'expo.in' });
          gsap.to(lineRef.current, { scaleX: 0, duration: 0.3 });
        },
        onUpdate: (self) => {
          if (self.progress > 0.05 && self.progress < 0.95) {
            if (self.direction === 1 && lastDirection !== 1) {
              gsap.to(headerRef.current, { yPercent: -100, duration: 0.5, ease: 'expo.out', overwrite: 'auto' });
              lastDirection = 1;
            } else if (self.direction === -1 && lastDirection !== -1) {
              gsap.to(headerRef.current, { yPercent: 0, duration: 0.5, ease: 'expo.out', overwrite: 'auto' });
              lastDirection = -1;
            }
          }
        }
      });
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (cartCount > 0) {
      gsap.to(headerRef.current, { yPercent: 0, duration: 0.5, ease: 'expo.out', overwrite: 'auto' });
    }
  }, [cartCount]);

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/shop', label: 'Loja' },
    { to: '/envios', label: 'Envios' },
    { to: '/tracking', label: 'Rastrear Encomenda' },
    { to: '/devolucoes', label: 'Devolucoes' },
  ];

  return (
    <>
      <header
        ref={headerRef}
        className="fixed left-0 w-full h-16 md:h-20 z-[210] bg-raw-linen/90 backdrop-blur-[10px] flex items-center justify-between px-5 md:px-12"
        style={{ top: 'var(--urgency-h, 0px)', transform: 'translateY(-100%)' }}
      >
        {/* Logotipo */}
        <div className="flex-1 md:w-1/3">
          <Link to="/">
            <span className="font-serif text-xs md:text-sm tracking-[0.4em] uppercase text-absolute-black">
              Solaris
            </span>
          </Link>
        </div>

        {/* Filtros — so desktop */}
        <div className="hidden md:flex w-1/3 justify-center gap-3">
          {categories.map((filter) => (
            <SfChip
              key={filter}
              size="sm"
              inputProps={{
                type: 'radio',
                name: 'archive-filter',
                checked: activeFilter === filter,
                onChange: () => onFilterChange(filter),
              }}
              className={`font-mono text-[13px] uppercase tracking-widest !rounded-none border transition-colors
                ${activeFilter === filter
                  ? '!bg-absolute-black !text-stark-white !border-absolute-black'
                  : '!bg-transparent !text-absolute-black/80 !border-absolute-black/20 hover:!border-absolute-black/60 hover:!text-absolute-black'
                }`}
            >
              {filter}
            </SfChip>
          ))}
        </div>

        {/* Direita */}
        <div className="flex-1 md:w-1/3 flex justify-end items-center gap-4 md:gap-8">
          <Link
            to="/shop"
            className="font-mono text-xs uppercase tracking-widest text-absolute-black/80 hover:text-absolute-black transition-colors hidden md:block"
          >
            Shop
          </Link>

          {/* Mobile: filtro ativo como pill clicavel */}
          <button
            onClick={() => {
              const next = categories[(categories.indexOf(activeFilter) + 1) % categories.length];
              onFilterChange(next);
            }}
            aria-label={`Filtro ativo: ${activeFilter}. Toca para mudar`}
            className="md:hidden font-mono text-[10px] uppercase tracking-widest bg-absolute-black text-stark-white px-3 py-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {activeFilter}
          </button>

          <button
            id="cart-icon"
            onClick={() => setIsOpen(true)}
            className="relative font-mono text-xs hover:text-oxidized-gold transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Abrir carrinho"
          >
            <span className="uppercase tracking-widest">Bag</span>
            {cartCount > 0 && (
              <SfBadge
                content={cartCount}
                className="!bg-solar-yellow !text-absolute-black !text-[13px] !min-w-[16px] !h-[16px]"
              />
            )}
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="min-w-[44px] min-h-[44px] flex flex-col gap-[5px] items-center justify-center hover:opacity-50 transition-opacity"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
          >
            <div className={`w-5 h-[1.5px] bg-absolute-black transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
            <div className={`w-3.5 h-[1.5px] bg-absolute-black transition-all duration-300 ${menuOpen ? 'opacity-0 w-5' : ''}`} />
            <div className={`w-5 h-[1.5px] bg-absolute-black transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
          </button>
        </div>

        <div
          ref={lineRef}
          className="absolute bottom-0 left-0 w-full h-[0.5px] bg-absolute-black origin-left"
        />
      </header>

      {/* Drawer de navegacao mobile + desktop */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-[209] bg-absolute-black/40 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          {/* Painel */}
          <div
            className="fixed right-0 top-0 h-full w-[85vw] max-w-sm z-[210] bg-raw-linen flex flex-col"
            style={{ paddingTop: 'calc(var(--urgency-h, 0px) + 64px)' }}
          >
            {/* Fechar */}
            <div className="flex justify-end px-6 py-4 border-b border-absolute-black/10">
              <button
                onClick={() => setMenuOpen(false)}
                className="font-mono text-xs uppercase tracking-widest text-absolute-black/50 hover:text-absolute-black transition-colors min-h-[44px] min-w-[44px] flex items-center justify-end"
                aria-label="Fechar menu"
              >
                Fechar ✕
              </button>
            </div>

            {/* Links */}
            <nav className="flex flex-col px-8 py-8 gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="font-serif italic text-3xl font-light text-absolute-black py-3 border-b border-absolute-black/8 hover:text-oxidized-gold transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Filtros de categoria (so na homepage) */}
            {categories.length > 1 && (
              <div className="px-8 py-4 border-t border-absolute-black/10">
                <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-absolute-black/40 mb-3">Filtrar</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { onFilterChange(cat); setMenuOpen(false); }}
                      className={`font-mono text-[11px] uppercase tracking-widest px-3 py-2 border transition-colors ${
                        activeFilter === cat
                          ? 'bg-absolute-black text-stark-white border-absolute-black'
                          : 'border-absolute-black/20 text-absolute-black/70 hover:border-absolute-black'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rodape do menu */}
            <div className="mt-auto px-8 py-8 border-t border-absolute-black/10">
              <button
                onClick={() => { setIsOpen(true); setMenuOpen(false); }}
                className="w-full bg-absolute-black text-solar-yellow font-mono text-[13px] tracking-[0.3em] uppercase py-4 hover:bg-deep-night transition-colors"
              >
                Ver Carrinho ({cartCount})
              </button>
              <p className="font-mono text-[11px] text-absolute-black/30 tracking-widest uppercase text-center mt-4">
                SOLARIS — Verao 2025
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
