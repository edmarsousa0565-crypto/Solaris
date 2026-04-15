'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface MagneticTextProps {
  children: React.ReactNode;
  className?: string;
}

export default function MagneticText({ children, className = '' }: MagneticTextProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!ref.current) return;

    const xTo = gsap.quickTo(ref.current, "x", { duration: 0.4, ease: "power2.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const { left, width } = ref.current!.getBoundingClientRect();
      const centerX = left + width / 2;
      const distanceX = e.clientX - centerX;
      
      xTo(distanceX * 0.15);
      gsap.to(ref.current, { letterSpacing: '0.05em', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
    };

    const handleMouseLeave = () => {
      xTo(0);
      gsap.to(ref.current, { letterSpacing: '0em', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
    };

    ref.current.addEventListener("mousemove", handleMouseMove);
    ref.current.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      ref.current?.removeEventListener("mousemove", handleMouseMove);
      ref.current?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, { scope: ref });

  return (
    <div 
      ref={ref} 
      className={`inline-block will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}
