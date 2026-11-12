// A price, plus the old price crossed out when the product is on sale.

import { discountPercent, formatPrice } from "@/lib/utils/money";

export function Price({
  priceCents,
  compareAtPriceCents,
  large = false,
}: {
  priceCents: number;
  compareAtPriceCents?: number;
  large?: boolean;
}) {
  const onSale = Boolean(discountPercent(priceCents, compareAtPriceCents));

  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className={`font-semibold ${large ? "text-3xl" : "text-lg"}`}>
        {formatPrice(priceCents)}
      </span>
      {onSale && compareAtPriceCents && (
        <span className="text-sm text-slate-500">
          <span className="sr-only">Was </span>
          <s>{formatPrice(compareAtPriceCents)}</s>
        </span>
      )}
    </p>
  );
}