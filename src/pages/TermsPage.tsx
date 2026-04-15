'use client';

import { Link } from 'react-router-dom';

export default function TermsPage() {
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
          Termos e Condições
        </h1>
        <p className="font-mono text-xs text-[#7A6752] mb-16">
          šltima atualização: Abril 2026
        </p>

        <div className="space-y-12 text-[13px] leading-relaxed text-[#3D3128]">

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">1. Identificação</h2>
            <p>
              O presente website é operado pela <strong>SOLARIS</strong>, loja de moda feminina em modelo
              dropshipping, com contacto em <a href="mailto:edmar@pakkaz.com" className="text-[#C17D0E] underline">edmar@pakkaz.com</a>.
              Ao utilizar este website e efetuar compras, o utilizador aceita integralmente estes Termos e Condições.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">2. Encomendas</h2>
            <p>
              Ao submeter uma encomenda, o utilizador faz uma proposta de compra que a SOLARIS pode aceitar
              ou recusar. A confirmação da encomenda é enviada por email para o endereço indicado no momento
              da compra. A SOLARIS reserva-se o direito de cancelar encomendas em caso de erro de preço,
              indisponibilidade de stock ou suspeita de fraude.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">3. Preços e Pagamentos</h2>
            <p>
              Todos os preços apresentados incluem IVA   taxa legal em vigor. Os preços podem ser alterados
              sem aviso prévio, mas a encomenda é processada ao preço vigente no momento da compra.
            </p>
            <p className="mt-3">
              O pagamento é processado de forma segura pela <strong>Stripe</strong>. Aceitamos os
              principais cartões de débito e crédito (Visa, Mastercard, American Express) e MB WAY.
              A SOLARIS não armazena dados de pagamento.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">4. Entrega</h2>
            <p>Os prazos de entrega estimados são:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li><strong>Portugal Continental:</strong> 7""14 dias úteis</li>
              <li><strong>Ilhas (Açores/Madeira):</strong> 10""18 dias úteis</li>
              <li><strong>Brasil e Angola:</strong> 14""25 dias úteis</li>
            </ul>
            <p className="mt-3">
              Estes prazos são estimativas e podem variar devido a fatores externos (atrasos alfandegários,
              transportadoras). O envio é gratuito em encomendas acima de <strong>€49</strong>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">5. Direito de Arrependimento</h2>
            <p>
              Nos termos do Decreto-Lei n.º 24/2014, tem o direito de resolver o contrato sem indicação
              de motivo no prazo de <strong>14 dias</strong> a contar da receção do bem (a SOLARIS alarga
              este prazo para <strong>30 dias</strong> por cortesia comercial).
            </p>
            <p className="mt-3">
              Para exercer este direito, envie uma comunicação inequívoca para <a href="mailto:edmar@pakkaz.com" className="text-[#C17D0E] underline">edmar@pakkaz.com</a> antes do
              término do prazo. Os custos de devolução são suportados pelo cliente, salvo em caso de produto
              com defeito ou erro de envio.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">6. Conformidade e Garantias</h2>
            <p>
              Todos os produtos vendidos pela SOLARIS estão cobertos pela garantia legal de conformidade
              de <strong>3 anos</strong> prevista no Decreto-Lei n.º 84/2021 (para contratos celebrados
              após 1 de janeiro de 2022). Em caso de falta de conformidade, pode solicitar a reparação,
              substituição, redução de preço ou resolução do contrato.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">7. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo deste website "" incluindo textos, imagens, logótipos, design e código "" é
              propriedade da SOLARIS ou dos seus licenciantes e está protegido por direitos de autor.
              É proibida a reprodução total ou parcial sem autorização prévia por escrito.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">8. Responsabilidade</h2>
            <p>
              A SOLARIS não se responsabiliza por danos indiretos decorrentes da utilização do website ou
              de atrasos na entrega causados por terceiros (transportadoras, alf¢ndegas). A responsabilidade
              total da SOLARIS fica limitada ao valor da encomenda em causa.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">9. Resolução de Litígios</h2>
            <p>
              Em caso de litígio, pode recorrer ao Centro de Arbitragem de Conflitos de Consumo de Lisboa
              ou a outro centro de arbitragem de conflitos de consumo legalmente autorizado.
              Mais informações em <a href="https://www.consumidor.gov.pt" target="_blank" rel="noopener noreferrer" className="text-[#C17D0E] underline">consumidor.gov.pt</a>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">10. Lei Aplicável</h2>
            <p>
              Estes Termos e Condições são regidos pela lei portuguesa. Para a resolução de quaisquer
              conflitos é competente o tribunal da comarca do domicílio do consumidor.
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
            <Link to="/devolucoes" className="font-mono text-xs text-white/60 hover:text-[#F4A623] transition-colors">Devoluções</Link>
            <Link to="/cookies" className="font-mono text-xs text-white/60 hover:text-[#F4A623] transition-colors">Cookies</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
