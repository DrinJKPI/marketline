// Money helpers Prices are stored as whole cents (see docs/data-model.md)
// and only turned into text like "€79.99" when they're shown

const euro = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
});

// 7999 -> "€79.99"
export function formatPrice(cents: number): string {
  return euro.format(cents / 100);
}

// How much cheaper than the old price, in whole percent (rounded down so we
// never promise more than the real discount). null when not on sale.
export function discountPercent(
  priceCents: number,
  compareAtPriceCents?: number,
): number | null {
  if (!compareAtPriceCents || compareAtPriceCents <= priceCents) return null;
  return Math.floor((1 - priceCents / compareAtPriceCents) * 100);
}