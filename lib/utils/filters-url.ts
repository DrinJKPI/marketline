// Turns ProductFilters into a URL like /products?q=lamp&brand=Nordhaus&sort=newest
// and back. Filters live in the URL so that results can be bookmarked and
// shared, and the back button works. This file is used in the browser too,
// so it has no server-only code.

import type { ProductFilters, ProductSort } from "@/types/catalog";

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "relevance", label: "Best match" },
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Customer rating" },
];

// Searches are sorted by best match unless the shopper picks something else.
export function defaultSort(query?: string): ProductSort {
  return query ? "relevance" : "featured";
}

// ProductFilters -> "q=lamp&brand=Nordhaus". Default values are left out to
// keep URLs short.
export function filtersToQuery(filters: ProductFilters): string {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.categorySlug) params.set("category", filters.categorySlug);
  for (const brand of filters.brands ?? []) params.append("brand", brand);
  if (filters.minPriceCents !== undefined) params.set("min", String(filters.minPriceCents / 100));
  if (filters.maxPriceCents !== undefined) params.set("max", String(filters.maxPriceCents / 100));
  if (filters.minRating) params.set("rating", String(filters.minRating));
  if (filters.inStockOnly) params.set("stock", "1");

  // "Best match" only makes sense while there's a search.
  const sort =
    filters.sort === "relevance" && !filters.query ? "featured" : filters.sort;
  if (sort !== defaultSort(filters.query)) params.set("sort", sort);

  return params.toString();
}

// The URL of a listing page with some filters changed,
// e.g. filtersHref("/products", filters, { brands: [] }).
export function filtersHref(
  basePath: string,
  filters: ProductFilters,
  changes: Partial<ProductFilters> = {},
): string {
  const query = filtersToQuery({ ...filters, ...changes });
  return query ? `${basePath}?${query}` : basePath;
}