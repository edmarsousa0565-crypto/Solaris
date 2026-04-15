'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface MagneticCTAProps {
  text1: string;
  text2: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function MagneticCTA({ text1, text2, className = '', onClick }: MagneticCTAProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useGSAP(() => {
    const button = buttonRef.current;
    if (!button) return;

    const xTo = gsap.quickTo(button, "x", { duration: 0.4, ease: "power2.out" });
    const yTo = gsap.quickTo(button, "y", { duration: 0.4, ease: "power2.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = button.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (distance < 100) {
        xTo(distanceX * 0.3);
        yTo(distanceY * 0.3);
      } else {
        xTo(0);
        yTo(0);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, { scope: buttonRef });

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={`group relative overflow-hidden bg-absolute-black text-stark-white px-6 py-3 flex items-center justify-center ${className}`}
    >
      {/* Wrapper para o texto com altura fixa para o efeito de slide */}
      <div className="relative flex flex-col items-center justify-center h-4 overflow-hidden pointer-events-none">
        <span className="transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full uppercase tracking-widest text-[13px] md:text-xs">
          {text1}
        </span>
        <span className="absolute top-full transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full uppercase tracking-widest text-[13px] md:text-xs">
          {text2}
        </span>
      </div>
    </button>
  );
}
