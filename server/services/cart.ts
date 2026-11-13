// Business logic for the shopping cart: whose cart it is, how many of a
// product you may have, the subtotal, and merging a guest's cart into
// their account when they log in.
import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { MAX_PER_PRODUCT } from "@/lib/validation/cart";
import {
  CartLimitError,
  NotInCartError,
  addCartItem,
  listCartItems,
  putCartItem,
  removeCartItem,
  removeCartItems,
  setCartItemQuantity,
} from "@/server/db/carts";
import { getProduct, getProductsBySlugs } from "@/server/db/products";
import { getCurrentUser } from "@/server/services/session";
import type { Cart, CartItem, CartOwner } from "@/types/cart";
import type { Product } from "@/types/catalog";

const GUEST_COOKIE = "marketline_guest";
const GUEST_COOKIE_DAYS = 30;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// A problem the shopper should see, with the HTTP status the API returns.
export class CartError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "CartError";
  }
}

const EMPTY_CART: Cart = { lines: [], itemCount: 0, subtotalCents: 0 };

// ----- Pure rules -----

// The most of this product one cart may hold: the per-product limit, or
// fewer if there isn't that much in stock.
export function maxQuantityFor(product: Pick<Product, "stock">): number {
  return Math.max(0, Math.min(MAX_PER_PRODUCT, product.stock));
}

// Stored items + current product details -> what the cart page shows.
// Prices always come from the product, so they're never out of date.
// Products that no longer exist are left out. Newest additions first.
export function buildCart(items: CartItem[], products: Product[]): Cart {
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  const lines = items
    .flatMap((item) => {
      const product = bySlug.get(item.productSlug);
      if (!product) return [];
      return [
        {
          ...item,
          product,
          lineTotalCents: product.priceCents * item.quantity,
          maxQuantity: maxQuantityFor(product),
        },
      ];
    })
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt));

  return {
    lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotalCents: lines.reduce((sum, line) => sum + line.lineTotalCents, 0),
  };
}

// When a guest logs in: their quantity plus what the account already had,
// but never more than the limit.
export function mergedQuantity(
  accountQuantity: number,
  guestQuantity: number,
  maxQuantity: number,
): number {
  return Math.min(accountQuantity + guestQuantity, maxQuantity);
}

// ----- Whose cart is it? -----

async function guestIdFromCookie(): Promise<string | null> {
  const value = (await cookies()).get(GUEST_COOKIE)?.value;
  return value && UUID.test(value) ? value : null;
}

// The logged-in user's cart, a guest's cart, or null for a first-time
// visitor who hasn't added anything yet.
async function currentOwner(): Promise<CartOwner | null> {
  const user = await getCurrentUser();
  if (user) return { kind: "user", userId: user.id };
  const guestId = await guestIdFromCookie();
  return guestId ? { kind: "guest", guestId } : null;
}

// Like currentOwner, but gives a first-time visitor a guest ID (in a
// cookie) so their cart can be saved. Only works where cookies can be set:
// API routes and Server Actions.
async function currentOrNewOwner(): Promise<CartOwner> {
  const owner = await currentOwner();
  if (owner) return owner;

  const guestId = crypto.randomUUID();
  (await cookies()).set(GUEST_COOKIE, guestId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GUEST_COOKIE_DAYS * 24 * 60 * 60,
  });
  return { kind: "guest", guestId };
}

async function loadCart(owner: CartOwner | null): Promise<Cart> {
  if (!owner) return EMPTY_CART;
  const items = await listCartItems(owner);
  if (items.length === 0) return EMPTY_CART;
  const products = await getProductsBySlugs(items.map((item) => item.productSlug));
  return buildCart(items, products);
}

// ----- Reading -----
// connection(): read the cart when a visitor asks, never ahead of time.

export async function getCart(): Promise<Cart> {
  await connection();
  return loadCart(await currentOwner());
}

// Just the number of items, for the header badge (no product reads).
export async function getCartItemCount(): Promise<number> {
  await connection();
  const owner = await currentOwner();
  if (!owner) return 0;
  const items = await listCartItems(owner);
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

// ----- Changing -----

async function productOrError(productSlug: string): Promise<Product> {
  const product = await getProduct(productSlug);
  if (!product) throw new CartError("This product doesn't exist.", 404);
  return product;
}

export async function addToCart(productSlug: string, quantity: number): Promise<Cart> {
  const product = await productOrError(productSlug);
  const max = maxQuantityFor(product);
  if (max === 0) throw new CartError("Sorry, this product is out of stock.", 409);
  if (quantity > max) {
    throw new CartError(`You can have at most ${max} of this product in your cart.`, 409);
  }

  const owner = await currentOrNewOwner();
  try {
    await addCartItem(owner, productSlug, quantity, max);
  } catch (error) {
    if (error instanceof CartLimitError) {
      throw new CartError(
        `You can have at most ${max} of this product in your cart.`,
        409,
      );
    }
    throw error;
  }
  return loadCart(owner);
}

export async function updateCartQuantity(
  productSlug: string,
  quantity: number,
): Promise<Cart> {
  const owner = await currentOwner();
  if (!owner) throw new CartError("This product isn't in your cart.", 404);

  const product = await productOrError(productSlug);
  const max = maxQuantityFor(product);
  if (quantity > max) {
    const message =
      max === 0
        ? "Sorry, this product is out of stock."
        : `You can have at most ${max} of this product in your cart.`;
    throw new CartError(message, 409);
  }

  try {
    await setCartItemQuantity(owner, productSlug, quantity);
  } catch (error) {
    if (error instanceof NotInCartError) throw new CartError(error.message, 404);
    throw error;
  }
  return loadCart(owner);
}

export async function removeFromCart(productSlug: string): Promise<Cart> {
  const owner = await currentOwner();
  if (owner) await removeCartItem(owner, productSlug);
  return loadCart(owner);
}

// Called right after logging in or signing up: moves the guest cart's
// products into the account's cart, then deletes the guest cart.
export async function mergeGuestCart(userId: string): Promise<void> {
  const guestId = await guestIdFromCookie();
  if (!guestId) return;

  const guest: CartOwner = { kind: "guest", guestId };
  const account: CartOwner = { kind: "user", userId };
  const guestItems = await listCartItems(guest);

  if (guestItems.length > 0) {
    const [accountItems, products] = await Promise.all([
      listCartItems(account),
      getProductsBySlugs(guestItems.map((item) => item.productSlug)),
    ]);
    const accountQuantity = new Map(
      accountItems.map((item) => [item.productSlug, item.quantity]),
    );

    for (const item of guestItems) {
      const product = products.find((p) => p.slug === item.productSlug);
      if (!product) continue; // the product no longer exists
      const quantity = mergedQuantity(
        accountQuantity.get(item.productSlug) ?? 0,
        item.quantity,
        maxQuantityFor(product),
      );
      if (quantity > 0) {
        await putCartItem(account, { ...item, quantity });
      }
    }
    await removeCartItems(guest, guestItems.map((item) => item.productSlug));
  }

  (await cookies()).delete(GUEST_COOKIE);
}