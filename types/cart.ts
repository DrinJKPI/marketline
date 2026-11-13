// Shared types for the shopping cart and the wishlist.

import type { Product } from "@/types/catalog";

// Who a cart belongs to: a logged-in user, or a guest identified by a
// random ID in a cookie.
export type CartOwner =
  | { kind: "user"; userId: string }
  | { kind: "guest"; guestId: string };

// What's stored: just the product and how many.
export type CartItem = {
  productSlug: string;
  quantity: number;
  addedAt: string; // ISO date
};

// What's shown: the stored item plus the current product details and price.
export type CartLine = CartItem & {
  product: Product;
  lineTotalCents: number; // price × quantity
  maxQuantity: number; // the most you can have: the per-item limit or the stock
};

export type Cart = {
  lines: CartLine[];
  itemCount: number; // total quantity, for the header badge
  subtotalCents: number;
};

export type WishlistItem = {
  productSlug: string;
  addedAt: string; // ISO date
};