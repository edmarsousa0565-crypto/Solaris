import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { trackAddToCart } from '../lib/pixel';

export interface CartItem {
  id?: string;
  cjPid?: string;
  name: string;
  price: string | number;
  image?: string;
  size?: string;
  color?: string;
  quantity: number;
  variantId?: string; // vid CJ (ex: "1234567890") — necessário para criar encomenda CJ
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size?: string, color?: string) => void;
  updateQuantity: (id: string, size: string | undefined, color: string | undefined, quantity: number) => void;
  clearCart: () => void;
  syncPrices: (featuredProducts: { id: string; cjPid: string; name: string; price: string; priceNum: number }[]) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      addItem: (product) => set((state) => {
        const itemToAdd = { ...product, quantity: product.quantity || 1 };

        const existingIndex = state.items.findIndex(item =>
          (item.cjPid === itemToAdd.cjPid || item.id === itemToAdd.id) &&
          item.size === itemToAdd.size &&
          item.color === itemToAdd.color
        );

        if (existingIndex > -1) {
          const newItems = [...state.items];
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: (newItems[existingIndex].quantity || 1) + itemToAdd.quantity,
          };
          return { items: newItems, isOpen: true };
        }
        return { items: [...state.items, itemToAdd], isOpen: true };
      }),
      removeItem: (id, size, color) => set((state) => ({
        items: state.items.filter(item =>
          !((item.id === id || item.cjPid === id) && item.size === size && item.color === color)
        ),
      })),
      updateQuantity: (id, size, color, quantity) => set((state) => {
        if (quantity <= 0) {
          return {
            items: state.items.filter(item =>
              !((item.id === id || item.cjPid === id) && item.size === size && item.color === color)
            ),
          };
        }
        return {
          items: state.items.map(item =>
            ((item.id === id || item.cjPid === id) && item.size === size && item.color === color)
              ? { ...item, quantity }
              : item
          ),
        };
      }),
      clearCart: () => set({ items: [] }),
      syncPrices: (featuredProducts) => set((state) => {
        const priceMap = new Map(
          featuredProducts.map(p => [p.cjPid || p.id, { price: p.price, name: p.name }])
        );
        const updated = state.items.map(item => {
          const key = item.cjPid || item.id || '';
          const match = priceMap.get(key);
          if (!match) return item;
          return { ...item, price: match.price, name: match.name };
        });
        return { items: updated };
      }),
    }),
    {
      name: 'solaris-cart',
      // isOpen não deve ser persistido — o drawer começa sempre fechado
      partialize: (state) => ({ items: state.items }),
    }
  )
);
