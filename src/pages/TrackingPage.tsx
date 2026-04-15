'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

// â"€â"€â"€ Tipos â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

interface Order {
  order_number: string;
  customer_name: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | string;
  tracking_number: string | null;
  tracking_url: string | null;
  carrier: string | null;
  items: any[];
  total_amount: number;
  currency: string;
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
}

// â"€â"€â"€ Mapa de estados â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const STATUS_STEPS = [
  { key: 'pending',    label: 'Encomenda Recebida', icon: 'âœ"', desc: 'Pagamento confirmado' },
  { key: 'processing', label: 'A Preparar',          icon: '⟳', desc: 'O fornecedor está a preparar a encomenda' },
  { key: 'shipped',    label: 'Em Tr¢nsito',          icon: '←’', desc: 'A caminho de ti' },
  { key: 'delivered',  label: 'Entregue',             icon: '★', desc: 'Encomenda entregue' },
];

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  payment_received: 0,
  processing: 1,
  shipped: 2,
  in_transit: 2,
  delivered: 3,
};

function getStepIndex(status: string): number {
  return STATUS_ORDER[status.toLowerCase()] ?? 0;
}

// â"€â"€â"€ Componente Timeline â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function Timeline({ status }: { status: string }) {
  const currentStep = getStepIndex(status);

  return (
    <div className="relative flex flex-col gap-0 my-8">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentStep;
        const active = i === currentStep;

        return (
          <div key={step.key} className="flex items-start gap-5">
            {/* Linha vertical + ícone */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.12, duration: 0.4, ease: 'backOut' }}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 z-10
                  ${done
                    ? active
                      ? 'bg-deep-night text-solar-yellow shadow-[0_0_0_4px_rgba(244,166,35,0.25)]'
                      : 'bg-solar-yellow text-absolute-black'
                    : 'bg-bleached-concrete/50 text-[#7A6752]'
                  }`}
              >
                {step.icon}
              </motion.div>
              {i < STATUS_STEPS.length - 1 && (
                <div className="w-px flex-1 my-1" style={{ minHeight: 36 }}>
                  <motion.div
                    className="w-full h-full bg-solar-yellow origin-top"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: done ? 1 : 0 }}
                    transition={{ delay: i * 0.12 + 0.2, duration: 0.5, ease: 'easeOut' }}
                    style={{ background: done ? '#F4A623' : '#E8D5B7', width: 2, margin: '0 auto' }}
                  />
                </div>
              )}
            </div>

            {/* Texto */}
            <div className={`pt-2 pb-8 ${i === STATUS_STEPS.length - 1 ? 'pb-0' : ''}`}>
              <p className={`font-mono text-[13px] tracking-[0.3em] uppercase mb-1 ${done ? 'text-absolute-black' : 'text-[#7A6752]'}`}>
                {step.label}
              </p>
              <p className={`text-sm ${active ? 'text-[#7A6752]' : 'text-absolute-black/40'}`}>
                {step.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// â"€â"€â"€ Página Principal â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export default function TrackingPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      // Procura por nº de encomenda ou email
      const isEmail = q.includes('@');

      const { data, error: dbError } = await supabase
        .from('orders')
        .select('order_number, customer_name, status, tracking_number, tracking_url, carrier, items, total_amount, currency, created_at, shipped_at, delivered_at')
        .eq(isEmail ? 'customer_email' : 'order_number', isEmail ? q.toLowerCase() : q.toUpperCase())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (dbError || !data) {
        setError('Encomenda não encontrada. Verifica o número ou o email.');
      } else {
        setOrder(data as Order);
      }
    } catch (err: any) {
      setError('Erro ao pesquisar. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('pt-PT', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-raw-linen text-absolute-black">

      {/* Header */}
      <header className="fixed top-0 left-0 w-full h-16 z-50 bg-raw-linen/90 backdrop-blur-md flex items-center justify-between px-8 md:px-16 border-b border-absolute-black/10">
        <Link
          to="/"
          className="font-serif text-sm tracking-[0.4em] uppercase hover:text-oxidized-gold transition-colors min-h-[44px] flex items-center"
        >
          ← Solaris
        </Link>
        <span className="font-mono text-[13px] tracking-[0.5em] uppercase text-absolute-black/50">
          Rastrear Encomenda
        </span>
        <div className="w-24" />
      </header>

      <main className="pt-16 min-h-screen flex flex-col">

        {/* Hero */}
        <div className="bg-deep-night px-8 md:px-16 py-16 md:py-24">
          <p className="font-mono text-[13px] tracking-[0.4em] uppercase text-solar-yellow mb-4">
            Tracking
          </p>
          <h1 className="font-serif text-[clamp(2.5rem,6vw,5rem)] font-light text-white leading-none mb-4">
            A tua<br /><em className="text-solar-yellow">encomenda.</em>
          </h1>
          <p className="font-mono text-xs tracking-widest uppercase text-white/70 max-w-xs">
            Introduz o nº de encomenda (ex: SOL-XXXXXXXX) ou o teu email
          </p>

          {/* Formulário de pesquisa */}
          <form onSubmit={handleSearch} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="SOL-XXXXXXXX ou email@exemplo.com"
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/30 font-mono text-sm px-5 py-4 focus:outline-none focus:border-solar-yellow transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-solar-yellow text-absolute-black font-mono text-xs tracking-[0.3em] uppercase px-8 py-4 hover:bg-solar-yellow-pale transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {loading ? '...' : 'Rastrear ←’'}
            </button>
          </form>
        </div>

        {/* Resultado */}
        <div className="flex-1 px-8 md:px-16 py-12 max-w-3xl mx-auto w-full">

          <AnimatePresence mode="wait">

            {/* Erro */}
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-[#FDECEA] border border-[#F5B7B1] px-6 py-5 flex gap-4 items-start"
              >
                <span className="text-[#C0392B] text-lg leading-none mt-0.5">✕</span>
                <div>
                  <p className="font-mono text-xs tracking-widest uppercase text-[#C0392B] mb-1">Não encontrado</p>
                  <p className="text-sm text-[#7A6752]">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Resultado da encomenda */}
            {order && (
              <motion.div
                key="order"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                {/* Cabeçalho da encomenda */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-absolute-black/15">
                  <div>
                    <p className="font-mono text-[13px] tracking-[0.3em] uppercase text-[#7A6752] mb-1">Encomenda</p>
                    <p className="font-serif text-2xl font-light">#{order.order_number}</p>
                    <p className="font-mono text-xs text-[#7A6752] mt-1">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[13px] tracking-[0.3em] uppercase text-[#7A6752] mb-1">Total</p>
                    <p className="font-serif text-2xl font-light text-oxidized-gold">
                      {order.currency === 'EUR' ? '€' : order.currency}{Number(order.total_amount).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Timeline de estados */}
                <Timeline status={order.status} />

                {/* Tracking box "" só aparece se shipped */}
                {order.tracking_number && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white border-2 border-solar-yellow p-6 mb-8"
                  >
                    <p className="font-mono text-[13px] tracking-[0.3em] uppercase text-[#7A6752] mb-2">
                      {order.carrier ? `Transportadora: ${order.carrier}` : 'Número de Tracking'}
                    </p>
                    <p className="font-serif text-2xl font-light text-absolute-black mb-4 tracking-wider">
                      {order.tracking_number}
                    </p>
                    <a
                      href={order.tracking_url || `https://t.17track.net/en#nums=${order.tracking_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 bg-absolute-black text-solar-yellow font-mono text-xs tracking-[0.3em] uppercase px-6 py-3 hover:bg-deep-night transition-colors"
                    >
                      Rastrear no transportador ←’
                    </a>
                    {order.shipped_at && (
                      <p className="font-mono text-[13px] text-[#7A6752] mt-4">
                        Enviado em: {formatDate(order.shipped_at)}
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Itens da encomenda */}
                {Array.isArray(order.items) && order.items.length > 0 && (
                  <div className="mb-8">
                    <p className="font-mono text-[13px] tracking-[0.3em] uppercase text-[#7A6752] mb-4">Artigos</p>
                    <div className="flex flex-col gap-3">
                      {order.items.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-absolute-black/15 last:border-0">
                          <div className="flex items-center gap-4">
                            {item.price?.product?.images?.[0] && (
                              <img loading="lazy" decoding="async"
                                src={item.price.product.images[0]}
                                alt={item.description}
                                className="w-12 h-12 object-cover bg-bleached-concrete/50"
                              />
                            )}
                            <div>
                              <p className="text-sm font-medium text-absolute-black">
                                {item.description || item.price?.product?.name || 'Produto SOLARIS'}
                              </p>
                              <p className="font-mono text-[13px] text-[#7A6752]">×{item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-serif text-base text-absolute-black">
                            €{((item.amount_total || 0) / 100).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Datas */}
                {order.delivered_at && (
                  <div className="bg-[#D8F3DC] border border-[#2D6A4F]/20 px-6 py-4 mb-6">
                    <p className="font-mono text-[13px] tracking-[0.3em] uppercase text-[#2D6A4F] mb-1">Entregue em</p>
                    <p className="text-sm text-[#2D6A4F] font-medium">{formatDate(order.delivered_at)}</p>
                  </div>
                )}

                {/* Ajuda */}
                <div className="bg-raw-linen border border-absolute-black/15 px-6 py-5">
                  <p className="font-mono text-[13px] tracking-[0.3em] uppercase text-[#7A6752] mb-2">Precisas de ajuda?</p>
                  <p className="text-sm text-[#7A6752]">
                    Contacta-nos em{' '}
                    <a href="mailto:edmar@pakkaz.com" className="text-oxidized-gold hover:underline">
                      edmar@pakkaz.com
                    </a>
                    {' '}ou via{' '}
                    <a
                      href="https://wa.me/351000000000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-oxidized-gold hover:underline"
                    >
                      WhatsApp
                    </a>
                    . Temos 30 dias de política de devoluções.
                  </p>
                </div>

              </motion.div>
            )}

            {/* Estado inicial "" sem pesquisa */}
            {!order && !error && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                <p className="font-serif text-6xl text-[#E8D5B7] mb-4">☀</p>
                <p className="font-mono text-[13px] tracking-[0.3em] uppercase text-[#7A6752]">
                  Introduz o nº de encomenda ou email para rastrear
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
