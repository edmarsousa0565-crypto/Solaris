'use client';

import { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { SfInput, SfButton } from '@storefront-ui/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const MagneticLink = ({ children, href }: { children: React.ReactNode, href: string }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    if (!ref.current || !textRef.current) return;

    const xTo = gsap.quickTo(ref.current, "x", { duration: 1, ease: "power3.out" });
    const yTo = gsap.quickTo(ref.current, "y", { duration: 1, ease: "power3.out" });
    const textXTo = gsap.quickTo(textRef.current, "x", { duration: 1, ease: "power3.out" });
    const textYTo = gsap.quickTo(textRef.current, "y", { duration: 1, ease: "power3.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = ref.current!.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      
      xTo(x * 0.3);
      yTo(y * 0.3);
      textXTo(x * 0.1);
      textYTo(y * 0.1);
    };

    const handleMouseLeave = () => {
      gsap.to(ref.current, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
      gsap.to(textRef.current, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
    };

    ref.current.addEventListener("mousemove", handleMouseMove);
    ref.current.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      ref.current?.removeEventListener("mousemove", handleMouseMove);
      ref.current?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, { scope: ref });

  return (
    <a 
      ref={ref}
      href={href}
      className="relative inline-block p-4 cursor-pointer"
    >
      <span ref={textRef} className="inline-block font-mono text-sm uppercase tracking-widest text-[#F7F7F5]">
        {children}
      </span>
    </a>
  );
};

export default function FinalFooter() {
  const containerRef = useRef<HTMLElement>(null);
  const textFillRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !textFillRef.current) return;

    // Scroll Fill Animation for Giant Logo
    gsap.fromTo(textFillRef.current,
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%', // Começa a preencher quando o footer entra no ecrã
          end: 'bottom bottom', // Termina quando chegamos ao fim absoluto
          scrub: true,
        }
      }
    );
  }, { scope: containerRef });

  const scrollToTop = () => {
    // Smooth scroll to top using native behavior (intercepted by Lenis/SmoothScroll)
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer ref={containerRef} className="relative w-full bg-[#121212] text-[#F7F7F5] pt-32 pb-24 md:pb-8 px-8 md:px-16 z-40 flex flex-col justify-between min-h-screen">
      
      {/* Top Section: CTA & Socials */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-16 md:gap-0">
        
        {/* Newsletter CTA */}
        <div className="w-full md:w-1/2 max-w-md">
          <h3 className="font-serif text-3xl md:text-5xl mb-8 leading-tight">Junta-te à Arquitectura da Luz</h3>
          <form className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="footer-email" className="sr-only">O teu endereço de email</label>
            <SfInput
              id="footer-email"
              type="email"
              placeholder="o.teu@email.com"
              autoComplete="email"
              wrapperClassName="flex-1 !rounded-none !border-0 !border-b !border-[#F7F7F5]/40 !bg-transparent focus-within:!border-solar-yellow transition-colors"
              className="!bg-transparent !text-[#F7F7F5] font-mono text-sm placeholder:!text-[#F7F7F5]/40 !rounded-none !shadow-none"
            />
            <SfButton
              type="submit"
              variant="tertiary"
              size="sm"
              className="font-mono text-xs uppercase tracking-widest !text-[#F7F7F5]/60 hover:!text-solar-yellow transition-colors !bg-transparent !rounded-none !shadow-none flex-shrink-0"
            >
              Subscrever →
            </SfButton>
          </form>
        </div>

        {/* Magnetic Socials */}
        <div className="flex flex-col items-start md:items-end gap-2">
          <MagneticLink href="#">Instagram</MagneticLink>
          <MagneticLink href="#">Pinterest</MagneticLink>
          <MagneticLink href="#">LinkedIn</MagneticLink>
        </div>

      </div>

      {/* Middle Section: Back to Top */}
      <div className="flex justify-center my-12 md:my-auto">
        <button
          onClick={scrollToTop}
          className="group relative flex items-center justify-center w-20 h-20 md:w-32 md:h-32 rounded-full border border-[#F7F7F5]/20 hover:border-[#F7F7F5]/60 transition-colors overflow-hidden cursor-pointer"
        >
          <span className="font-mono text-[10px] md:text-xs uppercase tracking-widest z-10 group-hover:-translate-y-1 transition-transform duration-500 text-center leading-tight px-2">
            Back to Top
          </span>
          <div className="absolute inset-0 bg-[#F7F7F5]/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
        </button>
      </div>

      {/* Legal Links */}
      <div className="flex flex-wrap justify-center gap-6 mb-8 border-t border-[#F7F7F5]/10 pt-8">
        <Link to="/envios" className="font-mono text-xs uppercase tracking-widest text-[#F7F7F5]/60 hover:text-solar-yellow transition-colors">
          Envios
        </Link>
        <Link to="/tracking" className="font-mono text-xs uppercase tracking-widest text-[#F7F7F5]/60 hover:text-solar-yellow transition-colors">
          Rastrear Encomenda
        </Link>
        <Link to="/privacidade" className="font-mono text-xs uppercase tracking-widest text-[#F7F7F5]/60 hover:text-solar-yellow transition-colors">
          Privacidade
        </Link>
        <Link to="/termos" className="font-mono text-xs uppercase tracking-widest text-[#F7F7F5]/60 hover:text-solar-yellow transition-colors">
          Termos e Condições
        </Link>
        <Link to="/devolucoes" className="font-mono text-xs uppercase tracking-widest text-[#F7F7F5]/60 hover:text-solar-yellow transition-colors">
          Devoluções
        </Link>
        <Link to="/cookies" className="font-mono text-xs uppercase tracking-widest text-[#F7F7F5]/60 hover:text-solar-yellow transition-colors">
          Cookies
        </Link>
      </div>

      {/* Bottom Section: Giant Logo */}
      <div className="relative w-full flex justify-center items-end mt-auto overflow-hidden" aria-hidden="true">
        <div className="text-[18vw] font-serif leading-[0.75] tracking-tighter uppercase select-none w-full text-center relative">
          {/* Outline/Faded Layer */}
          <span className="text-[#F7F7F5]/8">SOLARIS</span>

          {/* Solid Fill Layer "" preenche em amarelo solar */}
          <span
            ref={textFillRef}
            className="absolute left-0 top-0 w-full text-solar-yellow"
            style={{ clipPath: 'inset(0 100% 0 0)' }}
          >
            SOLARIS
          </span>
        </div>
      </div>

    </footer>
  );
}
