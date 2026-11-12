// Reads the filters from a listing page's URL (?q=...&brand=...&min=...).
// Anyone can type anything into a URL, so every value is checked, and an
// invalid one is simply ignored instead of showing an error page.

import { z } from "zod";
import { SORT_OPTIONS, defaultSort } from "@/lib/utils/filters-url";
import type { ProductFilters, ProductSort } from "@/types/catalog";

type SearchParams = Record<string, string | string[] | undefined>;

// A parameter can appear once (?brand=A) or several times (?brand=A&brand=B).
const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;
const all = (value: string | string[] | undefined) =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

// An empty box in the form sends "", which should mean "not set".
const blankIsUnset = (value: unknown) => (value === "" ? undefined : value);

const euros = z.preprocess(
  blankIsUnset,
  z.coerce.number().int().min(0).max(100_000).optional(),
);

const sortValues = SORT_OPTIONS.map((option) => option.value) as [
  ProductSort,
  ...ProductSort[],
];

// .catch() replaces an invalid value with a safe default.
const schema = z.object({
  q: z.string().trim().max(100).catch(""),
  category: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional()
    .catch(undefined),
  brand: z.array(z.string().trim().min(1).max(60)).max(30).catch([]),
  min: euros.catch(undefined),
  max: euros.catch(undefined),
  rating: z
    .preprocess(blankIsUnset, z.coerce.number().min(1).max(5).multipleOf(0.5).optional())
    .catch(undefined),
  stock: z.literal("1").optional().catch(undefined),
  sort: z.enum(sortValues).optional().catch(undefined),
});

export function parseProductFilters(params: SearchParams): ProductFilters {
  const raw = schema.parse({
    q: first(params.q) ?? "",
    category: first(params.category),
    brand: all(params.brand),
    min: first(params.min),
    max: first(params.max),
    rating: first(params.rating),
    stock: first(params.stock),
    sort: first(params.sort),
  });

  // Someone typed the prices the wrong way round: swap them.
  let { min, max } = raw;
  if (min !== undefined && max !== undefined && min > max) [min, max] = [max, min];

  const query = raw.q || undefined;
  let sort = raw.sort ?? defaultSort(query);
  if (sort === "relevance" && !query) sort = "featured";

  return {
    query,
    categorySlug: raw.category,
    brands: [...new Set(raw.brand)],
    minPriceCents: min === undefined ? undefined : min * 100,
    maxPriceCents: max === undefined ? undefined : max * 100,
    minRating: raw.rating,
    inStockOnly: raw.stock === "1",
    sort,
  };
}