import { Facebook, Instagram, Mail, Youtube } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import logo from "@/assets/logo.svg";

const COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Dogs", to: "/products?petType=dog" },
      { label: "Cats", to: "/products?petType=cat" },
      { label: "Food", to: "/products?category=Dog+Food" },
      { label: "Treats", to: "/products?category=Dog+Treats" },
      { label: "Toys", to: "/products?tag=toy" },
      { label: "Grooming", to: "/products?category=Dog+Grooming" },
      { label: "Accessories", to: "/products?category=Dog+Accessories" },
      { label: "Offers", to: "/products?onSale=true" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact Us", to: "/contact" },
      { label: "FAQs", to: "/faqs" },
      { label: "Shipping", to: "/shipping" },
      { label: "Returns", to: "/returns" },
      { label: "Track Order", to: "/account" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About PawKart", to: "/about" },
      { label: "Our Story", to: "/about" },
      { label: "Pet Care", to: "/products?tag=puppy" },
      { label: "Blog", to: "/" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms & Conditions", to: "/terms" },
      { label: "Refund Policy", to: "/refund" },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("You're in! 🐾", {
      description: "Welcome to the PawKart family. Watch your inbox!",
    });
    setEmail("");
  };

  return (
    <footer className="mt-20">
      {/* Newsletter */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-[2rem] bg-clay-orange px-6 py-12 text-center clay-surface sm:px-12">
          <div className="paw-dots absolute inset-0 opacity-40" />
          <div className="relative">
            <p className="text-3xl">🐾</p>
            <h3 className="font-display mt-2 text-2xl font-bold text-white sm:text-3xl">
              Join The PawKart Family 🐾
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium text-white/85">
              Get pet-care tips, exclusive offers and new product updates.
            </p>
            <form
              onSubmit={subscribe}
              className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-clay-ink/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-12 w-full rounded-2xl border-0 bg-white pl-11 pr-4 text-sm font-medium text-clay-ink placeholder:text-clay-ink/40 focus:outline-none focus:ring-4 focus:ring-white/40"
                />
              </div>
              <button
                type="submit"
                className="h-12 rounded-2xl bg-clay-ink px-6 text-sm font-extrabold tracking-wide text-white transition-all hover:brightness-110 active:scale-95 clay-btn"
              >
                JOIN NOW
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Link columns */}
      <div className="mx-auto mt-14 grid max-w-7xl grid-cols-2 gap-8 px-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src={logo}
              alt="PawKart"
              className="size-12 rounded-2xl clay-surface-sm"
            />
            <span className="flex flex-col leading-none">
              <span className="font-display text-2xl font-bold text-clay-ink">
                PawKart
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-clay-orange">
                Everything your pet loves
              </span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-clay-ink/60">
            Premium food, treats, toys and essentials for dogs &amp; cats —
            carefully chosen, vet-reviewed and delivered across India.
          </p>
          <div className="mt-5 flex gap-2">
            {[
              { icon: Instagram, label: "Instagram" },
              { icon: Facebook, label: "Facebook" },
              { icon: Youtube, label: "YouTube" },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                onClick={(e) => e.preventDefault()}
                className="flex size-10 items-center justify-center rounded-2xl bg-clay-sand/70 text-clay-ink transition-all hover:bg-clay-orange hover:text-white clay-tile"
              >
                <Icon className="size-4.5" />
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-clay-ink/50">
              {col.title}
            </p>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm font-semibold text-clay-ink/75 transition-colors hover:text-clay-orange"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 border-t border-clay-ink/10 py-6 text-center text-xs font-semibold text-clay-ink/45">
        © 2026 PawKart. All Rights Reserved. · Made with 🧡 for pets in India
      </div>
    </footer>
  );
}
