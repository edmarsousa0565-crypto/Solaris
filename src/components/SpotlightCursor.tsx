'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function SpotlightCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cursorRef.current) return;
    // Não activa em dispositivos touch (pointer: coarse)
    if (!window.matchMedia('(pointer: fine)').matches) return;

    // Centra o cursor no rato usando xPercent e yPercent do GSAP
    gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });

    // quickTo é otimizado para animações que seguem o rato (alta performance)
    const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.15, ease: "power3.out" });
    const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.15, ease: "power3.out" });

    let isHovering = false;

    const moveCursor = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);

      // Verifica se o rato está sobre uma imagem de produto
      const target = e.target as HTMLElement;
      const isProductHover = target.closest('.product-image-wrapper');

      if (isProductHover && !isHovering) {
        isHovering = true;
        // Expande o cursor
        gsap.to(cursorRef.current, { 
          width: 80, 
          height: 80, 
          duration: 0.4, 
          ease: 'back.out(1.5)' 
        });
      } else if (!isProductHover && isHovering) {
        isHovering = false;
        // Volta ao tamanho original
        gsap.to(cursorRef.current, { 
          width: 8, 
          height: 8, 
          duration: 0.3, 
          ease: 'power3.out' 
        });
      }
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <div 
      ref={cursorRef}
      // bg-white com mix-blend-difference resulta num círculo preto sobre fundo branco, 
      // e inverte as cores das imagens por onde passa.
      className="fixed top-0 left-0 w-2 h-2 bg-stark-white rounded-full pointer-events-none z-[9999] mix-blend-difference"
    />
  );
}
