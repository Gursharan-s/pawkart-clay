import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  viewAllTo?: string;
  viewAllLabel?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  viewAllTo,
  viewAllLabel = "View all",
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-wrap items-end justify-between gap-4",
        align === "center" && "flex-col items-center text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-clay-blush px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-clay-orange clay-tile">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-3xl font-bold tracking-tight text-clay-ink sm:text-4xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-3 text-sm leading-6 text-clay-ink/60 sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {viewAllTo && (
        <Link
          to={viewAllTo}
          className="group inline-flex items-center gap-1.5 rounded-full bg-clay-butter px-4 py-2 text-sm font-bold text-clay-ink transition-all hover:bg-clay-orange hover:text-white clay-tile"
        >
          {viewAllLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
