// Business logic for the storefront: which products appear where, in what
// order, and which ones match a search. The functions in the first part are
// pure (data in, data out), which makes them easy to test. The "get"
// functions at the bottom load the data a page needs from the repositories.
import "server-only";
import { connection } from "next/server";
import { getCategory, listCategories } from "@/server/db/categories";
import {
  getProduct,
  listProducts,
  listProductsByCategory,
} from "@/server/db/products";
import { discountPercent } from "@/lib/utils/money";
import type {
  Category,
  Product,
  ProductFilters,
  ProductSort,
} from "@/types/catalog";

const SECTION_SIZE = 8; // products per homepage section
const RELATED_SIZE = 4; // related products on a product page

const inStock = (product: Product) => product.stock > 0;

const discountOf = (product: Product) =>
  discountPercent(product.priceCents, product.compareAtPriceCents) ?? 0;

// ----- Homepage sections -----

// Featured products that can be bought right now.
export function pickFeatured(products: Product[], limit = SECTION_SIZE): Product[] {
  return products.filter((p) => p.featured && inStock(p)).slice(0, limit);
}

// Products on sale, biggest discount first.
export function pickDeals(products: Product[], limit = SECTION_SIZE): Product[] {
  return products
    .filter((p) => discountOf(p) > 0 && inStock(p))
    .sort((a, b) => discountOf(b) - discountOf(a))
    .slice(0, limit);
}

// The most recently added products.
export function pickNewArrivals(products: Product[], limit = SECTION_SIZE): Product[] {
  return sortProducts(products.filter(inStock), "newest").slice(0, limit);
}

// ----- Sorting -----

// Returns a sorted copy (never changes the original array). Out-of-stock
// products always go last. "relevance" needs the search scores.
export function sortProducts(
  products: Product[],
  sort: ProductSort,
  scores: Map<string, number> = new Map(),
): Product[] {
  // Featured first, then the most reviewed ("most popular").
  const byFeatured = (a: Product, b: Product) =>
    Number(b.featured) - Number(a.featured) || b.reviewCount - a.reviewCount;

  const compare: Record<ProductSort, (a: Product, b: Product) => number> = {
    relevance: (a, b) =>
      (scores.get(b.slug) ?? 0) - (scores.get(a.slug) ?? 0) || byFeatured(a, b),
    featured: byFeatured,
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    "price-asc": (a, b) => a.priceCents - b.priceCents,
    "price-desc": (a, b) => b.priceCents - a.priceCents,
    rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  };
  return [...products].sort(
    (a, b) => Number(inStock(b)) - Number(inStock(a)) || compare[sort](a, b),
  );
}

// ----- Search -----

// Lowercase without accents, so "Café" matches "cafe".
const normalize = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// "Wireless  earbuds!" -> ["wireless", "earbuds"]
export function queryTerms(query?: string): string[] {
  return normalize(query ?? "").split(/[^a-z0-9]+/).filter(Boolean);
}

// How well a product matches the search words: 0 = not at all. Every word
// must appear somewhere, and a word counts more in the name than in the
// description. With no search words, every product matches.
export function searchScore(product: Product, terms: string[]): number {
  if (terms.length === 0) return 1;

  const fields: [string, number][] = [
    [normalize(product.name), 3],
    [normalize(product.brand), 2],
    [normalize(product.tags.join(" ")), 2],
    [normalize(product.categorySlug), 1],
    [normalize(product.description), 1],
  ];

  let score = 0;
  for (const term of terms) {
    const best = Math.max(
      0,
      ...fields.map(([text, weight]) => (text.includes(term) ? weight : 0)),
    );
    if (best === 0) return 0;
    score += best;
  }
  return score;
}

export type BrandCount = { name: string; count: number };

// Applies a search and the filters to a list of products. Also returns the
// brands to offer as filters: they're counted before the brand, price,
// rating and stock filters, so ticking one brand doesn't hide the others.
export function browseProducts(
  products: Product[],
  filters: ProductFilters,
): { products: Product[]; brands: BrandCount[] } {
  const terms = queryTerms(filters.query);
  const scores = new Map<string, number>();

  const matching = products.filter((product) => {
    if (filters.categorySlug && product.categorySlug !== filters.categorySlug) {
      return false;
    }
    const score = searchScore(product, terms);
    scores.set(product.slug, score);
    return score > 0;
  });

  const brandCounts = new Map<string, number>();
  for (const product of matching) {
    brandCounts.set(product.brand, (brandCounts.get(product.brand) ?? 0) + 1);
  }
  const brands = [...brandCounts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const { brands: wantedBrands = [], minPriceCents, maxPriceCents, minRating } = filters;
  const results = matching.filter(
    (p) =>
      (wantedBrands.length === 0 || wantedBrands.includes(p.brand)) &&
      (minPriceCents === undefined || p.priceCents >= minPriceCents) &&
      (maxPriceCents === undefined || p.priceCents <= maxPriceCents) &&
      (minRating === undefined || p.rating >= minRating) &&
      (!filters.inStockOnly || inStock(p)),
  );

  return { products: sortProducts(results, filters.sort, scores), brands };
}

// ----- Related products -----

// Other products from the same category: in-stock ones first, then those
// sharing the most tags with this product, then the best rated.
export function pickRelated(
  product: Product,
  candidates: Product[],
  limit = RELATED_SIZE,
): Product[] {
  const sharedTags = (other: Product) =>
    other.tags.filter((tag) => product.tags.includes(tag)).length;

  return candidates
    .filter((p) => p.slug !== product.slug && p.categorySlug === product.categorySlug)
    .sort(
      (a, b) =>
        Number(inStock(b)) - Number(inStock(a)) ||
        sharedTags(b) - sharedTags(a) ||
        b.rating - a.rating,
    )
    .slice(0, limit);
}

// ----- Loading data for pages -----
// connection() tells Next.js to load this when a visitor asks for the page,
// not once at build time, so prices and stock are always current.

export async function getCategories(): Promise<Category[]> {
  await connection();
  return listCategories();
}

export async function getHomepageData() {
  await connection();
  const [categories, products] = await Promise.all([
    listCategories(),
    listProducts(),
  ]);
  const featured = pickFeatured(products);
  // Don't repeat the featured products under "New arrivals".
  const featuredSlugs = new Set(featured.map((p) => p.slug));
  const notFeatured = products.filter((p) => !featuredSlugs.has(p.slug));

  return {
    categories,
    deals: pickDeals(products),
    featured,
    newArrivals: pickNewArrivals(notFeatured),
  };
}

// A category and all its products, or null if the category doesn't exist.
export async function getCategoryPageData(slug: string) {
  await connection();
  const [category, products] = await Promise.all([
    getCategory(slug),
    listProductsByCategory(slug),
  ]);
  if (!category) return null;
  return { category, products };
}

// Search results for the /products page, plus what the filters need.
export async function getProductsPageData(filters: ProductFilters) {
  await connection();
  const [categories, products] = await Promise.all([
    listCategories(),
    listProducts(),
  ]);
  return { categories, ...browseProducts(products, filters) };
}

// A product, its category and related products, or null if there's no
// product with this slug.
export async function getProductPageData(slug: string) {
  await connection();
  const product = await getProduct(slug);
  if (!product) return null;

  const [category, sameCategory] = await Promise.all([
    getCategory(product.categorySlug),
    listProductsByCategory(product.categorySlug),
  ]);
  return { product, category, related: pickRelated(product, sameCategory) };
}