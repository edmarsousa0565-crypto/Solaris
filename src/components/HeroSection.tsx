'use client';

import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const LETTERS = 'SOLARIS'.split('');

const LETTER_ANIMS = [
  { x: -160, y: -200, rotation: -25, delay: 0.00, duration: 1.5 },
  { x:   90, y:  230, rotation:  18, delay: 0.35, duration: 1.2 },
  { x: -110, y:  190, rotation: -14, delay: 0.10, duration: 1.6 },
  { x:  130, y: -210, rotation:  30, delay: 0.50, duration: 1.3 },
  { x:  -80, y:  160, rotation: -20, delay: 0.20, duration: 1.4 },
  { x:  100, y: -180, rotation:  12, delay: 0.40, duration: 1.2 },
  { x:  110, y:  180, rotation: -26, delay: 0.15, duration: 1.5 },
];

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef   = useRef<HTMLDivElement>(null);
  const imageRef   = useRef<HTMLImageElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    // Imagem entra
    gsap.fromTo(imageRef.current,
      { scale: 1.05, opacity: 0 },
      { scale: 1, opacity: 1, duration: 2.6, ease: 'power2.out', delay: 0.05 }
    );

    // Letras dispersas → posição
    LETTER_ANIMS.forEach((anim, i) => {
      gsap.fromTo(`.hero-letter-${i}`,
        { x: anim.x, y: anim.y, rotation: anim.rotation, opacity: 0 },
        { x: 0, y: 0, rotation: 0, opacity: 1, duration: anim.duration, ease: 'expo.out', delay: anim.delay }
      );
    });

    // Painel de fundo sobe
    gsap.fromTo(panelRef.current,
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.0, ease: 'expo.out', delay: 1.1 }
    );

    // Fade ao scroll
    gsap.to(titleRef.current, {
      opacity: 0, y: -50,
      scrollTrigger: { trigger: document.body, start: 'top top', end: '+=550', scrub: 1 }
    });
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="w-screen h-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: '#e8e4dc' }}
    >

      {/* ── IMAGEM — mobile: sem overlay escuro ───────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          ref={imageRef}
          src="/hero-beach.webp"
          srcSet="/hero-beach-800.webp 800w, /hero-beach-1200.webp 1200w, /hero-beach.webp 1920w"
          sizes="100vw"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover object-center"
          style={{ opacity: 0 }}
        />
        {/* Overlay: quase nenhum no mobile, mais escuro no desktop */}
        <div
          className="absolute inset-0"
          style={{
            background: [
              'linear-gradient(180deg,',
              '  rgba(8,6,4,0.10) 0%,',     /* mobile: quase transparente */
              '  rgba(8,6,4,0.05) 40%,',
              '  rgba(8,6,4,0.30) 75%,',
              '  rgba(8,6,4,0.65) 100%',
              ')',
            ].join(''),
          }}
        />
        {/* Desktop: overlay mais rico */}
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            background: 'linear-gradient(180deg, rgba(8,6,4,0.45) 0%, rgba(8,6,4,0.15) 45%, rgba(8,6,4,0.60) 100%)',
          }}
        />
      </div>

      {/* ── CORNER MARKS — detalhe de arquivo fotográfico ──────── */}
      {/* Visíveis só no mobile — editorial */}
      <div className="md:hidden absolute top-5 left-5 z-20 w-7 h-7 border-t border-l border-white/40 pointer-events-none" />
      <div className="md:hidden absolute top-5 right-5 z-20 w-7 h-7 border-t border-r border-white/40 pointer-events-none" />

      {/* ── SEASON STAMP — top right ────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.3, duration: 0.5, ease: 'backOut' }}
        className="md:hidden absolute top-[22px] left-1/2 -translate-x-1/2 z-20 pointer-events-none"
      >
        <div className="flex items-center gap-1.5 border border-white/30 bg-black/10 backdrop-blur-sm px-3 py-1">
          <div className="w-1 h-1 rounded-full bg-solar-yellow" />
          <span className="font-mono text-[9px] tracking-[0.45em] uppercase text-white/70">
            SS '25
          </span>
          <div className="w-1 h-1 rounded-full bg-solar-yellow" />
        </div>
      </motion.div>

      {/* ── TÍTULO SOLARIS ───────────────────────────────────────── */}
      <div
        ref={titleRef}
        className="relative z-10 flex flex-col items-center justify-center w-full px-3 md:px-6"
        /* Mobile: empurra o título ligeiramente acima do painel */
        style={{ paddingBottom: 'clamp(160px, 35vw, 220px)' }}
      >
        <h1 className="flex" style={{ gap: '0.02em' }}>
          {LETTERS.map((letter, i) => (
            <span
              key={i}
              className={`hero-letter-${i} inline-block leading-none font-serif font-light uppercase antialiased will-change-transform`}
              style={{
                opacity: 0,
                fontSize: 'clamp(3.8rem, 20.5vw, 11vw)',
                letterSpacing: '-0.015em',
                /* Mobile: outline puro — imagem aparece dentro das letras */
                WebkitTextStroke: '1.5px rgba(255,255,255,0.88)',
                color: 'transparent',
              }}
            >
              {letter}
            </span>
          ))}
        </h1>

        {/* Linha + subtítulo — mobile: discreto, desktop: mais visível */}
        <div className="flex items-center gap-3 mt-3 md:mt-5 w-full max-w-[340px] md:max-w-none">
          <div className="flex-1 h-[0.5px] bg-white/25" />
          <p className="font-serif italic text-[clamp(0.75rem,2.8vw,1rem)] text-white/60 md:text-white/80 tracking-wide font-light whitespace-nowrap">
            A fluidez do verão europeu
          </p>
          <div className="flex-1 h-[0.5px] bg-white/25" />
        </div>

        {/* CTA — desktop: visível aqui / mobile: no painel de baixo */}
        <div className="hidden md:block mt-8">
          <Link
            to="/shop"
            className="group flex items-center gap-5 bg-solar-yellow text-absolute-black font-mono text-[11px] tracking-[0.4em] uppercase px-10 py-5 hover:bg-white transition-colors duration-300"
          >
            Explorar Coleção
            <span className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
          </Link>
        </div>

        {/* Trust signals — desktop */}
        <div className="hidden md:flex items-center justify-center gap-6 mt-8 flex-wrap">
          {[
            'Entrega 7–14 dias',
            'Devolução 30 dias',
            'Pagamento Seguro',
          ].map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              {i > 0 && <span className="text-white/15 text-[10px]">·</span>}
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/50">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── PAINEL MOBILE — sobe do fundo como folha de papel ──── */}
      <div
        ref={panelRef}
        className="md:hidden absolute bottom-0 left-0 right-0 z-20 pointer-events-auto"
        style={{ opacity: 0 }}
      >
        {/* Borda superior decorativa */}
        <div className="flex items-center gap-0 px-6 mb-0">
          <div className="flex-1 h-[0.5px] bg-white/20" />
          <div className="w-1.5 h-1.5 rotate-45 border border-white/30 bg-transparent mx-3 shrink-0" />
          <div className="flex-1 h-[0.5px] bg-white/20" />
        </div>

        {/* Painel linen */}
        <div
          className="mx-0 px-6 pt-5 pb-8"
          style={{
            background: 'linear-gradient(180deg, rgba(232,228,220,0.92) 0%, rgba(232,228,220,0.98) 100%)',
            backdropFilter: 'blur(16px) saturate(1.2)',
            WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
          }}
        >
          {/* Tagline */}
          <p className="font-serif italic text-[1.05rem] text-absolute-black/75 leading-snug mb-5">
            Descubra a nova coleção —<br />
            <span className="font-mono not-italic text-[10px] tracking-[0.35em] uppercase text-absolute-black/40">
              Verão Europeu 2025
            </span>
          </p>

          {/* CTA principal */}
          <Link
            to="/shop"
            className="group flex items-center justify-between w-full bg-absolute-black text-stark-white font-mono text-[11px] tracking-[0.4em] uppercase px-6 py-4 mb-4 hover:bg-deep-night transition-colors"
          >
            Explorar Coleção
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          {/* Trust signals — linha compacta */}
          <div className="flex items-center justify-between">
            {[
              '7–14 dias',
              '30 dias dev.',
              'Pag. Seguro',
            ].map((label) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="font-mono text-[8.5px] tracking-[0.2em] uppercase text-absolute-black/45">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator — só desktop */}
      <div className="hidden md:flex absolute bottom-7 left-1/2 -translate-x-1/2 flex-col items-center opacity-20 z-10 pointer-events-none">
        <span className="font-mono text-[8px] tracking-[0.4em] uppercase text-white mb-2">scroll</span>
        <div className="w-[1px] h-7 bg-white/50 relative overflow-hidden">
          <div className="w-full h-full bg-white absolute top-0 animate-[scroll-down_2s_ease-in-out_infinite]" />
        </div>
      </div>

    </section>
  );
}
