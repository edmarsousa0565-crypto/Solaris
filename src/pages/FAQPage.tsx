import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const faqs = [
  {
    category: 'Encomendas',
    items: [
      {
        q: 'Como faço uma encomenda?',
        a: 'Adiciona os produtos ao carrinho, escolhe o tamanho e clica em "Finalizar compra". O pagamento é processado de forma segura pela Stripe. Receberás um email de confirmação em minutos.',
      },
      {
        q: 'Posso alterar ou cancelar a minha encomenda?',
        a: 'Tens uma janela de 1 hora após o pagamento para solicitar alterações ou cancelamento. Após esse período, a encomenda já foi enviada ao fornecedor e não é possível alterar. Contacta-nos imediatamente em geral@solaris.pt.',
      },
      {
        q: 'Qual é o número mínimo de encomenda?',
        a: 'Não há mínimo. Podes encomendar uma única peça.',
      },
      {
        q: 'Os preços incluem IVA?',
        a: 'Sim. Todos os preços apresentados já incluem IVA à taxa legal em vigor em Portugal.',
      },
    ],
  },
  {
    category: 'Envios e Entregas',
    items: [
      {
        q: 'Quanto tempo demora a entrega?',
        a: 'Portugal Continental: 7–12 dias úteis. Ilhas (Açores/Madeira): 10–18 dias úteis. Europa: 10–18 dias úteis. Brasil e Angola: 12–25 dias úteis. Estes prazos contam a partir do despacho, não do pagamento.',
      },
      {
        q: 'O envio é gratuito?',
        a: 'Sim, para encomendas acima de €60 em Portugal Continental. Para encomendas de menor valor e destinos internacionais, aplica-se uma taxa de €4,99–€7,99, calculada no checkout.',
      },
      {
        q: 'Posso rastrear a minha encomenda?',
        a: 'Sim. Receberás um email com o número de rastreio assim que a encomenda for despachada. Podes também usar a página /tracking do nosso site.',
      },
      {
        q: 'Entregam para o meu país?',
        a: 'Entregamos para Portugal, Brasil, Angola e toda a Europa. Se o teu país não estiver na lista do checkout, contacta-nos e tentamos encontrar uma solução.',
      },
    ],
  },
  {
    category: 'Devoluções e Trocas',
    items: [
      {
        q: 'Qual é a política de devoluções?',
        a: 'Tens 14 dias após a recepção para devolver qualquer artigo em perfeito estado, com etiquetas, na embalagem original. Consulta a página de Devoluções para o processo completo.',
      },
      {
        q: 'A devolução é gratuita?',
        a: 'Os custos de devolução são da responsabilidade do cliente, excepto em casos de artigo com defeito ou erro de envio, onde assumimos os custos na totalidade.',
      },
      {
        q: 'Em quanto tempo recebo o reembolso?',
        a: 'Após recebermos o artigo e confirmarmos as condições, o reembolso é processado em 5–10 dias úteis para o método de pagamento original.',
      },
    ],
  },
  {
    category: 'Produtos e Tamanhos',
    items: [
      {
        q: 'Como escolho o tamanho certo?',
        a: 'Cada produto tem uma tabela de medidas na página de detalhes. Em caso de dúvida entre dois tamanhos, recomendamos o maior — as nossas peças têm geralmente corte fluido.',
      },
      {
        q: 'Os produtos são autênticos?',
        a: 'Sim. Trabalhamos directamente com fornecedores certificados (CJ Dropshipping, Matterhorn, Eprolo) que cumprem os nossos padrões de qualidade.',
      },
      {
        q: 'Como cuido das peças SOLARIS?',
        a: 'As instruções de cuidado estão na etiqueta de cada peça. Geralmente recomendamos lavagem a frio (30°C) e secagem natural para preservar a forma e a cor.',
      },
    ],
  },
  {
    category: 'Pagamentos e Segurança',
    items: [
      {
        q: 'Que métodos de pagamento aceitam?',
        a: 'Cartão de crédito/débito (Visa, Mastercard, American Express), MB WAY, e outros métodos disponíveis na Stripe conforme o teu país.',
      },
      {
        q: 'É seguro pagar no vosso site?',
        a: 'Sim. Os pagamentos são processados pela Stripe, líder global em pagamentos online com certificação PCI-DSS nível 1. Não armazenamos dados de cartão no nosso servidor.',
      },
      {
        q: 'Posso usar um código de desconto?',
        a: 'Sim. Se subscreveste a nossa newsletter, recebeste um código de 10% de desconto na primeira compra. O campo para inserir o código aparece no checkout.',
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-absolute-black/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-6"
        aria-expanded={open}
      >
        <span className="font-mono text-[13px] uppercase tracking-widest text-absolute-black">{q}</span>
        <span className="font-mono text-lg text-absolute-black/40 shrink-0 transition-transform duration-300" style={{ transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      {open && (
        <p className="font-mono text-[13px] leading-relaxed text-absolute-black/60 pb-5 pr-8">
          {a}
        </p>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      <Helmet>
        <title>FAQ — Perguntas Frequentes SOLARIS</title>
        <meta name="description" content="Respostas às perguntas mais frequentes sobre encomendas, envios, devoluções e produtos SOLARIS." />
      </Helmet>

      <div className="min-h-screen bg-raw-linen">
        {/* Header */}
        <div className="bg-solar-yellow px-8 md:px-24 pt-28 pb-16">
          <div className="w-full h-[0.5px] bg-absolute-black/20 mb-12" />
          <h1 className="font-serif text-5xl md:text-7xl font-light tracking-widest uppercase leading-none">
            FAQ
          </h1>
          <p className="font-mono text-[13px] uppercase tracking-widest text-absolute-black/60 mt-4">
            Perguntas frequentes
          </p>
        </div>

        <div className="max-w-3xl mx-auto px-8 md:px-12 py-16 md:py-24 flex flex-col gap-16">
          {faqs.map(({ category, items }) => (
            <div key={category}>
              <h2 className="font-mono text-[13px] tracking-[0.4em] uppercase text-absolute-black/50 mb-6 pb-4 border-b border-absolute-black/10">
                {category}
              </h2>
              <div>
                {items.map(({ q, a }) => (
                  <FAQItem key={q} q={q} a={a} />
                ))}
              </div>
            </div>
          ))}

          {/* Não encontrou resposta */}
          <div className="bg-absolute-black p-8 md:p-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-stark-white/40 mb-3">Não encontraste o que procuras?</p>
            <p className="font-serif italic text-xl font-light text-stark-white mb-6">
              Fala connosco directamente.
            </p>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-3 bg-solar-yellow text-absolute-black font-mono text-xs tracking-[0.3em] uppercase px-8 py-4 hover:bg-solar-yellow/80 transition-colors"
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
