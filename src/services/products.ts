import { api } from "@/convex/_generated/api";
import { PRODUCTS, type Product } from "@/data/products";
import { useQuery } from "convex/react";

/**
 * PawKart Clay product service.
 *
 * Serves products via Convex when available, with instant fallback to the
 * 48-product sample catalog (`src/data/products.ts`) so content and photos
 * are always visible.
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

const discountPct = (p: { mrp: number; price: number }) =>
  Math.round(((p.mrp - p.price) / p.mrp) * 100);

function productToDoc(p: Product): ProductDoc {
  return {
    ...p,
    _id: p.sku,
    badge: p.badge === null ? undefined : p.badge,
  };
}

function filterAndSortProducts(args: ProductListArgs & { offset?: number }): ProductListResult {
  let rows = [...PRODUCTS];

  const q = (args.search ?? "").trim().toLowerCase();
  if (q) {
    rows = rows.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }
  if (args.category) rows = rows.filter((p) => p.category === args.category);
  if (args.brand) rows = rows.filter((p) => p.brand === args.brand);
  if (args.petType) rows = rows.filter((p) => p.petType === args.petType);
  if (args.tag) rows = rows.filter((p) => p.tags.includes(args.tag!));
  if (args.minPrice !== undefined)
    rows = rows.filter((p) => p.price >= args.minPrice!);
  if (args.maxPrice !== undefined)
    rows = rows.filter((p) => p.price <= args.maxPrice!);
  if (args.minRating !== undefined)
    rows = rows.filter((p) => p.rating >= args.minRating!);
  if (args.inStock) rows = rows.filter((p) => p.stock > 0);
  if (args.onSale) rows = rows.filter((p) => p.mrp > p.price);

  const sort = args.sort ?? "featured";
  rows.sort((a, b) => {
    switch (sort) {
      case "priceAsc":
        return a.price - b.price;
      case "priceDesc":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating || b.reviewCount - a.reviewCount;
      case "newest":
        return b.createdAt - a.createdAt;
      case "bestselling":
        return Number(b.isBestseller) - Number(a.isBestseller) || b.reviewCount - a.reviewCount;
      case "discount":
        return discountPct(b) - discountPct(a);
      case "featured":
      default:
        return Number(b.isBestseller) - Number(a.isBestseller) || b.rating - a.rating || b.reviewCount - a.reviewCount;
    }
  });

  const offset = args.offset ?? 0;
  const limit = args.limit ?? 12;
  const total = rows.length;
  const page = rows.slice(offset, offset + limit);

  return {
    products: page.map(productToDoc),
    total,
    hasMore: offset + page.length < total,
  };
}

/** Reactive product list with filters/sort/pagination, with fallback */
export function useProducts(
  args: (ProductListArgs & { offset?: number }) | "skip" = {},
): ProductListResult | undefined {
  const convexData = useQuery(api.products.list, args === "skip" ? "skip" : args);
  if (args === "skip") return undefined;
  if (convexData !== undefined) return convexData;
  return filterAndSortProducts(args);
}

/** Single product by Convex id or SKU fallback */
export function useProduct(id: string | undefined): ProductDoc | null | undefined {
  const convexData = useQuery(
    api.products.get,
    id && isConvexId(id) ? { id: id as never } : "skip",
  );
  if (convexData !== undefined) return convexData;
  if (!id) return undefined;
  const found = PRODUCTS.find(
    (p) => p.sku === id || p.sku.toLowerCase() === id.toLowerCase(),
  );
  return found ? productToDoc(found) : null;
}

/** Best sellers carousel data with fallback */
export function useBestsellers(limit = 8): ProductDoc[] {
  const convexData = useQuery(api.products.bestsellers, { limit });
  if (convexData !== undefined) return convexData;
  return PRODUCTS.filter((p) => p.isBestseller)
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, limit)
    .map(productToDoc);
}

/** New arrivals carousel data with fallback */
export function useNewArrivals(limit = 8): ProductDoc[] {
  const convexData = useQuery(api.products.newArrivals, { limit });
  if (convexData !== undefined) return convexData;
  return PRODUCTS.filter((p) => p.isNew)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit)
    .map(productToDoc);
}

/** Related products for a product detail page with fallback */
export function useRelated(productId: string | undefined, limit = 8): ProductDoc[] {
  const convexData = useQuery(
    api.products.related,
    productId && isConvexId(productId)
      ? { productId: productId as never, limit }
      : "skip",
  );
  if (convexData !== undefined) return convexData;
  if (!productId) return [];
  const target = PRODUCTS.find(
    (p) => p.sku === productId || p.sku.toLowerCase() === productId.toLowerCase(),
  );
  const category = target?.category ?? PRODUCTS[0]?.category;
  return PRODUCTS.filter((p) => p.sku !== productId && p.category === category)
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, limit)
    .map(productToDoc);
}

/** Facet data with fallback */
export function useFacets() {
  const convexData = useQuery(api.products.filters);
  if (convexData !== undefined) return convexData;

  const categories = new Map<
    string,
    { name: string; count: number; petType: string }
  >();
  const brands = new Map<string, number>();
  let minPrice = Infinity;
  let maxPrice = 0;

  for (const p of PRODUCTS) {
    const cat = categories.get(p.category) ?? {
      name: p.category,
      count: 0,
      petType: p.petType,
    };
    cat.count += 1;
    categories.set(p.category, cat);
    brands.set(p.brand, (brands.get(p.brand) ?? 0) + 1);
    minPrice = Math.min(minPrice, p.price);
    maxPrice = Math.max(maxPrice, p.price);
  }

  return {
    categories: [...categories.values()].sort((a, b) => a.name.localeCompare(b.name)),
    brands: [...brands.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    minPrice: minPrice === Infinity ? 0 : minPrice,
    maxPrice,
  };
}

