"use client";
// "Add to cart" on a product page: pick a quantity, add, and see a link to
// the cart. router.refresh() then re-renders the server parts of the page,
// such as the cart count in the header.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { callCartApi } from "@/lib/cart-client";

type AddToCartProps = {
  productSlug: string;
  maxQuantity: number; // 0 = out of stock
};

export function AddToCart({ productSlug, maxQuantity }: AddToCartProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();

  if (maxQuantity === 0) {
    return (
      <button
        type="button"
        disabled
        className="mt-6 w-full rounded-lg bg-slate-200 px-6 py-3 font-semibold text-slate-500 sm:w-auto"
      >
        Out of stock
      </button>
    );
  }

  function add() {
    setError(null);
    setAdded(false);
    startTransition(async () => {
      const problem = await callCartApi("/api/cart", "POST", { productSlug, quantity });
      if (problem) {
        setError(problem);
      } else {
        setAdded(true);
        router.refresh();
      }
    });
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium">Quantity</span>
          <select
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2"
          >
            {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={add}
          disabled={pending}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-400 px-6 py-3 font-semibold text-slate-900 hover:bg-amber-300 disabled:opacity-60 sm:flex-none"
        >
          <ShoppingCart aria-hidden className="h-5 w-5" />
          {pending ? "Adding…" : "Add to cart"}
        </button>
      </div>

      <div aria-live="polite" className="mt-3 text-sm">
        {error && <p className="font-medium text-red-600">{error}</p>}
        {added && (
          <p className="flex items-center gap-2 font-medium text-emerald-700">
            <Check aria-hidden className="h-4 w-4" /> Added to your cart.
            <Link href="/cart" className="text-brand-700 underline">
              View cart
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}