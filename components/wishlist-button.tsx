"use client";
// "Save to wishlist" on a product page. Logged-out visitors get a link to
// the login page that brings them back here. Logged-in users can save and
// unsave with one click (a Server Action does the work).

import Link from "next/link";
import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { addToWishlistAction, removeFromWishlistAction } from "@/app/actions/wishlist";

type WishlistButtonProps = {
  productSlug: string;
  loggedIn: boolean;
  initialSaved: boolean;
};

const buttonClass =
  "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition";

export function WishlistButton({ productSlug, loggedIn, initialSaved }: WishlistButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!loggedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/products/${productSlug}`)}`}
        className={`${buttonClass} w-fit border-slate-300 bg-white hover:bg-slate-50`}
      >
        <Heart aria-hidden className="h-5 w-5" /> Log in to save to your wishlist
      </Link>
    );
  }

  function toggle() {
    setMessage(null);
    startTransition(async () => {
      const result = saved
        ? await removeFromWishlistAction(productSlug)
        : await addToWishlistAction(productSlug);
      setSaved(result.saved);
      setMessage(result.message ?? null);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={saved}
        className={`${buttonClass} disabled:opacity-60 ${
          saved
            ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
            : "border-slate-300 bg-white hover:bg-slate-50"
        }`}
      >
        <Heart aria-hidden className={`h-5 w-5 ${saved ? "fill-rose-500 text-rose-500" : ""}`} />
        {saved ? "Saved to your wishlist" : "Save to wishlist"}
      </button>
      <p aria-live="polite" className="mt-2 text-sm text-slate-600">
        {message}
      </p>
    </div>
  );
}

// Shown while the page checks whether the product is already saved.
export function WishlistButtonPlaceholder() {
  return (
    <div
      aria-hidden
      className={`${buttonClass} w-fit animate-pulse border-slate-200 bg-slate-100 text-transparent`}
    >
      <Heart className="h-5 w-5" /> Save to wishlist
    </div>
  );
}