'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
gsap.registerPlugin(Draggable);

const PHASES = [
  {
    max: 90,
    title: 'Dawn',
    label: 'Amanhecer',
    time: '07:00',
    mood: 'Leveza. Linho sobre a pele. O dia ainda não pesa.',
    bg: 'bg-solar-yellow',
    textAccent: 'text-absolute-black',
    products: [
      {
        name: 'Raw Silk Shirt',
        price: '€180',
        tag: 'Essentials',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=600&auto=format&fit=crop',
      },
      {
        name: 'Linen Trousers',
        price: '€220',
        tag: 'Essentials',
        image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop',
      },
      {
        name: 'Minimalist Tote',
        price: '€150',
        tag: 'Accessories',
        image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=600&auto=format&fit=crop',
      },
    ],
  },
  {
    max: 180,
    title: 'Zenith',
    label: 'Meio-dia',
    time: '12:00',
    mood: 'Presença total. Estrutura e sombra. A luz não perdoa.',
    bg: 'bg-absolute-black',
    textAccent: 'text-solar-yellow',
    products: [
      {
        name: 'Structured Blazer',
        price: '€450',
        tag: 'Limited',
        image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?q=80&w=600&auto=format&fit=crop',
      },
      {
        name: 'Pleated Wide Trousers',
        price: '€320',
        tag: 'Limited',
        image: 'https://images.unsplash.com/photo-1550614000-4b95d4158173?q=80&w=600&auto=format&fit=crop',
      },
      {
        name: 'Cotton Wrap Dress',
        price: '€260',
        tag: 'Essentials',
        image: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=600&auto=format&fit=crop',
      },
    ],
  },
  {
    max: 270,
    title: 'Golden Hour',
    label: 'Hora Dourada',
    time: '18:30',
    mood: 'A hora mais bonita. Seda, calor e movimento.',
    bg: 'bg-[#1C1200]',
    textAccent: 'text-oxidized-gold',
    products: [
      {
        name: 'Silk Drape Vest',
        price: '€240',
        tag: 'Limited',
        image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=600&auto=format&fit=crop',
      },
      {
        name: 'Merino Knit Top',
        price: '€195',
        tag: 'Essentials',
        image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=600&auto=format&fit=crop',
      },
      {
        name: 'Silk Slip Skirt',
        price: '€185',
        tag: 'Archive',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
      },
    ],
  },
  {
    max: 360,
    title: 'Dusk',
    label: 'Crepúsculo',
    time: '20:45',
    mood: 'O epílogo do dia. Silhuetas que permanecem.',
    bg: 'bg-[#0A0700]',
    textAccent: 'text-stark-white',
    products: [
      {
        name: 'Sculptural Coat',
        price: '€680',
        tag: 'Limited',
        image: 'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?q=80&w=600&auto=format&fit=crop',
      },
      {
        name: 'Oversized Trench',
        price: '€520',
        tag: 'Archive',
        image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop',
      },
      {
        name: 'Linen Shirt Dress',
        price: '€210',
        tag: 'Archive',
        image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=600&auto=format&fit=crop',
      },
    ],
  },
];

const isLight = (bg: string) => bg === 'bg-solar-yellow';

