'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function UrgencyBar() {
  const [visible, setVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const barRef = useRef<HTMLDivElement>(null);

  // Define CSS var para o StickyHeader saber onde começar
  useEffect(() => {
    document.documentElement.style.setProperty('--urgency-h', '40px');
    return () => document.documentElement.style.setProperty('--urgency-h', '0px');
  }, []);

  useGSAP(() => {
    gsap.fromTo(barRef.current,
      { height: 0, opacity: 0 },
      { height: 40, opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
  }, { scope: barRef });

  const handleClose = () => {
    document.documentElement.style.setProperty('--urgency-h', '0px');
    gsap.to(barRef.current, {
      height: 0, opacity: 0, duration: 0.4, ease: 'power2.in',
      onComplete: () => setVisible(false),
    });
  };

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const sunday = new Date(now);
      sunday.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));
      sunday.setHours(23, 59, 59, 0);
      const diff = sunday.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h}h ${m}m`);
    };
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 w-full z-[200] bg-absolute-black overflow-hidden"
      style={{ height: 0, opacity: 0 }}
    >
      <div className="flex items-center justify-center px-10 h-10 relative">
        {/* Mobile: texto curto */}
        <p className="md:hidden font-mono text-[11px] tracking-[0.2em] uppercase text-center text-solar-yellow whitespace-nowrap">
          ✦ Frete grátis acima de €49 ✦
        </p>
        {/* Desktop: texto completo */}
        <p className="hidden md:block font-mono text-[13px] tracking-[0.25em] uppercase text-center text-solar-yellow">
          <span className="mr-2">✦</span>
          Frete grátis acima de €49
          <span className="mx-3 text-solar-yellow/40">•</span>
          Promoção termina em{' '}
          <span className="font-medium">{timeLeft}</span>
          <span className="ml-2">✦</span>
        </p>
        <button
          onClick={handleClose}
          className="absolute right-0 w-10 h-10 flex items-center justify-center font-mono text-[13px] text-stark-white/40 hover:text-stark-white transition-colors"
          aria-label="Fechar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
