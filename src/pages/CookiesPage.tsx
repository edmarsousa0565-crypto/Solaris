'use client';

import { Link } from 'react-router-dom';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#FAF5EF] font-sans text-[#1C1410]">

      {/* Header */}
      <header className="bg-[#1C1410] px-8 md:px-16 py-6 flex items-center justify-between">
        <Link to="/" className="font-serif text-2xl tracking-[6px] text-[#F4A623] font-light">
          SOLARIS
        </Link>
        <Link
          to="/"
          className="font-mono text-xs uppercase tracking-widest text-white/80 hover:text-[#F4A623] transition-colors"
        >
          ← Voltar
        </Link>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-8 py-16 md:py-24">

        <p className="font-mono text-xs uppercase tracking-[3px] text-[#C17D0E] mb-4">Legal</p>
        <h1 className="font-serif text-4xl md:text-5xl font-light leading-tight mb-4">
          Política de Cookies
        </h1>
        <p className="font-mono text-xs text-[#7A6752] mb-16">
          šltima atualização: Abril 2026
        </p>

        <div className="space-y-12 text-[13px] leading-relaxed text-[#3D3128]">

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">1. O que são Cookies?</h2>
            <p>
              Cookies são pequenos ficheiros de texto guardados no seu dispositivo quando visita um website.
              Permitem que o site "recorde" as suas preferências e comportamentos entre visitas, melhorando
              a sua experiência de navegação.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">2. Cookies que Utilizamos</h2>

            <div className="space-y-6 mt-4">

              {/* Necessários */}
              <div className="bg-white border border-[#E8D5B7] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-[#2D6A4F] text-white font-mono text-[13px] uppercase tracking-wider px-3 py-1 rounded-full">
                    Obrigatórios
                  </span>
                  <span className="font-mono text-xs text-[#7A6752]">Sempre ativos</span>
                </div>
                <h3 className="font-semibold text-[#1C1410] mb-2">Cookies Estritamente Necessários</h3>
                <p className="text-sm">
                  Essenciais para o funcionamento do website. Incluem cookies de sessão, autenticação e
                  carrinho de compras. Não podem ser desativados.
                </p>
                <div className="mt-3 space-y-1 text-xs text-[#7A6752]">
                  <p><code className="bg-[#FAF5EF] px-1 rounded">session_id</code> "" sessão do utilizador (sessão)</p>
                  <p><code className="bg-[#FAF5EF] px-1 rounded">cart</code> "" conteúdo do carrinho (7 dias)</p>
                  <p><code className="bg-[#FAF5EF] px-1 rounded">stripe_sid</code> "" sessão de pagamento Stripe (sessão)</p>
                </div>
              </div>

              {/* Analytics */}
              <div className="bg-white border border-[#E8D5B7] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-[#1A5276] text-white font-mono text-[13px] uppercase tracking-wider px-3 py-1 rounded-full">
                    Analytics
                  </span>
                  <span className="font-mono text-xs text-[#7A6752]">Requerem consentimento</span>
                </div>
                <h3 className="font-semibold text-[#1C1410] mb-2">Cookies de Análise</h3>
                <p className="text-sm">
                  Permitem-nos compreender como os visitantes interagem com o website,
                  quais as páginas mais visitadas e detetar erros. Os dados são anonimizados.
                </p>
                <div className="mt-3 space-y-1 text-xs text-[#7A6752]">
                  <p><code className="bg-[#FAF5EF] px-1 rounded">_ga</code> "" Google Analytics (2 anos)</p>
                  <p><code className="bg-[#FAF5EF] px-1 rounded">_ga_*</code> "" Google Analytics (2 anos)</p>
                </div>
              </div>

              {/* Marketing */}
              <div className="bg-white border border-[#E8D5B7] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-[#C17D0E] text-white font-mono text-[13px] uppercase tracking-wider px-3 py-1 rounded-full">
                    Marketing
                  </span>
                  <span className="font-mono text-xs text-[#7A6752]">Requerem consentimento</span>
                </div>
                <h3 className="font-semibold text-[#1C1410] mb-2">Cookies de Marketing</h3>
                <p className="text-sm">
                  Utilizados para mostrar anúncios relevantes e medir a eficácia das nossas campanhas
                  no Meta (Instagram/Facebook).
                </p>
                <div className="mt-3 space-y-1 text-xs text-[#7A6752]">
                  <p><code className="bg-[#FAF5EF] px-1 rounded">_fbp</code> "" Meta Pixel (3 meses)</p>
                  <p><code className="bg-[#FAF5EF] px-1 rounded">_fbc</code> "" Meta click ID (2 anos)</p>
                </div>
              </div>

            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">3. Como Gerir os Cookies</h2>
            <p>
              Pode gerir ou desativar cookies a qualquer momento através das definições do seu browser:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li><strong>Google Chrome:</strong> Definições ←’ Privacidade e segurança ←’ Cookies</li>
              <li><strong>Firefox:</strong> Opções ←’ Privacidade e segurança ←’ Cookies</li>
              <li><strong>Safari:</strong> Preferências ←’ Privacidade ←’ Cookies</li>
              <li><strong>Edge:</strong> Definições ←’ Cookies e permissões do site</li>
            </ul>
            <p className="mt-3 text-sm bg-[#FDECEA] border-l-4 border-[#C0392B] p-4 rounded-r-lg">
              <strong>Atenção:</strong> A desativação de cookies necessários pode prejudicar o funcionamento
              do website, incluindo o carrinho de compras e o checkout.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">4. Cookies de Terceiros</h2>
            <p>
              Alguns cookies são colocados por serviços de terceiros que aparecem nas nossas páginas.
              Não controlamos esses cookies "" consulte as políticas de privacidade dos respetivos
              fornecedores:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>Stripe "" stripe.com/privacy</li>
              <li>Google Analytics "" policies.google.com/privacy</li>
              <li>Meta "" facebook.com/privacy/policy</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">5. Base Legal</h2>
            <p>
              A utilização de cookies no website SOLARIS está em conformidade com a Lei n.º 41/2004
              (transpõe a Diretiva ePrivacy) e com o RGPD. Os cookies estritamente necessários são
              utilizados com base no interesse legítimo; os restantes apenas após consentimento explícito.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">6. Contacto</h2>
            <p>
              Para questões sobre cookies e privacidade:<br />
              <a href="mailto:edmar@pakkaz.com" className="text-[#C17D0E] underline">edmar@pakkaz.com</a>
            </p>
          </section>

        </div>
      </main>

      {/* Footer simples */}
      <footer className="bg-[#1C1410] px-8 md:px-16 py-8 mt-16">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-xs text-white/60">© 2026 SOLARIS. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link to="/privacidade" className="font-mono text-xs text-white/60 hover:text-[#F4A623] transition-colors">Privacidade</Link>
            <Link to="/termos" className="font-mono text-xs text-white/60 hover:text-[#F4A623] transition-colors">Termos</Link>
            <Link to="/devolucoes" className="font-mono text-xs text-white/60 hover:text-[#F4A623] transition-colors">Devoluções</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
