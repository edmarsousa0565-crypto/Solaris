'use client';

import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { trackPurchase } from '../lib/pixel';
import { gaPurchase } from '../lib/analytics';

export default function ThankYouPage() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const firedRef = useRef(false);

  const circleRef = useRef<SVGCircleElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Dispara o evento Purchase apenas uma vez
  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    // Lê valor do sessionStorage se foi guardado antes do checkout
    const stored = sessionStorage.getItem('solaris-checkout-total');
    const value = stored ? parseFloat(stored) : 0;
    sessionStorage.removeItem('solaris-checkout-total');

    trackPurchase({ value, orderId: sessionId || undefined });
    gaPurchase({ value, orderId: sessionId || undefined });
  }, [sessionId]);

  useGSAP(() => {
    if (!circleRef.current || !contentRef.current) return;

    // Animação do círculo de check
    gsap.fromTo(circleRef.current,
      { strokeDashoffset: 283 },
      { strokeDashoffset: 0, duration: 0.8, ease: 'power3.inOut', delay: 0.3 }
    );

    gsap.fromTo(contentRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.7 }
    );
  });

  return (
    <div className="min-h-screen bg-[#1C1410] text-white flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between px-8 md:px-16 py-8">
        <Link
          to="/"
          className="font-serif text-sm tracking-[0.4em] uppercase text-white/70 hover:text-[#F4A623] transition-colors"
        >
          ← Solaris
        </Link>
      </header>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">

        {/* Círculo animado âœ" */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'backOut' }}
          className="mb-10"
        >
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="44" fill="none" stroke="rgba(244,166,35,0.15)" strokeWidth="2" />
            <circle
              ref={circleRef}
              cx="48" cy="48" r="44"
              fill="none"
              stroke="#F4A623"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset="283"
              transform="rotate(-90 48 48)"
            />
            <motion.path
              d="M30 48 L43 61 L66 36"
              fill="none"
              stroke="#F4A623"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.9 }}
            />
          </svg>
        </motion.div>

        <div ref={contentRef} style={{ opacity: 0 }} className="flex flex-col items-center gap-6 max-w-md">
          <div>
            <p className="font-mono text-[13px] tracking-[0.4em] uppercase text-[#F4A623] mb-3">
              Encomenda Confirmada
            </p>
            <h1 className="font-serif text-[clamp(2.5rem,6vw,4rem)] font-light leading-none text-white mb-4">
              Obrigado.
            </h1>
            <p className="text-white/80 text-sm leading-relaxed">
              Recebemos a tua encomenda e já estamos a tratá-la.
              Receberás um email de confirmação em breve.
            </p>
          </div>

          {/* Próximos passos */}
          <div className="w-full border border-white/10 divide-y divide-white/10 text-left mt-2">
            {[
              { num: '01', label: 'Confirmação por email', desc: 'Nos próximos minutos' },
              { num: '02', label: 'Encomenda processada', desc: '24""48 horas' },
              { num: '03', label: 'Número de tracking', desc: 'Assim que for enviada' },
              { num: '04', label: 'Entrega estimada', desc: '7""14 dias úteis' },
            ].map(step => (
              <div key={step.num} className="flex items-center gap-5 px-5 py-4">
                <span className="font-mono text-[13px] text-[#F4A623]/50 w-6 shrink-0">{step.num}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[13px] tracking-widest uppercase text-white/70">{step.label}</p>
                </div>
                <span className="font-mono text-[13px] text-white/60 shrink-0">{step.desc}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
            <Link
              to="/tracking"
              className="flex-1 text-center bg-[#F4A623] text-[#1C1410] font-mono text-xs tracking-[0.3em] uppercase px-6 py-4 hover:bg-[#FDE68A] transition-colors"
            >
              Rastrear Encomenda
            </Link>
            <Link
              to="/shop"
              className="flex-1 text-center border border-white/20 text-white/60 font-mono text-xs tracking-[0.3em] uppercase px-6 py-4 hover:border-white/40 hover:text-white transition-colors"
            >
              Continuar a comprar
            </Link>
          </div>

          <p className="font-mono text-[13px] text-white/25 tracking-wider">
            Dúvidas? <a href="mailto:edmar@pakkaz.com" className="text-[#F4A623]/60 hover:text-[#F4A623] transition-colors">edmar@pakkaz.com</a>
          </p>
        </div>
      </div>

    </div>
  );
}
