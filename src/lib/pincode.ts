const PINCODE_RE = /^[1-9][0-9]{5}$/;

export function isValidPincode(pincode: string): boolean {
  return PINCODE_RE.test(pincode.trim());
}

/**
 * Simulated delivery estimate. Version 1 returns a deterministic "best case"
 * estimate; the next version swaps this for a real logistics API.
 */
export function estimateDelivery(pincode: string): string {
  const digits = [...pincode.trim()].reduce((sum, ch) => sum + Number(ch), 0);
  // deterministic pseudo-random 2-5 day window from the pincode itself
  const days = 2 + (digits % 4);
  const eta = new Date(Date.now() + days * 86_400_000);
  return eta.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
