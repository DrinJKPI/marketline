// Tests for the cart rules in server/services/cart.ts and the cart's
// request validation.

import { describe, expect, it } from "vitest";
import { addToCartSchema, updateQuantitySchema } from "@/lib/validation/cart";
import { buildCart, maxQuantityFor, mergedQuantity } from "@/server/services/cart";
import type { CartItem } from "@/types/cart";
import { makeProduct } from "./fixtures";

const item = (productSlug: string, quantity: number, addedAt = "2026-11-10T00:00:00.000Z"): CartItem => ({
  productSlug,
  quantity,
  addedAt,
});

describe("maxQuantityFor", () => {
  it("is 10 when there's plenty in stock", () => {
    expect(maxQuantityFor({ stock: 300 })).toBe(10);
  });

  it("is the stock when there's less than 10", () => {
    expect(maxQuantityFor({ stock: 4 })).toBe(4);
  });

  it("is 0 when out of stock", () => {
    expect(maxQuantityFor({ stock: 0 })).toBe(0);
  });
});

describe("buildCart", () => {
  const lamp = makeProduct({ slug: "lamp", priceCents: 2499, stock: 3 });
  const mug = makeProduct({ slug: "mug", priceCents: 799 });

  it("works out line totals, the item count and the subtotal", () => {
    const cart = buildCart([item("lamp", 2), item("mug", 3)], [lamp, mug]);
    expect(cart.lines.map((line) => line.lineTotalCents)).toEqual([4998, 2397]);
    expect(cart.itemCount).toBe(5);
    expect(cart.subtotalCents).toBe(4998 + 2397);
  });

  it("uses the product's current price and stock limit", () => {
    const cart = buildCart([item("lamp", 1)], [lamp]);
    expect(cart.lines[0].product.priceCents).toBe(2499);
    expect(cart.lines[0].maxQuantity).toBe(3);
  });

  it("leaves out products that no longer exist", () => {
    const cart = buildCart([item("lamp", 1), item("deleted-product", 4)], [lamp]);
    expect(cart.lines.map((line) => line.productSlug)).toEqual(["lamp"]);
    expect(cart.itemCount).toBe(1);
  });

  it("lists the most recently added products first", () => {
    const cart = buildCart(
      [item("lamp", 1, "2026-11-01T00:00:00.000Z"), item("mug", 1, "2026-11-09T00:00:00.000Z")],
      [lamp, mug],
    );
    expect(cart.lines.map((line) => line.productSlug)).toEqual(["mug", "lamp"]);
  });

  it("is empty with no items", () => {
    expect(buildCart([], [lamp])).toEqual({ lines: [], itemCount: 0, subtotalCents: 0 });
  });
});

describe("mergedQuantity (guest cart -> account cart)", () => {
  it("adds the guest's quantity to the account's", () => {
    expect(mergedQuantity(2, 3, 10)).toBe(5);
  });

  it("never goes over the limit", () => {
    expect(mergedQuantity(9, 3, 10)).toBe(10);
    expect(mergedQuantity(0, 5, 4)).toBe(4); // only 4 in stock
  });
});

describe("cart request validation", () => {
  it("accepts a valid request and defaults the quantity to 1", () => {
    expect(addToCartSchema.parse({ productSlug: "air-fryer-5l" })).toEqual({
      productSlug: "air-fryer-5l",
      quantity: 1,
    });
  });

  it("rejects quantities outside 1 to 10, and fractions", () => {
    for (const quantity of [0, 11, -1, 2.5]) {
      expect(updateQuantitySchema.safeParse({ quantity }).success).toBe(false);
    }
  });

  it("rejects product slugs that can't exist", () => {
    expect(addToCartSchema.safeParse({ productSlug: "../../etc/passwd" }).success).toBe(false);
  });
});