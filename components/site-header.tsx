// The header on every page: logo, search, account/wishlist/cart links,
// and the category bar.

import Link from "next/link";
import { Suspense } from "react";
import { Heart, ShoppingBag, ShoppingCart } from "lucide-react";
import { AccountLink, AccountLinkFallback } from "@/components/account-link";
import { CategoryNav } from "@/components/category-nav";
import { SearchBox, SearchForm } from "@/components/search-box";
import { CategoryNavSkeleton } from "@/components/skeletons";

const iconLinks = [
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

          <Suspense fallback={<SearchForm />}>
            <SearchBox />
          </Suspense>

          <nav aria-label="Your account" className="ml-auto flex items-center gap-1 sm:ml-0">
            <Suspense fallback={<AccountLinkFallback />}>
              <AccountLink />
            </Suspense>
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