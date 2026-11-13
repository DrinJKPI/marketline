// The cart page: every product in the cart with its quantity, price and a
// remove button, and the subtotal. Works for guests and logged-in users.

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ShoppingCart, TriangleAlert } from "lucide-react";
import { CartLineControls } from "@/components/cart-line-controls";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";
import { HeadingSkeleton } from "@/components/skeletons";
import { formatPrice } from "@/lib/utils/money";
import { getCart } from "@/server/services/cart";
import { getCurrentUser } from "@/server/services/session";
import type { CartLine } from "@/types/cart";

export const metadata: Metadata = { title: "Your cart" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Your cart</h1>
      <Suspense fallback={<div className="mt-8"><HeadingSkeleton /></div>}>
        <CartContents />
      </Suspense>
    </div>
  );
}

async function CartContents() {
  const [cart, user] = await Promise.all([getCart(), getCurrentUser()]);

  if (cart.lines.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <ShoppingCart aria-hidden className="mx-auto h-10 w-10 text-slate-400" />
        <p className="mt-3 text-lg font-semibold">Your cart is empty</p>
        <p className="mt-1 text-sm text-slate-500">
          Find something you like and add it to your cart.
        </p>
        <Link
          href="/products"
          className="mt-5 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_20rem]">
      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {cart.lines.map((line) => (
          <CartRow key={line.productSlug} line={line} />
        ))}
      </ul>

      <aside className="rounded-xl border border-slate-200 bg-white p-5 lg:sticky lg:top-4">
        <h2 className="font-semibold">Order summary</h2>
        <dl className="mt-4 flex items-baseline justify-between">
          <dt className="text-slate-600">
            Subtotal ({cart.itemCount} {cart.itemCount === 1 ? "item" : "items"})
          </dt>
          <dd className="text-xl font-bold">{formatPrice(cart.subtotalCents)}</dd>
        </dl>
        <button
          type="button"
          disabled
          className="mt-5 w-full rounded-lg bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500"
        >
          Checkout isn&apos;t part of this demo
        </button>
        {!user && (
          <p className="mt-4 text-sm text-slate-600">
            <Link href="/login?next=/cart" className="font-medium text-brand-700 underline">
              Log in
            </Link>{" "}
            to keep your cart on any device. Your items come with you.
          </p>
        )}
      </aside>
    </div>
  );
}

function CartRow({ line }: { line: CartLine }) {
  const { product } = line;
  const tooMany = line.quantity > line.maxQuantity;

  return (
    <li className="flex gap-4 p-4">
      <Link
        href={`/products/${product.slug}`}
        className="w-20 shrink-0 self-start overflow-hidden rounded-lg border border-slate-200 sm:w-28"
      >
        <ProductImage product={product} sizes="112px" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {product.brand}
          </p>
          <Link
            href={`/products/${product.slug}`}
            className="line-clamp-2 font-medium hover:text-brand-700"
          >
            {product.name}
          </Link>
          <Price
            priceCents={product.priceCents}
            compareAtPriceCents={product.compareAtPriceCents}
          />
          {tooMany && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-amber-700">
              <TriangleAlert aria-hidden className="h-4 w-4" />
              {line.maxQuantity === 0
                ? "Now out of stock. Please remove it."
                : `Only ${line.maxQuantity} available. Please lower the quantity.`}
            </p>
          )}
          <div className="pt-1">
            <CartLineControls
              productSlug={product.slug}
              productName={product.name}
              quantity={line.quantity}
              maxQuantity={line.maxQuantity}
            />
          </div>
        </div>
        <p className="font-semibold sm:text-right">{formatPrice(line.lineTotalCents)}</p>
      </div>
    </li>
  );
}