'use client';

import { Link, useLocation } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';

export default function MobileBottomNav() {
  const location = useLocation();
  const { items, setIsOpen } = useCartStore();
  const cartCount = items.length;
  const { items: wishItems, setIsOpen: openWishlist } = useWishlistStore();
  const wishCount = wishItems.length;
  const isHome = location.pathname === '/';
  const isShop = location.pathname.startsWith('/shop');

  const isTracking = location.pathname === '/tracking';

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[150] bg-raw-linen/95 backdrop-blur-md border-t border-absolute-black/10"
      aria-label="Navegação principal"
    >
      <div className="flex h-16">
        <Link
          to="/"
          aria-label="Início"
          aria-current={isHome ? 'page' : undefined}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px] ${isHome ? 'text-absolute-black' : 'text-absolute-black/45'}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
          </svg>
          <span className="font-mono text-[10px] tracking-widest uppercase">Início</span>
        </Link>

        <Link
          to="/shop"
          aria-label="Loja"
          aria-current={isShop ? 'page' : undefined}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px] ${isShop ? 'text-absolute-black' : 'text-absolute-black/45'}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span className="font-mono text-[10px] tracking-widest uppercase">Shop</span>
        </Link>

        <Link
          to="/tracking"
          aria-label="Rastrear encomenda"
          aria-current={isTracking ? 'page' : undefined}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px] ${isTracking ? 'text-absolute-black' : 'text-absolute-black/45'}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="font-mono text-[10px] tracking-widest uppercase">Track</span>
        </Link>

        <button
          onClick={() => openWishlist(true)}
          aria-label={wishCount > 0 ? `Lista de desejos — ${wishCount} items` : 'Lista de desejos'}
          className="flex-1 flex flex-col items-center justify-center gap-1 text-absolute-black/45 relative min-h-[44px]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={wishCount > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={wishCount > 0 ? 'text-oxidized-gold' : ''}>
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          {wishCount > 0 && (
            <span className="absolute top-1.5 right-[calc(50%-16px)] min-w-[18px] h-[18px] bg-oxidized-gold text-stark-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center px-1">
              {wishCount}
            </span>
          )}
          <span className="font-mono text-[10px] tracking-widest uppercase">Wishlist</span>
        </button>

        <button
          onClick={() => setIsOpen(true)}
          aria-label={cartCount > 0 ? `Carrinho — ${cartCount} ${cartCount === 1 ? 'item' : 'itens'}` : 'Carrinho vazio'}
          className="flex-1 flex flex-col items-center justify-center gap-1 text-absolute-black/45 relative min-h-[44px]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute top-1.5 right-[calc(50%-16px)] min-w-[18px] h-[18px] bg-solar-yellow text-absolute-black font-mono text-[9px] font-bold rounded-full flex items-center justify-center px-1">
              {cartCount}
            </span>
          )}
          <span className="font-mono text-[10px] tracking-widest uppercase">Bag</span>
        </button>
      </div>
    </nav>
  );
}
