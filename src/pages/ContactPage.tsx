'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const channels = [
  {
    label: 'Email Geral',
    value: 'geral@solaris.pt',
    href: 'mailto:geral@solaris.pt',
    desc: 'Encomendas, produtos, dúvidas gerais',
  },
  {
    label: 'Suporte a Encomendas',
    value: 'suporte@solaris.pt',
    href: 'mailto:suporte@solaris.pt',
    desc: 'Rastreamento, problemas, devoluções',
  },
  {
    label: 'Instagram',
    value: '@solaris.oficial',
    href: 'https://instagram.com/solaris.oficial',
    desc: 'DM para questões rápidas',
  },
  {
    label: 'Morada (RGPD)',
    value: 'Rua de Exemplo, 123 · 4000-000 Porto · Portugal',
    href: undefined,
    desc: 'Sede registada',
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'contact', data: form }),
      });
      if (!res.ok) throw new Error('Erro no envio');
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contacto — SOLARIS</title>
        <meta name="description" content="Contacta a equipa SOLARIS. Estamos disponíveis por email, Instagram ou através do formulário de contacto." />
      </Helmet>

      <div className="min-h-screen bg-raw-linen">
        {/* Header */}
        <div className="bg-absolute-black px-8 md:px-24 pt-28 pb-16">
          <div className="w-full h-[0.5px] bg-stark-white/20 mb-12" />
          <h1 className="font-serif text-5xl md:text-7xl font-light tracking-widest uppercase leading-none text-stark-white">
            Contacto
          </h1>
          <p className="font-mono text-[13px] uppercase tracking-widest text-stark-white/50 mt-4">
            Respondemos em 24 horas em dias úteis
          </p>
        </div>

        <div className="max-w-3xl mx-auto px-8 md:px-12 py-16 md:py-24 flex flex-col gap-16">

          {/* Canais */}
          <div>
            <h2 className="font-mono text-[13px] tracking-[0.4em] uppercase text-absolute-black/50 mb-6 pb-4 border-b border-absolute-black/10">
              Como nos encontrar
            </h2>
            <div className="flex flex-col">
              {channels.map(({ label, value, href, desc }) => (
                <div key={label} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 py-4 border-b border-absolute-black/5">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-absolute-black/40 mb-0.5">{label}</p>
                    <p className="font-mono text-[13px] text-absolute-black/60 text-xs">{desc}</p>
                  </div>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith('http') ? '_blank' : undefined}
                      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="font-serif italic text-lg text-absolute-black hover:text-oxidized-gold transition-colors"
                    >
                      {value}
                    </a>
                  ) : (
                    <span className="font-serif italic text-lg text-absolute-black">{value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Formulário */}
          <div>
            <h2 className="font-mono text-[13px] tracking-[0.4em] uppercase text-absolute-black/50 mb-6 pb-4 border-b border-absolute-black/10">
              Formulário de Contacto
            </h2>

            {status === 'sent' ? (
              <div className="bg-solar-yellow p-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-absolute-black/50 mb-2">Mensagem enviada</p>
                <p className="font-serif italic text-2xl font-light text-absolute-black">
                  Obrigado! Respondemos em 24 horas.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[11px] uppercase tracking-widest text-absolute-black/50">Nome</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="border border-absolute-black/20 bg-transparent px-4 py-3 font-mono text-[13px] text-absolute-black placeholder-absolute-black/30 focus:outline-none focus:border-absolute-black transition-colors"
                      placeholder="O teu nome"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[11px] uppercase tracking-widest text-absolute-black/50">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="border border-absolute-black/20 bg-transparent px-4 py-3 font-mono text-[13px] text-absolute-black placeholder-absolute-black/30 focus:outline-none focus:border-absolute-black transition-colors"
                      placeholder="o.teu@email.com"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[11px] uppercase tracking-widest text-absolute-black/50">Assunto</label>
                  <select
                    required
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="border border-absolute-black/20 bg-raw-linen px-4 py-3 font-mono text-[13px] text-absolute-black focus:outline-none focus:border-absolute-black transition-colors"
                  >
                    <option value="">Seleccionar assunto</option>
                    <option value="encomenda">Questão sobre encomenda</option>
                    <option value="devolucao">Devolução / Troca</option>
                    <option value="produto">Dúvida sobre produto</option>
                    <option value="pagamento">Pagamento</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[11px] uppercase tracking-widest text-absolute-black/50">Mensagem</label>
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="border border-absolute-black/20 bg-transparent px-4 py-3 font-mono text-[13px] text-absolute-black placeholder-absolute-black/30 focus:outline-none focus:border-absolute-black transition-colors resize-none"
                    placeholder="Descreve a tua questão..."
                  />
                </div>

                {status === 'error' && (
                  <p className="font-mono text-[12px] text-red-600 uppercase tracking-widest">
                    Erro no envio. Tenta enviar um email directamente para geral@solaris.pt
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="self-start bg-absolute-black text-solar-yellow font-mono text-xs tracking-[0.3em] uppercase px-10 py-4 hover:bg-deep-night transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? 'A enviar...' : 'Enviar Mensagem →'}
                </button>
              </form>
            )}
          </div>

          <Link to="/" className="font-mono text-xs uppercase tracking-widest text-absolute-black/40 hover:text-absolute-black transition-colors">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </>
  );
}
