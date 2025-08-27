import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  id: string;
  name: string;
  price?: number;
  image?: string | null;
}

interface WishlistState {
  items: WishlistItem[];
  add: (item: WishlistItem) => void;
  remove: (id: string) => void;
  toggle: (item: WishlistItem) => void;
  clear: () => void;
  contains: (id: string) => boolean;
  count: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        const items = get().items.slice();
        if (!items.find((i) => i.id === item.id)) items.push(item);
        set({ items });
      },
      remove: (id) => {
        const items = get().items.filter((i) => i.id !== id);
        set({ items });
      },
      toggle: (item) => {
        const exists = get().items.find((i) => i.id === item.id);
        if (exists) {
          set({ items: get().items.filter((i) => i.id !== item.id) });
        } else {
          set({ items: [...get().items, item] });
        }
      },
      clear: () => set({ items: [] }),
      contains: (id) => !!get().items.find((i) => i.id === id),
      count: () => get().items.length,
    }),
    {
      name: "wishlist-storage",
    }
  )
);