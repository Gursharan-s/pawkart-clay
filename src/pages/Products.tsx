import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { SectionHeader } from "@/components/SectionHeader";
import { useFacets, useProducts, type ProductSort } from "@/services/products";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, Filter, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";

const PAGE_SIZE = 12;

const SORTS: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "bestselling", label: "Best Selling" },
  { value: "newest", label: "Newest" },
  { value: "priceAsc", label: "Price: Low to High" },
  { value: "priceDesc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "discount", label: "Biggest Discount" },
];

const PRICE_PRESETS: { label: string; min?: number; max?: number }[] = [
  { label: "Under ₹500", max: 500 },
  { label: "₹500 – ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 – ₹2,000", min: 1000, max: 2000 },
  { label: "Above ₹2,000", min: 2000 },
];

const RATING_OPTIONS = [4, 3] as const;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? undefined;
  const brand = searchParams.get("brand") ?? undefined;
  const petType = searchParams.get("petType") as "dog" | "cat" | null;
  const tag = searchParams.get("tag") ?? undefined;
  const minPrice = searchParams.get("minPrice") ?? undefined;
  const maxPrice = searchParams.get("maxPrice") ?? undefined;
  const minRating = searchParams.get("minRating") ?? undefined;
  const inStock = searchParams.get("inStock") === "true";
  const onSale = searchParams.get("onSale") === "true";
  const sort = (searchParams.get("sort") as ProductSort) ?? "featured";

  const facets = useFacets();

  const result = useProducts({
    search: q || undefined,
    category,
    brand,
    petType: petType ?? undefined,
    tag,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    minRating: minRating ? Number(minRating) : undefined,
    inStock: inStock || undefined,
    onSale: onSale || undefined,
    sort,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const total = result?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const update = (patch: Record<string, string | undefined>, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === "" || value === "false") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    if (resetPage) setPage(1);
    setSearchParams(next, { replace: true });
  };

  const clearAll = () => {
    setPage(1);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const activeFilterCount = [
    q,
    category,
    brand,
    petType,
    tag,
    minPrice,
    maxPrice,
    minRating,
    inStock ? "1" : "",
    onSale ? "1" : "",
  ].filter(Boolean).length;

  const selectedCategory = useMemo(() => {
    if (category) return category;
    if (petType === "dog") return "Dogs";
    if (petType === "cat") return "Cats";
    return tag ? tag : null;
  }, [category, petType, tag]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      <SectionHeader
        align="left"
        eyebrow="Catalogue"
        title={
          selectedCategory
            ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
            : "All Products"
        }
        subtitle={q ? `Results for “${q}”` : `${total} products, hand-picked for your pet`}
      />

      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-clay-ink/40" />
          <input
            value={q}
            onChange={(e) => update({ q: e.target.value || undefined })}
            placeholder="Search products…"
            className="h-11 w-full rounded-2xl border border-clay-ink/10 bg-white pl-10 pr-4 text-sm font-medium text-clay-ink placeholder:text-clay-ink/40 focus:border-clay-orange focus:outline-none focus:ring-2 focus:ring-clay-orange/25 clay-pressed"
          />
        </div>

        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-2xl border border-clay-ink/10 bg-white px-4 text-sm font-bold text-clay-ink transition-colors hover:text-clay-orange lg:hidden clay-tile",
            filtersOpen && "text-clay-orange",
          )}
        >
          <SlidersHorizontal className="size-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-clay-orange text-[10px] font-extrabold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="relative ml-auto">
          <select
            value={sort}
            onChange={(e) => update({ sort: e.target.value })}
            aria-label="Sort products"
            className="h-11 cursor-pointer appearance-none rounded-2xl border border-clay-ink/10 bg-white pl-4 pr-10 text-sm font-bold text-clay-ink focus:border-clay-orange focus:outline-none clay-tile"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-clay-ink/40" />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside
          className={cn(
            "w-60 shrink-0 lg:block",
            filtersOpen ? "block" : "hidden",
          )}
        >
          <div className="sticky top-32 space-y-5 rounded-[1.75rem] border border-clay-ink/5 bg-card p-5 clay-tile">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-extrabold text-clay-ink">
                <Filter className="size-4 text-clay-orange" /> Filters
              </p>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs font-bold text-clay-orange hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Category */}
            <FilterGroup title="Category">
              <ul className="space-y-1">
                {facets?.categories.map((c) => (
                  <li key={c.name}>
                    <button
                      type="button"
                      onClick={() => update({ category: c.name === category ? undefined : c.name, petType: undefined, tag: undefined })}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-sm font-semibold transition-colors",
                        category === c.name
                          ? "bg-clay-blush/70 text-clay-orange"
                          : "text-clay-ink/70 hover:bg-clay-sand/50",
                      )}
                    >
                      {c.name}
                      <span className="text-xs text-clay-ink/40">{c.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </FilterGroup>

            {/* Brand */}
            <FilterGroup title="Brand">
              <ul className="space-y-1">
                {facets?.brands.map((b) => (
                  <li key={b.name}>
                    <button
                      type="button"
                      onClick={() => update({ brand: b.name === brand ? undefined : b.name })}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-sm font-semibold transition-colors",
                        brand === b.name
                          ? "bg-clay-blush/70 text-clay-orange"
                          : "text-clay-ink/70 hover:bg-clay-sand/50",
                      )}
                    >
                      {b.name}
                      <span className="text-xs text-clay-ink/40">{b.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </FilterGroup>

            {/* Price */}
            <FilterGroup title="Price">
              <div className="flex flex-wrap gap-1.5">
                {PRICE_PRESETS.map((preset) => {
                  const active =
                    (preset.min === undefined || Number(minPrice) === preset.min) &&
                    (preset.max === undefined || Number(maxPrice) === preset.max);
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        update(
                          active
                            ? { minPrice: undefined, maxPrice: undefined }
                            : { minPrice: preset.min?.toString(), maxPrice: preset.max?.toString() },
                        )
                      }
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
                        active
                          ? "bg-clay-orange text-white"
                          : "bg-clay-sand/60 text-clay-ink/70 hover:bg-clay-sand",
                      )}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  placeholder="Min"
                  value={minPrice ?? ""}
                  onChange={(e) => update({ minPrice: e.target.value || undefined })}
                  className="h-9 w-full rounded-xl border border-clay-ink/10 bg-white px-2.5 text-xs font-semibold focus:border-clay-orange focus:outline-none"
                />
                <span className="text-clay-ink/30">–</span>
                <input
                  type="number"
                  min={0}
                  placeholder="Max"
                  value={maxPrice ?? ""}
                  onChange={(e) => update({ maxPrice: e.target.value || undefined })}
                  className="h-9 w-full rounded-xl border border-clay-ink/10 bg-white px-2.5 text-xs font-semibold focus:border-clay-orange focus:outline-none"
                />
              </div>
              <p className="mt-2 text-[11px] font-semibold text-clay-ink/40">
                Range: {formatINR(facets?.minPrice ?? 0)} – {formatINR(facets?.maxPrice ?? 0)}
              </p>
            </FilterGroup>

            {/* Rating */}
            <FilterGroup title="Rating">
              <ul className="space-y-1">
                {RATING_OPTIONS.map((r) => (
                  <li key={r}>
                    <button
                      type="button"
                      onClick={() => update({ minRating: Number(minRating) === r ? undefined : String(r) })}
                      className={cn(
                        "flex w-full items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-semibold transition-colors",
                        Number(minRating) === r
                          ? "bg-clay-blush/70 text-clay-orange"
                          : "text-clay-ink/70 hover:bg-clay-sand/50",
                      )}
                    >
                      <span className="text-amber-400">{r}.0+</span>
                      <span className="text-xs text-clay-ink/40">★★★★</span>
                    </button>
                  </li>
                ))}
              </ul>
            </FilterGroup>

            {/* Availability */}
            <FilterGroup title="Availability">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-clay-ink/75">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => update({ inStock: e.target.checked ? "true" : undefined })}
                  className="size-4 accent-clay-orange"
                />
                In stock only
              </label>
              <label className="mt-2 flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-clay-ink/75">
                <input
                  type="checkbox"
                  checked={onSale}
                  onChange={(e) => update({ onSale: e.target.checked ? "true" : undefined })}
                  className="size-4 accent-clay-orange"
                />
                On sale
              </label>
            </FilterGroup>
          </div>
        </aside>

        {/* Grid */}
        <div className="min-w-0 flex-1">
          {result === undefined ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : result.products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-clay-ink/15 bg-card/60 px-6 py-20 text-center clay-tile">
              <span className="text-5xl">🐾</span>
              <h3 className="mt-4 font-display text-xl font-bold text-clay-ink">
                No products found
              </h3>
              <p className="mt-2 max-w-sm text-sm text-clay-ink/55">
                We couldn't find anything matching your filters. Try clearing
                them or searching for something else.
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-5 rounded-2xl bg-clay-orange px-5 py-2.5 text-sm font-extrabold text-white transition-all hover:brightness-105 clay-btn"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={`${page}-${q}-${category}-${brand}-${sort}-${tag}-${petType}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
                >
                  {result.products.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                    className="flex size-10 items-center justify-center rounded-2xl bg-white text-clay-ink transition-colors hover:text-clay-orange disabled:opacity-40 clay-tile"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPage(i + 1)}
                      className={cn(
                        "size-10 rounded-2xl text-sm font-extrabold transition-colors",
                        page === i + 1
                          ? "bg-clay-orange text-white clay-tile"
                          : "bg-white text-clay-ink hover:text-clay-orange clay-tile",
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Next page"
                    className="flex size-10 items-center justify-center rounded-2xl bg-white text-clay-ink transition-colors hover:text-clay-orange disabled:opacity-40 clay-tile"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-clay-ink/45">
        {title}
      </p>
      {children}
    </div>
  );
}
