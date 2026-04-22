'use client';

import { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SfButton } from '@storefront-ui/react';
import { useCJProduct } from '../hooks/useCJProduct';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartAnimation } from '../hooks/useCartAnimation';
import { Helmet } from 'react-helmet-async';
import { useEffect as useEffectReact, useState as useStateReact } from 'react';
import { trackViewContent } from '../lib/pixel';
import { gaViewItem } from '../lib/analytics';

export default function ProductPage() {
  const { pid } = useParams<{ pid: string }>();
  const navigate = useNavigate();

  // Resolve o fornecedor antes de fazer o fetch do produto
  const [supplier, setSupplier] = useStateReact<'cj' | 'matterhorn'>('cj');
  const [supplierResolved, setSupplierResolved] = useStateReact(false);

  useEffectReact(() => {
    let cancelled = false;
    if (!pid) return;
    // Procura o produto em featured para descobrir o supplier
    fetch('/api/admin/featured')
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const match = (data.products || []).find((p: any) => p.cjPid === pid || p.id === pid);
        if (match?.supplier === 'matterhorn') setSupplier('matterhorn');
        else setSupplier('cj');
        setSupplierResolved(true);
      })
      .catch(() => setSupplierResolved(true));
    return () => { cancelled = true; };
  }, [pid]);

  const { product, loading, error } = useCJProduct(supplierResolved ? pid : undefined, supplier);
  const onAddToCart = useCartAnimation();
  const cartItems = useCartStore(state => state.items);
  const setIsOpen = useCartStore(state => state.setIsOpen);
  const { toggle: toggleWishlist, has: inWishlist, setIsOpen: openWishlist } = useWishlistStore();

  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [openAcc, setOpenAcc] = useState<Record<string, boolean>>({ desc: true, sizes: false, materials: false });

  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!product) return;
    const tl = gsap.timeline();
    tl.fromTo(titleRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power4.out' });
    tl.fromTo(infoRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power4.out' }, '-=0.5');
  }, { scope: heroRef, dependencies: [product] });

  // ViewContent — Meta Pixel + GA4 quando o produto carrega
  useEffectReact(() => {
    if (!product) return;
    const price = parseFloat(String(product.price).replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
    trackViewContent({ id: product.id, name: product.name, price });
    gaViewItem({ id: product.id, name: product.name, price });
  }, [product?.id]);

  const images = product?.images?.length ? product.images : product ? [product.image] : [];

  const [sizeError, setSizeError] = useStateReact(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    if (!product) return;
    // Exige seleção de tamanho se existirem variantes
    if (product.sizes.length > 1 && !selectedVariant) {
      e.preventDefault();
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    const variant = product.variants.find(v => v.name === selectedVariant) || product.variants[0];
    const isMh = product.supplier === 'matterhorn';
    onAddToCart(e, {
      ...product,
      size: variant?.name || selectedVariant || undefined,
      variantId: !isMh ? (variant?.vid || undefined) : undefined,
      variant_uid: isMh ? (variant?.variant_uid || variant?.vid || undefined) : undefined,
      matterhorn_id: isMh ? (product.matterhorn_id || product.cjPid) : undefined,
      supplier: product.supplier || 'cj',
      quantity,
    });
  };

  const priceNum = product ? parseFloat(String(product.price).replace(/[^0-9.,]/g, '').replace(',', '.')) || 0 : 0;

  return (
    <>
    {product && (
      <Helmet>
        <title>{product.name} — SOLARIS</title>
        <meta name="description" content={`${product.name} — ${product.price}. Moda feminina de verão com envio para Portugal, Brasil e Europa.`} />
        <meta property="og:title" content={`${product.name} — SOLARIS`} />
        <meta property="og:description" content={`${product.name} — ${product.price}. Envio rápido para Portugal, Brasil e Europa.`} />
        <meta property="og:image" content={product.image} />
        <meta property="og:url" content={`${typeof window !== 'undefined' ? window.location.origin : ''}/shop/product/${product.cjPid}`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": product.name,
          "image": images,
          "description": product.name,
          "brand": { "@type": "Brand", "name": "SOLARIS" },
          "offers": {
            "@type": "Offer",
            "url": `${typeof window !== 'undefined' ? window.location.origin : ''}/shop/product/${product.cjPid}`,
            "priceCurrency": "EUR",
            "price": priceNum,
            "availability": product.isSoldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
            "seller": { "@type": "Organization", "name": "SOLARIS" }
          }
        })}</script>
      </Helmet>
    )}
    <div className="min-h-screen bg-raw-linen text-absolute-black overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full h-16 z-50 bg-raw-linen/90 backdrop-blur-md flex items-center justify-between px-8 md:px-16 border-b border-absolute-black/10">
        <button
          onClick={() => navigate(-1)}
          className="font-serif text-sm tracking-[0.4em] uppercase hover:text-oxidized-gold transition-colors min-h-[44px] flex items-center"
        >
          ← Voltar
        </button>
        <Link to="/" className="font-mono text-[13px] tracking-[0.5em] uppercase text-absolute-black/70 hover:text-absolute-black transition-colors">
          Solaris
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          aria-label={`Carrinho — ${cartItems.length} ${cartItems.length === 1 ? 'item' : 'itens'}`}
          className="font-mono text-xs hover:text-oxidized-gold transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          [{String(cartItems.length).padStart(2, '0')}]
        </button>
      </header>

      <main className="pt-16">
        {/* Estado de carregamento */}
        {loading && (
          <div className="flex flex-col md:flex-row gap-0 min-h-[calc(100vh-4rem)]">
            <div className="w-full md:w-[55%] aspect-square md:aspect-auto animate-pulse bg-bleached-concrete/30" />
            <div className="w-full md:w-[45%] p-12 md:p-20 flex flex-col gap-6">
              <div className="h-4 bg-bleached-concrete/30 w-1/3 animate-pulse" />
              <div className="h-16 bg-bleached-concrete/30 w-3/4 animate-pulse" />
              <div className="h-8 bg-bleached-concrete/30 w-1/4 animate-pulse" />
              <div className="h-24 bg-bleached-concrete/30 w-full animate-pulse" />
            </div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <div className="text-center">
              <p className="font-mono text-xs tracking-widest uppercase text-absolute-black/90 mb-6">Produto não encontrado</p>
              <Link to="/shop" className="font-mono text-[13px] tracking-[0.3em] uppercase text-absolute-black border-b border-absolute-black/30 pb-1 hover:border-absolute-black transition-colors">
                ← Voltar à loja
              </Link>
            </div>
          </div>
        )}

        {/* Produto carregado */}
        {product && !loading && (
          <div ref={heroRef}>
            {/* Layout principal: Imagem + Info */}
            <section className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">

              {/* COLUNA ESQUERDA — Galeria */}
              <div className="w-full md:w-[55%] md:sticky md:top-16 md:h-[calc(100vh-4rem)] flex flex-col">
                {/* Imagem principal */}
                <div className="relative flex-1 overflow-hidden bg-bleached-concrete/10 max-h-[60vh] md:max-h-none">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImage}
                      src={images[activeImage]}
                      alt={product.name}
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </AnimatePresence>

                  {/* Badges */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                    {product.isNew && (
                      <span className="font-mono text-[13px] tracking-widest uppercase bg-solar-yellow text-absolute-black px-3 py-1.5">
                        Novo
                      </span>
                    )}
                    {product.isSoldOut && (
                      <span className="font-mono text-[13px] tracking-widest uppercase bg-absolute-black text-stark-white px-3 py-1.5">
                        Esgotado
                      </span>
                    )}
                  </div>

                  {/* Número da imagem */}
                  <div className="absolute bottom-6 right-6 font-mono text-[13px] tracking-widest text-absolute-black/70">
                    {String(activeImage + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
                  </div>
                </div>

                {/* Miniaturas */}
                {images.length > 1 && (
                  <div className="flex gap-1 p-3 bg-raw-linen overflow-x-auto">
                    {images.slice(0, 8).map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`shrink-0 w-16 h-20 overflow-hidden transition-all duration-300 ${
                          activeImage === i
                            ? 'ring-2 ring-absolute-black ring-offset-1'
                            : 'opacity-50 hover:opacity-80'
                        }`}
                      >
                        <img loading="lazy" decoding="async"
                          src={img}
                          alt={`${product.name} ${i + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* COLUNA DIREITA — Info e compra */}
              <div ref={infoRef} className="w-full md:w-[45%] px-5 md:px-16 py-8 md:py-20 flex flex-col gap-6 md:gap-8 border-l border-absolute-black/10">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-3 font-mono text-[13px] tracking-[0.3em] uppercase text-absolute-black/90">
                  <Link to="/" className="hover:text-absolute-black transition-colors">Solaris</Link>
                  <span>/</span>
                  <Link to="/shop" className="hover:text-absolute-black transition-colors">Shop</Link>
                  <span>/</span>
                  <span className="text-absolute-black/90 truncate max-w-[120px]">{product.name}</span>
                </nav>

                {/* Categoria */}
                <p className="font-mono text-[13px] tracking-[0.5em] uppercase text-absolute-black/90">
                  {product.category}
                </p>

                {/* Nome */}
                <h1 ref={titleRef} className="font-serif font-light leading-[0.95] tracking-tight text-[clamp(2rem,4vw,3.5rem)]">
                  {product.name}
                </h1>

                {/* Preço */}
                <div className="flex items-baseline gap-4">
                  <span className="font-serif text-3xl font-light">{product.price}</span>
                  <span className="font-mono text-[13px] tracking-widest uppercase text-absolute-black/90">IVA incluído</span>
                </div>

                <div className="w-12 h-px bg-solar-yellow" />

                {/* Variantes / Tamanhos */}
                {product.sizes.length > 0 && (
                  <fieldset className="flex flex-col gap-3 border-0 p-0 m-0">
                    <div className="flex justify-between items-center">
                      <legend className="font-mono text-[13px] tracking-[0.4em] uppercase text-absolute-black/80 float-left">
                        Tamanho / Variante
                      </legend>
                      {selectedVariant && (
                        <p className="font-mono text-[13px] tracking-widest text-absolute-black/90">{selectedVariant}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 clear-both">
                      {product.sizes.map((size) => {
                        const variant = product.variants.find(v => v.name === size);
                        const outOfStock = variant && variant.stock === 0;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => !outOfStock && setSelectedVariant(size)}
                            disabled={!!outOfStock}
                            aria-pressed={selectedVariant === size}
                            className={`relative font-mono text-[13px] tracking-widest uppercase px-4 py-2.5 border transition-all duration-200 min-h-[44px]
                              ${selectedVariant === size
                                ? 'bg-absolute-black text-stark-white border-absolute-black'
                                : outOfStock
                                  ? 'opacity-30 line-through border-absolute-black/10 cursor-not-allowed'
                                  : 'border-absolute-black/20 hover:border-absolute-black text-absolute-black hover:bg-absolute-black/5'
                              }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                )}

                {/* Quantidade */}
                <div className="flex flex-col gap-3">
                  <p className="font-mono text-[13px] tracking-[0.4em] uppercase text-absolute-black/80">Quantidade</p>
                  <div className="flex items-center gap-0 w-fit border border-absolute-black/20">
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      aria-label="Diminuir quantidade"
                      className="w-11 h-11 font-mono text-sm hover:bg-absolute-black hover:text-stark-white transition-colors flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="w-12 h-11 font-mono text-xs tracking-widest flex items-center justify-center border-x border-absolute-black/20" aria-live="polite" aria-atomic="true">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(q => q + 1)}
                      aria-label="Aumentar quantidade"
                      className="w-11 h-11 font-mono text-sm hover:bg-absolute-black hover:text-stark-white transition-colors flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* CTA — Adicionar ao carrinho */}
                <div className="flex flex-col gap-3">
                  <SfButton
                    onClick={handleAddToCart}
                    disabled={product.isSoldOut}
                    className="!rounded-none !bg-absolute-black !text-stark-white font-mono text-xs tracking-[0.3em] uppercase !py-4 !px-8 hover:!bg-solar-yellow hover:!text-absolute-black transition-colors duration-300 disabled:opacity-40 w-full"
                  >
                    {product.isSoldOut ? 'Esgotado' : '+ Adicionar ao Carrinho'}
                  </SfButton>
                  {sizeError && (
                    <p className="font-mono text-[11px] tracking-widest uppercase text-red-600 text-center">
                      Seleciona um tamanho primeiro
                    </p>
                  )}
                  <button
                    type="button"
                    className={`font-mono text-[13px] tracking-[0.3em] uppercase transition-colors py-2 min-h-[44px] ${inWishlist(product.cjPid) ? 'text-oxidized-gold' : 'text-absolute-black/55 hover:text-absolute-black'}`}
                    onClick={() => {
                      toggleWishlist({ id: product.id, cjPid: product.cjPid, name: product.name, price: product.price, image: product.image, category: product.category });
                      if (!inWishlist(product.cjPid)) openWishlist(true);
                    }}
                  >
                    {inWishlist(product.cjPid) ? '♥ Guardado' : '♡ Guardar para mais tarde'}
                  </button>
                </div>

                {/* Envio */}
                <div className="flex items-start gap-4 p-4 bg-absolute-black/3 border border-absolute-black/8">
                  <div>
                    <p className="font-mono text-[13px] tracking-[0.3em] uppercase text-absolute-black/90 mb-1">
                      Envio estimado
                    </p>
                    <p className="font-mono text-[13px] tracking-widest text-absolute-black/70">
                      {product.shippingTime} dias úteis · Envio gratuito acima de €50
                    </p>
                  </div>
                </div>

                {/* WhatsApp + Trust Signals */}
                <div className="flex flex-col gap-3">
                  <a
                    href="https://wa.me/351910000000?text=Olá!%20Tenho%20uma%20dúvida%20sobre%20este%20produto."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 border border-absolute-black/15 font-mono text-[11px] tracking-[0.3em] uppercase py-3.5 px-6 text-absolute-black/90 hover:bg-absolute-black hover:text-stark-white transition-colors duration-300"
                  >
                    Dúvidas? WhatsApp
                  </a>
                  <div className="grid grid-cols-3 gap-2 px-1">
                    <div className="flex items-center gap-1">
                      <span className="text-oxidized-gold text-[11px]" aria-hidden="true">&#10055;</span>
                      <span className="font-mono text-[9px] tracking-wider uppercase text-absolute-black/55 leading-tight">Dev. 30 dias</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-oxidized-gold text-[11px]" aria-hidden="true">&#10055;</span>
                      <span className="font-mono text-[9px] tracking-wider uppercase text-absolute-black/55 leading-tight">Pag. Seguro</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-oxidized-gold text-[11px]" aria-hidden="true">&#10055;</span>
                      <span className="font-mono text-[9px] tracking-wider uppercase text-absolute-black/55 leading-tight">Envio EU</span>
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <div className="flex flex-col gap-4 border-t border-absolute-black/10 pt-8">
                  <button
                    type="button"
                    className="flex justify-between items-center w-full text-left group min-h-[44px]"
                    aria-expanded={openAcc.desc}
                    aria-controls="acc-desc"
                    onClick={() => setOpenAcc(s => ({ ...s, desc: !s.desc }))}
                  >
                    <p className="font-mono text-[13px] tracking-[0.4em] uppercase text-absolute-black/80 group-hover:text-absolute-black transition-colors">
                      Descrição do Produto
                    </p>
                    <span className="font-mono text-[13px] text-absolute-black/70 transition-transform duration-300" style={{ display: 'inline-block', transform: openAcc.desc ? 'rotate(45deg)' : 'none' }}>+</span>
                  </button>
                  <div id="acc-desc" hidden={!openAcc.desc} className="font-mono text-xs text-absolute-black/70 leading-relaxed tracking-wide">
                    {product.description}
                  </div>
                </div>

                {/* Detalhes */}
                <div className="flex flex-col gap-4 border-t border-absolute-black/10 pt-8">
                  <div className="grid grid-cols-2 gap-y-3">
                    <span className="font-mono text-[13px] tracking-[0.3em] uppercase text-absolute-black/60">Categoria</span>
                    <span className="font-mono text-[13px] tracking-widest text-absolute-black/80">{product.category}</span>
                    <span className="font-mono text-[13px] tracking-[0.3em] uppercase text-absolute-black/60">Coleção</span>
                    <span className="font-mono text-[13px] tracking-widest text-absolute-black/80">{product.collection}</span>
                    <span className="font-mono text-[13px] tracking-[0.3em] uppercase text-absolute-black/60">Ref.</span>
                    <span className="font-mono text-[13px] tracking-widest text-absolute-black/80 uppercase">{product.cjPid}</span>
                  </div>
                </div>

                {/* Guia de Tamanhos */}
                <div className="flex flex-col gap-4 border-t border-absolute-black/10 pt-8">
                  <button
                    type="button"
                    className="flex justify-between items-center w-full text-left group min-h-[44px]"
                    aria-expanded={openAcc.sizes}
                    aria-controls="acc-sizes"
                    onClick={() => setOpenAcc(s => ({ ...s, sizes: !s.sizes }))}
                  >
                    <p className="font-mono text-[13px] tracking-[0.4em] uppercase text-absolute-black/80 group-hover:text-absolute-black transition-colors">
                      Guia de Tamanhos
                    </p>
                    <span className="font-mono text-[13px] text-absolute-black/70 transition-transform duration-300" style={{ display: 'inline-block', transform: openAcc.sizes ? 'rotate(45deg)' : 'none' }}>+</span>
                  </button>
                  <div id="acc-sizes" hidden={!openAcc.sizes}>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          {['Tam.', 'Peito', 'Cintura', 'Anca'].map(h => (
                            <th key={h} className="text-left font-mono text-[13px] tracking-[0.3em] uppercase text-absolute-black/70 py-2 pr-4 border-b border-absolute-black/10">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ['XS', '80–84', '60–64', '86–90'],
                          ['S',  '84–88', '64–68', '90–94'],
                          ['M',  '88–92', '68–72', '94–98'],
                          ['L',  '92–96', '72–76', '98–102'],
                          ['XL', '96–100','76–80', '102–106'],
                        ].map(([size, chest, waist, hip]) => (
                          <tr key={size} className="border-b border-absolute-black/5">
                            <td className="font-mono text-[13px] font-medium text-absolute-black/70 py-2 pr-4">{size}</td>
                            <td className="font-mono text-[13px] text-absolute-black/55 py-2 pr-4">{chest} cm</td>
                            <td className="font-mono text-[13px] text-absolute-black/55 py-2 pr-4">{waist} cm</td>
                            <td className="font-mono text-[13px] text-absolute-black/55 py-2">{hip} cm</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="font-mono text-[13px] tracking-wider text-absolute-black/50 mt-3 leading-relaxed">
                      Em dúvida entre dois tamanhos? Recomendamos o maior.
                    </p>
                  </div>
                </div>

                {/* Materiais e Cuidados */}
                <div className="flex flex-col gap-4 border-t border-absolute-black/10 pt-8">
                  <button
                    type="button"
                    className="flex justify-between items-center w-full text-left group min-h-[44px]"
                    aria-expanded={openAcc.materials}
                    aria-controls="acc-materials"
                    onClick={() => setOpenAcc(s => ({ ...s, materials: !s.materials }))}
                  >
                    <p className="font-mono text-[13px] tracking-[0.4em] uppercase text-absolute-black/80 group-hover:text-absolute-black transition-colors">
                      Materiais &amp; Cuidados
                    </p>
                    <span className="font-mono text-[13px] text-absolute-black/70 transition-transform duration-300" style={{ display: 'inline-block', transform: openAcc.materials ? 'rotate(45deg)' : 'none' }}>+</span>
                  </button>
                  <div id="acc-materials" hidden={!openAcc.materials}>
                    <ul className="flex flex-col gap-2 font-mono text-[13px] tracking-wide text-absolute-black/70 leading-relaxed">
                      <li className="flex items-start gap-2"><span className="text-oxidized-gold shrink-0" aria-hidden="true">✧</span>100% Linho Natural / Viscose</li>
                      <li className="flex items-start gap-2"><span className="text-oxidized-gold shrink-0" aria-hidden="true">✧</span>Lavagem à mão ou 30°C delicados</li>
                      <li className="flex items-start gap-2"><span className="text-oxidized-gold shrink-0" aria-hidden="true">✧</span>Não torcer — estender à sombra</li>
                      <li className="flex items-start gap-2"><span className="text-oxidized-gold shrink-0" aria-hidden="true">✧</span>Ferro a temperatura baixa</li>
                      <li className="flex items-start gap-2"><span className="text-oxidized-gold shrink-0" aria-hidden="true">✧</span>Não usar máquina de secar</li>
                    </ul>
                  </div>
                </div>

                {/* Footer da info */}
                <div className="mt-auto pt-12 border-t border-absolute-black/10">
                  <Link
                    to="/shop"
                    className="font-mono text-[13px] tracking-[0.3em] uppercase text-absolute-black/90 hover:text-absolute-black transition-colors"
                  >
                    ← Continuar a explorar
                  </Link>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
    </>
  );
}
