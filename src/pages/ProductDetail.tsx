import { ProductCard } from "@/components/ProductCard";
import { CarouselSkeleton } from "@/components/ProductCardSkeleton";
import { ProductCarousel, CarouselItem } from "@/components/ProductCarousel";
import { RatingStars } from "@/components/RatingStars";
import { SectionHeader } from "@/components/SectionHeader";
import { useCart, useWishlist } from "@/context";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { estimateDelivery, isValidPincode } from "@/lib/pincode";
import { discountPct, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { isConvexId, useProduct, useProducts, useRelated, type ProductDoc } from "@/services/products";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Check,
  ChevronRight,
  Heart,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

/* ─── Sample reviews (deterministic per product) ───────────────── */

const REVIEW_POOL = [
  { name: "Riya Kapoor", city: "Mumbai", rating: 5, text: "Exactly what I hoped for. Quality is fantastic and my pet is obsessed with it. Ordering again for sure!" },
  { name: "Arjun Nair", city: "Kochi", rating: 5, text: "Great value for money. Packaging was neat and delivery took just two days to Kerala." },
  { name: "Megha Singh", city: "Lucknow", rating: 4, text: "Really good product. Slightly smaller than expected but the quality makes up for it." },
  { name: "Vikram Reddy", city: "Hyderabad", rating: 5, text: "My vet actually recommended this. Both my dogs love it and it's easy to serve." },
  { name: "Ananya Iyer", city: "Chennai", rating: 4, text: "Solid buy. Would love a bigger pack size, but the product itself is great." },
  { name: "Kabir Malhotra", city: "Chandigarh", rating: 5, text: "Superb quality at this price point. PawKart has become our go-to store." },
  { name: "Farah Khan", city: "Bhopal", rating: 4, text: "Good product, arrived well packed. My cat took a couple of days to warm up to it, now she loves it." },
  { name: "Dev Patel", city: "Surat", rating: 5, text: "Honestly impressed. The quality feels premium and the free delivery above ₹999 sealed the deal." },
  { name: "Sana Sheikh", city: "Nagpur", rating: 4, text: "Works as described. Customer support was quick to answer my questions too." },
  { name: "Rohit Bose", city: "Kolkata", rating: 5, text: "Third time ordering this. Consistency in quality is what keeps me coming back." },
  { name: "Aditi Rao", city: "Pune", rating: 4, text: "Very good overall. Wish there were more flavour options, but highly recommended." },
  { name: "Gaurav Joshi", city: "Indore", rating: 5, text: "My puppy devours this. Delivery was fast and the product was fresh." },
] as const;

function reviewsFor(sku: string, count = 3) {
  const hash = [...sku].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return Array.from({ length: count }, (_, i) => {
    const r = REVIEW_POOL[(hash + i * 3) % REVIEW_POOL.length];
    const daysAgo = (hash * (i + 3)) % 40 + 2;
    return {
      ...r,
      date: new Date(Date.now() - daysAgo * 86_400_000).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
  });
}

/* ─── Pincode checker ──────────────────────────────────────────── */

function PincodeChecker() {
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [eta, setEta] = useState("");

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPincode(pincode)) {
      setState("error");
      return;
    }
    setState("loading");
    setTimeout(() => {
      setEta(estimateDelivery(pincode));
      setState("ok");
    }, 600);
  };

  return (
    <div className="rounded-2xl border border-clay-ink/8 bg-clay-sand/40 p-4">
      <p className="flex items-center gap-1.5 text-sm font-extrabold text-clay-ink">
        <Truck className="size-4 text-clay-orange" /> Delivery pincode
      </p>
      <form onSubmit={check} className="mt-2.5 flex gap-2">
        <input
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
            setState("idle");
          }}
          placeholder="e.g. 400001"
          inputMode="numeric"
          className="h-10 w-32 rounded-xl border border-clay-ink/10 bg-white px-3 text-sm font-bold tracking-widest focus:border-clay-orange focus:outline-none"
        />
        <button
          type="submit"
          className="h-10 rounded-xl bg-clay-ink px-4 text-xs font-extrabold text-white transition-all hover:brightness-110 clay-btn"
        >
          {state === "loading" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Check"
          )}
        </button>
      </form>
      <div className="mt-2 text-xs font-semibold">
        {state === "ok" && (
          <p className="flex items-center gap-1.5 text-clay-green">
            <Check className="size-3.5" /> Delivery by {eta}
          </p>
        )}
        {state === "error" && (
          <p className="text-rose-600">Please enter a valid 6-digit pincode.</p>
        )}
      </div>
    </div>
  );
}

