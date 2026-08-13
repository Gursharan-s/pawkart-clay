import { CarouselItem, ProductCarousel } from "@/components/ProductCarousel";
import { ProductCard } from "@/components/ProductCard";
import { CarouselSkeleton } from "@/components/ProductCardSkeleton";
import { SectionHeader } from "@/components/SectionHeader";
import { useCart } from "@/context";
import { PRODUCTS } from "@/data/products";
import {
  ARTICLES,
  CATEGORY_CARDS,
  COMBOS,
  CONCERNS,
  DEALS,
  TESTIMONIALS,
  TRUST_ITEMS,
} from "@/lib/catalog";
import { discountPct, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useBestsellers, useNewArrivals, type ProductDoc } from "@/services/products";
import { motion } from "framer-motion";
import { ArrowRight, Check, ShoppingBag, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import { HERO_IMAGES, px } from "@/data/products";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

/* ─── Hero ─────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="paw-dots absolute inset-0" />
      <div className="absolute -left-24 top-10 size-72 rounded-full bg-clay-butter/60 blur-3xl" />
      <div className="absolute -right-24 bottom-0 size-80 rounded-full bg-clay-blush/70 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-clay-orange clay-tile">
            <Sparkles className="size-3.5" />
            India&apos;s friendliest pet store
          </p>
          <h1 className="font-display mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-clay-ink sm:text-5xl xl:text-6xl">
            Because Every Pet
            <span className="relative mx-2 inline-block text-clay-orange">
              Deserves
              <svg
                viewBox="0 0 120 12"
                className="absolute -bottom-1 left-0 w-full text-clay-orange/30"
                aria-hidden
              >
                <path
                  d="M3 9c30-6 84-6 114 0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            The Best.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-clay-ink/65 sm:text-lg">
            Food, treats, toys and everyday essentials — carefully chosen for
            happier pets.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/products?petType=dog"
              className="clay-btn h-13 rounded-2xl bg-clay-orange px-7 text-sm font-extrabold tracking-wide text-white"
            >
              SHOP DOGS
            </Link>
            <Link
              to="/products?petType=cat"
              className="clay-btn h-13 rounded-2xl bg-white px-7 text-sm font-extrabold tracking-wide text-clay-ink"
            >
              SHOP CATS
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-clay-ink/50">
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-clay-green" /> Vet-reviewed products
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-clay-green" /> COD available
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-clay-green" /> 30-day easy returns
            </span>
          </div>
        </motion.div>

        {/* Image + floating badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-white clay-surface">
            <img
              src={HERO_IMAGES.dog}
              alt="A happy dog enjoying life"
              className="aspect-[4/3.4] w-full object-cover"
            />
          </div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -left-3 top-6 rounded-3xl bg-white p-4 shadow-xl sm:-left-8 clay-surface"
          >
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-clay-orange">
              New pet parent?
            </p>
            <p className="mt-1 text-sm font-bold text-clay-ink">
              Get 10% OFF your first order
            </p>
            <Link
              to="/products?onSale=true"
              className="mt-2 inline-flex items-center gap-1 rounded-full bg-clay-orange px-3.5 py-1.5 text-[11px] font-extrabold text-white transition-transform hover:scale-105 clay-tile"
            >
              SHOP NOW
            </Link>
          </motion.div>

          <div className="absolute -bottom-4 right-4 flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-2.5 shadow-lg clay-surface-sm">
            <span className="text-lg">⭐</span>
            <span className="text-xs font-bold text-clay-ink">
              4.6/5 · 25,000+ happy pet parents
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Trust strip ──────────────────────────────────────────────── */

function TrustStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4">
      <motion.div
        {...fadeUp}
        className="grid grid-cols-2 gap-3 rounded-[2rem] border border-clay-ink/5 bg-card p-4 clay-surface sm:grid-cols-4 sm:gap-4 sm:p-6"
      >
        {TRUST_ITEMS.map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-3 rounded-2xl bg-clay-sand/50 p-3.5 clay-tile"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-xl clay-tile">
              {item.icon}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-clay-ink">
                {item.title}
              </p>
              <p className="mt-0.5 truncate text-[11px] font-medium text-clay-ink/55">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

/* ─── Shop by pet ──────────────────────────────────────────────── */

function ShopByPet() {
  const cards = [
    {
      label: "Dogs",
      text: "Everything your dog needs.",
      image: HERO_IMAGES.dog,
      to: "/products?petType=dog",
      tint: "bg-clay-blush",
    },
    {
      label: "Cats",
      text: "Everything your cat needs.",
      image: HERO_IMAGES.cat,
      to: "/products?petType=cat",
      tint: "bg-clay-mint",
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
      <SectionHeader
        eyebrow="Shop by pet"
        title="Aisle by aisle, tail by tail"
        subtitle="Curated shelves for the two loves of our lives — one for woofs, one for meows."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        {cards.map((card, i) => (
          <motion.div key={card.label} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }}>
            <Link
              to={card.to}
              className={cn(
                "group relative block overflow-hidden rounded-[2.25rem] border-4 border-white clay-surface",
                card.tint,
              )}
            >
              <img
                src={card.image}
                alt={card.label}
                loading="lazy"
                className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-clay-ink/70 via-clay-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                <div>
                  <h3 className="font-display text-3xl font-bold text-white sm:text-4xl">
                    {card.label}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-white/85">
                    {card.text}
                  </p>
                </div>
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-clay-ink transition-all group-hover:bg-clay-orange group-hover:text-white clay-tile">
                  <ArrowRight className="size-5" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── Category grid ────────────────────────────────────────────── */

function CategoryGrid() {
  return (
    <section className="bg-clay-sand/40 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          eyebrow="Browse"
          title="Shop by category"
          subtitle="From kibble to carriers — twelve shelves of pet essentials."
          viewAllTo="/products"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {CATEGORY_CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: (i % 6) * 0.05 }}
            >
              <Link
                to={card.to}
                className="group flex flex-col items-center gap-3 rounded-[1.75rem] border border-clay-ink/5 bg-card p-4 text-center transition-all duration-300 hover:-translate-y-1 clay-tile hover:clay-surface"
              >
                <div className="size-20 overflow-hidden rounded-full border-4 border-white clay-surface-sm sm:size-24">
                  <img
                    src={card.image}
                    alt={card.label}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <p className="text-sm font-extrabold leading-tight text-clay-ink group-hover:text-clay-orange">
                  {card.label}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Product carousel sections ────────────────────────────────── */

function CarouselSection({
  eyebrow,
  title,
  subtitle,
  products,
  viewAllTo,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  products: ProductDoc[] | undefined;
  viewAllTo: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:py-16">
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        viewAllTo={viewAllTo}
      />
      {products ? (
        <ProductCarousel ariaLabel={title}>
          {products.map((p) => (
            <CarouselItem key={p.sku}>
              <ProductCard product={p} />
            </CarouselItem>
          ))}
        </ProductCarousel>
      ) : (
        <CarouselSkeleton />
      )}
    </section>
  );
}

/* ─── Deals ────────────────────────────────────────────────────── */

function Deals() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:py-16">
      <SectionHeader
        eyebrow="Offers"
        title="Goodies For Less. Happy Pets For More."
        subtitle="Stacked discounts across the shelves your pets love most."
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {DEALS.map((deal, i) => (
          <motion.div key={deal.sub} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.07 }}>
            <Link
              to={deal.to}
              className={cn(
                "group flex h-full flex-col items-center gap-1 rounded-[1.75rem] border border-clay-ink/5 p-6 text-center transition-all duration-300 hover:-translate-y-1 clay-tile hover:clay-surface",
                deal.tint,
              )}
            >
              <span className="text-4xl transition-transform duration-300 group-hover:scale-110">
                {deal.emoji}
              </span>
              <p className="mt-2 font-display text-xl font-bold text-clay-ink sm:text-2xl">
                {deal.title}
              </p>
              <p className="text-sm font-bold text-clay-ink/55">{deal.sub}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-clay-orange transition-colors group-hover:text-clay-ink">
                Shop now <ArrowRight className="size-3.5" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link
          to="/products?onSale=true"
          className="clay-btn h-12 rounded-2xl bg-clay-ink px-8 text-sm font-extrabold tracking-wide text-white"
        >
          SHOP OFFERS
        </Link>
      </div>
    </section>
  );
}

/* ─── Shop by concern ──────────────────────────────────────────── */

function Concerns() {
  return (
    <section className="bg-clay-blush/40 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          eyebrow="Pet care"
          title="Shop by concern"
          subtitle="Life stage, dental days, anxious evenings — we've got a shelf for that."
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CONCERNS.map((concern, i) => (
            <motion.div key={concern.label} {...fadeUp} transition={{ ...fadeUp.transition, delay: (i % 4) * 0.06 }}>
              <Link
                to={concern.to}
                className="group flex items-center gap-3 rounded-[1.5rem] border border-clay-ink/5 bg-card p-4 transition-all duration-300 hover:-translate-y-1 clay-tile hover:clay-surface"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-clay-sand/70 text-xl transition-transform group-hover:scale-110">
                  {concern.emoji}
                </span>
                <span className="text-sm font-extrabold leading-snug text-clay-ink group-hover:text-clay-orange">
                  {concern.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Combo packs ──────────────────────────────────────────────── */

function Combos() {
  const { addItem } = useCart();

  const addBundle = (skus: string[]) => {
    const bundle = PRODUCTS.filter((p) => skus.includes(p.sku));
    bundle.forEach((p) => addItem(p, 1));
    toast.success("Combo added to cart! 🛍️", {
      description: `${bundle.length} products bundled at combo pricing.`,
      action: { label: "View cart", onClick: () => window.location.assign("/cart") },
    });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:py-16">
      <SectionHeader
        eyebrow="Combo packs"
        title="Better Together"
        subtitle="Hand-picked bundles that save you money and simplify re-stocking."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {COMBOS.map((combo, i) => {
          const pct = discountPct(combo.price, combo.mrp);
          const items = PRODUCTS.filter((p) => combo.skus.includes(p.sku));
          return (
            <motion.div key={combo.name} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
              <div className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-clay-ink/5 bg-card transition-all duration-300 hover:-translate-y-1 clay-tile hover:clay-surface">
                <div className="relative">
                  <img
                    src={combo.image}
                    alt={combo.name}
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-clay-green px-2.5 py-1 text-[10px] font-extrabold tracking-widest text-white clay-tile">
                    {pct}% OFF
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-sm font-extrabold text-clay-ink">{combo.name}</p>
                  <p className="mt-1 text-[11px] font-semibold text-clay-ink/50">
                    {combo.tagline}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5">
                    {items.map((item) => (
                      <img
                        key={item.sku}
                        src={item.images[0]}
                        alt={item.name}
                        title={item.name}
                        loading="lazy"
                        className="size-9 rounded-xl border-2 border-white object-cover clay-surface-sm"
                      />
                    ))}
                  </div>
                  <div className="mt-auto flex items-end justify-between pt-4">
                    <div>
                      <p className="text-lg font-extrabold text-clay-ink">
                        {formatINR(combo.price)}
                      </p>
                      <p className="text-xs font-medium text-clay-ink/40 line-through">
                        {formatINR(combo.mrp)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addBundle(combo.skus)}
                      className="flex size-10 items-center justify-center rounded-2xl bg-clay-orange text-white transition-all hover:brightness-105 active:scale-90 clay-tile"
                      aria-label={`Add ${combo.name} to cart`}
                    >
                      <ShoppingBag className="size-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Editorial ────────────────────────────────────────────────── */

function Editorial() {
  return (
    <section className="bg-clay-mint/35 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          eyebrow="The PawKart Journal"
          title="More Than Shopping. It's Pet Parenting."
          subtitle="Real advice from vets, trainers and pawrents who've been there."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ARTICLES.map((article, i) => (
            <motion.div key={article.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.07 }}>
              <Link
                to="/"
                onClick={(e) => e.preventDefault()}
                className="group block overflow-hidden rounded-[1.75rem] border border-clay-ink/5 bg-card transition-all duration-300 hover:-translate-y-1 clay-tile hover:clay-surface"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    className="aspect-[16/11] w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-clay-orange">
                    {article.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-extrabold leading-snug text-clay-ink group-hover:text-clay-orange">
                    {article.title}
                  </h3>
                  <p className="mt-2 text-[11px] font-bold text-clay-ink/45">
                    {article.readMins} min read · READ MORE →
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─────────────────────────────────────────────── */

function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
      <SectionHeader
        eyebrow="Pet parents say"
        title="Loved by tails across India"
        subtitle="Real words from real pawrents — from Delhi to Bengaluru."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TESTIMONIALS.map((t, i) => (
          <motion.div key={t.name} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.07 }}>
            <div className="flex h-full flex-col rounded-[1.75rem] border border-clay-ink/5 bg-card p-5 clay-tile">
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <span key={s}>★</span>
                ))}
              </div>
              <p className="mt-3 flex-1 text-sm leading-6 text-clay-ink/75">
                “{t.text}”
              </p>
              <div className="mt-4 flex items-center gap-3 border-t border-clay-ink/5 pt-4">
                <span className="flex size-10 items-center justify-center rounded-full bg-clay-blush text-sm font-extrabold text-clay-orange">
                  {t.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-extrabold text-clay-ink">{t.name}</p>
                  <p className="text-[11px] font-semibold text-clay-ink/50">
                    {t.city} · {t.pet}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── Page ─────────────────────────────────────────────────────── */

export default function Landing() {
  const bestsellers = useBestsellers(8);
  const newArrivals = useNewArrivals(8);

  return (
    <div>
      <Hero />
      <TrustStrip />
      <ShopByPet />
      <CategoryGrid />
      <CarouselSection
        eyebrow="Fan favourites"
        title="Best Sellers"
        subtitle="The products India's pets keep re-ordering."
        products={bestsellers}
        viewAllTo="/products?sort=bestselling"
      />
      <CarouselSection
        eyebrow="Just landed"
        title="New Arrivals"
        subtitle="Fresh drops for curious noses and paws."
        products={newArrivals}
        viewAllTo="/products?sort=newest"
      />
      <Deals />
      <Concerns />
      <Combos />
      <Editorial />
      <Testimonials />
    </div>
  );
}
