import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const values = [
  {
    num: '01',
    title: 'Design com Intenção',
    body: 'Cada peça nasce de uma pergunta: vai durar? Não criamos tendências. Criamos peças que resistem ao tempo — no corte, no material, na ideia.',
  },
  {
    num: '02',
    title: 'Materiais que Respeitam',
    body: 'Linho, algodão orgânico, viscose ECOVERO. Escolhemos fornecedores com certificações OEKO-TEX® e GRS. A qualidade que sentes é inseparável da origem que não vês.',
  },
  {
    num: '03',
    title: 'Entregas para Toda a Europa',
    body: 'Trabalhámos com parceiros logísticos seleccionados para garantir que a tua encomenda chega em condições e no menor impacto possível.',
  },
  {
    num: '04',
    title: 'Transparência Total',
    body: 'Os nossos preços, margens e parceiros não são segredo. Se tiveres dúvidas sobre qualquer produto, escreve-nos — respondemos em 24 horas.',
  },
];

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>Sobre a SOLARIS — Moda Consciente Portuguesa</title>
        <meta name="description" content="Conheça a história e os valores da SOLARIS. Moda feminina portuguesa com design atemporal, materiais sustentáveis e entrega para toda a Europa." />
      </Helmet>

      <div className="min-h-screen bg-raw-linen">
        {/* Header */}
        <div className="bg-absolute-black px-8 md:px-24 pt-28 pb-16">
          <div className="w-full h-[0.5px] bg-stark-white/20 mb-12" />
          <h1 className="font-serif text-5xl md:text-7xl font-light tracking-widest uppercase leading-none text-stark-white">
            Sobre
          </h1>
          <p className="font-mono text-[13px] uppercase tracking-widest text-stark-white/50 mt-4">
            Quem somos e o que acreditamos
          </p>
        </div>

        <div className="max-w-3xl mx-auto px-8 md:px-12 py-16 md:py-24 flex flex-col gap-16">

          {/* Manifesto */}
          <div>
            <h2 className="font-mono text-[13px] tracking-[0.4em] uppercase text-absolute-black/50 mb-6 pb-4 border-b border-absolute-black/10">
              Manifesto
            </h2>
            <p className="font-serif italic text-2xl md:text-4xl font-light text-absolute-black leading-snug mb-8">
              "Veste-te de calma.<br />Roupa que respeita o teu tempo."
            </p>
            <p className="font-mono text-[13px] leading-relaxed text-absolute-black/70 mb-6">
              A SOLARIS nasceu da convicção de que moda consciente não é um nicho — é o único caminho que faz sentido. Num mercado saturado de fast fashion e novidades semanais, escolhemos o oposto: peças atemporais, produzidas com intenção, pensadas para durar.
            </p>
            <p className="font-mono text-[13px] leading-relaxed text-absolute-black/70">
              O nome vem do sol — presente em tudo o que fazemos. Nos tons quentes da paleta, nas texturas leves do linho de verão, na leveza que cada peça deve proporcionar a quem a usa.
            </p>
          </div>

          {/* Valores */}
          <div>
            <h2 className="font-mono text-[13px] tracking-[0.4em] uppercase text-absolute-black/50 mb-6 pb-4 border-b border-absolute-black/10">
              Os Nossos Valores
            </h2>
            <div className="flex flex-col gap-8">
              {values.map(({ num, title, body }) => (
                <div key={num} className="flex gap-6 py-6 border-b border-absolute-black/5">
                  <span className="font-mono text-[11px] text-absolute-black/30 mt-1 shrink-0">{num}</span>
                  <div>
                    <p className="font-mono text-[13px] uppercase tracking-widest text-absolute-black mb-3">{title}</p>
                    <p className="font-mono text-[13px] leading-relaxed text-absolute-black/60">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contacto CTA */}
          <div className="bg-solar-yellow p-8 md:p-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-absolute-black/50 mb-4">Fala connosco</p>
            <p className="font-serif italic text-2xl font-light text-absolute-black mb-6">
              Tens uma questão ou simplesmente queres dizer olá?
            </p>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-3 bg-absolute-black text-solar-yellow font-mono text-xs tracking-[0.3em] uppercase px-8 py-4 hover:bg-deep-night transition-colors"
            >
              Contactar →
            </Link>
          </div>

          <Link to="/" className="font-mono text-xs uppercase tracking-widest text-absolute-black/40 hover:text-absolute-black transition-colors">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </>
  );
}
