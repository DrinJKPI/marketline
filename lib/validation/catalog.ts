// zod rules for catalog data. They check the seed data before it's
// written, and every item read back from DynamoDB: parse() also drops
// fields the schema doesn't know, such as the DynamoDB keys (PK, SK...)

import { z } from "zod";
import type { Category, Product } from "@/types/catalog";

// e.g. "wireless-earbuds-pro": lowercase words joined by single hyphens
const slug = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "must be lowercase words joined by hyphens");

const cents = z.number().int().nonnegative();

export const categorySchema = z.object({
  slug,
  name: z.string().min(1).max(60),
  description: z.string().max(300),
  imageUrl: z.string().min(1).optional(),
  sortOrder: z.number().int().min(1).max(999),
}) satisfies z.ZodType<Category>; // must match the Category type

export const productSchema = z
  .object({
    slug,
    name: z.string().min(1).max(120),
    description: z.string().max(2000),
    brand: z.string().min(1).max(60),
    categorySlug: slug,
    priceCents: cents.min(1),
    compareAtPriceCents: cents.optional(),
    images: z.array(z.string().min(1)),
    rating: z.number().min(0).max(5),
    reviewCount: z.number().int().nonnegative(),
    stock: z.number().int().nonnegative(),
    featured: z.boolean(),
    tags: z.array(z.string()),
    createdAt: z.iso.datetime(),
  })
  .refine(
    (p) => p.compareAtPriceCents === undefined || p.compareAtPriceCents > p.priceCents,
    { message: "must be higher than priceCents", path: ["compareAtPriceCents"] },
  ) satisfies z.ZodType<Product>; // must match the Product type