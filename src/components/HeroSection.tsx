'use client';

import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const sectionRef  = useRef<HTMLElement>(null);
  const titleRef    = useRef<HTMLDivElement>(null);
  const imageRef    = useRef<HTMLImageElement>(null);
  const navRef      = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);
  const trustRef    = useRef<HTMLDivElement>(null);
  const [cartCount] = useState(0);

  useGSAP(() => {
    if (!sectionRef.current) return;

    // Imagem entra suavemente com blur aplicado via CSS
    gsap.fromTo(imageRef.current,
      { scale: 1.06, opacity: 0 },
      { scale: 1, opacity: 1, duration: 2.8, ease: 'power2.out', delay: 0.1 }
    );

    // Letras entram dispersas
    LETTER_ANIMS.forEach((anim, i) => {
      gsap.fromTo(`.hero-letter-${i}`,
        { x: anim.x, y: anim.y, rotation: anim.rotation, opacity: 0 },
        { x: 0, y: 0, rotation: 0, opacity: 1, duration: anim.duration, ease: 'expo.out', delay: anim.delay }
      );
    });

    // Nav, subtítulo e CTA entram após as letras
    gsap.fromTo(navRef.current,
      { opacity: 0, y: -12 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.8 }
    );
    gsap.fromTo(subtitleRef.current,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 1.0 }
    );
    gsap.fromTo(ctaRef.current,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 1.2 }
    );
    gsap.fromTo(trustRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 1.5 }
    );

    // Desvanece ao fazer scroll
    gsap.to(titleRef.current, {
      opacity: 0, y: -60,
      scrollTrigger: { trigger: document.body, start: 'top top', end: '+=600', scrub: 1 }
    });
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="w-screen h-full flex flex-col items-center justify-center relative border-r border-white/10 overflow-hidden"
      style={{ backgroundColor: '#0c0b09' }}
    >

      {/* â"€â"€ IMAGEM DE FUNDO â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Responsive: generate hero-beach-800.webp/jpg, hero-beach-1200.webp/jpg with sharp/squoosh */}
        <picture>
          <source
            type="image/webp"
            srcSet="/hero-beach-800.webp 800w, /hero-beach-1200.webp 1200w, /hero-beach.webp 1920w"
            sizes="100vw"
          />
          <img
            ref={imageRef}
            src="/hero-beach.jpg"
            srcSet="/hero-beach-800.jpg 800w, /hero-beach-1200.jpg 1200w, /hero-beach.jpg 1920w"
            sizes="100vw"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center"
            style={{ opacity: 0, filter: 'blur(1.5px)' }}
          />
        </picture>
      </div>

      {/* Overlay gradiente "" luz dourada sunset */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(8,6,4,0.52) 0%, rgba(8,6,4,0.18) 45%, rgba(8,6,4,0.58) 100%)',
        }}
      />

      {/* â"€â"€ NAVBAR INTERNA â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <div
        ref={navRef}
        className="absolute top-0 left-0 right-0 flex items-start justify-between px-10 md:px-16 pt-10 pointer-events-auto z-20"
        style={{ opacity: 0 }}
      >
        {/* Esquerda: hamburger + coleção */}
        <div className="flex flex-col gap-2 cursor-pointer group">
          <div className="flex flex-col gap-[5px]">
            <span className="block w-6 h-[1px] bg-white/80 group-hover:w-8 transition-all duration-300" />
            <span className="block w-4 h-[1px] bg-white/80 group-hover:w-8 transition-all duration-300" />
            <span className="block w-6 h-[1px] bg-white/80 group-hover:w-8 transition-all duration-300" />
          </div>
          <span className="font-mono text-[13px] tracking-[0.35em] uppercase text-white/80 mt-1">
            Coleção / SS 2025
          </span>
        </div>

        {/* Direita: ícones */}
        <div className="flex items-center gap-6">
          {/* Search */}
          <button className="text-white/85 hover:text-white transition-colors" aria-label="Pesquisar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>

          {/* Profile */}
          <button className="text-white/85 hover:text-white transition-colors" aria-label="Conta">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </button>

          {/* Cart */}
          <button className="text-white/85 hover:text-white transition-colors relative" aria-label="Carrinho">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span className="absolute -top-2 -right-2 font-mono text-[13px] text-white/80 leading-none">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* â"€â"€ TTULO + SUBTTULO + CTA + TRUST â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <div ref={titleRef} className="relative flex flex-col items-center justify-center gap-6 z-10 w-full px-6">
        {/* SOLARIS */}
        <h1 className="flex" style={{ gap: '0.06em' }}>
          {LETTERS.map((letter, i) => (
            <span
              key={i}
              className={`hero-letter-${i} inline-block text-[13vw] md:text-[11vw] leading-none font-serif font-light uppercase antialiased will-change-transform text-white`}
              style={{ opacity: 0, textShadow: '0 4px 40px rgba(0,0,0,0.4)' }}
            >
              {letter}
            </span>
          ))}
        </h1>

        {/* Subtítulo */}
        <div
          ref={subtitleRef}
          className="flex flex-col items-center gap-1"
          style={{ opacity: 0 }}
        >
          <p className="font-serif italic text-[clamp(0.9rem,2vw,1.25rem)] text-white/80 tracking-wider text-center font-light leading-relaxed">
            A fluidez do verão europeu.
          </p>
          <p className="font-mono text-[13px] md:text-[13px] tracking-[0.3em] uppercase text-white/80 text-center">
            Descubra a nova coleção
          </p>
        </div>

        {/* â"€â"€ CTA â"€â"€ */}
        <div ref={ctaRef} style={{ opacity: 0 }}>
          <Link
            to="/shop"
            className="group flex items-center gap-5 bg-solar-yellow text-absolute-black font-mono text-xs tracking-[0.35em] uppercase px-10 py-5 hover:bg-white transition-colors duration-300 whitespace-nowrap"
          >
            Explorar Coleção
            <span className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
          </Link>
        </div>

        {/* â"€â"€ TRUST SIGNALS â"€â"€ */}
        <div
          ref={trustRef}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          style={{ opacity: 0 }}
        >
          {[
            { icon: '⚡', label: 'Entrega 7–14 dias' },
            { icon: '↩', label: 'Devolução 30 dias' },
            { icon: '🔒', label: 'Pagamento Seguro' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-[#F4A623] text-sm leading-none">{icon}</span>
              <span className="font-mono text-[13px] tracking-[0.2em] uppercase text-white/80 whitespace-nowrap">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-25 z-10">
        <div className="w-[1px] h-10 bg-white/40 relative overflow-hidden">
          <div className="w-full h-full bg-white absolute top-0 left-0 animate-[scroll-down_2s_ease-in-out_infinite]" />
        </div>
      </div>

    </section>
  );
}
