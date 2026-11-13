// The wishlist page: products the user saved, with buttons to add each one
// to the cart or remove it. Only for logged-in users.

import type { Metadata } from "next";
import { Suspense } from "react";
import { Heart } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/skeletons";
import { WishlistItemActions } from "@/components/wishlist-item-actions";
import { requireUser } from "@/server/services/session";
import { getWishlist } from "@/server/services/wishlist";

export const metadata: Metadata = { title: "Your wishlist" };

export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Your wishlist</h1>
      <Suspense fallback={<div className="mt-8"><ProductGridSkeleton count={4} /></div>}>
        <WishlistContents />
      </Suspense>
    </div>
  );
}

async function WishlistContents() {
  const user = await requireUser("/wishlist");
  const entries = await getWishlist(user.id);

  if (entries.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          text="Tap “Save to wishlist” on any product to keep it here for later."
          action={{ href: "/products", label: "Browse products" }}
        />
      </div>
    );
  }

  return (
    <>
      <p className="mt-2 text-sm text-slate-500">
        {entries.length} saved {entries.length === 1 ? "product" : "products"}
      </p>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {entries.map(({ product }) => (
          <li key={product.slug} className="flex flex-col gap-2">
            <div className="flex-1">
              <ProductCard product={product} />
            </div>
            <WishlistItemActions
              productSlug={product.slug}
              productName={product.name}
              inStock={product.stock > 0}
            />
          </li>
        ))}
      </ul>
    </>
  );
}