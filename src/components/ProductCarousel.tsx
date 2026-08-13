import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCarouselProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  ariaLabel?: string;
}

export function ProductCarousel({
  children,
  className,
  itemClassName,
  ariaLabel,
}: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-carousel-item]");
    const step = card ? card.offsetWidth + 16 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className={cn("group/carousel relative", className)}>
      <div
        ref={trackRef}
        aria-label={ariaLabel}
        className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-2 pt-1"
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Scroll left"
        className="absolute -left-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-clay-ink shadow-lg transition-all hover:scale-110 hover:text-clay-orange md:flex clay-surface-sm"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Scroll right"
        className="absolute -right-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-clay-ink shadow-lg transition-all hover:scale-110 hover:text-clay-orange md:flex clay-surface-sm"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}

/** Wrapper that sizes each carousel item responsively. */
export function CarouselItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-carousel-item
      className={cn(
        "w-[76%] shrink-0 snap-start sm:w-[46%] md:w-[31%] lg:w-[24%] xl:w-[19%]",
        className,
      )}
    >
      {children}
    </div>
  );
}
