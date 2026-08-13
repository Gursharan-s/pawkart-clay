import { MEGA_MENUS, PLAIN_LINKS, type NavMega } from "@/lib/catalog";
import { useAuth } from "@/hooks/use-auth";
import { useCart, useWishlist } from "@/context";
import { useProducts, type ProductDoc } from "@/services/products";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingCart,
  Truck,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import logo from "@/assets/logo.svg";

function PromoBar() {
  return (
    <div className="flex items-center justify-center gap-2 bg-clay-orange px-4 py-2 text-center text-[11px] font-extrabold tracking-wider text-white sm:text-xs">
      <Truck className="size-3.5 shrink-0" />
      FREE DELIVERY ON ORDERS ABOVE ₹999
    </div>
  );
}

/* ─── Live search with suggestions ─────────────────────────────── */

function SearchBox({ onNavigate }: { onNavigate?: () => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [debounced, setDebounced] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 220);
    return () => clearTimeout(t);
  }, [q]);

  const results = useProducts(
    debounced.length >= 2 ? { search: debounced, limit: 5 } : "skip",
  );
  const suggestions = (results?.products ?? []) as ProductDoc[] | undefined;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    setOpen(false);
    onNavigate?.();
    navigate(`/products?q=${encodeURIComponent(term)}`);
  };

  return (
    <div ref={boxRef} className="relative w-full">
      <form onSubmit={submit} role="search">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-clay-ink/40" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search food, treats, toys…"
            className="h-11 w-full rounded-2xl border border-clay-ink/10 bg-white pl-11 pr-4 text-sm font-medium text-clay-ink placeholder:text-clay-ink/40 focus:border-clay-orange focus:outline-none focus:ring-2 focus:ring-clay-orange/25 clay-pressed"
          />
        </div>
      </form>

      <AnimatePresence>
        {open && debounced.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.16 }}
            className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-clay-ink/10 bg-white p-2 shadow-xl"
          >
            {suggestions && suggestions.length > 0 ? (
              <>
                <p className="px-3 pb-1 pt-2 text-[10px] font-extrabold uppercase tracking-widest text-clay-ink/40">
                  Suggestions
                </p>
                {suggestions.map((p) => (
                  <Link
                    key={p.sku}
                    to={`/product/${p._id}`}
                    onClick={() => {
                      setOpen(false);
                      onNavigate?.();
                    }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-clay-sand/60"
                  >
                    <img
                      src={p.images[0]}
                      alt=""
                      className="size-11 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-clay-ink">
                        {p.name}
                      </p>
                      <p className="text-xs text-clay-ink/50">
                        {p.brand} · {p.category}
                      </p>
                    </div>
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={submit}
                  className="mt-1 w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-clay-orange transition-colors hover:bg-clay-blush/60"
                >
                  See all results for “{debounced}”
                </button>
              </>
            ) : (
              <p className="px-3 py-4 text-center text-sm text-clay-ink/50">
                {results === undefined
                  ? "Searching…"
                  : `No products match “${debounced}”`}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Icons + badges ───────────────────────────────────────────── */

function IconButton({
  to,
  label,
  badge,
  onClick,
  children,
}: {
  to?: string;
  label: string;
  badge?: number;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const inner = (
    <>
      {children}
      {badge !== undefined && badge > 0 && (
        <motion.span
          key={badge}
          initial={{ scale: 0.4 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          className="absolute -right-1 -top-1 flex size-4.5 items-center justify-center rounded-full bg-clay-orange text-[9px] font-extrabold text-white clay-tile"
        >
          {badge > 99 ? "99+" : badge}
        </motion.span>
      )}
    </>
  );
  const cls =
    "relative flex size-10 items-center justify-center rounded-2xl text-clay-ink transition-all hover:bg-clay-blush/70 hover:text-clay-orange clay-tile";
  return to ? (
    <Link to={to} aria-label={label} onClick={onClick} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" aria-label={label} onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

/* ─── Mega menu panel ──────────────────────────────────────────── */

function MegaMenu({ mega }: { mega: NavMega }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-full z-40 hidden w-[min(760px,92vw)] -translate-x-1/2 pt-3 group-hover/mega:pointer-events-auto lg:block">
      <div className="pointer-events-none invisible overflow-hidden rounded-[1.75rem] border border-clay-ink/10 bg-card p-6 opacity-0 shadow-2xl transition-all duration-200 translate-y-2 group-hover/mega:visible group-hover/mega:pointer-events-auto group-hover/mega:translate-y-0 group-hover/mega:opacity-100 clay-surface">
        <div className="grid grid-cols-2 gap-x-10 gap-y-6 md:grid-cols-3 xl:grid-cols-5">
          {mega.groups.map((group) => (
            <div key={group.title}>
              <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-clay-orange">
                {group.title}
              </p>
              <ul className="space-y-1.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm font-semibold text-clay-ink/80 transition-colors hover:text-clay-orange"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Mobile drawer ────────────────────────────────────────────── */

function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-clay-ink/30 backdrop-blur-sm lg:hidden"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-card lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-clay-ink/10 p-4">
              <Link to="/" onClick={onClose} className="flex items-center gap-2">
                <img src={logo} alt="PawKart Clay" className="size-10 rounded-2xl" />
                <span className="font-display text-xl font-bold text-clay-ink">
                  PawKart <span className="text-clay-orange">Clay</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="flex size-9 items-center justify-center rounded-xl bg-clay-sand/70 text-clay-ink"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="border-b border-clay-ink/10 p-4">
              <SearchBox onNavigate={onClose} />
            </div>

            <nav className="flex-1 p-4">
              {MEGA_MENUS.map((mega) => (
                <div key={mega.label} className="mb-1">
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded(expanded === mega.label ? null : mega.label)
                    }
                    className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-base font-bold text-clay-ink transition-colors hover:bg-clay-sand/60"
                  >
                    {mega.label}
                    <ChevronDown
                      className={cn(
                        "size-4 text-clay-ink/40 transition-transform",
                        expanded === mega.label && "rotate-180",
                      )}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {expanded === mega.label && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 py-2 pl-4">
                          {mega.groups.map((group) => (
                            <div key={group.title}>
                              <p className="mb-1 px-3 text-[11px] font-extrabold uppercase tracking-widest text-clay-orange">
                                {group.title}
                              </p>
                              {group.links.map((link) => (
                                <Link
                                  key={link.label}
                                  to={link.to}
                                  onClick={onClose}
                                  className="block rounded-xl px-3 py-1.5 text-sm font-semibold text-clay-ink/75 hover:bg-clay-sand/60 hover:text-clay-orange"
                                >
                                  {link.label}
                                </Link>
                              ))}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              {PLAIN_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={onClose}
                  className="block rounded-2xl px-3 py-3 text-base font-bold text-clay-ink transition-colors hover:bg-clay-sand/60"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-clay-ink/10 p-4 text-center text-[11px] font-semibold text-clay-ink/40">
              🐾 Everything Your Pet Loves.
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Header ───────────────────────────────────────────────────── */

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Promo bar collapses on scroll */}
      <div
        className={cn(
          "overflow-hidden bg-clay-orange transition-all duration-300",
          scrolled ? "max-h-0" : "max-h-10",
        )}
      >
        <PromoBar />
      </div>

      <div className="border-b border-clay-ink/8 bg-clay-cream/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-5">
          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="flex size-10 items-center justify-center rounded-2xl text-clay-ink lg:hidden clay-tile"
          >
            <Menu className="size-5" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <img
              src={logo}
              alt="PawKart Clay"
              className="size-11 rounded-2xl clay-surface-sm"
            />
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-2xl font-bold tracking-tight text-clay-ink">
                PawKart <span className="text-clay-orange">Clay</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-clay-orange">
                Everything your pet loves
              </span>
            </span>
          </Link>

          {/* Desktop search */}
          <div className="hidden flex-1 lg:block">
            <SearchBox />
          </div>

          {/* Icons */}
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5 lg:ml-0">
            <IconButton
              label="Account"
              to={isAuthenticated ? "/account" : "/auth?returnTo=%2Faccount"}
            >
              <User className="size-5" strokeWidth={2.1} />
            </IconButton>
            <IconButton
              label="Wishlist"
              to="/wishlist"
              badge={wishlistCount}
            >
              <Heart className="size-5" strokeWidth={2.1} />
            </IconButton>
            <IconButton
              label="Cart"
              to="/cart"
              badge={cartCount}
            >
              <ShoppingCart className="size-5" strokeWidth={2.1} />
            </IconButton>
          </div>
        </div>

        {/* Desktop nav row */}
        <nav className="mx-auto hidden max-w-7xl items-center justify-center gap-1 px-4 pb-2 lg:flex">
          {MEGA_MENUS.map((mega) => (
            <div key={mega.label} className="group/mega relative">
              <Link
                to={mega.to}
                className="flex items-center gap-1 rounded-2xl px-3.5 py-2 text-sm font-bold text-clay-ink transition-colors hover:bg-clay-blush/70 hover:text-clay-orange"
              >
                {mega.label}
                <ChevronDown className="size-3.5 text-clay-ink/40" />
              </Link>
              <MegaMenu mega={mega} />
            </div>
          ))}
          {PLAIN_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={cn(
                "rounded-2xl px-3.5 py-2 text-sm font-bold transition-colors",
                link.label === "Offers"
                  ? "bg-clay-butter text-clay-ink hover:bg-clay-orange hover:text-white"
                  : "text-clay-ink hover:bg-clay-blush/70 hover:text-clay-orange",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
