// A full product list with filters: the filter panel on the left (on top on
// phones), and the result count, sort menu, active filters and products on
// the right. Used by /products and every category page.

import Link from "next/link";
import { SearchX } from "lucide-react";
import { ActiveFilters } from "@/components/active-filters";
import { ProductFiltersPanel, SortSelect } from "@/components/product-filters";
import { ProductGrid } from "@/components/product-grid";
import { filtersToQuery } from "@/lib/utils/filters-url";
import type { Category, Product, ProductFilters } from "@/types/catalog";

type ProductListingProps = {
  basePath: string;
  filters: ProductFilters;
  products: Product[];
  brands: { name: string; count: number }[];
  categories?: Category[];
};

export function ProductListing({
  basePath,
  filters,
  products,
  brands,
  categories,
}: ProductListingProps) {
  return (
    <div className="mt-6 lg:grid lg:grid-cols-[15rem_1fr] lg:items-start lg:gap-8">
      <aside aria-label="Filters">
        {/* A new key gives a fresh form whenever the URL's filters change,
            e.g. after "Clear all", so the boxes always match the URL. */}
        <ProductFiltersPanel
          key={filtersToQuery(filters)}
          basePath={basePath}
          filters={filters}
          brands={brands}
          categories={categories}
        />
      </aside>

      <div className="mt-6 space-y-4 lg:mt-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500" aria-live="polite">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
          <SortSelect key={filters.sort} filters={filters} />
        </div>

        <ActiveFilters basePath={basePath} filters={filters} categories={categories} />

        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <SearchX aria-hidden className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-3 font-semibold">No products match</p>
            <p className="mt-1 text-sm text-slate-500">
              Try a different search or remove some filters.
            </p>
            <Link
              href={basePath}
              className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500"
            >
              Clear all filters
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}