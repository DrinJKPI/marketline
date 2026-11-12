// All products, with search (?q=...) and filters. The header's search box
// sends people here.

import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductListing } from "@/components/product-listing";
import { HeadingSkeleton, ProductGridSkeleton } from "@/components/skeletons";
import { parseProductFilters } from "@/lib/validation/product-filters";
import { getProductsPageData } from "@/server/services/catalog";

export async function generateMetadata({
  searchParams,
}: PageProps<"/products">): Promise<Metadata> {
  const { query } = parseProductFilters(await searchParams);
  return { title: query ? `Results for “${query}”` : "All products" };
}

export default function ProductsPage({ searchParams }: PageProps<"/products">) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Suspense
        fallback={
          <div className="space-y-8">
            <HeadingSkeleton />
            <ProductGridSkeleton count={12} />
          </div>
        }
      >
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Results({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseProductFilters(await searchParams);
  const { categories, products, brands } = await getProductsPageData(filters);

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">
        {filters.query ? `Results for “${filters.query}”` : "All products"}
      </h1>
      <ProductListing
        basePath="/products"
        filters={filters}
        products={products}
        brands={brands}
        categories={categories}
      />
    </>
  );
}