// Every DynamoDB key in one place, exactly as described in
// docs/data-model.md. The repositories build keys only through these
// helpers, so a typo in a key can't creep in somewhere.

import type { CartOwner } from "@/types/cart";

// Names of the two global secondary indexes.
export const GSI1 = "GSI1";
export const GSI2 = "GSI2";

// Primary keys (PK + SK) of single items.
export const keys = {
  user: (userId: string) => ({ PK: `USER#${userId}`, SK: "PROFILE" }),
  email: (email: string) => ({ PK: `EMAIL#${email.toLowerCase()}`, SK: "EMAIL" }),
  session: (tokenHash: string) => ({ PK: `SESSION#${tokenHash}`, SK: "SESSION" }),
  category: (slug: string) => ({ PK: `CATEGORY#${slug}`, SK: "CATEGORY" }),
  product: (slug: string) => ({ PK: `PRODUCT#${slug}`, SK: "PRODUCT" }),
  cartItem: (owner: CartOwner, productSlug: string) => ({
    PK: partitions.cart(owner),
    SK: `ITEM#${productSlug}`,
  }),
  wishlistItem: (userId: string, productSlug: string) => ({
    PK: partitions.user(userId),
    SK: `WISHLIST#${productSlug}`,
  }),
};

// Partition key values that group several items, for Query.
export const partitions = {
  user: (userId: string) => `USER#${userId}`,
  cart: (owner: CartOwner) =>
    owner.kind === "user"
      ? `CART#USER#${owner.userId}`
      : `CART#GUEST#${owner.guestId}`,
  allCategories: "CATEGORIES", // GSI1
  categoryProducts: (categorySlug: string) => `CATEGORY#${categorySlug}`, // GSI1
  allProducts: "PRODUCTS", // GSI2
};

// Sort key values used in the indexes.
export const sortKeys = {
  // Zero-padded, because sort keys are compared as text ("10" < "9").
  category: (sortOrder: number, slug: string) =>
    `${String(sortOrder).padStart(3, "0")}#${slug}`,
  productInCategory: (slug: string) => `PRODUCT#${slug}`,
  // ISO dates sort correctly as text, so this sorts by date.
  productByDate: (createdAt: string, slug: string) => `${createdAt}#${slug}`,
};

// Sort key prefixes, for begins_with() conditions.
export const prefixes = {
  wishlistItem: "WISHLIST#",
};