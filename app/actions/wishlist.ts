"use server";
// Server Actions for the wishlist. (The cart uses an API instead; the
// project shows both ways of changing data from the browser.)
// Every action checks the session itself: a Server Action is a public
// endpoint, so it can't trust that only our own buttons call it.

import { refresh } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/server/services/session";
import { removeFromWishlist, saveToWishlist } from "@/server/services/wishlist";

export type WishlistResult = { saved: boolean; message?: string };

const productSlug = z.string().max(120).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

export async function addToWishlistAction(slug: string): Promise<WishlistResult> {
  const user = await getCurrentUser();
  if (!user) return { saved: false, message: "Log in to save products to your wishlist." };

  const parsed = productSlug.safeParse(slug);
  if (!parsed.success) return { saved: false, message: "This product doesn't exist." };

  const result = await saveToWishlist(user.id, parsed.data);
  if (result === "no-product") return { saved: false, message: "This product doesn't exist." };

  refresh(); // re-render the page with the new wishlist
  return result === "already"
    ? { saved: true, message: "This product is already in your wishlist." }
    : { saved: true };
}

export async function removeFromWishlistAction(slug: string): Promise<WishlistResult> {
  const user = await getCurrentUser();
  if (!user) return { saved: false, message: "Log in to use your wishlist." };

  const parsed = productSlug.safeParse(slug);
  if (parsed.success) await removeFromWishlist(user.id, parsed.data);

  refresh();
  return { saved: false };
}