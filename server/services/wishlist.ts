// Business logic for wishlists. Only logged-in users have one, so every
// function takes the user's ID; the callers get it from the session.
import "server-only";
import { connection } from "next/server";
import { getProduct, getProductsBySlugs } from "@/server/db/products";
import {
  AlreadyInWishlistError,
  addWishlistItem,
  hasWishlistItem,
  listWishlistItems,
  removeWishlistItem,
} from "@/server/db/wishlists";
import type { Product } from "@/types/catalog";

export type WishlistEntry = { product: Product; addedAt: string };

// The wishlist's products, most recently saved first. Products that no
// longer exist are left out.
export async function getWishlist(userId: string): Promise<WishlistEntry[]> {
  await connection();
  const items = await listWishlistItems(userId);
  if (items.length === 0) return [];

  const products = await getProductsBySlugs(items.map((item) => item.productSlug));
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  return items
    .flatMap((item) => {
      const product = bySlug.get(item.productSlug);
      return product ? [{ product, addedAt: item.addedAt }] : [];
    })
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}

export async function isInWishlist(userId: string, productSlug: string): Promise<boolean> {
  await connection();
  return hasWishlistItem(userId, productSlug);
}

// "added" the first time, "already" if it was there before. Both leave the
// product in the wishlist exactly once.
export async function saveToWishlist(
  userId: string,
  productSlug: string,
): Promise<"added" | "already" | "no-product"> {
  if (!(await getProduct(productSlug))) return "no-product";
  try {
    await addWishlistItem(userId, productSlug);
    return "added";
  } catch (error) {
    if (error instanceof AlreadyInWishlistError) return "already";
    throw error;
  }
}

export async function removeFromWishlist(userId: string, productSlug: string): Promise<void> {
  await removeWishlistItem(userId, productSlug);
}