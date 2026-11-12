// Business logic for the storefront: which products appear where, and in
// what order. The "pick" and "sort" functions are pure (data in, data out),
// which makes them easy to test. The "get" functions load the data a page
// needs from the repositories
import "server-only";
import { connection } from "next/server";
import { getCategory, listCategories } from "@/server/db/categories";
import { listProducts, listProductsByCategory } from "@/server/db/products";
import { discountPercent } from "@/lib/utils/money";
import type { Category, Product, ProductSort } from "@/types/catalog";

const SECTION_SIZE = 8; // products per homepage section

const inStock = (product: Product) => product.stock > 0;

const discountOf = (product: Product) =>
  discountPercent(product.priceCents, product.compareAtPriceCents) ?? 0;

// ----- Pure rules -----

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

// Returns a sorted copy (never changes the original array). Out-of-stock
// products always go last, whatever the sort order.
export function sortProducts(products: Product[], sort: ProductSort): Product[] {
  const compare: Record<ProductSort, (a: Product, b: Product) => number> = {
    // Featured first, then the most reviewed ("most popular").
    featured: (a, b) =>
      Number(b.featured) - Number(a.featured) || b.reviewCount - a.reviewCount,
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    "price-asc": (a, b) => a.priceCents - b.priceCents,
    "price-desc": (a, b) => b.priceCents - a.priceCents,
    rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  };
  return [...products].sort(
    (a, b) => Number(inStock(b)) - Number(inStock(a)) || compare[sort](a, b),
  );
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

// A category and its products, or null if the category doesn't exist.
export async function getCategoryPageData(slug: string) {
  await connection();
  const [category, products] = await Promise.all([
    getCategory(slug),
    listProductsByCategory(slug),
  ]);
  if (!category) return null;
  return { category, products: sortProducts(products, "featured") };
}

export async function getAllProducts(): Promise<Product[]> {
  await connection();
  return sortProducts(await listProducts(), "featured");
}