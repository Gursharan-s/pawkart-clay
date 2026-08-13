import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-clay-cream px-4 text-center">
      <div className="paw-dots absolute inset-0" />
      <div className="absolute -left-24 top-10 size-72 rounded-full bg-clay-butter/70 blur-3xl" />
      <div className="absolute -right-24 bottom-0 size-80 rounded-full bg-clay-blush/70 blur-3xl" />

      <div className="relative">
        <p className="font-display text-7xl font-bold text-clay-orange sm:text-8xl">
          4<span className="inline-block animate-bounce">🐾</span>4
        </p>
        <h1 className="font-display mt-4 text-2xl font-bold text-clay-ink sm:text-3xl">
          This page wandered off
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-clay-ink/55">
          Looks like the page you're after has chased a squirrel somewhere else.
          Let's get you back to the good stuff.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="clay-btn h-12 rounded-2xl bg-clay-orange px-7 text-sm font-extrabold text-white"
          >
            Back to home
          </Link>
          <Link
            to="/products"
            className="clay-btn h-12 rounded-2xl bg-white px-7 text-sm font-extrabold text-clay-ink"
          >
            Shop products
          </Link>
        </div>
      </div>
    </div>
  );
}
