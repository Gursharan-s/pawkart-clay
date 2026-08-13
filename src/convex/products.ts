import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { CATALOG_VERSION, PRODUCTS } from "../data/products";

/**
 * PawKart product catalog API.
 * Version 1 serves the static sample catalog through Convex so the store is
 * fully functional end-to-end. The service layer on the frontend
 * (`src/services/products.ts`) is the single swap point for a REST
 * (Node.js/Express + MongoDB) backend in the next version.
 */

export const SortOption = v.optional(
  v.union(
    v.literal("featured"),
    v.literal("bestselling"),
    v.literal("newest"),
    v.literal("priceAsc"),
    v.literal("priceDesc"),
    v.literal("rating"),
    v.literal("discount"),
  ),
);

const discountPct = (p: { mrp: number; price: number }) =>
  Math.round(((p.mrp - p.price) / p.mrp) * 100);

type Sortable = {
  price: number;
  mrp: number;
  rating: number;
  reviewCount: number;
  isBestseller: boolean;
  createdAt: number;
};

function bySort(sort: string) {
  switch (sort) {
    case "priceAsc":
      return (a: Sortable, b: Sortable) => a.price - b.price;
    case "priceDesc":
      return (a: Sortable, b: Sortable) => b.price - a.price;
    case "rating":
      return (a: Sortable, b: Sortable) =>
        b.rating - a.rating || b.reviewCount - a.reviewCount;
    case "newest":
      return (a: Sortable, b: Sortable) => b.createdAt - a.createdAt;
    case "bestselling":
      return (a: Sortable, b: Sortable) =>
        Number(b.isBestseller) - Number(a.isBestseller) ||
        b.reviewCount - a.reviewCount;
    case "discount":
      return (a: Sortable, b: Sortable) => discountPct(b) - discountPct(a);
    case "featured":
    default:
      return (a: Sortable, b: Sortable) =>
        Number(b.isBestseller) - Number(a.isBestseller) ||
        b.rating - a.rating ||
        b.reviewCount - a.reviewCount;
  }
}

export const list = query({
  args: {
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    brand: v.optional(v.string()),
    petType: v.optional(v.union(v.literal("dog"), v.literal("cat"))),
    tag: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    minRating: v.optional(v.number()),
    inStock: v.optional(v.boolean()),
    onSale: v.optional(v.boolean()),
    sort: SortOption,
    offset: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let rows = await ctx.db.query("products").collect();

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

    rows.sort(bySort(args.sort ?? "featured"));

    const offset = args.offset ?? 0;
    const limit = args.limit ?? 12;
    const total = rows.length;
    const page = rows.slice(offset, offset + limit);

    return { products: page, total, hasMore: offset + page.length < total };
  },
});

export const get = query({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const byIds = query({
  args: { ids: v.array(v.id("products")) },
  handler: async (ctx, { ids }) => {
    const unique = [...new Set(ids)];
    const rows = await Promise.all(unique.map((id) => ctx.db.get(id)));
    return rows.filter((r): r is NonNullable<typeof r> => r !== null);
  },
});

export const bestsellers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const rows = await ctx.db
      .query("products")
      .withIndex("by_bestseller", (q) => q.eq("isBestseller", true))
      .collect();
    return rows
      .sort(
        (a, b) =>
          b.rating - a.rating || b.reviewCount - a.reviewCount,
      )
      .slice(0, limit ?? 8);
  },
});

export const newArrivals = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const rows = await ctx.db
      .query("products")
      .withIndex("by_new", (q) => q.eq("isNew", true))
      .collect();
    return rows
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit ?? 8);
  },
});

export const related = query({
  args: {
    productId: v.id("products"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { productId, limit }) => {
    const product = await ctx.db.get(productId);
    if (!product) return [];
    const rows = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", product.category))
      .collect();
    return rows
      .filter((p) => p._id !== productId)
      .sort(
        (a, b) =>
          b.rating - a.rating || b.reviewCount - a.reviewCount,
      )
      .slice(0, limit ?? 8);
  },
});

export const filters = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("products").collect();
    const categories = new Map<
      string,
      { name: string; count: number; petType: string }
    >();
    const brands = new Map<string, number>();
    let minPrice = Infinity;
    let maxPrice = 0;

    for (const p of rows) {
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
      categories: [...categories.values()].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
      brands: [...brands.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      minPrice: minPrice === Infinity ? 0 : minPrice,
      maxPrice,
    };
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => (await ctx.db.query("products").collect()).length,
});

/**
 * Idempotent seed — inserts the sample catalog once, and re-seeds when the
 * catalog version bumps. Safe to call from the client on first load.
 */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const meta = await ctx.db
      .query("seedMeta")
      .withIndex("by_key", (q) => q.eq("key", "catalog"))
      .first();

    const current = (await ctx.db.query("products").collect()).length;
    if (meta && meta.version >= CATALOG_VERSION && current > 0) {
      return { seeded: false, count: current };
    }

    // wipe stale sample data before re-seeding a new catalog version
    const existing = await ctx.db.query("products").collect();
    await Promise.all(existing.map((p) => ctx.db.delete(p._id)));

    for (const p of PRODUCTS) {
      await ctx.db.insert("products", {
        ...p,
        badge: p.badge === null ? undefined : p.badge,
      });
    }

    if (meta) {
      await ctx.db.patch(meta._id, { version: CATALOG_VERSION });
    } else {
      await ctx.db.insert("seedMeta", {
        key: "catalog",
        version: CATALOG_VERSION,
      });
    }

    return { seeded: true, count: PRODUCTS.length };
  },
});
