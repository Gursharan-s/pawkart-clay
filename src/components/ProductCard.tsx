import { useWishlist } from "@/context";
import type { ProductDoc } from "@/services/products";
import { useCart } from "@/context";
import { discountPct, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router";

interface ProductCardProps {
  product: ProductDoc;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const wished = has(product.sku);
  const pct = discountPct(product.price, product.mrp);
  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    if (outOfStock) return;
    addItem(product, 1, product.sizes?.[0]);
    toast.success("Added to cart", {
      description: `${product.name.slice(0, 42)}…`,
      action: { label: "View cart", onClick: () => window.location.assign("/cart") },
    });
  };

  const handleWishlist = () => {
    toggle(product);
    toast[wished ? "info" : "success"](
      wished ? "Removed from wishlist" : "Saved to wishlist ♥",
    );
  };

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-clay-ink/5 bg-card clay-tile transition-all duration-300 hover:-translate-y-1.5 hover:clay-surface",
        className,
      )}
    >
      {/* Image */}
      <Link
        to={`/product/${product._id}`}
        className="relative block overflow-hidden bg-clay-sand/60"
      >
        <div className="aspect-[4/3.2] w-full overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        </div>

        {product.badge && (
          <span
            className={cn(
              "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-widest text-white clay-tile",
              product.badge === "BESTSELLER"
                ? "bg-clay-orange"
                : "bg-clay-green",
            )}
          >
            {product.badge}
          </span>
        )}
        {pct > 0 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-bold text-clay-orange shadow-sm">
            {pct}% OFF
          </span>
        )}
      </Link>

      {/* Wishlist heart */}
      <button
        type="button"
        onClick={handleWishlist}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        className={cn(
          "absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/95 shadow-sm transition-all duration-200 hover:scale-110 active:scale-95",
          wished && "bg-rose-50",
        )}
      >
        <Heart
          className={cn(
            "size-4 transition-colors",
            wished ? "fill-rose-500 text-rose-500" : "text-clay-ink/60",
          )}
        />
      </button>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-clay-orange">{product.brand}</span>
          <span className="text-clay-ink/30">•</span>
          <span className="inline-flex items-center gap-1 text-clay-ink/60">
            <span className="font-semibold text-clay-ink/80">
              {product.rating.toFixed(1)}
            </span>
            <span>({product.reviewCount.toLocaleString("en-IN")})</span>
          </span>
        </div>

        <Link
          to={`/product/${product._id}`}
          className="line-clamp-2 min-h-[2.6rem] text-sm font-bold leading-snug text-clay-ink transition-colors hover:text-clay-orange"
        >
          {product.name}
        </Link>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="leading-none">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-clay-ink">
                {formatINR(product.price)}
              </span>
              {pct > 0 && (
                <span className="text-xs font-medium text-clay-ink/40 line-through">
                  {formatINR(product.mrp)}
                </span>
              )}
            </div>
            <span
              className={cn(
                "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold",
                outOfStock
                  ? "bg-rose-100 text-rose-600"
                  : "bg-clay-mint text-clay-green",
              )}
            >
              {outOfStock ? "Out of stock" : `In stock · ${product.stock} left`}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            aria-label="Add to cart"
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-2xl bg-clay-orange text-white transition-all duration-200 hover:brightness-105 active:scale-90 clay-tile",
              outOfStock && "cursor-not-allowed bg-clay-ink/15 text-clay-ink/40",
            )}
          >
            <ShoppingBag className="size-4.5" strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}
