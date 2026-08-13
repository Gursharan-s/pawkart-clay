import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pawkart:recently-viewed:v1";
const MAX = 10;

/** Recently viewed product SKUs (most recent first), persisted locally. */
export function useRecentlyViewed() {
  const [skus, setSkus] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(skus));
    } catch {
      // ignore
    }
  }, [skus]);

  const track = useCallback((sku: string) => {
    setSkus((prev) => [sku, ...prev.filter((s) => s !== sku)].slice(0, MAX));
  }, []);

  return { recentlyViewedSkus: skus, track };
}
