import type { CartProduct } from "./cart";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useCart } from "./cart";

export interface WishlistItem {
  sku: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  price: number;
  mrp: number;
  stock: number;
}

const STORAGE_KEY = "pawkart:wishlist:v1";

interface WishlistContextValue {
  items: WishlistItem[];
  count: number;
  has: (sku: string) => boolean;
  toggle: (product: CartProduct) => void;
  add: (item: WishlistItem) => void;
  remove: (sku: string) => void;
  moveToCart: (sku: string) => void;
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function load(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WishlistItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    if (typeof window === "undefined") return [];
    return load();
  });
  const { addItem } = useCart();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable — wishlist works in-memory
    }
  }, [items]);

  const has = useCallback(
    (sku: string) => items.some((i) => i.sku === sku),
    [items],
  );

  const toggle = useCallback((product: CartProduct) => {
    setItems((prev) =>
      prev.some((i) => i.sku === product.sku)
        ? prev.filter((i) => i.sku !== product.sku)
        : [
            ...prev,
            {
              sku: product.sku,
              name: product.name,
              brand: product.brand,
              category: product.category,
              image: product.images[0],
              price: product.price,
              mrp: product.mrp,
              stock: product.stock,
            },
          ],
    );
  }, []);

  const add = useCallback((item: WishlistItem) => {
    setItems((prev) =>
      prev.some((i) => i.sku === item.sku) ? prev : [...prev, item],
    );
  }, []);

  const remove = useCallback((sku: string) => {
    setItems((prev) => prev.filter((i) => i.sku !== sku));
  }, []);

  const moveToCart = useCallback(
    (sku: string) => {
      const item = items.find((i) => i.sku === sku);
      if (!item) return;
      addItem(
        {
          sku: item.sku,
          name: item.name,
          brand: item.brand,
          category: item.category,
          petType: "dog", // unused in cart snapshot
          price: item.price,
          mrp: item.mrp,
          rating: 0,
          reviewCount: 0,
          stock: item.stock,
          images: [item.image],
          description: "",
          highlights: [],
          specs: [],
          tags: [],
          badge: null,
          isBestseller: false,
          isNew: false,
          createdAt: 0,
        },
        1,
      );
      setItems((prev) => prev.filter((i) => i.sku !== sku));
    },
    [items, addItem],
  );

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      count: items.length,
      has,
      toggle,
      add,
      remove,
      moveToCart,
      clear,
    }),
    [items, has, toggle, add, remove, moveToCart, clear],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within <WishlistProvider>");
  return ctx;
}
