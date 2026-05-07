'use client';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('solaris-cookie-consent');
    if (!consent) {
      // Mostra o banner apos 1.5s para nao competir com outros elementos
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('solaris-cookie-consent', 'accepted');
    setVisible(false);
    // Notifica App para inicializar analytics agora
    window.dispatchEvent(new Event('solaris-cookie-accepted'));
  };

  const reject = () => {
    localStorage.setItem('solaris-cookie-consent', 'rejected');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 md:bottom-6 left-0 md:left-6 right-0 md:right-auto z-[300] md:max-w-md bg-deep-night text-stark-white shadow-2xl"
          role="dialog"
          aria-label="Aviso de cookies"
          aria-modal="false"
        >
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] tracking-[0.5em] uppercase text-solar-yellow mb-2">
                  Cookies
                </p>
                <p className="font-mono text-[13px] text-stark-white/70 leading-relaxed">
                  Usamos cookies para melhorar a tua experiencia e analisar o trafego do site. Podes aceitar todos ou so os essenciais.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={accept}
                className="flex-1 bg-solar-yellow text-absolute-black font-mono text-[13px] tracking-[0.3em] uppercase py-3 hover:bg-solar-yellow/90 transition-colors min-h-[44px]"
              >
                Aceitar
              </button>
              <button
                onClick={reject}
                className="flex-1 border border-stark-white/20 text-stark-white/60 font-mono text-[13px] tracking-[0.3em] uppercase py-3 hover:border-stark-white/50 hover:text-stark-white transition-colors min-h-[44px]"
              >
                Recusar
              </button>
            </div>

            <Link
              to="/cookies"
              onClick={reject}
              className="font-mono text-[11px] tracking-widest uppercase text-stark-white/30 hover:text-stark-white/60 transition-colors text-center"
            >
              Politica de cookies →
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
