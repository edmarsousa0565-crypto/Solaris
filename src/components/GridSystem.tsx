'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function GridSystem() {
  const horizontalLinesRef = useRef<(HTMLDivElement | null)[]>([]);
  const verticalLinesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 }); // Pequeno delay para garantir que a página carregou
      
      // Animação das linhas horizontais (desenham do centro para as bordas ou da esquerda para a direita)
      tl.fromTo(
        horizontalLinesRef.current,
        { scaleX: 0 },
        { 
          scaleX: 1, 
          duration: 1.8, 
          stagger: 0.2, 
          ease: 'expo.inOut', 
          transformOrigin: 'left center' 
        }
      );

      // Animação das linhas verticais (desenham de cima para baixo)
      tl.fromTo(
        verticalLinesRef.current,
        { scaleY: 0 },
        { 
          scaleY: 1, 
          duration: 1.8, 
          stagger: 0.2, 
          ease: 'expo.inOut', 
          transformOrigin: 'top center' 
        },
        "-=1.4" // Overlap para começarem a desenhar antes das horizontais terminarem
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Linhas Horizontais (ex: a 33% e 66% da altura) */}
      <div 
        ref={el => { horizontalLinesRef.current[0] = el }} 
        className="absolute top-1/3 left-0 w-full h-[1px] bg-absolute-black/10" 
      />
      <div 
        ref={el => { horizontalLinesRef.current[1] = el }} 
        className="absolute top-2/3 left-0 w-full h-[1px] bg-absolute-black/10" 
      />
      
      {/* Linhas Verticais (ex: a 33% e 66% da largura) */}
      <div 
        ref={el => { verticalLinesRef.current[0] = el }} 
        className="absolute top-0 left-1/3 w-[1px] h-full bg-absolute-black/10" 
      />
      <div 
        ref={el => { verticalLinesRef.current[1] = el }} 
        className="absolute top-0 left-2/3 w-[1px] h-full bg-absolute-black/10" 
      />
    </div>
  );
}
