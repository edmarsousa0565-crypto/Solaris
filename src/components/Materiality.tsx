'use client';

import { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PILLARS = [
  {
    num: '01',
    title: 'Origem',
    body: 'Cada peça nasce no Mediterr¢neo. Linho português, seda italiana, lã merino da Península Ibérica. A matéria-prima define tudo o que vem a seguir.',
  },
  {
    num: '02',
    title: 'Processo',
    body: 'Produção limitada, em ateliers que conhecemos pelo nome. Sem fábricas anónimas. Cada costura é rastreável até  s mãos que a fizeram.',
  },
  {
    num: '03',
    title: 'Permanência',
    body: 'Não fazemos tendências. Fazemos peças que duram dez anos no teu guarda-roupa. O melhor para o planeta é comprar menos, melhor.',
  },
];

export default function Materiality() {
  const sectionRef  = useRef<HTMLElement>(null);
  const imageRef    = useRef<HTMLDivElement>(null);
  const headingRef  = useRef<HTMLHeadingElement>(null);
  const pillarsRef  = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    // Imagem entra com parallax suave
    gsap.fromTo(imageRef.current,
      { yPercent: 8 },
      {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );

    // Título revela-se com clip-path
    gsap.fromTo(headingRef.current,
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        duration: 1.4,
        ease: 'expo.inOut',
        scrollTrigger: {
          trigger: headingRef.current,
          start: 'top 80%',
        },
      }
    );

    // Pilares sobem em stagger
    const items = pillarsRef.current?.querySelectorAll('.pillar-item');
    if (items) {
      gsap.fromTo(items,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: pillarsRef.current,
            start: 'top 80%',
          },
        }
      );
    }
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="w-full bg-raw-linen relative z-30 overflow-hidden">

      {/* Bloco superior "" título + imagem assimétrica */}
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[70vh]">

        {/* Esquerda "" texto */}
        <div className="flex flex-col justify-end px-8 md:px-16 pt-20 pb-12 md:py-24">
          <p className="font-mono text-[13px] tracking-[0.5em] uppercase text-absolute-black/90 mb-8">
            Solaris "" Sobre a Marca
          </p>
          <h2
            ref={headingRef}
            className="font-serif font-light text-[clamp(3rem,6vw,6rem)] leading-[0.9] tracking-tight text-absolute-black"
            style={{ clipPath: 'inset(0 100% 0 0)' }}
          >
            Feito para<br />
            <em>durar além<br />
            da estação.</em>
          </h2>
        </div>

        {/* Direita "" imagem com parallax */}
        <div className="relative overflow-hidden min-h-[50vw] md:min-h-0">
          <div ref={imageRef} className="absolute inset-[-10%] w-[120%] h-[120%]">
            <img loading="lazy" decoding="async"
              src="https://images.unsplash.com/photo-1605289355680-75fb41239154?q=80&w=1600&auto=format&fit=crop"
              alt="Linen texture"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Sobreposição com detalhe de material */}
          <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-1">
            <span className="font-mono text-[13px] tracking-[0.4em] uppercase text-stark-white/50">Material</span>
            <span className="font-mono text-xs text-stark-white/90 tracking-wider">Linho Org¢nico Português</span>
          </div>
        </div>
      </div>

      {/* Linha divisória */}
      <div className="w-full h-px bg-absolute-black/10 mx-0" />

      {/* Bloco inferior "" 3 pilares + CTA */}
      <div className="px-8 md:px-16 py-16 md:py-24">
        <div
          ref={pillarsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-20"
        >
          {PILLARS.map((p) => (
            <div key={p.num} className="pillar-item flex flex-col gap-4 opacity-0">
              <div className="flex items-center gap-4">
                <span className="font-mono text-[13px] tracking-widest text-absolute-black/90">{p.num}</span>
                <div className="flex-1 h-px bg-absolute-black/10" />
              </div>
              <h3 className="font-serif italic text-2xl font-light text-absolute-black">
                {p.title}
              </h3>
              <p className="font-mono text-xs tracking-wider leading-relaxed text-absolute-black/80">
                {p.body}
              </p>
            </div>
          ))}
        </div>

        {/* CTA final antes do footer */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 pt-8 border-t border-absolute-black/10">
          <p className="font-serif italic text-2xl md:text-3xl font-light text-absolute-black/90 max-w-sm leading-snug">
            "Não vestimos corpos,<br/>esculpimos sombras."
          </p>
          <Link
            to="/shop"
            className="group inline-flex items-center gap-4 bg-absolute-black text-stark-white font-mono text-xs tracking-[0.3em] uppercase px-8 py-5 hover:bg-solar-yellow hover:text-absolute-black transition-colors duration-300"
          >
            Explorar a coleção
            <span className="group-hover:translate-x-1 transition-transform duration-300">←’</span>
          </Link>
        </div>
      </div>

    </section>
  );
}
