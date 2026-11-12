// A category page, e.g. /categories/electronics: the category's name and
// its products, with filters and sorting. An unknown slug shows the 404 page.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense, cache } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductListing } from "@/components/product-listing";
import { HeadingSkeleton, ProductGridSkeleton } from "@/components/skeletons";
import { getCategoryVisual } from "@/lib/product-visuals";
import { parseProductFilters } from "@/lib/validation/product-filters";
import { browseProducts, getCategoryPageData } from "@/server/services/catalog";

// generateMetadata and the page both need the category. cache() makes them
// share one database read per request instead of reading it twice.
const loadCategory = cache(getCategoryPageData);

export async function generateMetadata({
  params,
}: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadCategory(slug);
  if (!data) return { title: "Category not found" };
  return { title: data.category.name, description: data.category.description };
}

export default function CategoryPage({
  params,
  searchParams,
}: PageProps<"/categories/[slug]">) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Suspense
        fallback={
          <div className="space-y-8">
            <HeadingSkeleton />
            <ProductGridSkeleton />
          </div>
        }
      >
        <CategoryContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CategoryContent({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const data = await loadCategory(slug);
  if (!data) notFound();

  const { category } = data;
  // The category is already chosen by the URL, so ignore ?category= here.
  const filters = { ...parseProductFilters(await searchParams), categorySlug: undefined };
  const { products, brands } = browseProducts(data.products, filters);
  const visual = getCategoryVisual(category.slug);

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: category.name }]} />

      <div className="mt-4 flex items-center gap-4">
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${visual.className}`}
        >
          <visual.icon aria-hidden className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
          <p className="mt-1 text-slate-600">{category.description}</p>
        </div>
      </div>

      <ProductListing
        basePath={`/categories/${category.slug}`}
        filters={filters}
        products={products}
        brands={brands}
      />
    </>
  );
}