/* ─── Main page ────────────────────────────────────────────────── */

export default function ProductDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Links can arrive as a Convex id (/product/<id>) or a SKU (/product/PK-DF-001)
  const direct = useProduct(id);
  const bySku = useProducts(
    id && !isConvexId(id) ? { search: id, limit: 1 } : "skip",
  );
  const product: ProductDoc | null | undefined = isConvexId(id)
    ? direct
    : bySku?.products?.[0];
  const loading = isConvexId(id) ? direct === undefined : bySku === undefined;

  const related = useRelated(product?._id, 8);

  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const { track } = useRecentlyViewed();

  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<string | undefined>(undefined);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"desc" | "specs">("desc");

  const wished = product ? has(product.sku) : false;

  useEffect(() => {
    if (product) track(product.sku);
  }, [product, track]);

  useEffect(() => {
    setQty(1);
    setSize(undefined);
    setActiveImage(0);
    setActiveTab("desc");
  }, [id]);

  const reviews = useMemo(
    () => (product ? reviewsFor(product.sku) : []),
    [product],
  );

  const frequentlyBought = useMemo(() => {
    if (!related || related.length < 3) return [];
    // "bought together": related products, excluding ones with the same sku
    return related.filter((r) => r.sku !== product?.sku).slice(0, 2);
  }, [related, product]);

  const pct = product ? discountPct(product.price, product.mrp) : 0;

  if (loading || product === undefined) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-28 text-center">
        <span className="text-6xl">🐾</span>
        <h1 className="font-display mt-5 text-2xl font-bold text-clay-ink">
          Loading product…
        </h1>
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-28 text-center">
        <span className="text-6xl">🐾</span>
        <h1 className="font-display mt-5 text-2xl font-bold text-clay-ink">
          Product not found
        </h1>
        <p className="mt-2 max-w-sm text-sm text-clay-ink/55">
          The product you're looking for may have been removed or the link is
          incorrect.
        </p>
        <Link
          to="/products"
          className="clay-btn mt-6 h-11 rounded-2xl bg-clay-orange px-6 text-sm font-extrabold text-white"
        >
          Browse all products
        </Link>
      </div>
    );
  }

  const handleAdd = (goToCart = false) => {
    addItem(product, qty, size);
    toast.success("Added to cart", {
      description: `${product.name.slice(0, 48)}${size ? ` · ${size}` : ""}`,
      action: { label: "View cart", onClick: () => window.location.assign("/cart") },
    });
    if (goToCart) navigate("/cart");
  };

  const handleWishlist = () => {
    toggle(product);
    toast[wished ? "info" : "success"](
      wished ? "Removed from wishlist" : "Saved to wishlist ♥",
    );
  };

  const outOfStock = product.stock <= 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:py-8 lg:pb-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-xs font-semibold text-clay-ink/50">
        <Link to="/" className="hover:text-clay-orange">Home</Link>
        <ChevronRight className="size-3" />
        <Link to={`/products?petType=${product.petType}`} className="hover:text-clay-orange capitalize">
          {product.petType === "dog" ? "Dogs" : "Cats"}
        </Link>
        <ChevronRight className="size-3" />
        <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-clay-orange">
          {product.category}
        </Link>
        <ChevronRight className="size-3" />
        <span className="max-w-[220px] truncate text-clay-ink/70">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        <div>
          <div className="relative overflow-hidden rounded-[2rem] border-4 border-white clay-surface">
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="aspect-[4/3.4] w-full object-cover"
            />
            {product.badge && (
              <span
                className={cn(
                  "absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-widest text-white clay-tile",
                  product.badge === "BESTSELLER" ? "bg-clay-orange" : "bg-clay-green",
                )}
              >
                {product.badge}
              </span>
            )}
          </div>
          <div className="mt-3 flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={img + i}
                type="button"
                onClick={() => setActiveImage(i)}
                aria-label={`View image ${i + 1}`}
                className={cn(
                  "overflow-hidden rounded-2xl border-2 transition-all",
                  activeImage === i
                    ? "border-clay-orange clay-surface-sm"
                    : "border-white opacity-70 hover:opacity-100",
                )}
              >
                <img src={img} alt="" className="size-20 object-cover sm:size-24" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <p className="text-sm font-extrabold uppercase tracking-widest text-clay-orange">
            {product.brand}
          </p>
          <h1 className="font-display mt-1.5 text-2xl font-bold leading-snug tracking-tight text-clay-ink sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-clay-mint px-3 py-1 font-extrabold text-clay-green clay-tile">
              <RatingStars rating={product.rating} />
              {product.rating.toFixed(1)}
            </span>
            <span className="font-semibold text-clay-ink/50">
              {product.reviewCount.toLocaleString("en-IN")} verified reviews
            </span>
            <span className="flex items-center gap-1 rounded-full bg-clay-sand/70 px-2.5 py-1 text-xs font-bold text-clay-ink/60">
              <BadgeCheck className="size-3.5 text-clay-green" /> Vet reviewed
            </span>
          </div>

          {/* Price */}
          <div className="mt-5 flex flex-wrap items-baseline gap-2.5">
            <span className="text-3xl font-extrabold text-clay-ink">
              {formatINR(product.price)}
            </span>
            {pct > 0 && (
              <>
                <span className="text-lg font-semibold text-clay-ink/35 line-through">
                  {formatINR(product.mrp)}
                </span>
                <span className="rounded-full bg-clay-blush px-2.5 py-1 text-xs font-extrabold text-clay-orange">
                  {pct}% OFF
                </span>
              </>
            )}
          </div>
          <p className="mt-1.5 text-xs font-semibold text-clay-ink/50">
            Inclusive of all taxes · {outOfStock ? "Currently out of stock" : `${product.stock} units in stock`}
          </p>

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-clay-ink/50">
                Select size
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={cn(
                      "rounded-2xl border-2 px-4 py-2 text-sm font-bold transition-all",
                      size === s
                        ? "border-clay-orange bg-clay-blush/50 text-clay-orange"
                        : "border-clay-ink/10 bg-white text-clay-ink/70 hover:border-clay-orange/50",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-2xl border border-clay-ink/10 bg-white clay-pressed">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="flex size-11 items-center justify-center text-clay-ink transition-colors hover:text-clay-orange"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center text-sm font-extrabold text-clay-ink">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                aria-label="Increase quantity"
                className="flex size-11 items-center justify-center text-clay-ink transition-colors hover:text-clay-orange"
              >
                <Plus className="size-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleWishlist}
              className={cn(
                "flex h-12 items-center gap-2 rounded-2xl border-2 px-4 text-sm font-extrabold transition-all",
                wished
                  ? "border-rose-300 bg-rose-50 text-rose-500"
                  : "border-clay-ink/10 bg-white text-clay-ink hover:border-rose-300 hover:text-rose-500",
              )}
            >
              <Heart className={cn("size-4.5", wished && "fill-rose-500")} />
              {wished ? "Wishlisted" : "Wishlist"}
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleAdd(false)}
              disabled={outOfStock}
              className="clay-btn h-13 rounded-2xl bg-clay-ink text-sm font-extrabold tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag className="size-4.5" /> Add to Cart
            </button>
            <button
              type="button"
              onClick={() => handleAdd(true)}
              disabled={outOfStock}
              className="clay-btn h-13 rounded-2xl bg-clay-orange text-sm font-extrabold tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Zap className="size-4.5" /> Buy Now
            </button>
          </div>

          {/* Trust + pincode */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <PincodeChecker />
            <div className="rounded-2xl border border-clay-ink/8 bg-clay-mint/40 p-4">
              <p className="flex items-center gap-1.5 text-sm font-extrabold text-clay-ink">
                <ShieldCheck className="size-4 text-clay-green" /> PawKart Promise
              </p>
              <ul className="mt-2 space-y-1.5 text-xs font-semibold text-clay-ink/65">
                <li className="flex items-center gap-1.5"><Check className="size-3.5 text-clay-green" /> 100% genuine, vet-approved products</li>
                <li className="flex items-center gap-1.5"><Check className="size-3.5 text-clay-green" /> 30-day easy returns & refunds</li>
                <li className="flex items-center gap-1.5"><Check className="size-3.5 text-clay-green" /> Free delivery on orders above ₹999</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs: description / specs */}
      <div className="mt-12 rounded-[2rem] border border-clay-ink/5 bg-card p-6 sm:p-8 clay-tile">
        <div className="flex gap-2 border-b border-clay-ink/8 pb-3">
          {(
            [
              { key: "desc", label: "Description & Benefits" },
              { key: "specs", label: "Specifications" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "rounded-2xl px-4 py-2 text-sm font-extrabold transition-colors",
                activeTab === tab.key
                  ? "bg-clay-blush/70 text-clay-orange"
                  : "text-clay-ink/50 hover:text-clay-ink",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "desc" ? (
          <div className="grid gap-8 pt-6 md:grid-cols-2">
            <div>
              <h3 className="font-display text-lg font-bold text-clay-ink">About this product</h3>
              <p className="mt-2 text-sm leading-7 text-clay-ink/70">{product.description}</p>
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-clay-ink">Key benefits</h3>
              <ul className="mt-2 space-y-2">
                {product.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-sm font-semibold text-clay-ink/75">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-clay-mint text-clay-green">
                      <Check className="size-3" />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="pt-6">
            <dl className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
              {product.specs.map((spec) => (
                <div key={spec.label} className="flex justify-between gap-4 border-b border-clay-ink/6 pb-2.5">
                  <dt className="text-sm font-bold text-clay-ink/50">{spec.label}</dt>
                  <dd className="text-right text-sm font-extrabold text-clay-ink">{spec.value}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 border-b border-clay-ink/6 pb-2.5">
                <dt className="text-sm font-bold text-clay-ink/50">SKU</dt>
                <dd className="text-right text-sm font-extrabold text-clay-ink">{product.sku}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      {/* Frequently bought together */}
      {frequentlyBought.length > 0 && (
        <div className="mt-12 rounded-[2rem] border border-clay-ink/5 bg-clay-butter/40 p-6 sm:p-8 clay-tile">
          <h3 className="font-display text-xl font-bold text-clay-ink">
            Frequently bought together
          </h3>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <ProductChip product={product} />
            <Plus className="size-4 text-clay-ink/40" />
            {frequentlyBought.map((p) => (
              <ProductChip key={p._id} product={p} />
            ))}
            <button
              type="button"
              onClick={() => {
                addItem(product, 1, size);
                frequentlyBought.forEach((p) => addItem(p, 1));
                toast.success("Bundle added to cart! 🛍️", {
                  action: { label: "View cart", onClick: () => window.location.assign("/cart") },
                });
              }}
              className="clay-btn h-11 rounded-2xl bg-clay-orange px-5 text-xs font-extrabold text-white"
            >
              Add all to cart
            </button>
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="mt-12">
        <SectionHeader
          align="left"
          eyebrow="Reviews"
          title={`What pet parents say`}
          subtitle={`${product.reviewCount.toLocaleString("en-IN")} verified ratings · ${product.rating.toFixed(1)} average`}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map((review, i) => (
            <div key={i} className="rounded-[1.5rem] border border-clay-ink/5 bg-card p-5 clay-tile">
              <div className="flex items-center justify-between">
                <RatingStars rating={review.rating} />
                <span className="text-[11px] font-semibold text-clay-ink/40">{review.date}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-clay-ink/75">“{review.text}”</p>
              <p className="mt-4 text-xs font-extrabold text-clay-ink">
                {review.name} <span className="font-semibold text-clay-ink/45">· {review.city}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Related */}
      <div className="mt-14">
        <SectionHeader
          eyebrow="You may also like"
          title="Related products"
          viewAllTo={`/products?category=${encodeURIComponent(product.category)}`}
        />
        {related ? (
          <ProductCarousel ariaLabel="Related products">
            {related.map((p) => (
              <CarouselItem key={p._id}>
                <ProductCard product={p} />
              </CarouselItem>
            ))}
          </ProductCarousel>
        ) : (
          <CarouselSkeleton />
        )}
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-clay-ink/10 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0">
            <p className="text-base font-extrabold text-clay-ink">{formatINR(product.price)}</p>
            {pct > 0 && (
              <p className="text-[11px] font-semibold text-clay-ink/45 line-through">
                {formatINR(product.mrp)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleAdd(false)}
            disabled={outOfStock}
            className="clay-btn h-11 flex-1 rounded-2xl bg-clay-ink text-xs font-extrabold text-white disabled:opacity-50"
          >
            Add to Cart
          </button>
          <button
            type="button"
            onClick={() => handleAdd(true)}
            disabled={outOfStock}
            className="clay-btn h-11 flex-1 rounded-2xl bg-clay-orange text-xs font-extrabold text-white disabled:opacity-50"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductChip({ product }: { product: ProductDoc }) {
  return (
    <Link
      to={`/product/${product._id}`}
      className="flex min-w-0 items-center gap-2.5 rounded-2xl border border-clay-ink/8 bg-white p-2 pr-3 transition-all hover:border-clay-orange/50 clay-surface-sm"
    >
      <img src={product.images[0]} alt={product.name} className="size-12 shrink-0 rounded-xl object-cover" />
      <div className="min-w-0">
        <p className="truncate text-xs font-extrabold text-clay-ink">{product.name}</p>
        <p className="text-xs font-bold text-clay-orange">{formatINR(product.price)}</p>
      </div>
    </Link>
  );
}
