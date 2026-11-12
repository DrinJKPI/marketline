// The filters in use, shown as chips above the results. Each chip is a
// link to the same page without that one filter.

import Link from "next/link";
import { X } from "lucide-react";
import { filtersHref } from "@/lib/utils/filters-url";
import { formatPrice } from "@/lib/utils/money";
import type { Category, ProductFilters } from "@/types/catalog";

type Chip = { label: string; href: string };

export function ActiveFilters({
  basePath,
  filters,
  categories = [],
}: {
  basePath: string;
  filters: ProductFilters;
  categories?: Category[];
}) {
  const href = (changes: Partial<ProductFilters>) =>
    filtersHref(basePath, filters, changes);
  const chips: Chip[] = [];

  if (filters.query) {
    chips.push({ label: `“${filters.query}”`, href: href({ query: undefined }) });
  }
  if (filters.categorySlug) {
    const name = categories.find((c) => c.slug === filters.categorySlug)?.name;
    chips.push({
      label: name ?? filters.categorySlug,
      href: href({ categorySlug: undefined }),
    });
  }
  for (const brand of filters.brands ?? []) {
    chips.push({
      label: brand,
      href: href({ brands: filters.brands?.filter((b) => b !== brand) }),
    });
  }
  if (filters.minPriceCents !== undefined || filters.maxPriceCents !== undefined) {
    const from = filters.minPriceCents !== undefined ? formatPrice(filters.minPriceCents) : "";
    const to = filters.maxPriceCents !== undefined ? formatPrice(filters.maxPriceCents) : "";
    chips.push({
      label: from && to ? `${from} – ${to}` : from ? `From ${from}` : `Up to ${to}`,
      href: href({ minPriceCents: undefined, maxPriceCents: undefined }),
    });
  }
  if (filters.minRating) {
    chips.push({ label: `${filters.minRating} ★ & up`, href: href({ minRating: undefined }) });
  }
  if (filters.inStockOnly) {
    chips.push({ label: "In stock", href: href({ inStockOnly: false }) });
  }

  if (chips.length === 0) return null;

  return (
    <ul aria-label="Active filters" className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <li key={chip.label}>
          <Link
            href={chip.href}
            scroll={false}
            className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700 hover:bg-brand-100"
          >
            {chip.label}
            <X aria-label="Remove filter" className="h-3.5 w-3.5" />
          </Link>
        </li>
      ))}
      {chips.length > 1 && (
        <li>
          <Link href={basePath} className="text-sm font-medium text-slate-500 hover:text-slate-800">
            Clear all
          </Link>
        </li>
      )}
    </ul>
  );
}