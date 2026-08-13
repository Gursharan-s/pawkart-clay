import { CarouselItem, ProductCarousel } from "@/components/ProductCarousel";
import { ProductCard } from "@/components/ProductCard";
import { CarouselSkeleton } from "@/components/ProductCardSkeleton";
import { FREE_DELIVERY_THRESHOLD, useCart, useWishlist, type CartItem } from "@/context";
import { formatINR } from "@/lib/format";
import { useProducts } from "@/services/products";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Minus, PartyPopper, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

function CartLine({ item }: { item: CartItem }) {
  const { setQty, removeItem } = useCart();
  const { add } = useWishlist();

  const moveToWishlist = () => {
    add({
      sku: item.sku,
      name: item.name,
      brand: item.brand,
      category: item.category,
      image: item.image,
      price: item.price,
      mrp: item.mrp,
      stock: item.stock,
    });
    removeItem(item.sku);
    toast.success("Moved to wishlist ♥");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24 }}
      className="flex gap-4 rounded-[1.5rem] border border-clay-ink/5 bg-card p-4 clay-tile"
    >
      <Link to={`/product/${item.sku}`} className="shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="size-24 rounded-2xl object-cover clay-surface-sm sm:size-28"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-clay-orange">
              {item.brand}
            </p>
            <Link
              to={`/product/${item.sku}`}
              className="mt-0.5 line-clamp-2 text-sm font-extrabold text-clay-ink hover:text-clay-orange"
            >
              {item.name}
            </Link>
            {item.size && (
              <p className="mt-1 text-xs font-semibold text-clay-ink/50">
                Size: {item.size}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.sku)}
            aria-label="Remove item"
            className="flex size-8 shrink-0 items-center justify-center rounded-xl text-clay-ink/40 transition-colors hover:bg-rose-50 hover:text-rose-500"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
          <div className="flex items-center rounded-2xl border border-clay-ink/10 bg-white clay-pressed">
            <button
              type="button"
              onClick={() => setQty(item.sku, item.qty - 1)}
              aria-label="Decrease quantity"
              className="flex size-9 items-center justify-center text-clay-ink transition-colors hover:text-clay-orange"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-7 text-center text-sm font-extrabold text-clay-ink">
              {item.qty}
            </span>
            <button
              type="button"
              onClick={() => setQty(item.sku, item.qty + 1)}
              aria-label="Increase quantity"
              className="flex size-9 items-center justify-center text-clay-ink transition-colors hover:text-clay-orange"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          <div className="flex items-baseline gap-2">
            {item.mrp > item.price && (
              <span className="text-xs font-semibold text-clay-ink/35 line-through">
                {formatINR(item.mrp * item.qty)}
              </span>
            )}
            <span className="text-base font-extrabold text-clay-ink">
              {formatINR(item.price * item.qty)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={moveToWishlist}
          className="mt-2 inline-flex items-center gap-1 self-start text-[11px] font-bold text-clay-ink/45 transition-colors hover:text-rose-500"
        >
          <Heart className="size-3" /> Move to wishlist
        </button>
      </div>
    </motion.div>
  );
}

export default function Cart() {
  const {
    items,
    subtotal,
    mrpTotal,
    discount,
    deliveryFee,
    total,
    freeDeliveryProgress,
    count,
  } = useCart();
  const navigate = useNavigate();

  const recommendations = useProducts({
    sort: "bestselling",
    limit: 6,
  });
  const recommended = recommendations?.products.filter(
    (p) => !items.some((i) => i.sku === p.sku),
  );
  const remaining = FREE_DELIVERY_THRESHOLD - subtotal;

  const checkout = () => {
    if (items.length === 0) return;
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
        <span className="text-6xl">🛒</span>
        <h1 className="font-display mt-5 text-2xl font-bold text-clay-ink">
          Your cart is feeling empty
        </h1>
        <p className="mt-2 max-w-sm text-sm text-clay-ink/55">
          Fill it with treats, toys and tails-wagging essentials for your best
          friend.
        </p>
        <Link
          to="/products"
          className="clay-btn mt-6 h-12 rounded-2xl bg-clay-orange px-7 text-sm font-extrabold text-white"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      <h1 className="font-display text-2xl font-bold text-clay-ink sm:text-3xl">
        Your Cart{" "}
        <span className="text-base font-semibold text-clay-ink/45">
          ({count} items)
        </span>
      </h1>

      {/* Free delivery progress */}
      <div className="mt-5 rounded-[1.5rem] border border-clay-ink/5 bg-card p-4 clay-tile">
        <div className="flex items-center gap-2 text-sm font-extrabold text-clay-ink">
          <Truck className="size-4 text-clay-orange" />
          {remaining > 0 ? (
            <>
              Add {formatINR(remaining)} more for{" "}
              <span className="text-clay-orange">FREE delivery</span>
            </>
          ) : (
            <>
              <PartyPopper className="size-4 text-clay-green" />
              FREE DELIVERY unlocked! 🎉
            </>
          )}
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-clay-sand clay-pressed">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${freeDeliveryProgress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-clay-orange to-clay-green"
          />
        </div>
        <p className="mt-2 text-[11px] font-semibold text-clay-ink/45">
          Free delivery on all orders above {formatINR(FREE_DELIVERY_THRESHOLD)}
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Line items */}
        <div className="space-y-4">
          {items.map((item) => (
            <CartLine key={`${item.sku}-${item.size ?? ""}`} item={item} />
          ))}

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-clay-orange hover:underline"
          >
            <ArrowRight className="size-4 rotate-180" /> Continue shopping
          </Link>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-[1.75rem] border border-clay-ink/5 bg-card p-6 clay-surface">
          <h2 className="font-display text-lg font-bold text-clay-ink">
            Order Summary
          </h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between font-semibold text-clay-ink/70">
              <dt>Subtotal</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between font-semibold text-clay-green">
                <dt>Discount</dt>
                <dd>− {formatINR(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between font-semibold text-clay-ink/70">
              <dt>Delivery fee</dt>
              <dd>{deliveryFee === 0 ? <span className="text-clay-green">FREE</span> : formatINR(deliveryFee)}</dd>
            </div>
            <div className="flex justify-between border-t border-clay-ink/8 pt-3 text-base font-extrabold text-clay-ink">
              <dt>Total</dt>
              <dd>{formatINR(total)}</dd>
            </div>
            {discount > 0 && (
              <p className="text-[11px] font-semibold text-clay-green">
                You&apos;re saving {formatINR(discount)} on this order 🎉
              </p>
            )}
          </dl>
          <button
            type="button"
            onClick={checkout}
            className="clay-btn mt-5 h-12 w-full rounded-2xl bg-clay-orange text-sm font-extrabold tracking-wide text-white"
          >
            <ShoppingBag className="size-4" /> Proceed to Checkout
          </button>
          <p className="mt-3 text-center text-[11px] font-semibold text-clay-ink/40">
            UPI · Cards · Cash on Delivery
          </p>
        </aside>
      </div>

      {/* Recommendations */}
      {recommended && recommended.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display mb-6 text-xl font-bold text-clay-ink">
            You may also like
          </h2>
          {recommended.length > 0 ? (
            <ProductCarousel ariaLabel="Recommended products">
              {recommended.map((p) => (
                <CarouselItem key={p._id}>
                  <ProductCard product={p} />
                </CarouselItem>
              ))}
            </ProductCarousel>
          ) : (
            <CarouselSkeleton />
          )}
        </div>
      )}
    </div>
  );
}
