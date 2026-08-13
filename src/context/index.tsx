import type { ReactNode } from "react";
import { CartProvider } from "./cart";
import { WishlistProvider } from "./wishlist";

export { CartProvider, useCart, FREE_DELIVERY_THRESHOLD, DELIVERY_FEE } from "./cart";
export type { CartItem } from "./cart";
export { WishlistProvider, useWishlist } from "./wishlist";
export type { WishlistItem } from "./wishlist";

/** Cart must wrap Wishlist (move-to-cart depends on the cart actions). */
export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <WishlistProvider>{children}</WishlistProvider>
    </CartProvider>
  );
}
