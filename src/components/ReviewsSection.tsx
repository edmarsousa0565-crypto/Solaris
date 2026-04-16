'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const REVIEWS = [
  {
    id: 1,
    name: 'Ana Oliveira',
    location: 'Lisboa',
    rating: 5,
    text: 'Recebi o vestido em 8 dias e a qualidade superou as minhas expectativas. O tecido é leve e perfeito para o verão. Já fiz o segundo pedido!',
    product: 'Vestido Linho Fluido',
    photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Mariana Costa',
    location: 'Porto',
    rating: 5,
    text: 'Adorei o conjunto! As fotos são completamente fiéis ao produto. O atendimento foi impecável e a embalagem muito cuidada. Recomendo a 100%.',
    product: 'Conjunto Coordenado',
    photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Sofia Mendes',
    location: 'Braga',
    rating: 5,
    text: 'A bolsa de palha é ainda mais bonita ao vivo. Já recebi tantos elogios! O envio foi rápido e bem embalado. Loja de total confiança.',
    product: 'Mini Shoulder Bag',
    photo: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 4,
    name: 'Catarina Ferreira',
    location: 'Faro',
    rating: 5,
    text: 'O kimono é lindo "" uso na praia e nas saídas   noite. Parece muito mais caro do que é. Definitivamente vou voltar a comprar.',
    product: 'Saída de Praia / Kimono',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 5,
    name: 'Beatriz Santos',
    location: 'Setúbal',
    rating: 5,
    text: 'Comprei o vestido midi para o casamento da minha amiga e toda a gente perguntou onde comprei. Qualidade incrível pelo preço.',
    product: 'Vestido Midi Floral Boho',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 6,
    name: 'Inês Rodrigues',
    location: 'Coimbra',
    rating: 5,
    text: 'As sandálias são super confortáveis e o design é minimalista "" combinam com tudo. "timo serviço, chegou em 7 dias.',
    product: 'Sandálias Rasteiras Minimalistas',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-[13px] ${i < rating ? 'text-solar-yellow' : 'text-absolute-black/70'}`}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Header fade-in
    gsap.fromTo(headerRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: headerRef.current, start: 'top 85%' }
      }
    );

    // Cards stagger
    gsap.fromTo('.review-card',
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: '.reviews-grid', start: 'top 80%' }
      }
    );
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-12 md:py-32 px-4 md:px-16 bg-raw-linen border-t border-absolute-black/10">
      {/* Header */}
      <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-16" style={{ opacity: 0 }}>
        <div className="flex flex-col gap-3">
          <p className="font-mono text-[13px] tracking-[0.45em] uppercase text-absolute-black/90">
            Clientes SOLARIS
          </p>
          <h2 className="font-serif font-light text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] text-absolute-black">
            O que dizem<br />as nossas clientes
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-1">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-solar-yellow text-sm">★</span>
              ))}
            </div>
            <p className="font-mono text-[13px] tracking-[0.3em] uppercase text-absolute-black/70">
              4.9 / 5 · 127 reviews
            </p>
          </div>
        </div>
      </div>

      {/* Grid — mobile: scroll horizontal limitado a 2 cards visíveis */}
      <div className="reviews-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-absolute-black/10
        max-md:flex max-md:overflow-x-auto max-md:gap-0 max-md:snap-x max-md:snap-mandatory max-md:bg-transparent">
        {REVIEWS.map((review) => (
          <div
            key={review.id}
            className="review-card bg-raw-linen p-5 md:p-8 flex flex-col gap-4 md:gap-5
              max-md:shrink-0 max-md:w-[82vw] max-md:snap-start max-md:border max-md:border-absolute-black/10"
            style={{ opacity: 0 }}
          >
            {/* Stars + product */}
            <div className="flex items-start justify-between">
              <StarRating rating={review.rating} />
              <span className="font-mono text-[13px] tracking-[0.25em] uppercase text-absolute-black/55 text-right max-w-[120px] leading-relaxed">
                {review.product}
              </span>
            </div>

            {/* Texto */}
            <p className="font-sans text-[13px] text-absolute-black/65 leading-relaxed flex-1">
              "{review.text}"
            </p>

            {/* Autor */}
            <div className="flex items-center gap-3 pt-4 border-t border-absolute-black/8">
              <img loading="lazy" decoding="async"
                src={review.photo}
                alt={review.name}
                className="w-9 h-9 rounded-full object-cover grayscale"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[13px] tracking-[0.2em] uppercase text-absolute-black font-medium">
                  {review.name}
                </span>
                <span className="font-mono text-[13px] tracking-wider text-absolute-black/90">
                  {review.location}
                </span>
              </div>
              <span className="ml-auto font-mono text-[11px] tracking-wider text-absolute-black/60 flex items-center gap-1">
                <span aria-hidden="true">✓</span> Verificada
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
