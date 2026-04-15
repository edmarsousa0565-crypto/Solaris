import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const sections = [
  {
    title: 'Prazos de Entrega',
    content: [
      { label: 'Portugal Continental', value: '7–12 dias úteis' },
      { label: 'Portugal Ilhas (Açores / Madeira)', value: '10–18 dias úteis' },
      { label: 'Brasil', value: '12–20 dias úteis' },
      { label: 'Angola', value: '14–25 dias úteis' },
      { label: 'Europa (ES, FR, DE, NL, BE, IT, GB)', value: '10–18 dias úteis' },
    ],
    note: 'Os prazos são estimativas e contam a partir do momento em que a tua encomenda é despachada pelo nosso parceiro logístico. Períodos de grande procura (ex: Black Friday, Natal) podem implicar ligeiro atraso.',
  },
  {
    title: 'Custos de Envio',
    content: [
      { label: 'Portugal Continental', value: 'Gratuito em encomendas acima de €60 · €4,99 abaixo' },
      { label: 'Resto do Mundo', value: '€7,99 (tarifa única)' },
    ],
    note: 'O custo de envio é calculado automaticamente no checkout.',
  },
  {
    title: 'Rastreamento',
    content: [
      { label: 'Confirmação', value: 'Email imediato após pagamento' },
      { label: 'Despacho', value: 'Email com número de rastreio em 1–3 dias' },
      { label: 'Acompanhamento', value: 'Disponível em solaris-drab.vercel.app/tracking' },
    ],
    note: 'Se não receberes o email de confirmação, verifica a pasta de spam ou contacta-nos.',
  },
  {
    title: 'Informações Importantes',
    bullets: [
      'As encomendas são processadas em dias úteis (segunda a sexta, exceto feriados).',
      'Após pagamento, tens uma janela de 1 hora para cancelar ou alterar a encomenda.',
      'Não nos responsabilizamos por atrasos causados por alfândegas ou transportadoras.',
      'Para encomendas internacionais, podem ser cobradas taxas aduaneiras adicionais pelo país de destino — de responsabilidade do destinatário.',
      'Se a embalagem chegar danificada, fotografa antes de abrir e contacta-nos no prazo de 48 horas.',
    ],
  },
];

export default function ShippingPage() {
  return (
    <>
      <Helmet>
        <title>Política de Envios — SOLARIS</title>
        <meta name="description" content="Prazos, custos de envio e rastreamento de encomendas SOLARIS. Entregas para Portugal, Brasil, Angola e Europa." />
      </Helmet>

      <div className="min-h-screen bg-raw-linen">
        {/* Header */}
        <div className="bg-solar-yellow px-8 md:px-24 pt-28 pb-16">
          <div className="w-full h-[0.5px] bg-absolute-black/20 mb-12" />
          <h1 className="font-serif text-5xl md:text-7xl font-light tracking-widest uppercase leading-none">
            Envios
          </h1>
          <p className="font-mono text-[13px] uppercase tracking-widest text-absolute-black/60 mt-4">
            Informações sobre entrega e rastreamento
          </p>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-8 md:px-12 py-16 md:py-24 flex flex-col gap-16">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="font-mono text-[13px] tracking-[0.4em] uppercase text-absolute-black/50 mb-6 pb-4 border-b border-absolute-black/10">
                {section.title}
              </h2>

              {section.content && (
                <div className="flex flex-col gap-4 mb-6">
                  {section.content.map(({ label, value }) => (
                    <div key={label} className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 py-3 border-b border-absolute-black/5">
                      <span className="font-mono text-[13px] uppercase tracking-widest text-absolute-black/70">{label}</span>
                      <span className="font-serif italic text-lg text-absolute-black">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {section.bullets && (
                <ul className="flex flex-col gap-3 mb-6">
                  {section.bullets.map((b, i) => (
                    <li key={i} className="flex gap-4 font-mono text-[13px] tracking-wide text-absolute-black/70 leading-relaxed">
                      <span className="text-oxidized-gold mt-0.5 shrink-0">—</span>
                      {b}
                    </li>
                  ))}
                </ul>
              )}

              {section.note && (
                <p className="font-mono text-[12px] tracking-wide text-absolute-black/40 leading-relaxed bg-bleached-concrete/30 px-4 py-3">
                  {section.note}
                </p>
              )}
            </div>
          ))}

          {/* Contact */}
          <div className="border border-absolute-black/10 p-8 flex flex-col gap-4">
            <h3 className="font-mono text-[11px] tracking-[0.4em] uppercase text-absolute-black/40">Ainda tens dúvidas?</h3>
            <p className="font-serif italic text-2xl font-light text-absolute-black">Estamos aqui para ajudar.</p>
            <a
              href="mailto:edmar@pakkaz.com"
              className="inline-block font-mono text-[13px] tracking-[0.3em] uppercase text-absolute-black border-b border-absolute-black/30 pb-1 hover:border-absolute-black transition-colors self-start"
            >
              edmar@pakkaz.com →
            </a>
          </div>

          <div className="flex gap-6 flex-wrap font-mono text-[11px] tracking-[0.3em] uppercase text-absolute-black/30">
            <Link to="/devolucoes" className="hover:text-absolute-black transition-colors">Devoluções</Link>
            <Link to="/privacidade" className="hover:text-absolute-black transition-colors">Privacidade</Link>
            <Link to="/termos" className="hover:text-absolute-black transition-colors">Termos</Link>
          </div>
        </div>
      </div>
    </>
  );
}
