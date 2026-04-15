'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function EmailPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const animatingOut = useRef(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('solaris-popup-dismissed');
    if (dismissed) return;
    const timer = setTimeout(() => setVisible(true), 14000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible || !backdropRef.current) return;
    animatingOut.current = false;
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    gsap.fromTo(modalRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
  }, [visible]);

  const dismiss = () => {
    if (animatingOut.current) return;
    animatingOut.current = true;
    sessionStorage.setItem('solaris-popup-dismissed', 'true');
    gsap.to([backdropRef.current, modalRef.current], { opacity: 0, duration: 0.3 });
    gsap.to(modalRef.current, { y: 40, duration: 0.3, onComplete: () => setVisible(false) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/email/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Erro ao registar. Tenta novamente.');
        setLoading(false);
        return;
      }
    } catch {
      setError('Erro de ligação. Verifica a tua internet.');
      setLoading(false);
      return;
    }
    setLoading(false);
    setSubmitted(true);
    setTimeout(dismiss, 2800);
  };

  if (!visible) return null;

  return (
    <>
      <div ref={backdropRef} onClick={dismiss} className="fixed inset-0 bg-absolute-black/60 z-[300] backdrop-blur-sm" style={{ opacity: 0 }} />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        className="fixed z-[301] pointer-events-none
          bottom-0 left-0 right-0
          md:bottom-auto md:inset-0 md:flex md:items-center md:justify-center"
        style={{ opacity: 0 }}
      >
        <div className="pointer-events-auto w-full md:max-w-[560px] bg-raw-linen shadow-2xl relative">
          {/* Fechar */}
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center font-mono text-[11px] tracking-[0.3em] uppercase text-absolute-black/40 hover:text-absolute-black transition-colors"
          >
            ✕
          </button>

          <div className="flex flex-col md:flex-row">
            {/* Imagem — só desktop */}
            <div className="hidden md:block w-full md:w-[45%] md:h-auto overflow-hidden shrink-0">
              <img loading="lazy" decoding="async"
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop"
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Conteúdo */}
            <div className="flex-1 p-6 md:p-10 flex flex-col justify-center gap-4">
              {!submitted ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <p className="font-mono text-[11px] tracking-[0.45em] uppercase text-solar-yellow">
                      Oferta Exclusiva
                    </p>
                    <h2 id="popup-title" className="font-serif font-light text-[1.8rem] md:text-[2.2rem] leading-[1.05] text-absolute-black">
                      −10% na 1ª encomenda
                    </h2>
                  </div>

                  <p className="font-mono text-[12px] tracking-wider text-absolute-black/70 leading-relaxed">
                    Junta-te à comunidade SOLARIS e recebe acesso antecipado às novas coleções.
                  </p>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                    <label htmlFor="popup-email" className="sr-only">
                      O teu endereço de email
                    </label>
                    <input
                      id="popup-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="o.teu@email.com"
                      required
                      autoComplete="email"
                      className="w-full border border-absolute-black/20 bg-transparent font-mono text-[13px] tracking-wider px-4 py-3 placeholder:text-absolute-black/50 focus:outline-none focus:border-absolute-black transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-absolute-black text-stark-white font-mono text-[12px] tracking-[0.35em] uppercase py-3.5 hover:bg-solar-yellow hover:text-absolute-black transition-colors duration-300 disabled:opacity-60"
                    >
                      {loading ? 'A enviar...' : 'Quero o desconto →'}
                    </button>
                    {error && (
                      <p className="font-mono text-[11px] text-red-600 tracking-wider">{error}</p>
                    )}
                  </form>

                  <p className="font-mono text-[11px] text-absolute-black/50 tracking-wider">
                    Sem spam · Cancelas quando quiseres
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <span className="font-serif text-4xl">☀</span>
                  <h3 className="font-serif font-light text-2xl text-absolute-black">Bem-vinda à família!</h3>
                  <p className="font-mono text-[12px] tracking-wider text-absolute-black/70">
                    O teu código chega por email em breve.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
