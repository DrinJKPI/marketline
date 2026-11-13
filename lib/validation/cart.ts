// Rules for cart requests. The API checks every request body with these,
// because anyone can send anything to an API, not just our own buttons.

import { z } from "zod";

export const MAX_PER_PRODUCT = 10; // the most of one product in a cart

const productSlug = z
  .string()
  .max(120)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Unknown product.");

const quantity = z
  .number("Quantity must be a number.")
  .int("Quantity must be a whole number.")
  .min(1, "Quantity must be at least 1.")
  .max(MAX_PER_PRODUCT, `You can have at most ${MAX_PER_PRODUCT} of one product.`);

export const addToCartSchema = z.object({
  productSlug,
  quantity: quantity.default(1),
});

export const updateQuantitySchema = z.object({ quantity });