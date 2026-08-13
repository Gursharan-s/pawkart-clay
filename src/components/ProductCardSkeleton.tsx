import { cn } from "@/lib/utils";

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-clay-ink/5 bg-card p-0 clay-tile",
        className,
      )}
    >
      <div className="aspect-[4/3.2] w-full animate-pulse bg-clay-sand/70" />
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="h-3 w-2/5 animate-pulse rounded-full bg-clay-sand" />
        <div className="h-4 w-full animate-pulse rounded-full bg-clay-sand" />
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-clay-sand" />
        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="h-6 w-20 animate-pulse rounded-full bg-clay-sand" />
          <div className="size-10 animate-pulse rounded-2xl bg-clay-sand" />
        </div>
      </div>
    </div>
  );
}

export function CarouselSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} className="w-[76%] shrink-0 sm:w-[46%] md:w-[31%] lg:w-[24%]" />
      ))}
    </div>
  );
}
