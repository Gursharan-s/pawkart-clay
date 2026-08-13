/** ₹ formatting with Indian digit grouping (e.g. ₹1,49,999). */
export function formatINR(amount: number): string {
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return `₹${formatted}`;
}

/** Whole-number discount percentage (0-100). */
export function discountPct(price: number, mrp: number): number {
  if (mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/** Absolute discount in rupees. */
export function discountAmount(price: number, mrp: number): number {
  return Math.max(0, mrp - price);
}
