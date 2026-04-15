'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Inicializa o Lenis com as configurações de luxo solicitadas
    const lenis = new Lenis({
      lerp: 0.05,
      wheelMultiplier: 1,
      smoothWheel: true,
    });

    // Reset ao topo imediatamente ao montar (navegação de volta)
    lenis.scrollTo(0, { immediate: true });

    // Loop de animação (Request Animation Frame) otimizado para performance máxima
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Limpeza ao desmontar o componente
    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
