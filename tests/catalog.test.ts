// Tests for the storefront rules in server/services/catalog.ts: sorting,
// search, filters, homepage sections and related products.

import { describe, expect, it } from "vitest";
import {
  browseProducts,
  pickDeals,
  pickFeatured,
  pickNewArrivals,
  pickRelated,
  queryTerms,
  searchScore,
  sortProducts,
} from "@/server/services/catalog";
import { makeProduct } from "./fixtures";

const slugs = (products: { slug: string }[]) => products.map((p) => p.slug);

describe("sortProducts", () => {
  const cheap = makeProduct({ slug: "cheap", priceCents: 500, rating: 3 });
  const mid = makeProduct({ slug: "mid", priceCents: 1500, rating: 5 });
  const dear = makeProduct({ slug: "dear", priceCents: 9000, rating: 4 });
  const soldOut = makeProduct({ slug: "sold-out", priceCents: 100, stock: 0 });

  it("sorts by price, both ways", () => {
    expect(slugs(sortProducts([dear, cheap, mid], "price-asc"))).toEqual(["cheap", "mid", "dear"]);
    expect(slugs(sortProducts([cheap, dear, mid], "price-desc"))).toEqual(["dear", "mid", "cheap"]);
  });

  it("sorts by rating, best first", () => {
    expect(slugs(sortProducts([cheap, dear, mid], "rating"))).toEqual(["mid", "dear", "cheap"]);
  });

  it("always puts out-of-stock products last", () => {
    // soldOut is the cheapest, but it still goes to the end.
    expect(slugs(sortProducts([dear, soldOut, cheap], "price-asc"))).toEqual([
      "cheap",
      "dear",
      "sold-out",
    ]);
  });

  it("puts featured products first, then the most reviewed", () => {
    const popular = makeProduct({ slug: "popular", reviewCount: 900 });
    const featured = makeProduct({ slug: "featured", featured: true, reviewCount: 5 });
    expect(slugs(sortProducts([popular, featured], "featured"))).toEqual(["featured", "popular"]);
  });

  it("returns a sorted copy and leaves the original array alone", () => {
    const original = [dear, cheap];
    sortProducts(original, "price-asc");
    expect(slugs(original)).toEqual(["dear", "cheap"]);
  });
});

describe("search", () => {
  it("splits a search into lowercase words without punctuation or accents", () => {
    expect(queryTerms("  Wireless,  EARBUDS! Café ")).toEqual(["wireless", "earbuds", "cafe"]);
    expect(queryTerms(undefined)).toEqual([]);
  });

  it("scores a match in the name higher than in the description", () => {
    const inName = makeProduct({ name: "Garden Hose" });
    const inDescription = makeProduct({ name: "Spray Gun", description: "Fits any garden hose." });
    expect(searchScore(inName, ["hose"])).toBeGreaterThan(searchScore(inDescription, ["hose"]));
  });

  it("needs every word to appear somewhere", () => {
    const product = makeProduct({ name: "Wireless Earbuds", tags: ["bluetooth"] });
    expect(searchScore(product, ["wireless", "bluetooth"])).toBeGreaterThan(0);
    expect(searchScore(product, ["wireless", "keyboard"])).toBe(0);
  });

  it("matches every product when there is no search", () => {
    expect(searchScore(makeProduct(), [])).toBeGreaterThan(0);
  });
});

