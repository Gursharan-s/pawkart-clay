import { useWishlist } from "@/context";
import { formatINR } from "@/lib/format";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

export default function Wishlist() {
  const { items, moveToCart, remove } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
        <span className="text-6xl">💔</span>
        <h1 className="font-display mt-5 text-2xl font-bold text-clay-ink">
          No wishes yet
        </h1>
        <p className="mt-2 max-w-sm text-sm text-clay-ink/55">
          Tap the heart on any product to save it here for later.
        </p>
        <Link
          to="/products"
          className="clay-btn mt-6 h-12 rounded-2xl bg-clay-orange px-7 text-sm font-extrabold text-white"
        >
          Discover favourites
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <h1 className="font-display text-2xl font-bold text-clay-ink sm:text-3xl">
        My Wishlist{" "}
        <span className="text-base font-semibold text-clay-ink/45">
          ({items.length} saved)
        </span>
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.sku}
            className="flex gap-4 rounded-[1.5rem] border border-clay-ink/5 bg-card p-4 transition-all hover:-translate-y-0.5 clay-tile hover:clay-surface"
          >
            <Link to={`/product/${item.sku}`} className="shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="size-28 rounded-2xl object-cover clay-surface-sm"
              />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-clay-orange">
                {item.brand}
              </p>
              <Link
                to={`/product/${item.sku}`}
                className="mt-0.5 line-clamp-2 text-sm font-extrabold text-clay-ink hover:text-clay-orange"
              >
                {item.name}
              </Link>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-base font-extrabold text-clay-ink">
                  {formatINR(item.price)}
                </span>
                {item.mrp > item.price && (
                  <span className="text-xs font-semibold text-clay-ink/35 line-through">
                    {formatINR(item.mrp)}
                  </span>
                )}
              </div>

              <div className="mt-auto flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    moveToCart(item.sku);
                    toast.success("Moved to cart 🛒");
                  }}
                  className="clay-btn h-9 flex-1 rounded-xl bg-clay-orange text-[11px] font-extrabold text-white"
                >
                  <ShoppingBag className="size-3.5" /> Move to cart
                </button>
                <button
                  type="button"
                  onClick={() => {
                    remove(item.sku);
                    toast.info("Removed from wishlist");
                  }}
                  aria-label="Remove from wishlist"
                  className="flex size-9 items-center justify-center rounded-xl border border-clay-ink/10 text-clay-ink/45 transition-colors hover:border-rose-300 hover:text-rose-500"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-extrabold text-clay-orange hover:underline"
        >
          <Heart className="size-4" /> Find more to love
        </Link>
      </div>
    </div>
  );
}
