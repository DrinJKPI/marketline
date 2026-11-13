"use client";
// The quantity menu and "Remove" button for one product on the cart page.

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { callCartApi } from "@/lib/cart-client";

type CartLineControlsProps = {
  productSlug: string;
  productName: string;
  quantity: number;
  maxQuantity: number;
};

export function CartLineControls({
  productSlug,
  productName,
  quantity,
  maxQuantity,
}: CartLineControlsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const path = `/api/cart/items/${encodeURIComponent(productSlug)}`;

  // Runs a request, then reloads the cart from the server (the subtotal
  // and header count are worked out there, not in the browser).
  function run(request: () => Promise<string | null>) {
    setError(null);
    startTransition(async () => {
      const problem = await request();
      if (problem) setError(problem);
      router.refresh();
    });
  }

  // Normally 1 up to the limit. If the stock has dropped below what's in the
  // cart, the current quantity is still listed so the menu shows it.
  const options = Array.from({ length: Math.max(maxQuantity, quantity) }, (_, i) => i + 1);

  return (
    <div className={pending ? "opacity-60" : undefined}>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="sr-only">Quantity of {productName}</span>
          <span aria-hidden className="text-slate-500">
            Qty
          </span>
          <select
            value={quantity}
            disabled={pending}
            onChange={(event) =>
              run(() => callCartApi(path, "PATCH", { quantity: Number(event.target.value) }))
            }
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5"
          >
            {options.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => callCartApi(path, "DELETE"))}
          className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-red-600"
        >
          <Trash2 aria-hidden className="h-4 w-4" />
          Remove<span className="sr-only"> {productName}</span>
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}