import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  cjPid: string;
  name: string;
  price: string;
  image: string;
  category?: string;
}

interface WishlistStore {
  items: WishlistItem[];
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  toggle: (item: WishlistItem) => void;
  has: (cjPid: string) => boolean;
  remove: (cjPid: string) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setIsOpen: (v) => set({ isOpen: v }),
      toggle: (item) => set((state) => {
        const exists = state.items.some(i => i.cjPid === item.cjPid);
        return {
          items: exists
            ? state.items.filter(i => i.cjPid !== item.cjPid)
            : [...state.items, item],
        };
      }),
      has: (cjPid) => get().items.some(i => i.cjPid === cjPid),
      remove: (cjPid) => set((state) => ({ items: state.items.filter(i => i.cjPid !== cjPid) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'solaris-wishlist',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
