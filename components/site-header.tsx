// The header on every page: logo, search, account/wishlist/cart links,
// and the category bar.

import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { Heart, Search, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { CategoryNav } from "@/components/category-nav";
import { CategoryNavSkeleton } from "@/components/skeletons";

const iconLinks = [
  { href: "/login", label: "Account", icon: User },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
];

export function SiteHeader() {
  return (
    <header>
      <div className="bg-brand-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <ShoppingBag aria-hidden className="h-6 w-6 text-brand-200" />
            Marketline
          </Link>

          {/* next/form: a normal GET form (?q=...) that navigates without a full reload. */}
          <Form
            action="/products"
            role="search"
            className="order-last flex w-full sm:order-none sm:w-auto sm:flex-1"
          >
            <label htmlFor="site-search" className="sr-only">
              Search products
            </label>
            <input
              id="site-search"
              type="search"
              name="q"
              placeholder="Search Marketline"
              maxLength={100}
              className="min-w-0 flex-1 rounded-l-lg border-0 bg-white px-4 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500"
            />
            <button
              type="submit"
              aria-label="Search"
              className="rounded-r-lg bg-amber-400 px-4 text-slate-900 hover:bg-amber-300"
            >
              <Search aria-hidden className="h-5 w-5" />
            </button>
          </Form>

          <nav aria-label="Your account" className="ml-auto flex items-center gap-1 sm:ml-0">
            {iconLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium hover:bg-white/10"
              >
                <Icon aria-hidden className="h-5 w-5" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <Suspense fallback={<CategoryNavSkeleton />}>
        <CategoryNav />
      </Suspense>
    </header>
  );
}