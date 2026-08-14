import { useAuth } from "@/hooks/use-auth";
import { useWishlist } from "@/context";
import { loadOrders, toClientOrder, type Order } from "@/lib/orders";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMyOrders } from "@/services/orders";
import { Heart, LogOut, Package, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

const ORDER_STAGES = [
  "Order Placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
] as const;

type Tab = "profile" | "orders" | "wishlist";

function OrderCard({ order }: { order: Order }) {
  const stageIndex = 0; // v1: orders start at "Order Placed"; tracking API comes next
  const placedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="rounded-[1.5rem] border border-clay-ink/5 bg-card p-5 clay-tile">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-extrabold text-clay-ink">#{order.id}</p>
          <p className="text-[11px] font-semibold text-clay-ink/45">
            Placed on {placedDate} · {order.items.reduce((s, i) => s + i.qty, 0)}{" "}
            item(s)
          </p>
        </div>
        <span className="rounded-full bg-clay-blush px-3 py-1 text-[11px] font-extrabold text-clay-orange">
          {order.status}
        </span>
      </div>

      {/* Tracking timeline */}
      <div className="mt-5 flex items-center">
        {ORDER_STAGES.map((stage, i) => (
          <div key={stage} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-[9px] font-extrabold",
                  i <= stageIndex
                    ? "bg-clay-orange text-white"
                    : "bg-clay-sand text-clay-ink/35",
                )}
              >
                {i + 1}
              </span>
              <span
                className={cn(
                  "hidden w-14 text-center text-[9px] font-bold leading-tight sm:block",
                  i <= stageIndex ? "text-clay-ink" : "text-clay-ink/35",
                )}
              >
                {stage}
              </span>
            </div>
            {i < ORDER_STAGES.length - 1 && (
              <span
                className={cn(
                  "mb-4 h-0.5 flex-1 rounded-full",
                  i < stageIndex ? "bg-clay-orange" : "bg-clay-sand",
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 border-t border-clay-ink/8 pt-3">
        {order.items.map((item) => (
          <div key={item.sku} className="flex items-center gap-3">
            <img
              src={item.image}
              alt={item.name}
              className="size-10 rounded-lg object-cover"
            />
            <p className="min-w-0 flex-1 truncate text-xs font-bold text-clay-ink">
              {item.name}
              <span className="block text-[10px] font-semibold text-clay-ink/45">
                × {item.qty}
              </span>
            </p>
            <p className="text-xs font-extrabold text-clay-ink">
              {formatINR(item.price * item.qty)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-clay-ink/8 pt-3">
        <p className="text-[11px] font-semibold text-clay-ink/45">
          Delivering to {order.address.name} · {order.address.city},{" "}
          {order.address.pincode}
        </p>
        <p className="text-sm font-extrabold text-clay-ink">
          {formatINR(order.total)}{" "}
          <span className="text-[10px] font-bold text-clay-ink/45">
            · {order.paymentMethod.toUpperCase()}
          </span>
        </p>
      </div>
    </div>
  );
}

export default function Account() {
  const { user, signOut, isLoading } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const serverOrders = useMyOrders();

  useEffect(() => {
    setLocalOrders(loadOrders());
  }, []);

  // Server orders win once loaded; the localStorage mirror fills the gap while
  // loading and covers orders placed before account sync existed (deduped by
  // order id and order fingerprint so nothing shows twice).
  const orders = useMemo<Order[]>(() => {
    if (serverOrders === undefined || serverOrders === null) {
      return localOrders;
    }
    const serverList = serverOrders.map(toClientOrder);
    const seenIds = new Set(serverList.map((o) => o.id));
    const serverFingerprints = new Set(
      serverList.map(
        (o) =>
          `${o.total}_${o.items.map((i) => `${i.sku}:${i.qty}`).sort().join(",")}`,
      ),
    );
    const uniqueLocal = localOrders.filter((o) => {
      if (seenIds.has(o.id)) return false;
      const fp = `${o.total}_${o.items.map((i) => `${i.sku}:${i.qty}`).sort().join(",")}`;
      if (serverFingerprints.has(fp)) return false;
      return true;
    });
    return [...serverList, ...uniqueLocal];
  }, [serverOrders, localOrders]);

  const tab = (searchParams.get("tab") as Tab) ?? "profile";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-clay-sand border-t-clay-orange" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Profile", icon: <UserRound className="size-4" /> },
    { key: "orders", label: `Orders (${orders.length})`, icon: <Package className="size-4" /> },
    { key: "wishlist", label: `Wishlist (${wishlistItems.length})`, icon: <Heart className="size-4" /> },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-clay-ink sm:text-3xl">
            My Account
          </h1>
          <p className="mt-1 text-sm font-semibold text-clay-ink/50">
            Welcome back{user.name ? `, ${user.name}` : ""} 🐾
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex h-11 items-center gap-2 rounded-2xl border-2 border-clay-ink/10 bg-white px-4 text-sm font-extrabold text-clay-ink transition-colors hover:border-rose-300 hover:text-rose-500 clay-tile"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setSearchParams({ tab: t.key }, { replace: true })}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-extrabold transition-colors",
              tab === t.key
                ? "bg-clay-orange text-white clay-tile"
                : "bg-white text-clay-ink/65 hover:text-clay-orange clay-tile",
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="mt-6 rounded-[1.75rem] border border-clay-ink/5 bg-card p-6 clay-surface">
          <div className="flex items-center gap-4">
            <span className="flex size-16 items-center justify-center rounded-full bg-clay-blush text-2xl font-extrabold text-clay-orange clay-tile">
              {(user.name ?? user.email ?? "P").charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-lg font-extrabold text-clay-ink">
                {user.name ?? "PawKart Clay member"}
              </p>
              <p className="text-sm font-semibold text-clay-ink/55">
                {user.email ?? "No email on file"}
              </p>
              <span className="mt-1.5 inline-block rounded-full bg-clay-mint px-2.5 py-0.5 text-[10px] font-extrabold text-clay-green">
                {user.isAnonymous ? "Guest member" : "Verified member"}
              </span>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Orders placed", value: orders.length },
              { label: "Wishlist items", value: wishlistItems.length },
              {
                label: "Member since",
                value: new Date(user._creationTime).getFullYear(),
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-clay-sand/50 p-4 text-center clay-tile"
              >
                <p className="text-2xl font-extrabold text-clay-ink">{stat.value}</p>
                <p className="mt-0.5 text-[11px] font-bold text-clay-ink/50">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs font-semibold text-clay-ink/45">
            Orders are synced to your PawKart Clay account, so they follow you
            across devices. Your wishlist lives on this device for now.
          </p>
        </div>
      )}

      {tab === "orders" && (
        <div className="mt-6 space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-clay-ink/15 bg-card/60 px-6 py-16 text-center clay-tile">
              <Package className="mx-auto size-10 text-clay-ink/25" />
              <h3 className="font-display mt-4 text-lg font-bold text-clay-ink">
                No orders yet
              </h3>
              <p className="mt-1 text-sm text-clay-ink/55">
                Your orders will appear here with live tracking.
              </p>
              <Link
                to="/products"
                className="clay-btn mt-5 inline-flex h-11 items-center rounded-2xl bg-clay-orange px-6 text-sm font-extrabold text-white"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            orders.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </div>
      )}

      {tab === "wishlist" && (
        <div className="mt-6">
          {wishlistItems.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-clay-ink/15 bg-card/60 px-6 py-16 text-center clay-tile">
              <Heart className="mx-auto size-10 text-clay-ink/25" />
              <h3 className="font-display mt-4 text-lg font-bold text-clay-ink">
                Nothing saved yet
              </h3>
              <p className="mt-1 text-sm text-clay-ink/55">
                Heart the products you love and find them here.
              </p>
              <Link
                to="/products"
                className="clay-btn mt-5 inline-flex h-11 items-center rounded-2xl bg-clay-orange px-6 text-sm font-extrabold text-white"
              >
                Explore products
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {wishlistItems.map((item) => (
                <Link
                  key={item.sku}
                  to={`/product/${item.sku}`}
                  className="flex gap-3 rounded-[1.5rem] border border-clay-ink/5 bg-card p-3 transition-all hover:-translate-y-0.5 clay-tile hover:clay-surface"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-20 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-clay-ink">
                      {item.name}
                    </p>
                    <p className="text-xs font-bold text-clay-orange">
                      {formatINR(item.price)}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold text-clay-ink/40">
                      Tap to view →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
