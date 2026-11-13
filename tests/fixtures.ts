// Builds test products, so each test only spells out what matters to it:
// makeProduct({ priceCents: 500 }) gives a complete product costing €5.00.

import type { Product } from "@/types/catalog";

let counter = 0;

export function makeProduct(overrides: Partial<Product> = {}): Product {
  counter += 1;
  return {
    slug: `test-product-${counter}`,
    name: `Test Product ${counter}`,
    description: "A product used in tests.",
    brand: "Testbrand",
    categorySlug: "electronics",
    priceCents: 1000,
    images: [],
    rating: 4,
    reviewCount: 10,
    stock: 20,
    featured: false,
    tags: [],
    createdAt: "2026-11-01T00:00:00.000Z",
    ...overrides,
  };
}