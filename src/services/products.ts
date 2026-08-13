import { api } from "@/convex/_generated/api";
import type { Product } from "@/data/products";
import { useQuery } from "convex/react";

/**
 * PawKart product service.
 *
 * Version 1 reads through Convex (which seeds the same catalog defined in
 * `src/data/products.ts`). When the Node.js/Express + MongoDB backend lands,
 * only these functions change — components keep their contracts.
 */

export type ProductDoc = Omit<Product, "category" | "badge"> & {
  _id: string;
  category: string;
  badge?: "BESTSELLER" | "NEW" | null;
};

export type ProductSort =
  | "featured"
  | "bestselling"
  | "newest"
  | "priceAsc"
  | "priceDesc"
  | "rating"
  | "discount";

export interface ProductListArgs {
  search?: string;
  category?: string;
  brand?: string;
  petType?: "dog" | "cat";
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  onSale?: boolean;
  sort?: ProductSort;
  limit?: number;
}

export interface ProductListResult {
  products: ProductDoc[];
  total: number;
  hasMore: boolean;
}

const CONVEX_ID_RE = /^[a-z0-9]{16,}$/i;

export function isConvexId(id: string): boolean {
  return CONVEX_ID_RE.test(id);
}

/** Reactive product list with filters/sort/pagination (see convex/products.ts).
 *  Pass "skip" to avoid subscribing (e.g. empty search input). */
export function useProducts(
  args: (ProductListArgs & { offset?: number }) | "skip" = {},
) {
  return useQuery(api.products.list, args === "skip" ? "skip" : args);
}

/** Single product by Convex id. Skips the query when the id is malformed. */
export function useProduct(id: string | undefined) {
  return useQuery(
    api.products.get,
    id && isConvexId(id) ? { id: id as never } : "skip",
  );
}

/** Best sellers carousel data. */
export function useBestsellers(limit = 8) {
  return useQuery(api.products.bestsellers, { limit });
}

/** New arrivals carousel data. */
export function useNewArrivals(limit = 8) {
  return useQuery(api.products.newArrivals, { limit });
}

/** Related products for a product detail page. */
export function useRelated(productId: string | undefined, limit = 8) {
  return useQuery(
    api.products.related,
    productId && isConvexId(productId)
      ? { productId: productId as never, limit }
      : "skip",
  );
}

/** Facet data: categories, brands and price range for the filter sidebar. */
export function useFacets() {
  return useQuery(api.products.filters);
}
