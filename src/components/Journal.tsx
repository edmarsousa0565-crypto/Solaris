'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Journal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    const items = gsap.utils.toArray('.journal-item');

    items.forEach((item: any) => {
      const speed = parseFloat(item.dataset.speed || "1");
      const content = item.querySelector('.journal-content');

      // 1. Reveal Animation (Slide up, fade in, scale down)
      if (content) {
        gsap.fromTo(content, 
          { opacity: 0, y: 100, scale: 1.1 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1, 
            duration: 1.5, 
            ease: "power4.out",
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
            }
          }
        );
      }

      // 2. Floating Parallax
      gsap.to(item, {
        y: () => -150 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative w-full min-h-screen bg-deep-night py-32 md:py-64 overflow-hidden">
      <div className="max-w-[90vw] mx-auto grid grid-cols-12 gap-y-24 md:gap-8">
        
        {/* Célula 01: Vídeo (Linho) */}
        <div className="journal-item col-span-12 md:col-span-4 md:col-start-2" data-speed="0.8">
          <div className="journal-content relative w-full aspect-[3/4] overflow-hidden border-[0.5px] border-stark-white/10 p-2 md:p-4">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover"
              poster="https://images.unsplash.com/photo-1590333748338-d629e4564ad9?q=80&w=1000&auto=format&fit=crop"
            >
              {/* Fallback de vídeo genérico, o poster garante a estética se o vídeo falhar */}
              <source src="https://cdn.pixabay.com/video/2020/05/24/40088-424933967_tiny.mp4" type="video/mp4" />
            </video>
          </div>
        </div>

        {/* Célula 02: Foto (Arquitetura) */}
        <div className="journal-item col-span-8 md:col-span-3 md:col-start-8 md:mt-32" data-speed="1.2">
          <div className="journal-content relative w-full aspect-square overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop"
              alt="Architectural Shadows"
              loading="lazy"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Célula 03: Texto Vertical */}
        <div className="journal-item col-span-4 md:col-span-1 md:col-start-6 flex justify-center md:mt-64" data-speed="1.8">
          <div className="journal-content">
            <h3 
              className="font-serif italic text-4xl md:text-6xl text-stark-white whitespace-nowrap"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              Lush Simplicity
            </h3>
          </div>
        </div>

        {/* Célula 04: Foto (Motion Blur) */}
        <div className="journal-item col-span-12 md:col-span-5 md:col-start-3 mt-16 md:mt-0" data-speed="0.9">
          <div className="journal-content relative w-full aspect-[16/9] md:aspect-[4/5] overflow-hidden border-[0.5px] border-stark-white/10 p-2 md:p-4">
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop"
              alt="Motion Blur Model"
              loading="lazy"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Célula 05: Meta-data */}
        <div className="journal-item col-span-12 md:col-span-3 md:col-start-9 mt-8 md:mt-48" data-speed="1.4">
          <div className="journal-content flex flex-col gap-4 border-l-[0.5px] border-stark-white/20 pl-6">
            <p className="font-mono text-xs text-stark-white/50 uppercase tracking-widest">
              Coordinates
            </p>
            <p className="font-mono text-sm text-stark-white/80">
              39° 33' 51" N <br />
              3° 12' 43" E
            </p>
            <p className="font-mono text-xs text-stark-white/50 uppercase tracking-widest mt-6">
              Atmosphere
            </p>
            <p className="font-mono text-sm text-stark-white/80">
              Arid breeze, salt, <br />
              crushed minerals.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
