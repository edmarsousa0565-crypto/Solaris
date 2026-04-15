'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import MagneticCTA from './MagneticCTA';

interface ProductDetailOverlayProps {
  product: any;
  onClose: () => void;
  onAddToCart: (e: React.MouseEvent, product: any) => void;
}

export default function ProductDetailOverlay({ product, onClose, onAddToCart }: ProductDetailOverlayProps) {
  const overlayRef  = useRef<HTMLDivElement>(null);
  const contentRef  = useRef<HTMLDivElement>(null);

  // Animate in on mount
  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    if (contentRef.current) {
      gsap.fromTo(Array.from(contentRef.current.children),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.1, delay: 0.3 }
      );
    }
  }, []);

  const handleClose = useCallback(() => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.35, ease: 'power2.in', onComplete: onClose });
  }, [onClose]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Se houver apenas uma cor/tamanho, seleciona automaticamente
  useEffect(() => {
    if (product.sizes?.length === 1) setSelectedSize(product.sizes[0]);
    if (product.colors?.length === 1) setSelectedColor(product.colors[0]);
  }, [product]);

  // Encontra a variante atual para preço/sku
  const currentVariant = product.variants?.find((v: any) => {
    const parts = v.variantNameEn.split('/');
    const vColor = parts.length > 1 ? parts[0].trim() : null;
    const vSize = parts.length > 1 ? parts[parts.length - 1].trim() : v.variantNameEn.trim();
    
    if (selectedColor && selectedSize) return vColor === selectedColor && vSize === selectedSize;
    if (selectedSize && !product.colors?.length) return vSize === selectedSize;
    if (selectedColor && !product.sizes?.length) return vColor === selectedColor;
    return false;
  });

  const currentPrice = currentVariant ? `€${parseFloat(currentVariant.sellPrice).toFixed(2)}` : product.price;
  const currentSku = currentVariant ? currentVariant.sku : `SOL-${product.id}00`;

  // Lógica de Fecho (Scroll Up / Swipe Down)
  useEffect(() => {
    // Bloqueia o scroll do body enquanto o overlay está aberto
    document.body.style.overflow = 'hidden';
    
    let touchStartY = 0;
    
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY < -30) handleClose(); // Scroll up
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      if (touchEndY - touchStartY > 50) handleClose(); // Swipe down
    };

    window.addEventListener('wheel', handleWheel);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] bg-raw-linen flex flex-col md:flex-row"
      style={{ opacity: 0 }}
    >
      {/* Esquerda: Imagem Expandida */}
      <div className="w-full md:w-[60%] h-[50vh] md:h-screen overflow-hidden relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2s] ease-out"
        />
      </div>

      {/* Direita: Informação (Slide-Up Faseado) */}
      <div className="w-full md:w-[40%] h-[50vh] md:h-screen flex flex-col justify-center px-8 md:px-24 relative">
        
        {/* Botão de Fechar (The Gesture) */}
        <button
          onClick={handleClose}
          className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center group z-10"
        >
          <div className="relative w-6 h-6 group-hover:rotate-90 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-absolute-black -rotate-45" />
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-absolute-black rotate-45" />
          </div>
        </button>

        {/* Conteúdo Faseado */}
        <div ref={contentRef} className="flex flex-col">
          <h1 className="font-serif italic text-5xl md:text-7xl text-absolute-black mb-4 leading-none">
            {product.name}
          </h1>
          
          <p className="font-mono text-xs md:text-sm text-absolute-black/90 tracking-widest mb-16 uppercase">
            {currentPrice} // SKU: {currentSku}
          </p>
          
          {/* SELEÇO DE CORES (Se existirem) */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-8">
              <p className="font-mono text-[14px] tracking-widest uppercase mb-4 text-absolute-black/40">Color</p>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border-[0.5px] font-mono text-[14px] uppercase tracking-widest transition-all
                      ${selectedColor === color
                        ? 'bg-absolute-black text-stark-white border-absolute-black'
                        : 'border-absolute-black/30 hover:border-absolute-black'
                      }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SELEÇO DE TAMANHOS */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-16">
              <p className="font-mono text-[14px] tracking-widest uppercase mb-4 text-absolute-black/40">Size</p>
              <div className="flex gap-4">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-full border-[0.5px] flex items-center justify-center font-mono text-xs transition-all duration-300
                      ${selectedSize === size
                        ? 'bg-absolute-black text-stark-white border-absolute-black scale-110'
                        : 'border-absolute-black/30 hover:border-absolute-black'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DESCRIÇO DO PRODUTO (Selling Points) */}
          {product.description && (
            <div className="mb-12 max-w-sm">
              <p className="font-mono text-[14px] tracking-widest uppercase mb-4 text-absolute-black/40">Details</p>
              <p className="font-mono text-[13px] leading-relaxed text-absolute-black/70 italic">
                {product.description}
              </p>
            </div>
          )}

          <div onClick={(e: any) => {
            if (!selectedSize && product.sizes?.length > 0) {
              alert('Por favor, selecione um tamanho.');
              return;
            }
            if (!selectedColor && product.colors?.length > 0) {
              alert('Por favor, selecione uma cor.');
              return;
            }
            
            const matchedVariant = product.variants?.find((v: any) => {
              const parts = v.variantNameEn.split('/');
              const vColor = parts.length > 1 ? parts[0].trim() : null;
              const vSize = parts.length > 1 ? parts[parts.length - 1].trim() : v.variantNameEn.trim();
              
              if (selectedColor && selectedSize) return vColor === selectedColor && vSize === selectedSize;
              if (selectedSize) return vSize === selectedSize;
              if (selectedColor) return vColor === selectedColor;
              return false;
            });

            const variantInfo = [selectedColor, selectedSize].filter(Boolean).join(' / ');
            onAddToCart(e, {
              ...product,
              size: selectedSize,
              color: selectedColor,
              variantName: variantInfo,
              vid: matchedVariant?.vid || product.cjPid,
              price: matchedVariant ? `€${parseFloat(matchedVariant.sellPrice).toFixed(2)}` : product.price,
              priceNum: matchedVariant ? parseFloat(matchedVariant.sellPrice) : product.priceNum
            });
            handleClose();
          }}>
            <MagneticCTA
              text1="Add to Bag"
              text2={product.price}
              className="w-full h-20 text-sm"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
