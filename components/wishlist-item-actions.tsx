"use client";
// The buttons under each product on the wishlist page: add it to the cart
// (through the cart API) or remove it from the wishlist (a Server Action).

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ShoppingCart, Trash2 } from "lucide-react";
import { removeFromWishlistAction } from "@/app/actions/wishlist";
import { callCartApi } from "@/lib/cart-client";

type WishlistItemActionsProps = {
  productSlug: string;
  productName: string;
  inStock: boolean;
};

export function WishlistItemActions({ productSlug, productName, inStock }: WishlistItemActionsProps) {
  const router = useRouter();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function addToCart() {
    setMessage(null);
    startTransition(async () => {
      const problem = await callCartApi("/api/cart", "POST", { productSlug, quantity: 1 });
      setMessage(problem ? { ok: false, text: problem } : { ok: true, text: "Added to your cart." });
      if (!problem) router.refresh(); // update the cart count in the header
    });
  }

  function remove() {
    setMessage(null);
    startTransition(async () => {
      await removeFromWishlistAction(productSlug); // also refreshes the page
    });
  }

  return (
    <div className={pending ? "opacity-60" : undefined}>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={addToCart}
          disabled={pending || !inStock}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300 disabled:bg-slate-200 disabled:text-slate-500"
        >
          <ShoppingCart aria-hidden className="h-4 w-4" />
          {inStock ? "Add to cart" : "Out of stock"}
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          aria-label={`Remove ${productName} from your wishlist`}
          title="Remove"
          className="rounded-lg border border-slate-300 bg-white px-3 text-slate-500 hover:border-red-300 hover:text-red-600"
        >
          <Trash2 aria-hidden className="h-4 w-4" />
        </button>
      </div>
      {message && (
        <p
          role={message.ok ? "status" : "alert"}
          className={`mt-2 text-sm ${message.ok ? "text-emerald-700" : "text-red-600"}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}