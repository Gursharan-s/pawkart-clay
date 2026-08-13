import type { Product } from "@/data/products";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartItem {
  sku: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  price: number; // locked at add time (standard e-commerce behaviour)
  mrp: number;
  qty: number;
  size?: string;
  stock: number;
}

export const FREE_DELIVERY_THRESHOLD = 999;
export const DELIVERY_FEE = 49;

/** Product shape the cart accepts — category is a free string (matches Convex docs). */
export type CartProduct = Omit<Product, "category" | "badge"> & {
  category: string;
  badge?: "BESTSELLER" | "NEW" | null;
};

const STORAGE_KEY = "pawkart:cart:v1";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  mrpTotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  freeDeliveryProgress: number; // 0-100
  addItem: (product: CartProduct, qty?: number, size?: string) => void;
  setQty: (sku: string, qty: number) => void;
  removeItem: (sku: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function load(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    return load();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable (private mode etc.) — cart still works in-memory
    }
  }, [items]);

  const addItem = useCallback(
    (product: CartProduct, qty = 1, size?: string) => {
      setItems((prev) => {
        const existing = prev.find(
          (i) => i.sku === product.sku && i.size === size,
        );
        if (existing) {
          return prev.map((i) =>
            i.sku === product.sku && i.size === size
              ? { ...i, qty: Math.min(i.qty + qty, i.stock) }
              : i,
          );
        }
        return [
          ...prev,
          {
            sku: product.sku,
            name: product.name,
            brand: product.brand,
            category: product.category,
            image: product.images[0],
            price: product.price,
            mrp: product.mrp,
            qty: Math.min(qty, product.stock),
            size,
            stock: product.stock,
          },
        ];
      });
    },
    [],
  );

  const setQty = useCallback((sku: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.sku === sku ? { ...i, qty: Math.max(0, Math.min(qty, i.stock)) } : i,
        )
        .filter((i) => i.qty > 0),
    );
  }, []);

  const removeItem = useCallback((sku: string) => {
    setItems((prev) => prev.filter((i) => i.sku !== sku));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const mrpTotal = items.reduce((sum, i) => sum + i.mrp * i.qty, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const discount = mrpTotal - subtotal;
    const deliveryFee =
      subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const total = subtotal + deliveryFee;
    const freeDeliveryProgress = Math.min(
      100,
      Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100),
    );

    return {
      items,
      count,
      subtotal,
      mrpTotal,
      discount,
      deliveryFee,
      total,
      freeDeliveryProgress,
      addItem,
      setQty,
      removeItem,
      clear,
    };
  }, [items, addItem, setQty, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
