'use client';

import { Link } from 'react-router-dom';

export default function ReturnsPage() {
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
          Política de Devoluções
        </h1>
        <p className="font-mono text-xs text-[#7A6752] mb-16">
          šltima atualização: Abril 2026
        </p>

        {/* Destaque do prazo */}
        <div className="bg-[#D8F3DC] border-l-4 border-[#2D6A4F] p-6 rounded-r-lg mb-12">
          <p className="font-semibold text-[#2D6A4F] text-lg">âœ" 30 dias para devolver</p>
          <p className="text-[#2D6A4F] text-sm mt-1">
            A SOLARIS oferece 30 dias para devolução (o dobro do mínimo legal europeu de 14 dias).
          </p>
        </div>

        <div className="space-y-12 text-[13px] leading-relaxed text-[#3D3128]">

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">1. Prazo de Devolução</h2>
            <p>
              Tem <strong>30 dias</strong> a contar da data de receção do produto para solicitar
              uma devolução, sem necessidade de justificação. Este prazo é superior ao mínimo
              legal de 14 dias estabelecido pelo Decreto-Lei n.º 24/2014.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">2. Condições de Devolução</h2>
            <p>Para que a devolução seja aceite, o produto deve:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>Estar no estado original, sem sinais de uso</li>
              <li>Ter todas as etiquetas intactas</li>
              <li>Estar na embalagem original (ou equivalente)</li>
              <li>Não ter sido lavado, alterado ou danificado</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">3. Como Iniciar uma Devolução</h2>
            <ol className="list-decimal list-inside space-y-3">
              <li>
                Envie um email para <a href="mailto:edmar@pakkaz.com" className="text-[#C17D0E] underline">edmar@pakkaz.com</a> com
                o assunto <strong>"Devolução "" [número de encomenda]"</strong>
              </li>
              <li>Aguarde confirmação e instruções de envio (resposta em até 48h)</li>
              <li>Embale o produto de forma segura e envie para a morada indicada</li>
              <li>Guarde o comprovativo de envio</li>
            </ol>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">4. Custos de Devolução</h2>
            <div className="space-y-4">
              <div className="border-l-2 border-[#2D6A4F] pl-4">
                <p className="font-semibold text-[#1C1410]">Produto com defeito ou erro de envio</p>
                <p className="text-sm mt-1">Custos de devolução totalmente suportados pela SOLARIS.</p>
              </div>
              <div className="border-l-2 border-[#E8D5B7] pl-4">
                <p className="font-semibold text-[#1C1410]">Arrependimento / tamanho errado</p>
                <p className="text-sm mt-1">Custos de devolução suportados pelo cliente.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">5. Reembolsos</h2>
            <p>
              Após receção e verificação do produto, o reembolso é processado no prazo de
              <strong> 14 dias</strong> através do mesmo método de pagamento utilizado na compra.
              Não são cobradas taxas de reembolso. O valor reembolsado inclui o preço do produto
              e os custos de envio originais (em caso de devolução total da encomenda).
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">6. Trocas</h2>
            <p>
              De momento não oferecemos trocas diretas. Para trocar por outro tamanho ou cor,
              sugerimos devolver o artigo original (seguindo o processo acima) e efetuar uma nova encomenda.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">7. Exceções</h2>
            <p>Não são aceites devoluções de:</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>Artigos personalizados ou feitos sob encomenda</li>
              <li>Artigos de higiene íntima (biquínis, roupa interior) por questões de saúde</li>
              <li>Artigos em promoção claramente identificados como "venda final"</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">8. Produtos com Defeito</h2>
            <p>
              Se receber um produto com defeito de fabrico, tem direito   reparação, substituição,
              redução de preço ou reembolso total ao abrigo da garantia legal de conformidade
              (3 anos). Contacte-nos imediatamente com fotos do defeito.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-light text-[#1C1410] mb-4">9. Contacto</h2>
            <p>
              Para qualquer dúvida sobre devoluções:<br />
              <a href="mailto:edmar@pakkaz.com" className="text-[#C17D0E] underline">edmar@pakkaz.com</a><br />
              Respondemos em até 48 horas úteis.
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
            <Link to="/cookies" className="font-mono text-xs text-white/60 hover:text-[#F4A623] transition-colors">Cookies</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
