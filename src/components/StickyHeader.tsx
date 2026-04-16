'use client';

import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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

const NAV_LINKS = [
  { to: '/',          label: 'Início',            sub: 'Home' },
  { to: '/shop',      label: 'Loja',              sub: 'Shop' },
  { to: '/envios',    label: 'Envios',            sub: 'Shipping' },
  { to: '/tracking',  label: 'Rastrear',          sub: 'Track Order' },
  { to: '/devolucoes',label: 'Devoluções',        sub: 'Returns' },
];

export default function StickyHeader({ activeFilter, onFilterChange, categories = ['All'] }: StickyHeaderProps) {
  const headerRef = useRef<HTMLHeadingElement>(null);
  const lineRef   = useRef<HTMLDivElement>(null);
  const { items, setIsOpen } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const location  = useLocation();

  const cartCount = items.length;

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

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

  return (
    <>
      {/* ── STICKY HEADER BAR ─────────────────────────────────── */}
      <header
        ref={headerRef}
        className="fixed left-0 w-full z-[210] bg-raw-linen/90 backdrop-blur-[10px]"
        style={{ top: 'var(--urgency-h, 0px)', transform: 'translateY(-100%)', height: '60px' }}
      >
        <div className="flex items-center justify-between h-full px-5 md:px-12">

          {/* Esquerda — hamburger mobile / espaço desktop */}
          <div className="w-12 md:flex-1 flex items-center">
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="md:hidden w-11 h-11 flex flex-col gap-[5px] items-center justify-center -ml-1"
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuOpen}
            >
              <div className={`w-5 h-[1.5px] bg-absolute-black transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
              <div className={`h-[1.5px] bg-absolute-black transition-all duration-300 ${menuOpen ? 'opacity-0 w-5' : 'w-3.5'}`} />
              <div className={`w-5 h-[1.5px] bg-absolute-black transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
            </button>
          </div>

          {/* Centro — Logo (sempre centrado no mobile, alinhado esq no desktop) */}
          <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:flex-1">
            <Link to="/" className="block">
              <span className="font-serif text-[13px] tracking-[0.45em] uppercase text-absolute-black">
                Solaris
              </span>
            </Link>
          </div>

          {/* Filtros — só desktop, centro */}
          <div className="hidden md:flex flex-1 justify-center gap-3">
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
                className={`font-mono text-[11px] uppercase tracking-widest !rounded-none border transition-colors
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
          <div className="flex-1 md:flex-1 flex justify-end items-center gap-2 md:gap-6">
            {/* Desktop: link shop */}
            <Link
              to="/shop"
              className="font-mono text-[11px] uppercase tracking-widest text-absolute-black/70 hover:text-absolute-black transition-colors hidden md:block"
            >
              Shop
            </Link>

            {/* Mobile: filtro ativo como pill */}
            <button
              onClick={() => {
                const next = categories[(categories.indexOf(activeFilter) + 1) % categories.length];
                onFilterChange(next);
              }}
              aria-label={`Filtro: ${activeFilter}`}
              className="md:hidden font-mono text-[9px] uppercase tracking-widest bg-absolute-black text-stark-white px-2.5 py-1.5 min-h-[36px] flex items-center"
            >
              {activeFilter}
            </button>

            {/* Bag */}
            <button
              id="cart-icon"
              onClick={() => setIsOpen(true)}
              className="relative font-mono text-[11px] uppercase tracking-widest text-absolute-black hover:text-oxidized-gold transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center md:justify-end"
              aria-label="Abrir carrinho"
            >
              Bag
              {cartCount > 0 && (
                <SfBadge
                  content={cartCount}
                  className="!bg-solar-yellow !text-absolute-black !text-[10px] !min-w-[14px] !h-[14px]"
                />
              )}
            </button>

            {/* Hamburger — desktop */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="hidden md:flex w-11 h-11 flex-col gap-[5px] items-center justify-center hover:opacity-50 transition-opacity"
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              <div className={`w-5 h-[1.5px] bg-absolute-black transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
              <div className={`h-[1.5px] bg-absolute-black transition-all duration-300 ${menuOpen ? 'opacity-0 w-5' : 'w-3.5'}`} />
              <div className={`w-5 h-[1.5px] bg-absolute-black transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
            </button>
          </div>
        </div>

        <div
          ref={lineRef}
          className="absolute bottom-0 left-0 w-full h-[0.5px] bg-absolute-black/15 origin-left"
        />
      </header>

      {/* ── MENU FULL-SCREEN ──────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="fixed inset-0 z-[209]"
              style={{ backgroundColor: 'rgba(12,11,9,0.45)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Painel full-screen — desliza de cima */}
            <motion.div
              key="menu"
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
              className="fixed left-0 right-0 top-0 z-[210] flex flex-col overflow-hidden"
              style={{
                backgroundColor: '#0d0c09',
                height: '100svh',
                paddingTop: 'var(--urgency-h, 0px)',
              }}
            >
              {/* Header do menu */}
              <div className="flex items-center justify-between px-6 md:px-12 h-[60px] border-b border-white/8 shrink-0">
                <span className="font-serif text-[13px] tracking-[0.45em] uppercase text-white/30">
                  Solaris
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-11 h-11 flex items-center justify-center group"
                  aria-label="Fechar menu"
                >
                  <div className="relative w-5 h-5">
                    <span className="absolute top-1/2 left-0 w-full h-[1.5px] bg-white/60 group-hover:bg-white transition-colors rotate-45" />
                    <span className="absolute top-1/2 left-0 w-full h-[1.5px] bg-white/60 group-hover:bg-white transition-colors -rotate-45" />
                  </div>
                </button>
              </div>

              {/* Corpo — links + categorias */}
              <div className="flex-1 flex flex-col justify-between px-6 md:px-16 py-10 md:py-14 overflow-hidden">

                {/* Eyebrow */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  className="font-mono text-[10px] tracking-[0.5em] uppercase text-white/20 mb-8"
                >
                  Menu
                </motion.p>

                {/* Nav links — grandes, serif, staggered */}
                <nav className="flex flex-col gap-0 flex-1">
                  {NAV_LINKS.map(({ to, label, sub }, i) => (
                    <motion.div
                      key={to}
                      initial={{ opacity: 0, x: -32 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.18 + i * 0.07, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      <Link
                        to={to}
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-baseline justify-between py-4 md:py-5 border-b border-white/8 hover:border-white/20 transition-colors"
                      >
                        <span
                          className="font-serif italic font-light text-white/90 group-hover:text-solar-yellow transition-colors leading-none"
                          style={{ fontSize: 'clamp(2rem, 8vw, 3.75rem)' }}
                        >
                          {label}
                        </span>
                        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/20 group-hover:text-white/40 transition-colors hidden md:block">
                          {sub}
                        </span>
                        <span className="font-mono text-sm text-white/20 group-hover:text-solar-yellow group-hover:translate-x-1 transition-all md:hidden">
                          →
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* Bottom — categorias + carrinho */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.45 }}
                  className="flex flex-col gap-5 pt-6 md:pt-8"
                >
                  {/* Filtros de categoria */}
                  {categories.length > 1 && (
                    <div className="flex flex-col gap-3">
                      <p className="font-mono text-[9px] tracking-[0.5em] uppercase text-white/20">
                        Filtrar Coleção
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => { onFilterChange(cat); setMenuOpen(false); }}
                            className={`font-mono text-[10px] uppercase tracking-widest px-3 py-2 border transition-all ${
                              activeFilter === cat
                                ? 'bg-solar-yellow text-absolute-black border-solar-yellow'
                                : 'border-white/15 text-white/40 hover:border-white/35 hover:text-white/70'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA carrinho */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => { setIsOpen(true); setMenuOpen(false); }}
                      className="flex-1 flex items-center justify-between bg-solar-yellow text-absolute-black font-mono text-[11px] tracking-[0.35em] uppercase px-6 py-4 hover:bg-white transition-colors"
                    >
                      <span>Bag</span>
                      <span className="font-serif italic text-base font-light">
                        {cartCount > 0 ? `(${cartCount})` : '—'}
                      </span>
                    </button>
                    <p className="font-mono text-[9px] tracking-[0.35em] uppercase text-white/15 leading-relaxed hidden md:block">
                      Coleção<br />SS 2025
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
