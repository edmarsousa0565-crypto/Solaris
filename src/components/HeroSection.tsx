'use client';

import { useRef } from 'react';
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
  const bottomRef   = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);
  const trustRef    = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    gsap.fromTo(imageRef.current,
      { scale: 1.06, opacity: 0 },
      { scale: 1, opacity: 1, duration: 2.8, ease: 'power2.out', delay: 0.1 }
    );

    LETTER_ANIMS.forEach((anim, i) => {
      gsap.fromTo(`.hero-letter-${i}`,
        { x: anim.x, y: anim.y, rotation: anim.rotation, opacity: 0 },
        { x: 0, y: 0, rotation: 0, opacity: 1, duration: anim.duration, ease: 'expo.out', delay: anim.delay }
      );
    });

    gsap.fromTo(subtitleRef.current,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.9 }
    );
    gsap.fromTo(ctaRef.current,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 1.1 }
    );
    gsap.fromTo(trustRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: 'power3.out', delay: 1.4 }
    );
    gsap.fromTo(bottomRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.9 }
    );

    gsap.to(titleRef.current, {
      opacity: 0, y: -60,
      scrollTrigger: { trigger: document.body, start: 'top top', end: '+=600', scrub: 1 }
    });
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="w-screen h-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: '#0c0b09' }}
    >

      {/* IMAGEM */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          ref={imageRef}
          src="/hero-beach.jpg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
          style={{ opacity: 0, filter: 'blur(1px)' }}
        />
      </div>

      {/* GRADIENT OVERLAY — mobile: mais escuro em baixo para legibilidade */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'linear-gradient(180deg,',
            '  rgba(8,6,4,0.55) 0%,',
            '  rgba(8,6,4,0.10) 38%,',
            '  rgba(8,6,4,0.10) 55%,',
            '  rgba(8,6,4,0.75) 80%,',
            '  rgba(8,6,4,0.92) 100%',
            ')',
          ].join(''),
        }}
      />

      {/* Grain sutil */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      {/* ── TÍTULO CENTRAL ─────────────────────────────────────── */}
      <div ref={titleRef} className="relative flex flex-col items-center justify-center gap-4 md:gap-6 z-10 w-full px-4 md:px-6">

        {/* Eyebrow — só desktop */}
        <p
          ref={subtitleRef}
          className="hidden md:block font-mono text-[11px] tracking-[0.55em] uppercase text-white/40"
          style={{ opacity: 0 }}
        >
          Coleção SS 2025
        </p>

        {/* SOLARIS */}
        <h1 className="flex" style={{ gap: '0.04em' }}>
          {LETTERS.map((letter, i) => (
            <span
              key={i}
              className={`hero-letter-${i} inline-block leading-none font-serif font-light uppercase antialiased will-change-transform text-white`}
              style={{
                opacity: 0,
                fontSize: 'clamp(3.2rem, 19vw, 11vw)',
                textShadow: '0 2px 60px rgba(0,0,0,0.35)',
                letterSpacing: '-0.01em',
              }}
            >
              {letter}
            </span>
          ))}
        </h1>

        {/* Linha decorativa — separador elegante */}
        <div
          ref={subtitleRef}
          className="flex items-center gap-4 w-full max-w-xs md:max-w-md"
          style={{ opacity: 0 }}
        >
          <div className="flex-1 h-[0.5px] bg-white/20" />
          <p className="font-serif italic text-[clamp(0.8rem,3.2vw,1.1rem)] text-white/65 tracking-wider text-center font-light whitespace-nowrap">
            A fluidez do verão europeu
          </p>
          <div className="flex-1 h-[0.5px] bg-white/20" />
        </div>

        {/* CTA */}
        <div ref={ctaRef} style={{ opacity: 0 }} className="mt-1 md:mt-2">
          <Link
            to="/shop"
            className="group relative flex items-center gap-4 md:gap-5 font-mono text-[10px] md:text-[11px] tracking-[0.4em] uppercase overflow-hidden"
          >
            {/* Mobile: estilo outline dourado / Desktop: filled amarelo */}
            <span className="
              relative z-10 flex items-center gap-4 md:gap-5
              px-8 py-4 md:px-10 md:py-5
              border border-white/30 text-white/90
              md:bg-solar-yellow md:text-absolute-black md:border-solar-yellow
              transition-all duration-500
              group-hover:border-solar-yellow group-hover:text-solar-yellow
              md:group-hover:bg-white md:group-hover:border-white md:group-hover:text-absolute-black
            ">
              Explorar Coleção
              <span className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
            </span>
          </Link>
        </div>
      </div>

      {/* ── BOTTOM BAR — trust signals + scroll ────────────────── */}
      <div
        ref={bottomRef}
        className="absolute bottom-0 left-0 right-0 z-10 pb-6 md:pb-8 px-6 md:px-12"
        style={{ opacity: 0 }}
      >
        {/* Trust signals — mobile: horizontal scroll sem wrap */}
        <div
          ref={trustRef}
          className="flex items-center justify-center gap-5 md:gap-8 overflow-x-auto scrollbar-none pb-1"
          style={{ opacity: 0 }}
        >
          {[
            { symbol: '✦', label: 'Entrega 7–14 dias' },
            { symbol: '·', label: '·' },
            { symbol: '↩', label: 'Devolução 30 dias' },
            { symbol: '·', label: '·' },
            { symbol: '◈', label: 'Pagamento Seguro' },
          ].map(({ symbol, label }, i) =>
            symbol === '·' ? (
              <span key={i} className="text-white/15 text-xs shrink-0">·</span>
            ) : (
              <div key={i} className="flex items-center gap-2 shrink-0">
                <span className="text-solar-yellow text-[10px] leading-none">{symbol}</span>
                <span className="font-mono text-[9px] md:text-[10px] tracking-[0.25em] uppercase text-white/45 whitespace-nowrap">
                  {label}
                </span>
              </div>
            )
          )}
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center mt-5">
          <div className="flex flex-col items-center gap-2 opacity-20">
            <span className="font-mono text-[8px] tracking-[0.4em] uppercase text-white">scroll</span>
            <div className="w-[1px] h-7 bg-white/50 relative overflow-hidden">
              <div className="w-full h-full bg-white absolute top-0 animate-[scroll-down_2s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