export default function SolarClock() {
  const dialRef = useRef<HTMLDivElement>(null);
  const sunRef  = useRef<HTMLDivElement>(null);
  const leftContentRef  = useRef<HTMLDivElement>(null);
  const rightContentRef = useRef<HTMLDivElement>(null);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const phase = PHASES[phaseIndex];
  const light = isLight(phase.bg);

  // Fade phase content in/out on change — useLayoutEffect prevents flash
  useLayoutEffect(() => {
    const els = [leftContentRef.current, rightContentRef.current].filter(Boolean);
    gsap.killTweensOf(els);
    gsap.set(els, { opacity: 0, y: 10 });
    gsap.to(els, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.05 });
  }, [phaseIndex]);

  useEffect(() => {
    if (!dialRef.current || !sunRef.current) return;

    Draggable.create(dialRef.current, {
      type: 'rotation',
      trigger: sunRef.current,
      onDrag: function () {
        let angle = this.rotation % 360;
        if (angle < 0) angle += 360;
        const idx = PHASES.findIndex(p => angle <= p.max);
        setPhaseIndex(idx === -1 ? 3 : idx);
      },
    });
  }, []);

  return (
    <section className={`w-full h-screen relative shrink-0 overflow-hidden transition-colors duration-700 ${phase.bg}`}>

      {/* Grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '180px',
        }}
      />

      {/* Layout de duas colunas */}
      <div className="relative z-20 w-full h-full flex flex-col md:flex-row">

        {/* Coluna esquerda "" Dial + Fase */}
        <div className="w-full md:w-[40%] h-[45%] md:h-full flex flex-col justify-between px-10 md:px-16 py-10 md:py-14">

          {/* Topo */}
          <div>
            <p className={`font-mono text-[13px] tracking-[0.5em] uppercase mb-6 transition-colors duration-700 ${light ? 'text-absolute-black/70' : 'text-stark-white/30'}`}>
              Veste pelo Momento
            </p>

            {/* Indicadores de fase */}
            <div className="flex gap-2 mb-8">
              {PHASES.map((p, i) => (
                <button
                  key={p.title}
                  onClick={() => setPhaseIndex(i)}
                  className={`font-mono text-[13px] tracking-widest uppercase px-3 py-1 border transition-all duration-300 ${
                    i === phaseIndex
                      ? light
                        ? 'bg-absolute-black text-solar-yellow border-absolute-black'
                        : 'bg-solar-yellow text-absolute-black border-solar-yellow'
                      : light
                        ? 'border-absolute-black/20 text-absolute-black/90 hover:text-absolute-black/90'
                        : 'border-stark-white/20 text-stark-white/30 hover:text-stark-white/60'
                  }`}
                >
                  {p.title}
                </button>
              ))}
            </div>

            <div ref={leftContentRef}>
                <p className={`font-mono text-[13px] tracking-[0.3em] uppercase mb-2 transition-colors duration-700 ${light ? 'text-absolute-black/70' : 'text-stark-white/30'}`}>
                  {phase.time} "" {phase.label}
                </p>
                <h2 className={`font-serif italic text-5xl md:text-6xl font-light leading-none mb-5 transition-colors duration-700 ${phase.textAccent}`}>
                  {phase.title}
                </h2>
                <p className={`font-mono text-xs tracking-wider leading-relaxed max-w-[240px] transition-colors duration-700 ${light ? 'text-absolute-black/80' : 'text-stark-white/40'}`}>
                  {phase.mood}
                </p>
            </div>
          </div>

          {/* Dial */}
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <circle cx="50%" cy="50%" r="48%" fill="none" stroke={light ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)'} strokeWidth="1" strokeDasharray="3 5" />
              </svg>
              <div ref={dialRef} className="absolute inset-0 w-full h-full">
                <div
                  ref={sunRef}
                  className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full cursor-grab active:cursor-grabbing hover:scale-125 transition-transform flex items-center justify-center ${light ? 'bg-absolute-black' : 'bg-solar-yellow'}`}
                />
              </div>
            </div>
            <p className={`font-mono text-[13px] tracking-[0.3em] uppercase leading-relaxed transition-colors duration-700 ${light ? 'text-absolute-black/90' : 'text-stark-white/20'}`}>
              Arrasta<br/>o sol
            </p>
          </div>
        </div>

        {/* Divisor vertical */}
        <div className={`hidden md:block w-px my-14 transition-colors duration-700 ${light ? 'bg-absolute-black/10' : 'bg-stark-white/10'}`} />

        {/* Coluna direita "" Produtos */}
        <div className="w-full md:w-[60%] h-[55%] md:h-full px-8 md:px-12 py-8 md:py-14 flex flex-col justify-between">

          <div ref={rightContentRef} className="flex flex-col h-full gap-6">
              {/* Grid de 3 produtos */}
              <div className="grid grid-cols-3 gap-3 md:gap-4 flex-1">
                {phase.products.map((product) => (
                  <div
                    key={product.name}
                    className="group flex flex-col gap-2"
                  >
                    <div className="relative flex-1 min-h-0 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                        style={{ aspectRatio: '3/4' }}
                        referrerPolicy="no-referrer"
                      />
                      <div className={`absolute top-2 left-2 font-mono text-[13px] tracking-widest uppercase px-2 py-0.5 transition-colors duration-700 ${light ? 'bg-absolute-black text-solar-yellow' : 'bg-solar-yellow text-absolute-black'}`}>
                        {product.tag}
                      </div>
                    </div>
                    <div>
                      <p className={`font-mono text-[13px] md:text-[13px] tracking-widest uppercase leading-tight transition-colors duration-700 ${light ? 'text-absolute-black' : 'text-stark-white'}`}>
                        {product.name}
                      </p>
                      <p className={`font-mono text-[13px] transition-colors duration-700 ${light ? 'text-absolute-black/70' : 'text-stark-white/30'}`}>
                        {product.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link
                to="/shop"
                className={`inline-flex items-center gap-3 font-mono text-[13px] tracking-[0.3em] uppercase border px-6 py-4 w-fit group transition-all duration-300 ${
                  light
                    ? 'border-absolute-black text-absolute-black hover:bg-absolute-black hover:text-solar-yellow'
                    : 'border-solar-yellow text-solar-yellow hover:bg-solar-yellow hover:text-absolute-black'
                }`}
              >
                Ver coleção {phase.title}
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
