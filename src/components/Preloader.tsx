'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef      = useRef<HTMLDivElement>(null);
  const rightRef     = useRef<HTMLDivElement>(null);
  const lightRef     = useRef<HTMLDivElement>(null);
  const textRef      = useRef<HTMLDivElement>(null);
  const subtitleRef  = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    // Estados iniciais "" texto visível desde o início, luz ainda fechada
    gsap.set(lightRef.current,    { width: 0, xPercent: -50 });
    gsap.set(subtitleRef.current, { opacity: 0 });

    // 1. Texto e subtítulo já aparecem (ecrã preto com letras brancas)
    tl.to(textRef.current, {
      opacity: 1,
      duration: 0.7,
      ease: 'power2.out',
    }, 0.15);

    tl.to(subtitleRef.current, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out',
    }, '-=0.3');

    // 2. Hold "" utilizador lê
    tl.to({}, { duration: 0.7 });

    // 3. Fissura de luz surge ao centro
    tl.to(lightRef.current, {
      width: '2px',
      duration: 0.45,
      ease: 'power2.out',
    });

    // 4. Hold breve com a fissura visível
    tl.to({}, { duration: 0.2 });

    // 5. Luz expande com força "" vai abrir o portão
    tl.to(lightRef.current, {
      width: '22vw',
      duration: 0.5,
      ease: 'power3.in',
    });

    // 6. Portão abre "" painéis deslizam para fora
    tl.to(leftRef.current, {
      xPercent: -100,
      duration: 0.75,
      ease: 'power3.inOut',
    }, '-=0.25');

    tl.to(rightRef.current, {
      xPercent: 100,
      duration: 0.75,
      ease: 'power3.inOut',
    }, '<');

    // 7. Texto some com os painéis
    tl.to([textRef.current, subtitleRef.current], {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
    }, '<0.05');

    // 8. Luz dissolve
    tl.to(lightRef.current, {
      opacity: 0,
      duration: 0.3,
    }, '<0.15');

    // 9. Container sai
    tl.to(containerRef.current, {
      opacity: 0,
      duration: 0.15,
      ease: 'none',
      onComplete,
    }, '-=0.1');

  }, { scope: containerRef, dependencies: [onComplete] });

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] overflow-hidden"
    >
      {/* Painel Esquerdo */}
      <div
        ref={leftRef}
        className="absolute top-0 left-0 h-full"
        style={{
          width: '50%',
          background: 'linear-gradient(to right, #0c0b09 0%, #0c0b09 85%, rgba(191,150,80,0.06) 100%)',
        }}
      />

      {/* Painel Direito */}
      <div
        ref={rightRef}
        className="absolute top-0 right-0 h-full"
        style={{
          width: '50%',
          background: 'linear-gradient(to left, #0c0b09 0%, #0c0b09 85%, rgba(191,150,80,0.06) 100%)',
        }}
      />

      {/* Fissura / Raio de Luz Central */}
      <div
        ref={lightRef}
        className="absolute top-0 h-full pointer-events-none"
        style={{
          left: '50%',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,220,130,0.08) 12%, rgba(255,235,160,0.45) 35%, rgba(255,250,210,0.98) 50%, rgba(255,235,160,0.45) 65%, rgba(255,220,130,0.08) 88%, transparent 100%)',
          filter: 'blur(4px)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Texto "" por cima dos painéis */}
      <div
        ref={textRef}
        className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
        style={{ opacity: 0 }} // GSAP anima para 1 no início
      >
        <span
          className="font-serif font-light uppercase antialiased"
          style={{
            fontSize: 'clamp(2.5rem, 9vw, 8rem)',
            letterSpacing: '0.3em',
            color: 'rgba(255,248,225,0.90)',
            textShadow: '0 0 80px rgba(255,215,100,0.25)',
          }}
        >
          SOLARIS
        </span>
      </div>

      {/* Subtítulo */}
      <span
        ref={subtitleRef}
        className="absolute z-10 font-mono uppercase whitespace-nowrap pointer-events-none"
        style={{
          bottom: '14%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '9px',
          letterSpacing: '0.45em',
          color: 'rgba(191,160,113,0.50)',
          opacity: 0,
        }}
      >
        Architecture of Light
      </span>
    </div>
  );
}
