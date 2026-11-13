// Tests for reading filters from a URL (lib/validation/product-filters.ts)
// and writing them back (lib/utils/filters-url.ts).

import { describe, expect, it } from "vitest";
import { filtersHref, filtersToQuery } from "@/lib/utils/filters-url";
import { parseProductFilters } from "@/lib/validation/product-filters";

describe("parseProductFilters", () => {
  it("uses sensible defaults for an empty URL", () => {
    expect(parseProductFilters({})).toEqual({
      query: undefined,
      categorySlug: undefined,
      brands: [],
      minPriceCents: undefined,
      maxPriceCents: undefined,
      minRating: undefined,
      inStockOnly: false,
      sort: "featured",
    });
  });

  it("reads every filter, converting euros to cents", () => {
    const filters = parseProductFilters({
      q: " earbuds ",
      category: "electronics",
      brand: ["Auralis", "Lumora"],
      min: "20",
      max: "150",
      rating: "4.5",
      stock: "1",
      sort: "price-asc",
    });
    expect(filters).toMatchObject({
      query: "earbuds",
      categorySlug: "electronics",
      brands: ["Auralis", "Lumora"],
      minPriceCents: 2000,
      maxPriceCents: 15000,
      minRating: 4.5,
      inStockOnly: true,
      sort: "price-asc",
    });
  });

  it("ignores invalid values instead of failing", () => {
    const filters = parseProductFilters({
      category: "BAD!",
      min: "lots",
      rating: "9",
      sort: "cheapest",
      stock: "yes",
    });
    expect(filters).toMatchObject({
      categorySlug: undefined,
      minPriceCents: undefined,
      minRating: undefined,
      sort: "featured",
      inStockOnly: false,
    });
  });

  it("swaps a minimum price that's higher than the maximum", () => {
    const filters = parseProductFilters({ min: "100", max: "20" });
    expect([filters.minPriceCents, filters.maxPriceCents]).toEqual([2000, 10000]);
  });

  it("sorts searches by best match, but only when there's a search", () => {
    expect(parseProductFilters({ q: "lamp" }).sort).toBe("relevance");
    expect(parseProductFilters({ sort: "relevance" }).sort).toBe("featured");
  });
});

describe("filtersToQuery and filtersHref", () => {
  it("leaves default values out of the URL", () => {
    expect(filtersToQuery(parseProductFilters({}))).toBe("");
    expect(filtersToQuery(parseProductFilters({ q: "lamp" }))).toBe("q=lamp");
  });

  it("gives back the same filters after a round trip", () => {
    const params = { q: "shoes", brand: ["Linen & Loom"], min: "10", stock: "1", sort: "newest" };
    const filters = parseProductFilters(params);
    const query = new URLSearchParams(filtersToQuery(filters));
    const again = parseProductFilters({
      ...Object.fromEntries(query),
      brand: query.getAll("brand"),
    });
    expect(again).toEqual(filters);
  });

  it("builds a link with one filter removed", () => {
    const filters = parseProductFilters({ q: "shoes", brand: ["Stridewell"] });
    expect(filtersHref("/products", filters, { brands: [] })).toBe("/products?q=shoes");
    expect(filtersHref("/products", filters, { query: undefined, brands: [] })).toBe("/products");
  });
});