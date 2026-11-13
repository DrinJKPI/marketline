// The cart link in the header, with the number of items as a badge.
// It reads the cart, so the header shows it inside <Suspense>, with the
// plain link (no badge) as the placeholder.

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { getCartItemCount } from "@/server/services/cart";

const className =
  "relative flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium hover:bg-white/10";

export async function CartLink() {
  const count = await getCartItemCount();
  if (count === 0) return <CartLinkFallback />;

  return (
    <Link href="/cart" aria-label={`Cart, ${count} items`} className={className}>
      <ShoppingCart aria-hidden className="h-5 w-5" />
      <span className="hidden md:inline">Cart</span>
      <span
        aria-hidden
        className="absolute -top-0.5 left-5 min-w-5 rounded-full bg-amber-400 px-1 text-center text-xs font-bold leading-5 text-slate-900"
      >
        {count > 99 ? "99+" : count}
      </span>
    </Link>
  );
}

export function CartLinkFallback() {
  return (
    <Link href="/cart" aria-label="Cart" className={className}>
      <ShoppingCart aria-hidden className="h-5 w-5" />
      <span className="hidden md:inline">Cart</span>
    </Link>
  );
}