// One product in the cart.
//   PATCH  /api/cart/items/<slug>  -> change the quantity: { "quantity": 3 }
//   DELETE /api/cart/items/<slug>  -> remove it from the cart
// Both answer with the updated { "cart": ... }.

import { NextResponse } from "next/server";
import { updateQuantitySchema } from "@/lib/validation/cart";
import { errorResponse, readJson } from "@/server/http";
import { removeFromCart, updateCartQuantity } from "@/server/services/cart";

export async function PATCH(
  request: Request,
  { params }: RouteContext<"/api/cart/items/[slug]">,
) {
  try {
    const { slug } = await params;
    const { quantity } = await readJson(request, updateQuantitySchema);
    return NextResponse.json({ cart: await updateCartQuantity(slug, quantity) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext<"/api/cart/items/[slug]">,
) {
  try {
    const { slug } = await params;
    return NextResponse.json({ cart: await removeFromCart(slug) });
  } catch (error) {
    return errorResponse(error);
  }
}