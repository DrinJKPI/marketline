// The 404 page: for addresses that don't exist, and for products or
// categories that don't exist (notFound() in their pages). It doesn't read
// the database, so it always works.

import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { SearchForm } from "@/components/search-box";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-sm font-semibold text-brand-700">Error 404</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">Page not found</h1>
      <div className="mt-6">
        <EmptyState
          icon={SearchX}
          title="We couldn't find that page"
          text="The link may be broken, or the product may no longer be available. Try searching instead."
          action={{ href: "/", label: "Go to the homepage" }}
        >
          <Link
            href="/products"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50"
          >
            Browse all products
          </Link>
        </EmptyState>
      </div>
      <div className="mt-6 flex rounded-lg bg-brand-900 p-2">
        <SearchForm />
      </div>
    </div>
  );
}