describe("browseProducts", () => {
  const products = [
    makeProduct({ slug: "a", brand: "Auralis", priceCents: 4999, rating: 4.3, name: "Speaker" }),
    makeProduct({ slug: "b", brand: "Auralis", priceCents: 12999, rating: 4.7, name: "Headphones" }),
    makeProduct({ slug: "c", brand: "Lumora", priceCents: 54900, rating: 4.5, name: "TV", stock: 0 }),
    makeProduct({ slug: "d", brand: "Kettlewise", categorySlug: "home-kitchen", priceCents: 3499, name: "Kettle" }),
  ];
  const browse = (filters: Parameters<typeof browseProducts>[1]) =>
    slugs(browseProducts(products, filters).products).sort();

  it("filters by category, brand, price, rating and stock", () => {
    expect(browse({ sort: "featured", categorySlug: "home-kitchen" })).toEqual(["d"]);
    expect(browse({ sort: "featured", brands: ["Auralis"] })).toEqual(["a", "b"]);
    expect(browse({ sort: "featured", minPriceCents: 4000, maxPriceCents: 13000 })).toEqual(["a", "b"]);
    expect(browse({ sort: "featured", minRating: 4.5 })).toEqual(["b", "c"]);
    expect(browse({ sort: "featured", inStockOnly: true })).toEqual(["a", "b", "d"]);
  });

  it("combines a search with filters", () => {
    expect(browse({ sort: "featured", query: "kettle", brands: ["Auralis"] })).toEqual([]);
    expect(browse({ sort: "featured", query: "kitchen" })).toEqual(["d"]); // matches the category
  });

  it("counts brands before the brand filter, so other brands stay visible", () => {
    const { brands } = browseProducts(products, { sort: "featured", brands: ["Lumora"] });
    expect(brands).toEqual([
      { name: "Auralis", count: 2 },
      { name: "Kettlewise", count: 1 },
      { name: "Lumora", count: 1 },
    ]);
  });

  it("sorts search results by best match", () => {
    const nameMatch = makeProduct({ slug: "name-match", name: "Speaker Stand" });
    const descriptionMatch = makeProduct({
      slug: "description-match",
      name: "Desk",
      description: "Holds a speaker.",
      featured: true,
    });
    const result = browseProducts([descriptionMatch, nameMatch], {
      sort: "relevance",
      query: "speaker",
    });
    expect(slugs(result.products)).toEqual(["name-match", "description-match"]);
  });
});

describe("homepage sections", () => {
  it("lists deals by biggest discount, leaving out sold-out products", () => {
    const tenOff = makeProduct({ slug: "ten", priceCents: 900, compareAtPriceCents: 1000 });
    const halfOff = makeProduct({ slug: "half", priceCents: 500, compareAtPriceCents: 1000 });
    const soldOut = makeProduct({ slug: "gone", priceCents: 100, compareAtPriceCents: 1000, stock: 0 });
    const noSale = makeProduct({ slug: "full-price" });
    expect(slugs(pickDeals([tenOff, noSale, soldOut, halfOff]))).toEqual(["half", "ten"]);
  });

  it("only features products that are in stock", () => {
    const featured = makeProduct({ slug: "yes", featured: true });
    const soldOut = makeProduct({ slug: "no", featured: true, stock: 0 });
    expect(slugs(pickFeatured([featured, soldOut, makeProduct()]))).toEqual(["yes"]);
  });

  it("lists new arrivals newest first, up to the limit", () => {
    const older = makeProduct({ slug: "older", createdAt: "2026-10-01T00:00:00.000Z" });
    const newer = makeProduct({ slug: "newer", createdAt: "2026-11-01T00:00:00.000Z" });
    const newest = makeProduct({ slug: "newest", createdAt: "2026-11-05T00:00:00.000Z" });
    expect(slugs(pickNewArrivals([older, newest, newer], 2))).toEqual(["newest", "newer"]);
  });
});

describe("pickRelated", () => {
  const earbuds = makeProduct({ slug: "earbuds", tags: ["audio", "bluetooth"] });

  it("picks other products from the same category, never the product itself", () => {
    const sameCategory = makeProduct({ slug: "speaker" });
    const otherCategory = makeProduct({ slug: "kettle", categorySlug: "home-kitchen" });
    expect(slugs(pickRelated(earbuds, [earbuds, sameCategory, otherCategory]))).toEqual(["speaker"]);
  });

  it("prefers in-stock products, then those sharing the most tags", () => {
    const twoTags = makeProduct({ slug: "two-tags", tags: ["audio", "bluetooth"] });
    const oneTag = makeProduct({ slug: "one-tag", tags: ["audio"] });
    const soldOut = makeProduct({ slug: "sold-out", tags: ["audio", "bluetooth"], stock: 0 });
    expect(slugs(pickRelated(earbuds, [soldOut, oneTag, twoTags]))).toEqual([
      "two-tags",
      "one-tag",
      "sold-out",
    ]);
  });
});