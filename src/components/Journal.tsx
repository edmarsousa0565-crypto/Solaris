'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Journal() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const bgWordRef     = useRef<HTMLDivElement>(null);
  const eyebrowRef    = useRef<HTMLDivElement>(null);
  const verticalTextRef = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    // ── Parallax no texto de fundo ──────────────────────────────
    if (bgWordRef.current) {
      gsap.to(bgWordRef.current, {
        y: '-25%',
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    // ── Eyebrow fade-in ─────────────────────────────────────────
    if (eyebrowRef.current) {
      gsap.fromTo(eyebrowRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: eyebrowRef.current, start: 'top 90%' },
        }
      );
    }

    // ── Texto vertical letra-a-letra ────────────────────────────
    if (verticalTextRef.current) {
      const text = verticalTextRef.current.textContent || '';
      verticalTextRef.current.innerHTML = text
        .split('')
        .map(c => c === ' ' ? `<span style="display:inline-block">&nbsp;</span>` : `<span style="display:inline-block">${c}</span>`)
        .join('');
      const chars = verticalTextRef.current.querySelectorAll('span');
      gsap.fromTo(chars,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          stagger: 0.04,
          scrollTrigger: { trigger: verticalTextRef.current, start: 'top 85%' },
        }
      );
    }

    // ── Reveal + parallax em cada célula ────────────────────────
    const items = gsap.utils.toArray<HTMLElement>('.journal-item');

    items.forEach((item) => {
      const speed   = parseFloat(item.dataset.speed || '1');
      const content = item.querySelector<HTMLElement>('.journal-content');
      const img     = item.querySelector<HTMLElement>('img, video');

      // Clip-path curtain reveal
      if (content) {
        gsap.fromTo(content,
          { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0 },
          {
            clipPath: 'inset(0% 0% 0% 0%)', opacity: 1,
            duration: 1.4, ease: 'power4.inOut',
            scrollTrigger: { trigger: item, start: 'top 88%' },
          }
        );
      }

      // Parallax interno na imagem
      if (img) {
        gsap.fromTo(img,
          { yPercent: 8 },
          {
            yPercent: -8, ease: 'none',
            scrollTrigger: {
              trigger: item, start: 'top bottom', end: 'bottom top', scrub: true,
            },
          }
        );
      }

      // Floating parallax da célula inteira
      gsap.to(item, {
        y: () => -120 * speed, ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom', end: 'bottom top', scrub: true,
        },
      });
    });

  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen bg-deep-night py-32 md:py-64 overflow-hidden"
    >

      {/* Grain ─────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.045] z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '180px',
        }}
      />

      {/* Texto de fundo gigante ─────────────────────────────────── */}
      <div
        ref={bgWordRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none"
        aria-hidden="true"
      >
        <span
          className="font-serif italic font-light text-stark-white/[0.025] whitespace-nowrap"
          style={{ fontSize: 'clamp(8rem, 22vw, 22rem)', lineHeight: 1 }}
        >
          Arquivo
        </span>
      </div>

      {/* Eyebrow ─────────────────────────────────────────────────── */}
      <div
        ref={eyebrowRef}
        className="relative z-20 max-w-[90vw] mx-auto flex items-center justify-between mb-20 md:mb-32 opacity-0"
      >
        <p className="font-mono text-[11px] tracking-[0.5em] uppercase text-stark-white/30">
          — Journal
        </p>
        <p className="font-mono text-[11px] tracking-[0.4em] uppercase text-stark-white/20">
          SS · 2025
        </p>
      </div>

      {/* Grid ─────────────────────────────────────────────────────── */}
      <div className="relative z-20 max-w-[90vw] mx-auto grid grid-cols-12 gap-y-24 md:gap-8">

        {/* Célula 01: Detalhe de Linho */}
        <div className="journal-item col-span-12 md:col-span-4 md:col-start-2" data-speed="0.8">
          <div className="journal-content relative w-full aspect-[3/4] overflow-hidden border-[0.5px] border-stark-white/10 p-2 md:p-4 group">
            <img
              src="/journal-linen.webp"
              alt="Detalhe de tecido linho Solaris"
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-2 md:inset-4 bg-solar-yellow/0 group-hover:bg-solar-yellow/10 transition-colors duration-700 pointer-events-none" />
            <span className="absolute bottom-5 left-6 font-mono text-[10px] tracking-[0.4em] uppercase text-stark-white/0 group-hover:text-stark-white/60 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
              Linho · Essentials
            </span>
          </div>
        </div>

        {/* Célula 02: Sombras Arquitetónicas */}
        <div className="journal-item col-span-8 md:col-span-3 md:col-start-8 md:mt-32" data-speed="1.2">
          <div className="journal-content relative w-full aspect-square overflow-hidden group">
            <img
              src="/journal-architecture.webp"
              alt="Sombras arquitectónicas mediterrânicas"
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-solar-yellow/0 group-hover:bg-solar-yellow/8 transition-colors duration-700 pointer-events-none" />
            <span className="absolute bottom-4 left-4 font-mono text-[10px] tracking-[0.4em] uppercase text-stark-white/0 group-hover:text-stark-white/60 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
              Mediterrâneo
            </span>
          </div>
        </div>

        {/* Célula 03: Texto Vertical */}
        <div className="journal-item col-span-4 md:col-span-1 md:col-start-6 flex justify-center md:mt-64" data-speed="1.8">
          <div className="journal-content">
            <h3
              ref={verticalTextRef}
              className="font-serif italic text-4xl md:text-6xl text-stark-white/70 whitespace-nowrap tracking-wide"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              Lush Simplicity
            </h3>
          </div>
        </div>

        {/* Célula 04: Modelo Editorial */}
        <div className="journal-item col-span-12 md:col-span-5 md:col-start-3 mt-16 md:mt-0" data-speed="0.9">
          <div className="journal-content relative w-full aspect-[16/9] md:aspect-[4/5] overflow-hidden border-[0.5px] border-stark-white/10 p-2 md:p-4 group">
            <img
              src="/journal-model.webp"
              alt="Editorial Solaris Verão"
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-2 md:inset-4 bg-solar-yellow/0 group-hover:bg-solar-yellow/8 transition-colors duration-700 pointer-events-none" />
            <span className="absolute bottom-5 left-6 font-mono text-[10px] tracking-[0.4em] uppercase text-stark-white/0 group-hover:text-stark-white/60 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
              Editorial · Verão 2025
            </span>
          </div>
        </div>

        {/* Célula 05: Meta-data */}
        <div className="journal-item col-span-12 md:col-span-3 md:col-start-9 mt-8 md:mt-48" data-speed="1.4">
          <div className="journal-content flex flex-col gap-4 border-l-[0.5px] border-stark-white/20 pl-6">
            <p className="font-mono text-[10px] text-stark-white/30 uppercase tracking-widest">
              Coordinates
            </p>
            <p className="font-mono text-sm text-stark-white/70 leading-relaxed">
              39° 33' 51" N <br />
              3° 12' 43" E
            </p>
            <div className="w-6 h-px bg-stark-white/10 my-2" />
            <p className="font-mono text-[10px] text-stark-white/30 uppercase tracking-widest">
              Atmosphere
            </p>
            <p className="font-mono text-sm text-stark-white/70 leading-relaxed">
              Arid breeze, salt, <br />
              crushed minerals.
            </p>
            <div className="w-6 h-px bg-stark-white/10 my-2" />
            <p className="font-mono text-[10px] text-stark-white/20 uppercase tracking-widest">
              Season
            </p>
            <p className="font-mono text-sm text-stark-white/50">
              Summer · 2025
            </p>
          </div>
        </div>

      </div>

      {/* Rodapé editorial ──────────────────────────────────────── */}
      <div className="relative z-20 max-w-[90vw] mx-auto mt-32 md:mt-48 flex items-center justify-between">
        <div className="flex-1 h-px bg-stark-white/10" />
        <p className="font-mono text-[10px] tracking-[0.5em] uppercase text-stark-white/20 px-6 whitespace-nowrap">
          Solaris · Verão 2025 · Portugal
        </p>
        <div className="flex-1 h-px bg-stark-white/10" />
      </div>

    </section>
  );
}
