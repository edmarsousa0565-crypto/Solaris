import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Página não encontrada — SOLARIS</title>
      </Helmet>
      <div className="min-h-screen bg-raw-linen flex flex-col items-center justify-center px-8 text-center gap-8">
        <p className="font-serif italic text-[8rem] leading-none text-absolute-black/8 select-none">404</p>
        <div className="flex flex-col gap-3">
          <h1 className="font-serif italic text-4xl md:text-5xl font-light text-absolute-black">
            Página não encontrada
          </h1>
          <p className="font-mono text-[13px] tracking-[0.3em] uppercase text-absolute-black/40">
            O endereço que procuras não existe ou foi movido
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/"
            className="font-mono text-[13px] tracking-[0.3em] uppercase bg-absolute-black text-stark-white px-8 py-4 hover:bg-solar-yellow hover:text-absolute-black transition-colors duration-300"
          >
            Voltar ao Início
          </Link>
          <Link
            to="/shop"
            className="font-mono text-[13px] tracking-[0.3em] uppercase border border-absolute-black/30 text-absolute-black px-8 py-4 hover:border-absolute-black transition-colors duration-300"
          >
            Ver Loja
          </Link>
        </div>
        <p className="font-mono text-[11px] tracking-[0.4em] uppercase text-absolute-black/25 mt-8">
          SOLARIS — Verão 2025
        </p>
      </div>
    </>
  );
}
