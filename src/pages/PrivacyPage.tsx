'use client';

import { Link } from 'react-router-dom';

export default function PrivacyPage() {
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
          Política de Privacidade
        </h1>
        <p className="font-mono text-xs text-[#7A6752] mb-16">
          šltima atualização: Abril 2026
        </p>

        <div className="space-y-12 text-[13px] leading-relaxed text-[#3D3128]">

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">1. Responsável pelo Tratamento</h2>
            <p>
              A <strong>SOLARIS</strong> é responsável pelo tratamento dos dados pessoais recolhidos através
              deste website. Para quaisquer questões relacionadas com a proteção dos seus dados, pode
              contactar-nos através do email <a href="mailto:edmar@pakkaz.com" className="text-[#C17D0E] underline">edmar@pakkaz.com</a>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">2. Dados Recolhidos</h2>
            <p>Recolhemos os seguintes dados pessoais:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li><strong>Dados de identificação:</strong> nome completo, endereço de email</li>
              <li><strong>Dados de contacto:</strong> endereço postal, número de telefone (opcional)</li>
              <li><strong>Dados de encomenda:</strong> produtos adquiridos, histórico de compras</li>
              <li><strong>Dados de pagamento:</strong> processados exclusivamente pela Stripe "" não armazenamos dados de cartão</li>
              <li><strong>Dados de navegação:</strong> endereço IP, tipo de browser, páginas visitadas (via cookies)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">3. Finalidade e Base Legal</h2>
            <div className="space-y-4">
              <div className="border-l-2 border-[#E8D5B7] pl-4">
                <p className="font-semibold text-[#1C1410] mb-1">Execução do contrato</p>
                <p>Processamento de encomendas, envio de produtos, faturação e suporte pós-venda.</p>
              </div>
              <div className="border-l-2 border-[#E8D5B7] pl-4">
                <p className="font-semibold text-[#1C1410] mb-1">Interesse legítimo</p>
                <p>Melhoria do website, prevenção de fraude, análise de comportamento de compra.</p>
              </div>
              <div className="border-l-2 border-[#E8D5B7] pl-4">
                <p className="font-semibold text-[#1C1410] mb-1">Consentimento</p>
                <p>Envio de newsletters e comunicações de marketing (pode retirar o consentimento a qualquer momento).</p>
              </div>
              <div className="border-l-2 border-[#E8D5B7] pl-4">
                <p className="font-semibold text-[#1C1410] mb-1">Obrigação legal</p>
                <p>Cumprimento de obrigações fiscais e contabilísticas previstas na legislação portuguesa.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">4. Partilha com Terceiros</h2>
            <p>Os seus dados são partilhados apenas com os seguintes parceiros, estritamente necessários para a prestação do serviço:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li><strong>Stripe</strong> "" processamento de pagamentos (política em stripe.com)</li>
              <li><strong>CJdropshipping</strong> "" fulfillment e envio de encomendas</li>
              <li><strong>Printful</strong> "" produção e envio de artigos personalizados</li>
              <li><strong>Supabase</strong> "" armazenamento seguro de dados (servidores UE)</li>
            </ul>
            <p className="mt-3">Não vendemos, alugamos nem partilhamos os seus dados com terceiros para fins de marketing.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">5. Conservação dos Dados</h2>
            <p>
              Os dados de encomenda são conservados durante <strong>10 anos</strong> para cumprimento de obrigações fiscais.
              Os dados de marketing são eliminados imediatamente após a retirada do consentimento.
              Os dados de navegação são conservados durante <strong>13 meses</strong>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">6. Os Seus Direitos (RGPD)</h2>
            <p>Ao abrigo do Regulamento Geral sobre a Proteção de Dados (RGPD), tem os seguintes direitos:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li><strong>Acesso</strong> "" solicitar uma cópia dos seus dados pessoais</li>
              <li><strong>Retificação</strong> "" corrigir dados incorretos ou incompletos</li>
              <li><strong>Apagamento</strong> "" solicitar a eliminação dos seus dados ("direito a ser esquecido")</li>
              <li><strong>Portabilidade</strong> "" receber os seus dados num formato legível por máquina</li>
              <li><strong>Oposição</strong> "" opor-se ao tratamento para fins de marketing</li>
              <li><strong>Limitação</strong> "" solicitar a suspensão do tratamento em determinadas circunst¢ncias</li>
            </ul>
            <p className="mt-4">
              Para exercer qualquer destes direitos, contacte-nos em <a href="mailto:edmar@pakkaz.com" className="text-[#C17D0E] underline">edmar@pakkaz.com</a>.
              Tem ainda o direito de apresentar uma reclamação   <strong>CNPD</strong> (Comissão Nacional de Proteção de Dados) em cnpd.pt.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">7. Transferências Internacionais</h2>
            <p>
              Os dados são tratados maioritariamente dentro da União Europeia. Quando existem
              transferências para países terceiros (ex: servidores CJdropshipping), asseguramos que
              existem garantias adequadas nos termos do artigo 46.º do RGPD.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">8. Segurança</h2>
            <p>
              Implementamos medidas técnicas e organizativas adequadas para proteger os seus dados contra
              acesso não autorizado, perda ou destruição, incluindo encriptação SSL/TLS em todas as
              comunicações e armazenamento encriptado de dados sensíveis.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">9. Contacto</h2>
            <p>
              Para qualquer questão sobre esta política ou sobre o tratamento dos seus dados:<br />
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
            <Link to="/termos" className="font-mono text-xs text-white/60 hover:text-[#F4A623] transition-colors">Termos</Link>
            <Link to="/devolucoes" className="font-mono text-xs text-white/60 hover:text-[#F4A623] transition-colors">Devoluções</Link>
            <Link to="/cookies" className="font-mono text-xs text-white/60 hover:text-[#F4A623] transition-colors">Cookies</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
