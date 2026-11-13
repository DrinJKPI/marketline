// Tests for small helpers: money, safe redirects and sign-up rules.

import { describe, expect, it } from "vitest";
import { discountPercent, formatPrice } from "@/lib/utils/money";
import { safeNextPath } from "@/lib/utils/safe-redirect";
import { signUpSchema } from "@/lib/validation/auth";

describe("money", () => {
  it("formats cents as euro", () => {
    expect(formatPrice(7999)).toBe("€79.99");
    expect(formatPrice(109900)).toBe("€1,099.00");
    expect(formatPrice(50)).toBe("€0.50");
  });

  it("rounds discounts down, never promising more than the real saving", () => {
    expect(discountPercent(7999, 9999)).toBe(20); // 20.002 %
    expect(discountPercent(2999, 3999)).toBe(25); // 25.006 %
    expect(discountPercent(1799, 2299)).toBe(21); // 21.7 %
  });

  it("has no discount when not on sale", () => {
    expect(discountPercent(1000)).toBeNull();
    expect(discountPercent(1000, 1000)).toBeNull();
    expect(discountPercent(1000, 900)).toBeNull();
  });
});

describe("safeNextPath", () => {
  it("allows paths on this site", () => {
    expect(safeNextPath("/cart")).toBe("/cart");
    expect(safeNextPath("/products?q=lamp")).toBe("/products?q=lamp");
  });

  it("blocks other websites and odd values", () => {
    for (const value of ["https://evil.example", "//evil.example", "/\\evil.example", "cart", null, 42]) {
      expect(safeNextPath(value)).toBe("/account");
    }
  });
});

describe("sign-up rules", () => {
  it("trims the name and lowercases the email", () => {
    const result = signUpSchema.parse({
      name: "  Anna Murphy ",
      email: " Anna@Example.COM ",
      password: "long-enough",
    });
    expect(result).toMatchObject({ name: "Anna Murphy", email: "anna@example.com" });
  });

  it("rejects short passwords and invalid emails", () => {
    expect(signUpSchema.safeParse({ name: "A", email: "a@b.co", password: "short" }).success).toBe(false);
    expect(signUpSchema.safeParse({ name: "A", email: "not-an-email", password: "long-enough" }).success).toBe(false);
  });
});