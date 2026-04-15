'use client';

import MagneticText from './MagneticText';
import MagneticCTA from './MagneticCTA';

interface ProductCardProps {
  number: string;
  title: string;
  price: string;
  image: string;
  className?: string;
  onAddToCart?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function ProductCard({ number, title, price, image, className = '', onAddToCart }: ProductCardProps) {
  return (
    <div className={`product-card flex flex-col gap-6 ${className}`}>
      
      {/* Wrapper da Imagem: Usado para o Skew e Clip-Path */}
      <div 
        className="product-image-wrapper relative w-full h-[50vh] md:h-[70vh] overflow-hidden bg-bleached-concrete/20"
        style={{ clipPath: 'inset(100% 0% 0% 0%)' }} // Estado inicial para o GSAP revelar de baixo para cima
      >
        {/* Imagem: Usada para o Parallax (scale-125 dá margem para mover sem mostrar as bordas) */}
        <img loading="lazy" decoding="async" 
          src={image} 
          alt={title} 
          className="product-image absolute inset-0 w-full h-full object-cover scale-125 origin-center"
          referrerPolicy="no-referrer"
        />
      </div>
      
      {/* UI do Produto (High-Contrast & Magnetic) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end px-2 gap-4">
        <div className="flex flex-col gap-1 items-start">
          <MagneticText>
            <h3 className="font-serif italic text-sm md:text-base text-absolute-black antialiased tracking-wide">
              {number}. {title}
            </h3>
          </MagneticText>
          <MagneticText>
            <span className="font-mono text-xs md:text-sm text-absolute-black/90 antialiased tracking-widest">
              {price}
            </span>
          </MagneticText>
        </div>
        
        <MagneticCTA text1="Add to Bag" text2={price} onClick={onAddToCart} />
      </div>

    </div>
  );
}
