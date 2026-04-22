import gsap from 'gsap';
import { trackAddToCart } from '../lib/pixel';
import { gaAddToCart } from '../lib/analytics';
import { useCartStore, CartItem } from '../store/cartStore';

export function useCartAnimation() {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Fallback if there is no event target
    const target = e.currentTarget || e.target;
    if (!target) {
        addItem(product);
        return;
    }

    const buttonRect = (target as HTMLElement).getBoundingClientRect();
    const cartIcon = document.getElementById('cart-icon');
    
    if (!cartIcon) {
        addItem(product);
        return;
    }
    
    const cartRect = cartIcon.getBoundingClientRect();

    // Cria o ponto de luz dinamicamente
    const dot = document.createElement('div');
    dot.className = 'fixed w-3 h-3 rounded-full bg-oxidized-gold z-[9999] pointer-events-none shadow-[0_0_15px_rgba(191,160,113,0.8)]';
    document.body.appendChild(dot);

    // Anima o ponto do botão até ao ícone do carrinho
    gsap.fromTo(dot, {
      x: buttonRect.left + buttonRect.width / 2 - 6,
      y: buttonRect.top + buttonRect.height / 2 - 6,
      scale: 1,
      opacity: 1,
    }, {
      x: cartRect.left + cartRect.width / 2 - 6,
      y: cartRect.top + cartRect.height / 2 - 6,
      scale: 0.2,
      opacity: 0,
      duration: 0.8,
      ease: "power3.inOut",
      onComplete: () => {
        dot.remove();
        
        // Dispara Zustand
        addItem(product);

        // Pixel + GA4 tracking
        const trackPayload = {
          id: product.id || product.cjPid || 'unknown',
          name: product.name,
          price: parseFloat((product.price || '0').toString().replace('€', '').replace(',', '.')),
        };
        trackAddToCart(trackPayload);
        gaAddToCart({ ...trackPayload, quantity: product.quantity ?? 1 });
        
        // Pequeno "bump" no ícone do carrinho
        gsap.fromTo(cartIcon, 
          { scale: 1.2, color: '#BFA071' }, 
          { scale: 1, color: '#000000', duration: 0.4, ease: 'back.out(2)' }
        );
      }
    });
  };

  return handleAddToCart;
}
