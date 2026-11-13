// The cart API.
//   GET  /api/cart   -> the current visitor's cart
//   POST /api/cart   -> add a product: { "productSlug": "...", "quantity": 1 }
// Both answer with { "cart": { lines, itemCount, subtotalCents } }.

import { NextResponse } from "next/server";
import { addToCartSchema } from "@/lib/validation/cart";
import { errorResponse, readJson } from "@/server/http";
import { addToCart, getCart } from "@/server/services/cart";

export async function GET() {
  try {
    return NextResponse.json({ cart: await getCart() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { productSlug, quantity } = await readJson(request, addToCartSchema);
    const cart = await addToCart(productSlug, quantity);
    return NextResponse.json({ cart }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}