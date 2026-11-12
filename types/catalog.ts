// Shared types for the product catalog, used by pages, components and the
// server. They describe the data the app works with, not how it's stored:
// DynamoDB keys (PK, SK...) stay inside server/db.

export type Category = {
  slug: string; // e.g. "electronics", also used in the URL
  name: string;
  description: string;
  imageUrl?: string; // optional: without one, the app shows an icon
  sortOrder: number; // position in menus, 1 = first
};

export type Product = {
  slug: string; // e.g. "wireless-earbuds-pro", also used in the URL
  name: string;
  description: string;
  brand: string;
  categorySlug: string;
  priceCents: number; // whole cents: 7999 = 79.99
  compareAtPriceCents?: number; // the old price, only when on sale
  images: string[]; // the first is the main one; empty = show a placeholder
  rating: number; // average review score, 0 to 5
  reviewCount: number;
  stock: number; // 0 = out of stock
  featured: boolean; // shown on the homepage
  tags: string[]; // extra words for search
  createdAt: string; // ISO date, used for "newest first"
};

export type ProductSort =
  | "relevance" // best match for a search
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating";

// Everything a shopper can search and filter by. All fields are optional
// except the sort order
export type ProductFilters = {
  query?: string;
  categorySlug?: string;
  minPriceCents?: number;
  maxPriceCents?: number;
  brands?: string[];
  minRating?: number;
  inStockOnly?: boolean;
  sort: ProductSort;
};